import fs from "fs";
import OpenAI from "openai";
import path from "path";
import createAssistant from "../initializers/initialize";
import dotenv from "dotenv";
import sax from "sax";
import { cleanParser, recurSplitParser, splitParser } from "./parsers";

dotenv.config();

if (process.env.AI_MODEL === undefined || process.env.API_KEY === undefined) {
  throw Error("Please specify AI_MODEL and API_KEY");
}

// initialize OpenAI API
const ai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.AI_BASEURL
});

const MAXLEN = Number(process.env.MAX_LEN) || 3000;

// change to true to avoid calling openai api, useful for troubleshooting
// chunking logic
const troubleshoot = false;
let languageNames = new Intl.DisplayNames(["en"], { type: "language" });

// Centralized logging to prevent duplicate messages
const errorMessages = new Set();
// Track errors by file for summary reporting
const fileErrors: Record<string, { message: string; error?: any }[]> = {};

function logError(message: string, error: any, filePath: string) {
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
    const language = languageNames.of(langCode.replace("_", "-"));

    if (language === undefined) {
      throw new Error("Undefined language");
    }

    if (!troubleshoot)
      assistant = await createAssistant(langCode, language, ai);

    // Generate output path by replacing "/en/" with "/../i18n/translation_output/zh_CN/" in the path
    const output_path = filePath.replace(
      path.sep + "en" + path.sep,
      path.sep +
        ".." +
        path.sep +
        "i18n" +
        path.sep +
        "translation_output" +
        path.sep +
        langCode +
        path.sep
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
    logError(`Error processing file ${filePath}:`, parseErr, filePath);
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

    let subSegments: string[] = await recurSplitParser(ori, filePath, logError);
    let subTranslated: string[] = [];

    for (const segment of subSegments) {
      try {
        if (segment[0]) {
          subTranslated.push(await helper(segment[1]));
        } else {
          subTranslated.push(segment[1]);
        }
      } catch (error) {
        logError(`Error translating segment in ${filePath}:`, error, filePath);
        // Add error comment and continue with next segment
        subTranslated.push(
          segment[1] + `<!-- Error translating this segment -->`
        );
      }
    }

    return subTranslated.join("");
  }

  // Create a SAX parser in strict mode to split source into chunks.

  const thread = await ai.beta.threads.create();

  console.log(
    "Translating " + filePath + " to " + language + " at " + thread.id
  );
  let translated: String[] = [];

  try {
    const segments: [boolean, string][] = await splitParser(filePath, logError);

    for (const segment of segments) {
      try {
        if (segment[0]) {
          translated.push(await helper(segment[1]));
        } else {
          translated.push(segment[1]);
        }
      } catch (error) {
        logError(`Error translating segment in ${filePath}:`, error, filePath);
        // Add error comment and continue with next segment
        translated.push(segment[1] + `<!-- Error translating this section -->`);
      }
    }

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

      return await cleanParser(text.value, filePath, logError);
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
