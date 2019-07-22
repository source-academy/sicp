import { recursiveProcessText, processText } from '../parseXML';
import {getChildrenByTagName, ancestorHasTag} from '../utilityFunctions';

let unlabeledEx = 0;
const processExerciseEpub = (node, writeTo) => {
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

  writeTo.push("\n\\subsubsection{Exercise}");
  if (solution && !label) {
    writeTo.push("\n\\label{" + labelName + "}");
  }
  writeTo.push("\n");

  recursiveProcessText(node.firstChild, writeTo);

  if (solution) {
    writeTo.push("\n\\paragraph{Solution}");
    recursiveProcessText(solution.firstChild, writeTo);
  }
};

export default processExerciseEpub;