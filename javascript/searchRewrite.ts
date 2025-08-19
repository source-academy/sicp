import fs from "node:fs";
import { insert, TrieNode } from "./search/TrieNode.js";

// line 3 to 68: trie implementation and search functions

export const getUrl = searchResult =>
  `https://sourceacademy.nus.edu.sg/sicpjs/${searchResult.id}`;

// search data, maintaining and updation functions and write function from this line onwards
export const idToContentMap = {};
export const textTrie = new TrieNode();
export const indexTrie = new TrieNode();

const parseIndexSearchEntryTo = (node, json) => {
  if (node === null) return;
  if (indexParsers[node.nodeName]) {
    indexParsers[node.nodeName](node, json);
    return;
  }
};

const indexParsers = {
  "#text": (node, json) => {
    json["text"] += node.nodeValue;
  },

  OPERATOR: (node, json) => {
    json["text"] += "operators";
  },
  PARSING: (node, json) => {
    json["text"] += "parsing JavaScript";
  },
  FUNCTION: (node, json) => {
    json["text"] += "function (JavaScript)";
  },
  PRIMITIVE: (node, json) => {
    json["text"] +=
      "primitive functions (ECMAScript equivalent in parentheses if they are in the ECMAScript standard)";
  },
  ENDASH: (node, json) => {
    json["text"] += "–";
  },
  APOS: (node, json) => {
    json["text"] += "'";
  },
  EACUTE_LOWER: (node, json) => {
    json["text"] += "é";
  },
  AACUTE_LOWER: (node, json) => {
    json["text"] += "á";
  },
  AACUTE_UPPER: (node, json) => {
    json["text"] += "Á";
  },
  SPACE: (node, json) => {
    json["text"] += " ";
  },
  // next and only child is text nodes
  ECMA: (node, json) => {
    if (node.firstChild.nodeName !== "#text") {
      console.log(
        "when parsing ECMA, got this unknown node name" +
          node.firstChild.nodeName
      );
      return;
    }
    json["text"] += ` (${node.firstChild.nodeValue})`;
  },
  JAVASCRIPTINLINE: (node, json) => {
    if (node.firstChild.nodeName !== "#text") {
      console.log(
        "when parsing JAVASCRIPTINLINE, got this unknown node name" +
          node.firstChild.nodeName
      );
      return;
    }
    json["text"] += node.firstChild.nodeValue;
  },
  QUOTE: (node, json) => {
    if (node.firstChild.nodeName !== "#text") {
      console.log(
        "when parsing QUOTE, got this unknown node name" +
          node.firstChild.nodeName
      );
      return;
    }
    json["text"] += `"${node.firstChild.nodeValue}"`;
  },
  USE: (node, json) => {
    if (node.firstChild.nodeName !== "#text") {
      console.log(
        "when parsing USE, got this unknown node name" +
          node.firstChild.nodeName
      );
      return;
    }
    json["text"] += node.firstChild.nodeValue;
    json["ORDER"] = node.firstChild.nodeValue;
  },
  DECLARATION: (node, json) => {
    if (node.firstChild.nodeName !== "#text") {
      console.log(
        "when parsing USE, got this unknown node name" +
          node.firstChild.nodeName
      );
      return;
    }
    json["text"] += node.firstChild.nodeValue;
    json["ORDER"] = node.firstChild.nodeValue;
  },
  ORDER: (node, json) => {
    if (node.firstChild.nodeName !== "#text") {
      console.log(
        "when parsing ORDER, got this unknown node name" +
          node.firstChild.nodeName
      );
      return;
    }
    json["ORDER"] = node.firstChild.nodeValue;
  },
  // other nodes
  CLOSE: (node, json) => {
    json["CLOSE"] = true;
  },
  OPEN: (node, json) => {
    json["OPEN"] = true;
  },
  SUBINDEX: (node, json) => {
    const newJson = { text: "" };
    json["SUBINDEX"] = newJson;
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      parseIndexSearchEntryTo(child, newJson);
    }
  },
  SPLITINLINE: (node, json) => {
    const javascriptNode = node.getElementsByTagName("JAVASCRIPT")[0];
    if (!javascriptNode) {
      console.log("when parsing SPLITINLINE, got no JAVASCRIPT node");
      return;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      parseIndexSearchEntryTo(child, json);
    }
  },
  INDEX: (node, json) => {
    json["text"] = "";
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      parseIndexSearchEntryTo(child, json);
    }
    if (node.getElementsByTagName("PRIMITIVE")[0]) {
      json.SUBINDEX.text = json.SUBINDEX.text.replace(" (\\textit{ns})", "");
    }
  },

  //todo
  LATEXINLINE: (node, json) => {
    json["text"] += `LATEX: ${node.firstChild.nodeValue}`;
  }
};

