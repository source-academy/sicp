import { getChildrenByTagName } from "../utilityFunctions.js";
import { recursivelyProcessTextSnippetJson } from "./processSnippetJson.js";

const processExerciseJson = (node, writeTo) => {
  const exercise = {
    type: "exercise",
    content: []
  };
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeName === "SNIPPET") {
      const snippet = [];
      recursivelyProcessTextSnippetJson(child.firstChild, snippet);
      const code = snippet.join("").trim();
      exercise.content.push({
        type: "snippet",
        code: code.replace(/const\s+(\w+)\s*=\s*/g, "$1 = ")
      });
    } else if (child.nodeName === "TEXT") {
      const text = [];
      recursivelyProcessTextSnippetJson(child.firstChild, text);
      exercise.content.push({
        type: "text",
        content: text.join("").trim()
      });
    }
  }
  writeTo.push(exercise);
};

export default processExerciseJson;