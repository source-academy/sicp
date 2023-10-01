import { recursiveProcessTextJson } from "../parseXmlJson";
import { missingExerciseWarning } from "./warnings.js";
import { referenceStore } from "./processReferenceJson";

let unlabeledEx = 0;
const processExerciseJson = (node, obj) => {
  const label = node.getElementsByTagName("LABEL")[0];
  let labelName = "";
  const solution = node.getElementsByTagName("SOLUTION")[0];

  if (!label) {
    unlabeledEx++;
    labelName = "ex:unlabeled" + unlabeledEx;
  } else {
    labelName = label.getAttribute("NAME");
  }

  if (!referenceStore[labelName]) {
    missingExerciseWarning(labelName);
    return;
  }

  const displayName = referenceStore[labelName].displayName;

  obj["tag"] = "EXERCISE";
  obj["title"] = "Exercise " + displayName;
  obj["id"] = `#ex-${displayName}`;

  recursiveProcessTextJson(node.firstChild, obj);

  if (solution) {
    const childObj = {};
    recursiveProcessTextJson(solution.firstChild, childObj);
    obj["solution"] = childObj["child"];
  }
};

export const getIdForExerciseJson = (node) => {
  const label = node.getElementsByTagName("LABEL")[0];
  let labelName = "";

  if (!label) {
    labelName = "ex:unlabeled" + unlabeledEx;
  } else {
    labelName = label.getAttribute("NAME");
  }

  if (!referenceStore[labelName]) {
    missingExerciseWarning(labelName);
    return undefined;
  }
   
  const displayName = referenceStore[labelName].displayName;
  return `#ex-${displayName}`;
}

export default processExerciseJson;
