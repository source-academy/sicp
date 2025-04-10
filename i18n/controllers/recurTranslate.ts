import fs from "fs";
import OpenAI from "openai";
import path from "path";
import createAssistant from "../initializers/initialize";
import dotenv from "dotenv";
import sax from "sax";
import { Readable } from "stream";
import { fileURLToPath } from "url";

dotenv.config();

if (process.env.AI_MODEL === undefined || process.env.API_KEY === undefined) {
  throw Error("Please specify AI_MODEL and API_KEY!");
}

// initialize OpenAI API
const ai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.AI_BASEURL
});

const MAXLEN = Number(process.env.MAX_LEN) || 3000;

const createParser = () =>
  (sax as any).createStream(true, { trim: false }, { strictEntities: true });

async function translate(language: string, filePath: string): Promise<void> {
  const startTime = new Date().getTime();
  try {
    // Pipe the XML file into the parser.
    const input_dir = fileURLToPath(
      import.meta.resolve("../../xml" + filePath)
    );

    const translated: string = await recursivelyTranslate(language, input_dir);

    const output_path = fileURLToPath(
      import.meta.resolve("../../xml/cn" + filePath)
    );

    // Ensure directory exists
    const dir = path.dirname(output_path);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(output_path, translated);
    console.log(`Translation saved to ${output_path}`);
  } catch (parseErr) {
    console.error("Error parsing XML:", parseErr);
  } finally {
    const elapsed = new Date().getTime() - startTime;
    console.log(filePath + " took " + elapsed / 1000.0 + " seconds");
  }
}

