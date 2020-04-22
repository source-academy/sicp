import path from "path";
import fs from "fs";
import util from "util";

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
  "SOLUTION",
  "INDEX",
  "LABEL",
  "NAME"
]);
// SOLUTION tag handled by processSnippet

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
    if (node.getAttribute("HIDE") == "yes") {
      return;
    } else if (node.getAttribute("LATEX") == "yes") {
      return;
    } else if (node.getAttribute("EVAL") === "no") {
      return;
    }

    const writeTojs = [];
    snippet_count += 1;
    processSnippetJs(node, writeTojs, "js");

    const outputFile = path.join(relativeFileDirectory, `${snippet_count}.js`);

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