const maintainOpenClose = (json, writeTo) => {
  if (json.OPEN) {
    writeTo["text"] += " (begin of range)";
    if (!writeTo["id"].includes("#")) {
      writeTo["id"] += "#begin";
    }
  }

  if (json.CLOSE) {
    writeTo["text"] += " (end of range)";
    if (!writeTo["id"].includes("#")) {
      writeTo["id"] += "#end";
    }
  }
};

export const parseAndInsertToIndexTrie = (node, json) => {
  parseIndexSearchEntryTo(node, json);
  const frontEndDisplayable = {
    text: "",
    order: "",
    id: "",
    hasSubindex: false
  };
  frontEndDisplayable["id"] = json.id;
  // build text for front end display, build prefix, main text and subindex text seperately
  let chapterId = json.id.split("#")[0];
  const num = chapterId.split(".").length;
  if (num === 1) {
    chapterId = "    " + chapterId;
  } else if (num === 2) {
    chapterId = "  " + chapterId;
  }
  frontEndDisplayable["text"] = chapterId + ": " + json.text;
  if (json.SUBINDEX) {
    frontEndDisplayable["hasSubindex"] = true;
    frontEndDisplayable["text"] += ` :: ${json.SUBINDEX.text}`;
    if (json.SUBINDEX.ORDER) {
      frontEndDisplayable["order"] = json.SUBINDEX.ORDER;
    } else {
      frontEndDisplayable["order"] = json.SUBINDEX.text;
    }

    maintainOpenClose(json.SUBINDEX, frontEndDisplayable);
  }
  maintainOpenClose(json, frontEndDisplayable);
  insert(json.text, frontEndDisplayable, indexTrie);
};

export const parseAndInsertToIdToContentMap = (
  json,
  chapterIndex,
  parentID = chapterIndex
) => {
  if (Array.isArray(json)) {
    for (let i = 0; i < json.length; i++) {
      parseAndInsertToIdToContentMap(json[i], chapterIndex, parentID);
    }
    return;
  }

  if (json.id && json.tag !== "SNIPPET") {
    const id = json.id.includes(chapterIndex)
      ? chapterIndex
      : chapterIndex + json.id;
    parentID = id;
    idToContentMap[id] = "";
  }
  if (json.body) {
    idToContentMap[parentID] += json.body;
  }
  if (json.child) {
    parseAndInsertToIdToContentMap(json.child, chapterIndex, parentID);
  }
};

const buildTextTrie = () => {
  console.log("enter buildTextTrie");
  for (const [key, value] of Object.entries(idToContentMap)) {
    const temp = value.match(/\b\w+\b/g);
    if (temp === null) {
      // some json node does not have text content, there id is stored, but no text value, so we skip them here
      continue;
    }
    const words = Array.from(new Set(temp.map(word => word.toLowerCase())));
    words.map(word => insert(word, key, textTrie));
  }
};

export const writeRewritedSearchData = () => {
  buildTextTrie();

  const searchData = { indexTrie, textTrie, idToContentMap };
  fs.writeFile(
    "json/rewritedSearchData.json",
    JSON.stringify(searchData),
    err => {
      if (err) {
        console.log(err);
      }
    }
  );
};
