import { sourceAcademyURL } from "../constants";
import { ancestorHasTag } from "../utilityFunctions";
import lzString from "lz-string";
import {
  checkLongLineWarning,
  missingRequireWarning,
  missingExampleWarning,
  repeatedNameWarning
} from "./warnings.js";
import { recursiveProcessTextLatex, processTextLatex } from "../parseXmlLatex";
import recursiveProcessPureText from "./recursiveProcessPureText";

const snippetStore = {};

export const setupSnippetsPdf = node => {
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

export const processSnippetPdf = (node, writeTo) => {
  const LatexString = node.getAttribute("LATEX") === "yes" ? "Latex" : "";
  if (node.getAttribute("HIDE") == "yes") {
    return;
  }

  const jsPromptSnippet = node.getElementsByTagName("JAVASCRIPT_PROMPT")[0];

  if (jsPromptSnippet) {
    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\begin{JavaScriptPrompt" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\begin{JavaScriptPrompt" + LatexString + "Small}");
    } else {
      writeTo.push("\n\\begin{JavaScriptPrompt" + LatexString + "}");
    }

    writeTo.push(jsPromptSnippet.firstChild.nodeValue.trimRight());

    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\end{JavaScriptPrompt" + LatexString + "Footnote}\n");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\end{JavaScriptPrompt" + LatexString + "Small}\n");
    } else {
      writeTo.push("\n\\end{JavaScriptPrompt" + LatexString + "}\n");
    }
  }

  const jsLonelySnippet = node.getElementsByTagName("JAVASCRIPT_LONELY")[0];

  if (jsLonelySnippet) {
    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\begin{JavaScriptLonely" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\begin{JavaScriptLonely" + LatexString + "Small}");
    } else {
      writeTo.push("\n\\begin{JavaScriptLonely" + LatexString + "}");
    }

    writeTo.push(jsLonelySnippet.firstChild.nodeValue.trimRight());

    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\end{JavaScriptLonely" + LatexString + "Footnote}\n");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\end{JavaScriptLonelySmall" + LatexString + "}\n");
    } else {
      writeTo.push("\n\\end{JavaScriptLonely" + LatexString + "}\n");
    }
  }

  const jsSnippet = node.getElementsByTagName("JAVASCRIPT")[0];
  if (jsSnippet) {
    // JavaScript source for running. Overrides JAVASCRIPT if present.
    let jsRunSnippet = node.getElementsByTagName("JAVASCRIPT_RUN")[0];
    if (!jsRunSnippet) {
      jsRunSnippet = jsSnippet;
    }

    const codeArr = [];
    recursiveProcessTextLatex(jsSnippet.firstChild, codeArr);
    const codeStr = codeArr.join("").trim();

    const codeArr_run = [];
    recursiveProcessPureText(jsRunSnippet.firstChild, codeArr_run);
    const codeStr_run = codeArr_run.join("").trim();

    // Do warning for very long lines if no latex
    if (node.getAttribute("LATEX") !== "yes") {
      checkLongLineWarning(codeStr);
    }

    if (
      node.getAttribute("EVAL") === "no" ||
      node.getAttribute("LATEX") === "yes"
    ) {
      if (ancestorHasTag(node, "FOOTNOTE")) {
        writeTo.push("\n\\begin{JavaScript" + LatexString + "Footnote}\n");
      } else if (ancestorHasTag(node, "EXERCISE")) {
        writeTo.push("\n\\begin{JavaScript" + LatexString + "Small}\n");
      } else {
        writeTo.push("\n\\begin{JavaScript" + LatexString + "}\n");
      }

      writeTo.push(codeStr);

      if (ancestorHasTag(node, "FOOTNOTE")) {
        writeTo.push("\n\\end{JavaScript" + LatexString + "Footnote}\n");
      } else if (ancestorHasTag(node, "EXERCISE")) {
        writeTo.push("\n\\end{JavaScript" + LatexString + "Small}\n");
      } else {
        writeTo.push("\n\\end{JavaScript" + LatexString + "}\n");
      }
    } else {
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
      const exampleStr = exampleArr.join("");

      // make url for source academy link
      const compressed = lzString.compressToEncodedURIComponent(
        reqStr + codeStr_run + exampleStr
      );
      // in this version we dont have access to the current chapter
      const chap = 4; // hard-wire chapter to 4
      let variant = node.getAttribute("VARIANT");
      if (variant) {
        variant = "variant=" + variant + "&";
      } else {
        variant = "";
      }
      const url =
        sourceAcademyURL +
        "/playground\\#chap=" +
        chap +
        variant +
        "&prgrm=" +
        compressed;

      const chunks = (codeStr + "\n").match(
        /^((?:.*?[\r\n]+){1,36})((?:.|\n|\r)*)$/
      );

      const lines = codeStr.split("\n");

      lines[0] =
        "/*!\\makebox[0pt][l]{\\makebox[1.03\\textwidth][r]{\\href{" +
        url +
        "}{\\ensuremath{\\blacktriangleright}}}}!*/" +
        lines[0];

      // writeTo.push("\n\\marginnote{\\href{" + url + "}{\\ensuremath{\\blacktriangleright}}}[2ex]" + "\\begin{JavaScriptClickable}\n");

      if (ancestorHasTag(node, "FOOTNOTE")) {
        writeTo.push("\n\\begin{JavaScriptClickableFootnote}\n");
      } else if (ancestorHasTag(node, "EXERCISE")) {
        writeTo.push("\n\\begin{JavaScriptClickableSmall}\n");
      } else {
        writeTo.push("\n\\begin{JavaScriptClickable}\n");
      }

      writeTo.push(lines.join("\n"));

      if (ancestorHasTag(node, "FOOTNOTE")) {
        writeTo.push("\n\\end{JavaScriptClickableFootnote}\n");
      } else if (ancestorHasTag(node, "EXERCISE")) {
        writeTo.push("\n\\end{JavaScriptClickableSmall}\n");
      } else {
        writeTo.push("\n\\end{JavaScriptClickable}\n");
      }

      // // 6 lines plus rest
      // writeTo.push(
      //   "\n\\begin{lrbox}{\\lstbox}\n\\begin{JavaScriptClickable}\n"
      // );
      // writeTo.push(chunks[1]);
      // writeTo.push("\\end{JavaScriptClickable}\n\\end{lrbox}");

      // if (chunks[2]) {
      //   writeTo.push("\n\\begin{JavaScriptClickable}\n");
      //   writeTo.push("/*!\\href{" + url + "}{\\usebox\\lstbox}!*/\n");
      //   writeTo.push(chunks[2]);
      //   writeTo.push("\n\\end{JavaScriptClickable}");
      // } else {
      //   writeTo.push("\n\n\\href{" + url + "}{\\usebox\\lstbox}");
      // }
    }
  }

  const jsOutputSnippet = node.getElementsByTagName("JAVASCRIPT_OUTPUT")[0];

  if (jsOutputSnippet) {
    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\begin{JavaScriptOutput" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\begin{JavaScriptOutput" + LatexString + "Small}");
    } else {
      writeTo.push("\n\\begin{JavaScriptOutput" + LatexString + "}");
    }

    writeTo.push(jsOutputSnippet.firstChild.nodeValue.trimRight());

    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\end{JavaScriptOutput" + LatexString + "Footnote}\n");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\end{JavaScriptOutput" + LatexString + "Small}\n");
    } else {
      writeTo.push("\n\\end{JavaScriptOutput" + LatexString + "}\n");
    }
  }

  //  writeTo.push("\n\n");
};

export default processSnippetPdf;
