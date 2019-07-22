
import replaceTagWithSymbol from "./replaceTagWithSymbol";
import processEpigraph from "./processEpigraph";
import processFigure, { generateImage } from "./processFigure";
import processFigureEpub from "./processFigureEpub";
import processExercise from './processExercise';
import processExerciseEpub from './processExerciseEpub';

import processFileInput from "./processFileInput";
import processSnippet from './processSnippet';
import processSnippetEpub from './processSnippetEpub';
import processTable from './processTable'
import recursiveProcessPureText from './recursiveProcessPureText';

import { recursiveProcessText, processText } from '../parseXML';
import {getChildrenByTagName, ancestorHasTag} from '../utilityFunctions';

export const processList = (node, writeTo) => {
  if (!node) return;
  if (node.nodeName == "LI") {
    writeTo.push("\\item{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n");
  }
  return processList(node.nextSibling, writeTo);
};

export const addName = (node, writeTo) => {
  const nameArr = [];
  recursiveProcessText(
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
	processEpigraph,
  processFigure,
  processFigureEpub,
	generateImage,
  processExercise,
  processExerciseEpub,
	processFileInput,
  processSnippet,
  processSnippetEpub,
	processTable,
	recursiveProcessPureText
}