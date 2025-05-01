import sax from "sax";
import { escapeXML, formatAttributes, strongEscapeXML } from "./xmlUtilities";
import { Readable } from "stream";
import { ignoredTags, max_chunk_len } from "../config";
import fs, { PathLike } from "fs";
import { FileLike } from "openai/uploads.mjs";

const MAXLEN = max_chunk_len;
const createParser = () =>
  (sax as any).createStream(false, { trim: false }, { strictEntities: true });

export async function cleanParser(
  text: string,
  filePath: string,
  logError: Function
): Promise<string> {
  let translatedChunk = "";
  const safeText = escapeXML(text);
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
      logError(`Error validating AI response for ${filePath}`, error, filePath);

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
}

export async function splitParser(filePath: PathLike, logError: Function): Promise<[boolean, string][]> {
  // Create a SAX parser in strict mode to split source into chunks.
  const parser = createParser();

  const segments: [boolean, string][] = [];
  await new Promise<void>((resolve, reject) => {
    // Variables to track current depth and segments.
    let currentDepth = 0;
    let currentSegment = "";

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
            Number(MAXLEN)
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

  return segments;
}

export async function recurSplitParser(ori: string, filePath: PathLike, logError: Function): Promise<string[]> {
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
            Number(MAXLEN)
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

      subParser.on("end", async () => 
        resolve()
      );

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

    return subTranslated;
}
