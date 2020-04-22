import replaceTagWithSymbol from "./replaceTagWithSymbol";
import { getChildrenByTagName, ancestorHasTag } from "../utilityFunctions";
import processFileInput from "./processFileInput";
import recursiveProcessPureText from "./recursiveProcessPureText";

import { recursiveProcessTextLatex, processTextLatex } from "../parseXmlLatex";
import processEpigraphPdf from "./processEpigraphPdf";
import processExercisePdf from "./processExercisePdf";
import processExerciseEpub from "./processExerciseEpub";
import processFigurePdf, { generateImage } from "./processFigurePdf";
import processFigureEpub from "./processFigureEpub";
import processSnippetPdf from "./processSnippetPdf";
import processSnippetEpub from "./processSnippetEpub";
import processSnippetJs from "./processSnippetJs";
import processTable from "./processTable";

import { recursiveProcessTextHtml, processTextHtml } from "../parseXmlHtml";
import processEpigraphHtml from "./processEpigraphHtml";
import processExerciseHtml from "./processExerciseHtml";
import processFigureHtml from "./processFigureHtml";
import processReferenceHtml from "./processReferenceHtml";
import processSnippetHtml from "./processSnippetHtml";
import processSnippetHtmlScheme from "./processSnippetHtml_scheme";

export const processList = (node, writeTo) => {
  if (!node) return;
  if (node.nodeName == "LI") {
    writeTo.push("\\item{");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}\n");
  }
  return processList(node.nextSibling, writeTo);
};

export const addName = (node, writeTo) => {
  const nameArr = [];
  recursiveProcessTextLatex(
    getChildrenByTagName(node, "NAME")[0].firstChild,
    nameArr
  );
  const name = nameArr.join("").trim();
  writeTo.push(name);
  writeTo.push("}\n\n");
  return name;
};

export {
  replaceTagWithSymbol,
  processFileInput,
  recursiveProcessPureText,
  processEpigraphPdf,
  processFigurePdf,
  processFigureEpub,
  generateImage,
  processExercisePdf,
  processExerciseEpub,
  processSnippetPdf,
  processSnippetEpub,
  processSnippetJs,
  processTable,
  processEpigraphHtml,
  processExerciseHtml,
  processFigureHtml,
  processReferenceHtml,
  processSnippetHtml,
  processSnippetHtmlScheme
};
