import path from "path";
import fs from "fs";

import { processSnippetJs } from "./processingFunctions";

let snippet_count = 0;
let relativeFileDirectory = "";

const tagsToRemove = new Set([
  "#comment",
  "COMMENT",
  "CHANGE",
  "EDIT",
  "EXCLUDE",
  "HISTORY",
  "ORDER",
  "SCHEME",
  "INDEX",
  "LABEL",
  "NAME"
]);

const ignoreTags = new Set([
  "CHAPTERCONTENT",
  "NOBR",
  "span",
  "SPLITINLINE",
  "JAVASCRIPT"
]);

const preserveTags = new Set([
  "B",
  "EM",
  "QUOTE",
  "SPLIT",
  "UL",
  "LI",
  "OL",
  "SECTIONCONTENT",
  "CITATION"
]);

const processTextFunctions = {
  SNIPPET: (node, writeTo) => {
    if (node.getAttribute("LATEX") == "yes") {
      return;
    } else if (node.getAttribute("EVAL") === "no") {
      return;
    }

    const writeTojs = [];
    snippet_count += 1;

    const snippet_count_string =
      snippet_count < 10 ? "0" + snippet_count : snippet_count;
    processSnippetJs(node, writeTojs, "js");

    const nameNode = node.getElementsByTagName("NAME")[0];

    const fileName = nameNode
      ? snippet_count_string + "_" + nameNode.firstChild.nodeValue
      : snippet_count_string;

    const outputFile = path.join(relativeFileDirectory, fileName + `.js`);

    const stream = fs.createWriteStream(outputFile);
    stream.once("open", fd => {
      stream.write(writeTojs.join(""));
      stream.end();
    });
  }
};

const processText = (node, writeTo) => {
  const name = node.nodeName;
  if (name == "SNIPPET") {
    processTextFunctions[name](node, writeTo);
    return true;
  } else {
    if (tagsToRemove.has(name)) {
      return true;
    } else {
      recursiveProcessText(node.firstChild, writeTo);
      return true;
    }
  }
};

const recursiveProcessText = (node, writeTo) => {
  if (!node) return;
  processText(node, writeTo);
  return recursiveProcessText(node.nextSibling, writeTo);
};

export const parseXmlJs = (doc, writeTo, filename) => {
  snippet_count = 0;
  relativeFileDirectory = filename;

  recursiveProcessText(doc.documentElement, writeTo);
};
