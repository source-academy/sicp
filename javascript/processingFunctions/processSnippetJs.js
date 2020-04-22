import lzString from "lz-string";
import {
  checkLongLineWarning,
  missingRequireWarning,
  missingExampleWarning,
  repeatedNameWarning
} from "./warnings.js";
import recursiveProcessPureText from "./recursiveProcessPureText";

const snippetStore = {};

export const setupSnippetsJs = node => {
  const snippets = node.getElementsByTagName("SNIPPET");
  for (let i = 0; snippets[i]; i++) {
    const snippet = snippets[i];
    const jsSnippet = snippet.getElementsByTagName("JAVASCRIPT")[0];
    let jsRunSnippet = snippet.getElementsByTagName("JAVASCRIPT_RUN")[0];
    if (!jsRunSnippet) {
      jsRunSnippet = jsSnippet;
    }
    const snippetName = snippet.getElementsByTagName("NAME")[0];
    if (snippetName && jsSnippet) {
      const nameStr = snippetName.firstChild.nodeValue;
      if (snippetStore[nameStr]) {
        repeatedNameWarning(nameStr);
        return;
      }
      const codeArr = [];
      recursiveProcessPureText(jsRunSnippet.firstChild, codeArr);

      if (snippet.getElementsByTagName("EXPECTED")[0]) {
        codeArr.push(
          "\n// result: " +
            snippet.getElementsByTagName("EXPECTED")[0].firstChild.nodeValue +
            "\n"
        );
      }

      const codeStr = codeArr.join("").trim();

      const requirements = snippet.getElementsByTagName("REQUIRES");
      const requireNames = [];
      for (let i = 0; requirements[i]; i++) {
        requireNames.push(requirements[i].firstChild.nodeValue);
      }

      snippetStore[nameStr] = { codeStr, requireNames };
    }
  }
};

const sourceAcademyURL = "https://sourceacademy.nus.edu.sg";
// to change to localhost if required
// http://localhost:8075

const recursiveGetRequires = (name, seen) => {
  if (seen.has(name)) return;
  seen.add(name);
  const snippetEntry = snippetStore[name];
  if (!snippetEntry) {
    missingRequireWarning(name);
    return;
  }
  for (const requirement of snippetEntry.requireNames) {
    recursiveGetRequires(requirement, seen);
  }
};

export const processSnippetJs = (node, writeTo, fileFormat) => {
  if (node.getAttribute("HIDE") == "yes") {
    return;
  }

  const jsSnippet = node.getElementsByTagName("JAVASCRIPT")[0];
  if (jsSnippet) {
    // JavaScript source for running. Overrides JAVASCRIPT if present.
    let jsRunSnippet = node.getElementsByTagName("JAVASCRIPT_RUN")[0];
    if (!jsRunSnippet) {
      jsRunSnippet = jsSnippet;
    }

    const codeArr = [];
    recursiveProcessPureText(jsSnippet.firstChild, codeArr);
    const codeStr = codeArr.join("").trim();

    const codeArr_run = [];
    recursiveProcessPureText(jsRunSnippet.firstChild, codeArr_run);
    const codeStr_run = codeArr_run.join("").trim();

    let reqStr = "";
    let reqArr = [];
    const snippetName = node.getElementsByTagName("NAME")[0];
    let nameStr;
    if (snippetName) {
      nameStr = snippetName.firstChild.nodeValue;
      const reqSet = new Set();
      recursiveGetRequires(nameStr, reqSet);
      for (const reqName of reqSet) {
        const snippetEntry = snippetStore[reqName];
        if (snippetEntry && reqName !== nameStr) {
          reqArr.push(snippetEntry.codeStr);
          reqArr.push("\n");
        }
      }
      reqStr = reqArr.join("");
    } else {
      const requirements = node.getElementsByTagName("REQUIRES");
      for (let i = 0; requirements[i]; i++) {
        const required = requirements[i].firstChild.nodeValue;
        if (snippetStore[required]) {
          reqArr.push(snippetStore[required].codeStr);
          reqArr.push("\n");
        } else {
          missingRequireWarning(required);
        }
      }
      reqStr = reqArr.join("");
    }

    const examples = node.getElementsByTagName("EXAMPLE");
    const exampleArr = [];
    for (let i = 0; examples[i]; i++) {
      const example = examples[i].firstChild.nodeValue;
      if (snippetStore[example]) {
        exampleArr.push("\n\n");
        exampleArr.push(snippetStore[example].codeStr);

        reqStr = reqArr.join("");
      } else {
        missingExampleWarning(example);
      }
    }
    const exampleStr = exampleArr.join("") + "\n";

    if (fileFormat == "js") {
      writeTo.push(reqStr);
      writeTo.push(codeStr_run);
      writeTo.push(exampleStr);
      return;
    }
  }
};

export default processSnippetJs;
