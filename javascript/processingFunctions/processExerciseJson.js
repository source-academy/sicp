import { recursiveProcessText } from "../parseXmlJson";
import { missingExerciseWarning } from "./warnings.js";
import { referenceStore } from "./processReferenceJson";

let unlabeledEx = 0;
const processExerciseHtml = (node, obj) => {
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

  obj["title"] = "Exercise " + displayName;
  obj["id"] = `#ex_${displayName}`;

  recursiveProcessText(node.firstChild, obj);

  if (solution) {
    const childObj = {};
    recursiveProcessText(solution.firstChild, childObj);
    obj["solution"] = childObj["child"];
  }
};

export default processExerciseHtml;
