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

const parseXML = (node, writeTo, options = {}) => {
  if (!node) return unprocessed;
  const name = node.nodeName;

  switch (name) {
    case "#text":
      let trimedValue = node.nodeValue.replace(/\s+/g, " ");
      if (options.trimNextFront) {
        trimedValue = trimedValue.replace(/^\s+/g, "");
      }
      if (trimedValue.match(/&(\w|\.)+;/)) {
        processFileInput(trimedValue.trim(), writeTo);
      }
      else if (!trimedValue.match(/^\s*$/)) {
        writeTo.push(trimedValue.replace(/%/g, "\\%"));
      }
      break;  

    case "ABOUT":
    case "REFERENCES":
    case "WEBPREFACE":
      writeTo.push("\\chapter*{")
      recursiveProcessText(node.getElementsByTagName("NAME")[0].firstChild, writeTo);
      writeTo.push("}\n\\addcontentsline{toc}{chapter}{");
      parseXML(node.firstChild, writeTo);
      break;

    case "CHAPTER":
      writeTo.push("\\pagestyle{main}\n\\chapter{");
      parseXML(node.firstChild, writeTo);
      break;

    case "EPIGRAPH":
      processEpigraph(node, writeTo);
      break;
    
    case "NAME":
      parseXML(node.firstChild, writeTo, {trimNextFront: true});
      writeTo.push("}\n\n");
      break;

    case "SECTION":
      writeTo.push("\\pagestyle{section}\n\\section{");
      parseXML(node.firstChild, writeTo);
      break;
      
    case "SUBHEADING":
    case "SUBSUBSUBSECTION":
      writeTo.push("\\subsubsection{");
      parseXML(node.firstChild, writeTo);
      break;

    case "SUBSECTION":
      writeTo.push("\\pagestyle{subsection}\n\\subsection{");
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
//   'CHAPTERCONTENT',
//   'SECTIONCONTENT'
//}