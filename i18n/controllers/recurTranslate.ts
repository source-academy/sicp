import fs from "fs";
import OpenAI from "openai";
import path from "path";
import createAssistant from "../initializers/initialize";
import dotenv from "dotenv";
import sax from "sax";
import { Readable } from "stream";

dotenv.config();

if (process.env.AI_MODEL === undefined || process.env.API_KEY === undefined) {
  throw Error("Please specify AI_MODEL and API_KEY");
}

// initialize OpenAI API
const ai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.AI_BASEURL
});

const ignoredTags = [
  "LATEXINLINE",
  "LATEX",
  "SNIPPET",
  "SCHEMEINLINE",
  "SCHEME",
  "LONG_PAGE",
  "LABEL",
  "HISTORY",
  "REF",
  "FIGURE",
  
];

const MAXLEN = Number(process.env.MAX_LEN) || 3000;

// change to true to avoid calling openai api, useful for troubleshooting
// chunking logic
const troubleshoot = false;
let languageNames = new Intl.DisplayNames(["en"], { type: "language" });

// Centralized logging to prevent duplicate messages
const errorMessages = new Set();
// Track errors by file for summary reporting
const fileErrors: Record<string, { message: string; error?: any }[]> = {};

function logError(message: string, error?: any, filePath?: string) {
  // Create a unique key for this error message
  const errorKey = message + (error ? error.toString() : "");
  // Only log if we haven't seen this exact message before
  if (!errorMessages.has(errorKey)) {
    errorMessages.add(errorKey);
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }

    // Store error for the summary log if filePath is provided
    if (filePath) {
      if (!fileErrors[filePath]) {
        fileErrors[filePath] = [];
      }
      fileErrors[filePath].push({ message, error });
    }
  }
}

// Function to get all logged errors for summary
export function getFileErrors(): Record<
  string,
  { message: string; error?: any }[]
> {
  return fileErrors;
}

const createParser = () =>
  (sax as any).createStream(false, { trim: false }, { strictEntities: true });

async function translate(langCode: string, filePath: string): Promise<void> {
  const startTime = new Date().getTime();
  let assistant;

  try {
    // Use the provided file path directly without modification
    const input_path = filePath;
    const language = languageNames.of(langCode.replace('_', '-'));

    if (language === undefined) {
      throw new Error('Undefined language');
    }

    if (!troubleshoot) assistant = await createAssistant(langCode, language, ai as any);

    // Generate output path by replacing "/en/" with "/../i18n/translation_output/zh_CN/" in the path
    const output_path = filePath.replace(
      path.sep + "en" + path.sep,
      path.sep + ".." + path.sep + "i18n" + path.sep + "translation_output"  + path.sep + langCode + path.sep
    );

    const translated: string = await recursivelyTranslate(
      language,
      input_path,
      troubleshoot ? 0 : assistant.id
    );

    // Ensure directory exists
    const dir = path.dirname(output_path);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(output_path, translated);
    console.log(`Translation saved to ${output_path}`);
  } catch (parseErr) {
    logError(`Error translating file ${filePath}:`, parseErr, filePath);
    // Re-throw the error to propagate it to the caller
    throw parseErr;
  } finally {
    if (assistant) {
      await ai.beta.assistants.del(assistant.id).catch(err => {
        logError(`Error deleting assistant:`, err, filePath);
      });
    }
    const elapsed = new Date().getTime() - startTime;
    console.log("Took " + elapsed / 1000.0 + " seconds");
  }
}

