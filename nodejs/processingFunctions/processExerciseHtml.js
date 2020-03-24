import { recursiveProcessTextHtml, processTextHtml } from '../parseXmlHtml';
import { getChildrenByTagName, ancestorHasTag } from '../utilityFunctions';
import { missingExerciseWarning } from "./warnings.js";
import { referenceStore } from './processReferenceHtml';

let unlabeledEx = 0;
const processExerciseHtml = (node, writeTo) => {
  const label = node.getElementsByTagName("LABEL")[0];
  let labelName = "";
  const solution = node.getElementsByTagName("SOLUTION")[0];
  
  if (!label) {
    unlabeledEx ++;
    labelName = "ex:unlabeled" + unlabeledEx;

  } else {
    labelName = label.getAttribute("NAME");
  }
  
  if (!referenceStore[labelName]) {
    missingExerciseWarning(labelName);
    return;
  }
  const href = referenceStore[labelName].href;
  const displayName = referenceStore[labelName].displayName;

  writeTo.push(`
    <div class="permalink">
    <a name="ex_${displayName}" class="permalink"></a><EXERCISE><b><a class="exercise-number permalink" id="ex_${displayName}">Exercise ${displayName} </a></b> 
  `);
  
  recursiveProcessTextHtml(node.firstChild, writeTo);
 
  if (solution) {
    
    writeTo.push(`
      <div class="Solution">
      <div class="solution_btn"><button class="btn btn-secondary solution_btn" href="#solution_${displayName}" data-toggle="collapse">Solution</button></div>
      <div class="solution_content collapse" id="solution_${displayName}"><SOLUTION>
    `);
    recursiveProcessTextHtml(solution.firstChild, writeTo);
    writeTo.push("</SOLUTION></div></div>");
  } else {
    writeTo.push(`
      <div class="Solution">
      <div class="solution_btn"><button class="btn btn-secondary solution_btn" href="#no_solution_${displayName}" data-toggle="collapse">Add solution</button></div>
      <div class="solution_content collapse" id="no_solution_${displayName}">There is currently no solution available for this exercise. This textbook adaptation is a community effort. Do consider contributing by providing a solution for this exercise, using a Pull Request in <a address="https://github.com/source-academy/sicp" href="https://github.com/source-academy/sicp">Github</a>.</div>
      </div>
    `);
  }

  writeTo.push("\n</EXERCISE></div>\n")
};

export default processExerciseHtml;