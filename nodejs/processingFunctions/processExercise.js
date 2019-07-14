import { recursiveProcessText, processText } from '../parseXML';
import {getChildrenByTagName, ancestorHasTag} from '../utilityFunctions';

let unlabeledEx = 0;
const processExercise = (node, writeTo) => {
  const label = getChildrenByTagName(node, "LABEL")[0];
  let labelName = "";
  const solution = node.getElementsByTagName("SOLUTION")[0];
  if (solution) {
    if (!label) {
      labelName = "ex:unlabeled" + unlabeledEx;
      unlabeledEx += 1;
    } else {
      labelName = label.getAttribute("NAME");
    }
  }

  writeTo.push("\n\\stepcounter{ExerciseDisplayNumber}\n\\begin{Exercise}");
  if (solution && !label) {
    writeTo.push("\n\\label{" + labelName + "}");
  }
  writeTo.push("\n");

  recursiveProcessText(node.firstChild, writeTo);
  if (solution) {
    writeTo.push("\\hfill{\\hyperref[" + labelName + "-Answer]{Solution}}\\\\");
  }
  writeTo.push("\n\\end{Exercise}\n");

  if (solution) {
    writeTo.push("\n\\begin{Answer}[ref={" + labelName + "}]\n");
    recursiveProcessText(solution.firstChild, writeTo);
    writeTo.push("\n\\end{Answer}\n");
  }
};

export default processExercise;