// Function to translate the content of a file
async function recursivelyTranslate(
  language: string,
  filePath: string,
  assistant_id: string
): Promise<string> {
  // Recursive function to split and translate
  async function helper(ori: string): Promise<string> {
    if (ori.length < MAXLEN) {
      return await translateChunk(ori); // translate the chunk
    }

    let subTranslated: string[] = [];
    // continue splitting the chunk
    // Create a SAX parser in strict mode to split source into chunks.
    await new Promise<void>((resolve, reject) => {
      const subParser = createParser();

      let subCurrentDepth = 0;
      let subCurrentSegment = "";
      const subSegments: [boolean, string][] = [];
      let subIsRecording = false;

      subParser.on("opentag", node => {
        if (node.name === "WRAPPER") return;

        subCurrentDepth++;

        if (subCurrentDepth === 2) subIsRecording = true;

        if (subIsRecording) {
          subCurrentSegment += `<${node.name}${formatAttributes(node.attributes)}>`;
        } else {
          subSegments.push([
            false,
            `<${node.name}${formatAttributes(node.attributes)}>`
          ]);
        }
      });

      subParser.on("text", text => {
        text = strongEscapeXML(text);
        if (subIsRecording) {
          subCurrentSegment += text;
        } else if (
          subSegments.length > 0 &&
          subSegments[subSegments.length - 1][0]
        ) {
          subSegments[subSegments.length - 1][1] += text;
        } else if (
          text.trim() === "" ||
          text.trim() === "," ||
          text.trim() === "."
        ) {
          subSegments.push([false, text]);
        } else {
          subSegments.push([true, text]);
        }
      });

      subParser.on("cdata", cdata => {
        if (subIsRecording) {
          subCurrentSegment += `<![CDATA[${cdata}]]>`;
        }
      });

      subParser.on("closetag", tagName => {
        if (tagName === "WRAPPER") {
          return;
        }

        subCurrentSegment += `</${tagName}>`;

        if (subCurrentDepth === 2) {
          // We are closing a segment element.
          if (ignoredTags.includes(tagName)) {
            subSegments.push([false, subCurrentSegment]);
          } else if (
            subSegments.length > 0 &&
            subSegments[subSegments.length - 1][0] &&
            subSegments[subSegments.length - 1][1].length +
              subCurrentSegment.length <
              MAXLEN
          ) {
            subSegments[subSegments.length - 1][1] += subCurrentSegment;
          } else {
            subSegments.push([true, subCurrentSegment]);
          }
          subCurrentSegment = "";
          subIsRecording = false;
        }

        if (subCurrentDepth === 1) {
          subSegments.push([false, `</${tagName}>`]);
          subCurrentSegment = "";
        }

        subCurrentDepth--;
      });

      subParser.on("comment", comment => {
        if (subIsRecording) {
          subCurrentSegment += `<!-- ${comment} -->`;
        } else {
          subSegments.push([false, `<!-- ${comment} -->`]);
        }
      });

      subParser.on("end", async () => {
        for (const segment of subSegments) {
          try {
            if (segment[0]) {
              subTranslated.push(await helper(segment[1]));
            } else {
              subTranslated.push(segment[1]);
            }
          } catch (error) {
            logError(
              `Error translating segment in ${filePath}:`,
              error,
              filePath
            );
            // Add error comment and continue with next segment
            subTranslated.push(
              segment[1] + `<!-- Error translating this segment -->`
            );
          }
        }
        resolve();
      });

      subParser.on("error", err => {
        logError(`Error in subParser for ${filePath}:`, err, filePath);
        // Try to recover and continue
        try {
          subParser._parser.error = null;
          subParser._parser.resume();
        } catch (resumeErr) {
          logError(`Could not recover from parser error:`, resumeErr, filePath);
          reject(err);
        }
      });

      Readable.from("<WRAPPER>" + ori + "</WRAPPER>").pipe(subParser);
    });

    return subTranslated.join("");
  }

  // Create a SAX parser in strict mode to split source into chunks.
  const parser = createParser();

  const thread = await ai.beta.threads.create();
  let translated: String[] = [];

  try {
    await new Promise<void>((resolve, reject) => {
      console.log("Translating " + filePath + " to " + language + " at " + thread.id);
      // Variables to track current depth and segments.
      let currentDepth = 0;
      let currentSegment = "";
      const segments: [boolean, string][] = [];

      // In this context:
      // - Depth 0: Before any element is opened.
      // - Depth 1: The root element (<CHAPTER>).
      // - Depth 2: Each direct child of the root that we want to capture.
      let isRecording = false;

      parser.on("opentag", node => {
        currentDepth++;

        if (currentDepth === 2 || isRecording) {
          isRecording = true;
          currentSegment += `<${node.name}${formatAttributes(node.attributes)}>`;
        } else {
          segments.push([
            false,
            `<${node.name}${formatAttributes(node.attributes)}>`
          ]);
        }
      });

      parser.on("text", text => {
        text = strongEscapeXML(text);

        if (isRecording) {
          currentSegment += text;
        } else {
          segments.push([false, text]);
        }
      });

      parser.on("cdata", cdata => {
        if (isRecording) {
          currentSegment += `<![CDATA[${cdata}]]>`;
        }
      });

      parser.on("closetag", tagName => {
        if (isRecording) {
          currentSegment += `</${tagName}>`;
        }

        if (currentDepth === 2) {
          isRecording = false;
          // We are closing a segment element.
          if (ignoredTags.includes(tagName)) {
            segments.push([false, currentSegment]);
          } else {
            if (
              segments.length > 0 &&
              segments[segments.length - 1][0] &&
              segments[segments.length - 1][1].length + currentSegment.length <
                MAXLEN
            ) {
              segments[segments.length - 1][1] += currentSegment;
            } else {
              segments.push([true, currentSegment]);
            }
          }
          currentSegment = "";
        }

        if (currentDepth === 1) {
          // We are closing the root element.
          segments.push([false, `</${tagName}>`]);
        }

        currentDepth--;
      });

      parser.on("comment", comment => {
        if (isRecording) {
          currentSegment += `<!-- ${comment} -->`;
        } else {
          segments.push([false, `<!-- ${comment} -->`]);
        }
      });

      parser.on("end", async () => {
        for (const segment of segments) {
          try {
            if (segment[0]) {
              translated.push(await helper(segment[1]));
            } else {
              translated.push(segment[1]);
            }
          } catch (error) {
            logError(
              `Error translating segment in ${filePath}:`,
              error,
              filePath
            );
            // Add error comment and continue with next segment
            translated.push(
              segment[1] + `<!-- Error translating this section -->`
            );
          }
        }
        resolve();
      });

      parser.on("error", err => {
        logError(`Parser error in ${filePath}:`, err, filePath);
        // Try to recover and continue
        try {
          parser._parser.error = null;
          parser._parser.resume();
        } catch (resumeErr) {
          logError(`Could not recover from parser error:`, resumeErr, filePath);
          reject(err);
        }
      });

      // Use the file path directly without modification
      fs.createReadStream(filePath).pipe(parser);
    });

    return translated.join("");
  } catch (parseErr) {
    logError(`Error parsing XML in ${filePath}:`, parseErr, filePath);
    // Return what we have so far plus error comment
    return translated.join("") + `<!-- Error parsing this file -->`;
  }

  async function translateChunk(chunk: string): Promise<string> {
    if (troubleshoot) return chunk;
    if (chunk.trim() === "" || chunk.trim() === "," || chunk.trim() === ".") {
      return chunk;
    }

    let translatedChunk = "";

    try {
      await ai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Translate to ${language}: <TRANSLATE> ${chunk} </TRANSLATE>`
      });

      const run = await ai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant_id,
        truncation_strategy: {
          type: "last_messages",
          last_messages: Number(process.env.CONTEXT) || 3
        }
      });

      const messages = await ai.beta.threads.messages.list(thread.id, {
        run_id: run.id,
        limit: Number(process.env.CONTEXT || 3)
      });

      const message = messages.data.pop();

      if (message) {
        if (message.status === "incomplete") {
          throw new Error(
            "AI Error: incomplete response: " + message.incomplete_details
          );
        }

        if (message.content[0].type !== "text") {
          throw new Error("AI Error: Unexpected response format");
        }

        if (
          run.usage &&
          run.usage.total_tokens > Number(process.env.TOKEN_WARNING || 10000)
        ) {
          console.warn("warning: high token usage", run.usage);
        }
      } else {
        throw new Error("AI Error: Undefined Response");
      }

      const text = message.content[0].text;

      const safeText = escapeXML(text.value);
      const textStream = Readable.from("<WRAPPER>" + safeText + "</WRAPPER>");

      await new Promise<void>((resolve, reject) => {
        // Create a SAX parser in strict mode for cleaning up translations.
        const clean = createParser();

        // SAX parser to remove any excess text (artifacts, annotations etc.) from LLM outside of XML tags
        let currDepth = -1;

        clean.on("text", text => {
          if (currDepth >= 1) {
            translatedChunk += strongEscapeXML(text);
          }
        });

        clean.on("opentag", node => {
          currDepth++;
          if (node.name != "WRAPPER" && node.name != "TRANSLATE") {
            translatedChunk += `<${node.name}${formatAttributes(node.attributes)}>`;
          }
        });

        clean.on("closetag", tagName => {
          if (tagName != "WRAPPER" && tagName != "TRANSLATE") {
            translatedChunk += `</${tagName}>`;
          }
          currDepth--;
        });

        clean.on("cdata", cdata => {
          translatedChunk += `<![CDATA[${cdata}]]>`;
        });

        clean.on("comment", comment => {
          translatedChunk += `<!-- ${comment} -->`;
        });

        clean.on("error", error => {
          // Log only once with abbreviated content
          logError(
            `Error validating AI response for ${filePath}`,
            error,
            filePath
          );

          // Attempt to recover using the internal parser
          try {
            clean._parser.error = null;
            clean._parser.resume();
            // Continue processing despite the error
            resolve();
          } catch (e) {
            // Add error comment and resolve instead of rejecting
            translatedChunk += `<!-- XML validation error -->`;
            resolve();
          }
        });

        clean.once("end", resolve);

        textStream.pipe(clean);
      });

      return translatedChunk;
    } catch (err) {
      logError(
        `Error occurred while translating chunk in ${filePath}:`,
        err,
        filePath
      );
      // Return the original chunk with error comment rather than throwing
      return chunk + `<!-- Error occurred while translating this section -->`;
    }
  }
}

export default translate;

// Helper function to format attributes into a string.
function formatAttributes(attrs: string) {
  const attrStr = Object.entries(attrs)
    .map(([key, val]) => `${key}="${val}"`)
    .join(" ");
  return attrStr ? " " + attrStr : "";
}

function escapeXML(str: string): string {
  return str
    .replace(/&(?!(?:amp;|lt;|gt;|apos;|quot;))/g, "&amp;")
    .replace(/<([^a-zA-Z\/])/g, "&lt;$1") // Fix lone < characters
    .replace(/([^a-zA-Z0-9"'\s\/])>/g, "$1&gt;"); // Fix lone > characters;
}

function strongEscapeXML(str: string): string {
  return str
    .replace(/&(?!(?:amp;|lt;|gt;|apos;|quot;))/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/【([\s\S]*?)】/g, "");
}
