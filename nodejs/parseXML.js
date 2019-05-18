import fs from 'fs';
import path from 'path';

import xpath from 'xpath';
import {DOMParser as dom} from 'xmldom';

import processEpigraph from './processEpigraph';
import processFileInput from './processFileInput';
import processFigure from './processFigure';
import {
  processList,
  processSnippet,
  processText,
  recursiveProcessText
} from './parseText';

const unprocessed = new Set([]);

const parseXML = (node, writeTo) => {
  if (!node) return unprocessed;
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

    case "CHAPTER":
      writeTo.push("\\chapter{");
      parseXML(node.firstChild, writeTo);
      break;

    case "EPIGRAPH":
      processEpigraph(node, writeTo);
      break;
    
    case "NAME":
      parseXML(node.firstChild, writeTo);
      writeTo.push("}\n\n");
      break;

    case "SECTION":
      writeTo.push("\\section{");
      parseXML(node.firstChild, writeTo);
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

    default:
      if (processText(node, writeTo)) {
        break
      } else {
        unprocessed.add(name);
        parseXML(node.firstChild, writeTo);
      }
  }

  return parseXML(node.nextSibling, writeTo);
}

export default parseXML;


// unaccounted
// Set {
//   'SPLITINLINE',
//   'JAVASCRIPT',
//   'CHAPTERCONTENT',
//   'SPLIT',
//   'ABOUT',
//   'H2',
//   'LINK',
//   'TT',
//   'LATEXINLINE',
//   'REFERENCES',
//   'REFERENCE',
//   'em',
//   'EGRAVE',
//   'sup',
//   'WEBPREFACE',
//   'SECTIONCONTENT',
//   'JAVASCIPT' }