// TODO: change the toTranslate to a file path, read the file and translate the content
async function recursivelyTranslate(
  language: string,
  path: string
): Promise<string> {
  // Recursive function to split and translate
  async function helper(ori: string, force: boolean): Promise<string> {
    if (ori.length < MAXLEN && !force) {
      return await translateChunk(ori); // translate the chunk
    }

    let subTranslated: string[] = [];
    // continue splitting the chunk
    // Create a SAX parser in strict mode to split source into chunks.
    await new Promise<void>((resolve, reject) => {
      const subParser = createParser();

      let subCurrentDepth = 1;
      let subCurrentSegment = "";
      const subSegments: [boolean, string][] = [];
      let subIsRecording = false;

      subParser.on("opentag", node => {
        if (node.name === "WRAPPER") {
          return;
        }
        
        subCurrentDepth++;

        // If we're at depth 2, this is the start of a new segment.
        if (subCurrentDepth === 2 || subIsRecording) {
          subIsRecording = true;
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
        } else {
          if (
            subSegments.length > 0 &&
            subSegments[subSegments.length - 1][0]
          ) {
            subSegments[subSegments.length - 1][1] += text;
          } else if (
              text.trim() !== "" ||
              text.trim() === "," ||
              text.trim() === "."
            ) {
              subSegments.push([false, text]);
            } else {
              subSegments.push([true, text]);
          }
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

        if (subIsRecording) {
          subCurrentSegment += `</${tagName}>`;
        }

        if (subCurrentDepth === 2) {
          // We are closing a segment element.
          if (
            tagName === "LATEXINLINE" ||
            tagName === "LATEX" ||
            tagName === "SNIPPET" ||
            tagName === "SCHEMEINLINE"
          ) {
            subSegments.push([false, subCurrentSegment]);
          } else {
            if (
              subSegments.length > 0 &&
              subSegments[subSegments.length - 1][0] &&
              (subSegments[subSegments.length - 1][1].length +
                subCurrentSegment.length) <
                MAXLEN
            ) {
              subSegments[subSegments.length - 1][1] += subCurrentSegment;
            } else {
            subSegments.push([true, subCurrentSegment]);
            }
          }
          subCurrentSegment = "";
          subIsRecording = false;
        }

        if (subCurrentDepth === 1) {
          // We are closing the root element.
          subSegments.push([false, `</${tagName}>`]);
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
          if (segment[0]) {
              subTranslated.push(await helper(segment[1], false));
          } else {
            subTranslated.push(segment[1]);
          }
        }
        resolve();
      });

      subParser.on("error", reject);

      Readable.from("<WRAPPER>" + ori + "</WRAPPER>").pipe(subParser);
    });

    return subTranslated.join("");
  }

  // Create a SAX parser in strict mode to split source into chunks.
  const parser = createParser();

  // const assistant = await createAssistant(language, ai as any);
  const assistant_id = "asst_BLVYfog5DpWrbu3fW3o2oD4r";
  const thread = await ai.beta.threads.create();
  let translated: String[] = [];

  try {
    await new Promise<void>((resolve, reject) => {
      console.log("Translating " + path + " at " + thread.id);
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

        // If we're at depth 2, this is the start of a new segment.
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
          // We are closing a segment element.
          if (
            tagName === "LATEXINLINE" ||
            tagName === "LATEX" ||
            tagName === "SNIPPET" ||
            tagName === "SCHEMEINLINE" ||
            tagName === "SCHEME"
          ) {
            segments.push([false, currentSegment]);
          } else {
            if (
              segments.length > 0 &&
              segments[segments.length - 1][0] &&
              (segments[segments.length - 1][1].length +
                currentSegment.length) <
                MAXLEN
            ) {
              segments[segments.length - 1][1] += currentSegment;
            } else {
            segments.push([true, currentSegment]);
            }
          }
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
          if (segment[0]) {
            translated.push(await helper(segment[1], false));
          } else {
            translated.push(segment[1]);
          }
        }
        resolve();
      });

      parser.on("error", reject);

      fs.createReadStream(path).pipe(parser);
    });

    return translated.join("");
  } catch (parseErr) {
    console.error("Error parsing XML:", parseErr);
    return translated.join("") + "<!-- Error parsing this section -->";
  }

  async function translateChunk(chunk: string): Promise<string> {
    if (chunk.trim() === "" || chunk.trim() === "," || chunk.trim() === ".") {
      return chunk;
    }
    
    // console.log("Translating chunk of length: " + chunk.length);
    if (chunk.length < 100) {
      console.log("\nchunk: " + chunk)
    }
    
    let translatedChunk = "";

    try {
      await ai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Translate this content to ${language}.
        IMPORTANT: You MUST search the uploaded reference file for any technical terms and use EXACTLY the translations specified there.
        If a term exists in the reference file, use that translation without deviation.
        Do not modify XML tags, attributes of XML tags and structure. Do not say anything else.
        Content to translate:
        <TRANSLATE> ${chunk} </TRANSLATE>`
      });
      
      const run = await ai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant_id
      });

      const messages = await ai.beta.threads.messages.list(thread.id, {
        run_id: run.id
      });

      const message = messages.data.pop()!;
      const messageContent = message.content[0];

      if (messageContent.type !== "text") {
        throw new Error(
          `Unexpected message content type: ${messageContent.type}`
        );
      }

      const text = messageContent.text;

      const safeText = escapeXML(text.value);
      console.log(safeText);
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
          console.log(
            "error encountered when validating XML: " +
              error + "\nfile: " + path +
              "\n section: " +
              (safeText.length > 50 ? safeText.substring(0, 100) + "..." : safeText )
          );

          // Attempt to recover using the internal parser
          try {
            clean._parser.resume();
          } catch (e) {
            console.log("Failed to resume parser:", e);
            reject(e);
          }
        });

        clean.once("end", resolve);

        textStream.pipe(clean);
      });

      return translatedChunk;
    } catch (err) {
      console.log(`Error occured while translating ${path}:\n    ` + err);
      return (
        translatedChunk +
        `<!-- Error occured while translating this section-->\n<!-- Error: ${err}-->`
      );
    }
  }
}

export default translate;

// Helper function to format attributes into a string.
function formatAttributes(attrs) {
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
    .replace(/'/g, "&apos;");
}
