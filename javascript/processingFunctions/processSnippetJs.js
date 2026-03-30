import {
  missingRequireWarning,
  missingExampleWarning,
  repeatedNameWarning
} from "./warnings.js";
import recursiveProcessPureText from "./recursiveProcessPureText";
import { processRuneModule } from "./processModuleImports.js";

const snippetStore = {};

export const setupSnippetsJs = node => {
  const snippets = node.getElementsByTagName("SNIPPET");
  for (let i = 0; snippets[i]; i++) {
    const snippet = snippets[i];
    const jsSnippet = snippet.getElementsByTagName("JAVASCRIPT")[0];
    let jsRunSnippet = snippet.getElementsByTagName("JAVASCRIPT_RUN")[0];
    let jsTestSnippet = snippet.getElementsByTagName("JAVASCRIPT_TEST")[0];
    if (jsTestSnippet) {
      jsRunSnippet = jsTestSnippet;
    } else {
      if (!jsRunSnippet) {
        jsRunSnippet = jsSnippet;
      }
    }
    const snippetName = snippet.getElementsByTagName("NAME")[0];
    if (snippetName && jsRunSnippet) {
      const nameStr = snippetName.firstChild.nodeValue;
      if (snippetStore[nameStr]) {
        repeatedNameWarning(nameStr);
        return;
      }
      const codeArr = [];
      recursiveProcessPureText(jsRunSnippet.firstChild, codeArr);

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

const recursiveGetRequires = (name, seen) => {
  //  console.log("in recursiveGetRequires: " + name);
  if (seen.has(name)) return;
  const snippetEntry = snippetStore[name];
  if (!snippetEntry) {
    missingRequireWarning(name);
    return;
  }
  for (const requirement of snippetEntry.requireNames) {
    recursiveGetRequires(requirement, seen);
  }
  seen.add(name);
};

export const processSnippetJs = (node, writeTo, fileFormat) => {
  const jsSnippet = node.getElementsByTagName("JAVASCRIPT")[0];
  if (jsSnippet) {
    if (node.getAttribute("CHAP") || node.getAttribute("VARIANT")) {
      writeTo.push("// ");
      if (node.getAttribute("CHAP")) {
        writeTo.push("chapter=" + node.getAttribute("CHAP") + " ");
      }
      if (node.getAttribute("VARIANT")) {
        writeTo.push("variant=" + node.getAttribute("VARIANT") + " ");
      }
      writeTo.push("\n");
    }

    // JavaScript source for running. Overrides JAVASCRIPT if present.
    let jsRunSnippet = node.getElementsByTagName("JAVASCRIPT_RUN")[0];
    let jsTestSnippet = node.getElementsByTagName("JAVASCRIPT_TEST")[0];
    if (jsTestSnippet) {
      jsRunSnippet = jsTestSnippet;
    } else {
      if (!jsRunSnippet) {
        jsRunSnippet = jsSnippet;
      }
    }
    const codeArr_run = [];
    recursiveProcessPureText(jsRunSnippet.firstChild, codeArr_run);
    const codeStr_run = codeArr_run.join("").trim();

    const reqSet = new Set();
    const snippetName = node.getElementsByTagName("NAME")[0];
    if (snippetName) {
      recursiveGetRequires(snippetName.firstChild.nodeValue, reqSet);
    }
    const requirements = node.getElementsByTagName("REQUIRES");
    for (let i = 0; requirements[i]; i++) {
      recursiveGetRequires(requirements[i].firstChild.nodeValue, reqSet);
    }
    const examples = node.getElementsByTagName("EXAMPLE");
    for (let i = 0; examples[i]; i++) {
      const exampleName = examples[i].firstChild.nodeValue;
      recursiveGetRequires(exampleName, reqSet);
    }

    const reqArr = [];
    for (const reqName of reqSet) {
      const snippetEntry = snippetStore[reqName];
      if (snippetEntry) {
        reqArr.push(snippetEntry.codeStr);
        reqArr.push("
");
      }
    }
    const reqStr = reqArr.join("");
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

    let ext = node.getAttribute("EXT");

    if (ext === "RUNES") {
      writeTo.push(
        processRuneModule(reqStr + " " + codeStr_run + exampleStr) + "\n\n"
      );
    }

    if (fileFormat == "js") {
      writeTo.push(reqStr);
      writeTo.push(codeStr_run);
      writeTo.push(exampleStr);
      if (node.getElementsByTagName("EXPECTED")[0]) {
        writeTo.push(
          "\n// expected: " +
            node.getElementsByTagName("EXPECTED")[0].firstChild.nodeValue +
            "\n"
        );
      }
      return;
    }
  }
};

export default processSnippetJs;