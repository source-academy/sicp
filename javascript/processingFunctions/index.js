import replaceTagWithSymbol from "./replaceTagWithSymbol.js";
import { getChildrenByTagName } from "../utilityFunctions.js";
import processFileInput from "./processFileInput.js";
import recursiveProcessPureText from "./recursiveProcessPureText.js";

import { recursiveProcessTextLatex } from "../parseXmlLatex.js";
import processAttributionPdf from "./processAttributionPdf.js";
import processEpigraphPdf from "./processEpigraphPdf.js";
import processExercisePdf from "./processExercisePdf.js";
import processFigurePdf, { generateImage } from "./processFigurePdf.js";
import processSnippetPdf from "./processSnippetPdf.js";
import processSnippetJs from "./processSnippetJs.js";
import processTablePdf from "./processTablePdf.js";

import processEpigraphHtml from "./processEpigraphHtml.js";
import processBlockquoteHtml from "./processBlockquoteHtml.js";
import processExerciseHtml from "./processExerciseHtml.js";
import processFigureHtml from "./processFigureHtml.js";
import processReferenceHtml from "./processReferenceHtml.js";
import processSnippetHtml from "./processSnippetHtml.js";
import processSnippetHtmlScheme from "./processSnippetHtml_scheme.js";

import processExerciseJson from "./processExerciseJson.js";
import processFigureJson from "./processFigureJson.js";
import {
  processSnippetJson,
  recursivelyProcessTextSnippetJson
} from "./processSnippetJson.js";
import processEpigraphJson from "./processEpigraphJson.js";
import processReferenceJson from "./processReferenceJson.js";

export const processList = (node, writeTo) => {
  if (!node) return;
  if (node.nodeName == "LI") {
    writeTo.push("\\item ");
    recursiveProcessTextLatex(node.firstChild, writeTo);
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
  processAttributionPdf,
  processEpigraphPdf,
  processFigurePdf,
  processFigureJson,
  generateImage,
  processExercisePdf,
  processSnippetPdf,
  processSnippetJs,
  processTablePdf,
  processEpigraphHtml,
  processEpigraphJson,
  processBlockquoteHtml,
  processExerciseHtml,
  processExerciseJson,
  processFigureHtml,
  processReferenceHtml,
  processReferenceJson,
  processSnippetHtml,
  processSnippetJson,
  processSnippetHtmlScheme,
  recursivelyProcessTextSnippetJson
};
