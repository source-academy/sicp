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

// TODO: change the toTranslate to a file path, read the file and translate the content
async function translate(language: string, filePath: string) {
  // Create a SAX parser in strict mode to split source into chunks.
  const parser = (sax as any).createStream(true, { trim: false });

  // const assistant = await createAssistant(language, ai);
  const assistant_id = "asst_BLVYfog5DpWrbu3fW3o2oD4r";
  const thread = await ai.beta.threads.create();
  let translated = "";

  console.dir(thread);
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
    if (isRecording) {
      currentSegment += strongEscapeXML(text);
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
      segments.push([true, currentSegment]);
      currentSegment = "";
      isRecording = false;
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
        translated += await translateChunk(segment[1]);
      } else {
        translated += segment[1];
      }
    }
    console.log(`Done translating all segments.`);
    const output_path = fileURLToPath(
      import.meta.resolve("../../xml_cn" + filePath)
    );

    // Ensure directory exists
    const dir = path.dirname(output_path);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(output_path, translated);
    console.log(`Translation saved to ${output_path}`);
  });

  try {
    // Pipe the XML file into the parser.
    const input_dir = fileURLToPath(
      import.meta.resolve("../../xml" + filePath)
    );
    console.log(input_dir);
    fs.createReadStream(input_dir).pipe(parser);
  } catch (parseErr) {
    console.error("Error parsing XML:", parseErr);
  }

  async function translateChunk(chunk: string) {
    // console.log("translating chunk: " + chunk);
    // Create a SAX parser in strict mode for cleaning up translations.
    const clean = (sax as any).createStream(true, { trim: false });

    // SAX parser to remove any excess text (artifacts, annotations etc.) from LLM outside of XML tags
    let currDepth = -1;

    clean.on("text", text => {
      if (currDepth >= 1) {
        translated += strongEscapeXML(text);
      }
    });

    clean.on("opentag", node => {
      currDepth++;
      if (node.name != "WRAPPER") {
        translated += `<${node.name}${formatAttributes(node.attributes)}>`;
      }
    });

    clean.on("closetag", tagName => {
      if (tagName != "WRAPPER") {
        translated += `</${tagName}>`;
      }
      currDepth--;
    });

    clean.on("cdata", cdata => {
      translated += `<![CDATA[${cdata}]]>`;
    });

    clean.on("comment", comment => {
      translated += `<!-- ${comment} -->`;
    });

      clean.on("error", error => {
    console.log(
      "error encountered when validating XML: " +
      error +
      "\nvalidating section: " +
      chunk.substring(0, 100) + "..."
    );
    
    // Attempt to recover using the internal parser
    try {
      clean._parser.resume();
    } catch (e) {
      console.log("Failed to resume parser:", e);
    }
  });

    let translated = "";

    try {
      await ai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Translate this content to ${language}.
                ${chunk}`
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
      // console.log(text.value);

      const safeText: String = escapeXML(text.value);
      const textStream = Readable.from("<WRAPPER>" + safeText + "</WRAPPER>");

      await new Promise<void>((resolve, reject) => {
        clean.once("end", resolve);
        clean.once("error", reject);
        textStream.pipe(clean);
      });

      return translated;
    } catch (err) {
      console.log(`Error occured while translating ${filePath}:\n    ` + err);
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
  return str.replace(/&(?!(?:amp;|lt;|gt;|apos;|quot;))/g, "&amp;");
}



function strongEscapeXML(str: string): string {
  return str
    .replace(/&(?!(?:amp;|lt;|gt;|apos;|quot;))/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}