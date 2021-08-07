import lzString from "lz-string";
import {
  missingRequireWarning,
  missingExampleWarning,
  repeatedNameWarning
} from "./warnings.js";
import { chapterIndex } from "../parseXmlJson";
import recursiveProcessPureText from "./recursiveProcessPureText";
import { processRuneModule } from "./processModuleImports.js";

const snippetStore = {};

export const setupSnippetsJson = node => {
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
      const codeStr = codeArr
        .join("")
        .trim();

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
  // console.log("in recursiveGetRequires: " + name);
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

const addToSnippet = (tag, value, snippet) => {
  snippet[tag] = value;
};

export const recursivelyProcessTextSnippetJson = (node, writeTo) => {
  if (!node) return;

  const name = node.nodeName;
  if (name === "#text") {
    if (!node.nodeValue.match(/&(\w|\.|\d)+;/)) {
      let s = node.nodeValue;
      writeTo.push(s);
    }
  } else if (name === "META") {
    writeTo.push("$");
    let s = node.firstChild.nodeValue;
    s = s.replace(/-/g, "$-$").replace(/ /g, "\\ ");
    writeTo.push(s);
    writeTo.push("$");
  } else if (name === "METAPHRASE") {
    writeTo.push("$\\langle{}$");
    recursivelyProcessTextSnippetJson(node.firstChild, writeTo);
    writeTo.push("$\\rangle$");
  } else if (name === "JAVASCRIPTINLINE") {
    recursivelyProcessTextSnippetJson(node.firstChild, writeTo);
  } else if (name === "#comment" || name === "ALLOW_BREAK") {
    return;
  } else if (name === "SHORT_SPACE" || name === "SHORT_SPACE_AND_ALLOW_BREAK") {
    writeTo.push("\n");
  } else {
    console.log(`processSnippetJson: UNRECOGNISED TAG ${name}\n\n`);
  }

  return recursivelyProcessTextSnippetJson(node.nextSibling, writeTo);
};

export const processSnippetJson = (node, snippet) => {
  if (node.getAttribute("HIDE") == "yes") {
    return;
  }

  addToSnippet("eval", false, snippet);

  const jsPromptSnippet = node.getElementsByTagName("JAVASCRIPT_PROMPT")[0];

  if (jsPromptSnippet) {
    addToSnippet("body", jsPromptSnippet.firstChild.nodeValue.trim(), snippet);
  }

  const jsSnippet = node.getElementsByTagName("JAVASCRIPT")[0];
  const jsOutputSnippet = node.getElementsByTagName("JAVASCRIPT_OUTPUT")[0];

  if (jsSnippet) {
    // JavaScript source for running. Overrides JAVASCRIPT if present.
    let jsRunSnippet = node.getElementsByTagName("JAVASCRIPT_RUN")[0];
    if (!jsRunSnippet) {
      jsRunSnippet = jsSnippet;
    }

    const codeArr = [];
    recursiveProcessPureText(jsSnippet.firstChild, codeArr);
    let codeStr = codeArr
      .join("")
      .trim();

    // Remove newline from beginning and end
    codeStr = codeStr.replace(/^[\r\n]+/g, "");
    codeStr = codeStr.replace(/[\r\n\s]+$/g, "");

    const codeArr_run = [];
    if (jsRunSnippet) {
      recursiveProcessPureText(jsRunSnippet.firstChild, codeArr_run);
    }
    const codeStr_run = codeArr_run
      .join("")
      .trim();

    if (node.getAttribute("EVAL") === "no") {
      addToSnippet("body", codeStr, snippet);
    } else {
      addToSnippet("eval", true, snippet);
      let reqStr = "";
      let reqArr = [];
      const snippetName = node.getElementsByTagName("NAME")[0];
      let nameStr;
      if (snippetName) {
        nameStr = snippetName.firstChild.nodeValue;
        const reqSet = new Set();
        recursiveGetRequires(nameStr, reqSet);
        const examples = node.getElementsByTagName("EXAMPLE");
        for (let i = 0; examples[i]; i++) {
          const exampleString = examples[i].firstChild.nodeValue;
          const exampleNode = snippetStore[exampleString];
          if (exampleNode) {
            const exampleRequires = exampleNode.requireNames;
            for (let j = 0; exampleRequires[j]; j++) {
              recursiveGetRequires(exampleRequires[j], reqSet);
            }
          }
        }
        for (const reqName of reqSet) {
          const snippetEntry = snippetStore[reqName];
          if (snippetEntry && reqName !== nameStr) {
            if (snippetEntry.codeStr) {
              reqArr.push("\n\n");
              reqArr.push(snippetEntry.codeStr);
              reqStr = reqArr.join("");
            }
          }
        }
        reqStr = reqArr.join("");
      } else {
        const requirements = node.getElementsByTagName("REQUIRES");
        for (let i = 0; requirements[i]; i++) {
          const required = requirements[i].firstChild.nodeValue;
          if (snippetStore[required]) {
            if (snippetStore[required].codeStr) {
              reqArr.push("\n\n");
              reqArr.push(snippetStore[required].codeStr);
              reqStr = reqArr.join("");
            }
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
          if (snippetStore[example].codeStr) {
            exampleArr.push("\n\n");
            exampleArr.push(snippetStore[example].codeStr);
            reqStr = reqArr.join("");
          }
        } else {
          missingExampleWarning(example);
        }
      }
      const exampleStr = exampleArr.join("");

      const current_chap = chapterIndex.substring(0, 1);
      const explicit_chap = node.getAttribute("CHAP");
      const implicit_chap = explicit_chap ? explicit_chap : current_chap;
      const chap = implicit_chap === "5" ? "4" : implicit_chap;
      let variant = node.getAttribute("VARIANT");
      let ext = node.getAttribute("EXT");
      let importStatement = "";

      if (variant) {
        variant = "&variant=" + variant;
      } else {
        variant = "";
      }

      if (ext === "RUNES") {
        importStatement =
          "\n\n" + processRuneModule(reqStr + " " + codeStr_run + exampleStr);
      }

      const compressed = lzString.compressToEncodedURIComponent(
        "// SICP JS " +
          chapterIndex +
          importStatement +
          reqStr +
          "\n\n" +
          codeStr_run +
          exampleStr
      );

      const makeHash = program =>
        "chap=" + chap + variant + "&prgrm=" + program;

      if (reqStr) {
        let prependLength = reqStr.split("\n").length;
        if (importStatement) {
          prependLength += 2;
        }
        addToSnippet("prependLength", prependLength, snippet);
      } else {
        addToSnippet("prependLength", 0, snippet);
      }

      addToSnippet("program", makeHash(compressed), snippet);

      const chunks = (codeStr + "\n").match(
        /^((?:.*?[\r\n]+){1,6})((?:.|\n|\r)*)$/
      );

      let body = "";
      body += chunks[1];

      if (chunks[2]) {
        body += chunks[2];
      }

      addToSnippet("body", body.trim() + " ", snippet);
    }
  }

  if (jsOutputSnippet) {
    addToSnippet(
      "output",
      jsOutputSnippet.firstChild.nodeValue.trim(),
      snippet
    );
  }
};

export default processSnippetJson;
