import fs from 'fs';
import path from 'path';

import xpath from 'xpath';
import {DOMParser as dom} from 'xmldom';

import replaceTagWithSymbol from './replaceTagWithSymbol';
import processEpigraph from './processEpigraph';
import processFileInput from './processFileInput';
import processFigure from './processFigure';
import {
  processIndex,
  processList,
  processSnippet,
  processText,
  recursiveProcessText
} from './parseText';

const tagsToRemove = new Set(["#comment", "COMMENT", "CHANGE", "EXCLUDE", "HISTORY", "SCHEME", "SCHEMEINLINE", "EXERCISE", "SOLUTION"]);
// const unprocessed = new Set([]);

const parseXML = (node, writeTo) => {
  if (!node) return;
  const name = node.nodeName;

  switch (name) {
    case "#text":
      const trimedValue = node.nodeValue.replace(/\s+/g, " ");
      if (trimedValue.match(/&(\w|\.)+;/)) {
        processFileInput(trimedValue.trim(), writeTo);
      }
      else if (!trimedValue.match(/^\s*$/)) {
        writeTo.push(trimedValue.replace(/%/g, "\\%"));
      }
      break;

    case "TEXT":
    case "P":
      writeTo.push("\n\n");
      recursiveProcessText(node.firstChild, writeTo);
      writeTo.push("\n");
      break;

    case "CHAPTER":
      writeTo.push("\\chapter{");
      parseXML(node.firstChild, writeTo);
      break;

    case "EPIGRAPH":
      processEpigraph(node, writeTo);
      break;

    case "FIGURE":
      processFigure(node, writeTo);
      break;

    case "INDEX":
      processIndex(node, writeTo);
      break;

    case "LABEL":
      writeTo.push("\\label{"
        + node.getAttribute("NAME")
        + "}\n");
      break;
    
    case "NAME":
      parseXML(node.firstChild, writeTo);
      writeTo.push("}\n");
      break;

    case "SECTION":
      writeTo.push("\\section{");
      parseXML(node.firstChild, writeTo);
      break;

    case "SNIPPET":
      processSnippet(node, writeTo);
      break;
      
    case "SUBHEADING":
    case "SUBSUBSUBSECTION":
      writeTo.push("\\subsubsection{");
      parseXML(node.firstChild, writeTo);
      break;

    case "SUBSECTION":
      writeTo.push("\\subsection{");
      parseXML(node.firstChild, writeTo);
      break;

    case "OL":
    case "EM":
    case "FOOTNOTE":
    case "JAVASCRIPTINLINE":
    case "REF":
    case "UL":
      processText(node, writeTo);
      break;

    default:
      if (!replaceTagWithSymbol(node, writeTo) && !tagsToRemove.has(name)) {
        // unprocessed.add(name);
        parseXML(node.firstChild, writeTo);
      }
  }

  parseXML(node.nextSibling, writeTo);
}

export default parseXML;


// unaccounted
// Set {
//   'CHAPTERCONTENT',
//   'LABEL',
//   'SUBINDEX',
//   'SECTIONCONTENT',
//   'EXERCISE',
//   'QUOTE',
//   'JAVASCRIPTINLINE',
//   'SOLUTION',
//   'EM',
//   'P',
//   'REF',
//   'CITATION',
//   'span',
//   'TREETAB',
//   'CHANGE',
//   'OMISSION',
//   'BR' }