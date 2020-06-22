import { sourceAcademyURL } from "../constants";
import lzString from "lz-string";
import {
  checkLongLineWarning,
  missingRequireWarning,
  missingExampleWarning,
  repeatedNameWarning
} from "./warnings.js";
import {
  chapterIndex,
  recursiveProcessTextHtml,
  processTextHtml
} from "../parseXmlHtml";
import recursiveProcessPureText from "./recursiveProcessPureText";

const snippetStore = {};

export const setupSnippetsHtml = node => {
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

export const processSnippetHtml = (node, writeTo, split) => {
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

    let jsOutputSnippet = node.getElementsByTagName("JAVASCRIPT_OUTPUT")[0];

    const codeArr = [];
    recursiveProcessPureText(jsSnippet.firstChild, codeArr);
    const codeStr = codeArr.join("").trim();

    const codeArr_run = [];
    recursiveProcessPureText(jsRunSnippet.firstChild, codeArr_run);
    const codeStr_run = codeArr_run.join("").trim();

    // Do warning for very long lines if no latex
    if (node.getAttribute("LATEX") !== "yes") {
      //checkLongLineWarning(codeStr);
    }

    if (node.getAttribute("EVAL") === "no") {
      writeTo.push("<pre class='prettyprint no-eval'>\n");
      writeTo.push(codeStr);
      writeTo.push("\n</pre>");
    } else {
      writeTo.push(
        "<pre class='prettyprint' title='Evaluate Javascript expression'"
      );

      let reqStr = "";
      let reqArr = [];
      const snippetName = node.getElementsByTagName("NAME")[0];
      let nameStr;
      if (snippetName) {
        nameStr = snippetName.firstChild.nodeValue;
        // console.log(nameStr);
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

      // make url for source academy link
      const compressed = lzString.compressToEncodedURIComponent(
        "// SICP JS " +
          chapterIndex +
          reqStr +
          "\n\n" +
          codeStr_run +
          exampleStr
      );
      const current_chap = chapterIndex.substring(0, 1);
      const explicit_chap = node.getAttribute("CHAP");
      const chap = explicit_chap ? explicit_chap : current_chap;
      let variant = node.getAttribute("VARIANT");
      let ext = node.getAttribute("EXT");
      if (variant) {
        variant = "&variant=" + variant;
      } else {
        variant = "";
      }
      if (ext) {
        ext = "&ext=" + ext;
      } else {
        ext = "";
      }
      const url =
        sourceAcademyURL +
        "/playground#chap=" +
        chap +
        variant +
        ext +
        "&prgrm=" +
        compressed;

      const chunks = (codeStr + "\n").match(
        /^((?:.*?[\r\n]+){1,6})((?:.|\n|\r)*)$/
      );
      // 6 lines plus rest
      writeTo.push(`onclick="window.open('${url}')">`);
      writeTo.push(chunks[1]);

      if (chunks[2]) {
        writeTo.push(chunks[2]);
      }

      writeTo.push("\n</pre>");
    }
    if (jsOutputSnippet && split) {
      writeTo.push("<pre class='prettyprintoutput'>\n");
      writeTo.push(jsOutputSnippet.firstChild.nodeValue);
      writeTo.push("\n</pre>");
    }
  }
};

export default processSnippetHtml;
