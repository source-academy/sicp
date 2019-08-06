import fs from "fs";
import path from "path";

import xpath from "xpath";
import { DOMParser as dom } from "xmldom";

import processEpigraph from "./processEpigraph";
import processFileInput from "./processFileInput";
import processFigure from "./processFigure";
import {
  addName,
  processList,
  processSnippet,
  processText,
  recursiveProcessText
} from "./parseText";

const parseXML = (node, writeTo) => {
  if (!node) return;
  const name = node.nodeName;

  switch (name) {
    case "#text":
      let trimedValue = node.nodeValue.replace(/\s+/g, " ");
      if (trimedValue.match(/&(\w|\.)+;/)) {
        processFileInput(trimedValue.trim(), writeTo);
      } else {
        writeTo.push(trimedValue.replace(/%/g, "\\%"));
      }
      // else if (!trimedValue.match(/^\s*$/)) {
      // }
      break;

    case "ABOUT":
    case "REFERENCES":
    case "WEBPREFACE":
    case "MATTER":
      writeTo.push("\\chapter*{");
      addName(node, writeTo);
      writeTo.push("\n\\addcontentsline{toc}{chapter}{");
      addName(node, writeTo);
      parseXML(node.firstChild, writeTo);
      break;

    case "CHAPTER":
      writeTo.push("\\chapter{");
      addName(node, writeTo);
      writeTo.push("\\pagestyle{main}\n");
      parseXML(node.firstChild, writeTo);
      break;

    case "EPIGRAPH":
      processEpigraph(node, writeTo);
      break;

    case "SECTION":
      writeTo.push("\\section{");
      addName(node, writeTo);
      //writeTo.push("\\pagestyle{section}\n");
      parseXML(node.firstChild, writeTo);
      break;

    case "SUBHEADING":
    case "SUBSUBSUBSECTION":
      writeTo.push("\\subsubsection{");
      addName(node, writeTo);
      parseXML(node.firstChild, writeTo);
      break;

  case "MATTERSECTION":
      writeTo.push("\\section*{");
      addName(node, writeTo);
      parseXML(node.firstChild, writeTo);
      break;
      
  case "SUBSECTION":
      writeTo.push("\\subsection{");
      addName(node, writeTo);
      //writeTo.push("\\pagestyle{subsection}\n");
      parseXML(node.firstChild, writeTo);
      break;

    default:
      if (!processText(node, writeTo)) {
        parseXML(node.firstChild, writeTo);
      }
  }

  return parseXML(node.nextSibling, writeTo);
};

export default parseXML;

// unaccounted
// Set {
//   'CHAPTERCONTENT',
//   'SECTIONCONTENT'
//}
