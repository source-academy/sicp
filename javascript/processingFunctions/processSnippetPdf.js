import { sourceAcademyURL } from "../constants";
import { ancestorHasTag, getChildrenByTagName } from "../utilityFunctions";
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

let once = false;

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

// Check if the next sibling node is an element node
function nextNodeIsVisibleSnippet(n) {
  var cursor = n.nextSibling;

  // Skip over all intermediate next nodes
  if (cursor === undefined || cursor === null) return false;
  while (cursor.nodeType == 3 && cursor.textContent.trim() === "") {
    cursor = cursor.nextSibling;
    if (cursor === undefined || cursor === null) return false;
  }

  if (cursor.nodeName === "SNIPPET" && cursor.getAttribute("HIDE") === "yes") {
    return nextNodeIsVisibleSnippet(cursor);
  } else {
    return cursor.nodeName === "SNIPPET";
  }
}

export const processSnippetPdf = (node, writeTo) => {
  const LatexString = node.getAttribute("LATEX") === "yes" ? "Latex" : "";
  const isSmall = node.getAttribute("SMALL") === "yes";
  const skipPostPadding = node.getAttribute("POSTPADDING") === "no"; //  ||
  //       (node.nextSibling === null);

  // if (skipPostPadding) console.log("XXXX: " + node);

  if (node.getAttribute("HIDE") == "yes") {
    return;
  }

  const indexTags = getChildrenByTagName(node, "INDEX");
  const processedIndexTags = [];
  for (let i = 0; indexTags[i]; i++) {
    processTextLatex(indexTags[i], processedIndexTags);
  }

  const indexTerms =
    processedIndexTags.length > 0
      ? [
          processedIndexTags
            .map(s => s.trim())
            .join("")
            .replace(/%/g, "")
            .trim()
        ]
      : [];

  const followedByOtherSnippet = nextNodeIsVisibleSnippet(node);
  let outputAdjacent = false;

  const inFigure = ancestorHasTag(node, "FIGURE");
  const preSpace = inFigure ? "" : "\\PreBoxCmd";
  const postSpace = inFigure ? "" : "\\PostBoxCmd%\n";
  const midSpace = inFigure ? "\\smallskip" : "";

  const jsPromptSnippet = node.getElementsByTagName("JAVASCRIPT_PROMPT")[0];
  const jsLonelySnippet = node.getElementsByTagName("JAVASCRIPT_LONELY")[0];
  const jsSnippet = node.getElementsByTagName("JAVASCRIPT")[0];
  const jsOutputSnippet = node.getElementsByTagName("JAVASCRIPT_OUTPUT")[0];

  if (jsPromptSnippet) {
    writeTo.push(preSpace);
    writeTo.push("\n\\begin{lrbox}{\\UnbreakableBox}");

    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\begin{JavaScriptPrompt" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\begin{JavaScriptPrompt" + LatexString + "Small}");
    } else {
      writeTo.push("\n\\begin{JavaScriptPrompt" + LatexString + "}");
    }

    const promptArr = [];
    recursiveProcessTextLatex(jsPromptSnippet.firstChild, promptArr);
    const promptStr = promptArr.join("").trimRight();

    writeTo.push(promptStr);

    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\end{JavaScriptPrompt" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\end{JavaScriptPrompt" + LatexString + "Small}");
    } else {
      writeTo.push("\n\\end{JavaScriptPrompt" + LatexString + "}");
    }

    writeTo.push("\n");
    writeTo.push("\\end{lrbox}");
    writeTo.push("\\Usebox{\\UnbreakableBox}");

    if (jsLonelySnippet || jsSnippet || jsOutputSnippet) {
      writeTo.push("\\MidBoxCmd");
    } else {
      writeTo.push("\\PostBoxCmd\n");
    }
  }

  if (jsLonelySnippet) {
    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\begin{JavaScriptLonely" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\begin{JavaScriptLonely" + LatexString + "Small}");
    } else {
      writeTo.push("\n\\begin{JavaScriptLonely" + LatexString + "}");
    }

    const lonelyArr = [];
    recursiveProcessTextLatex(jsLonelySnippet.firstChild, lonelyArr);
    const lonelyStr = lonelyArr.join("").trimRight();

    writeTo.push(lonelyStr);

    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\end{JavaScriptLonely" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\end{JavaScriptLonelySmall" + LatexString + "}");
    } else {
      writeTo.push("\n\\end{JavaScriptLonely" + LatexString + "}");
    }

    if (!(jsSnippet || jsOutputSnippet) && indexTerms.length > 0) {
      writeTo.push("\\nopagebreak");
      writeTo.push(indexTerms.pop());
      writeTo.push("\\nopagebreak%\n");
    }
  }

  if (jsSnippet) {
    // JavaScript source for running. Overrides JAVASCRIPT if present.
    let jsRunSnippet = node.getElementsByTagName("JAVASCRIPT_RUN")[0];
    if (!jsRunSnippet) {
      jsRunSnippet = jsSnippet;
    }

    const codeArr = [];
    recursiveProcessTextLatex(jsSnippet.firstChild, codeArr);
    const codeStr = codeArr.join("").replace(/###\n/g, "").trim();

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
      let codeEnv = isSmall
        ? "JavaScriptSmaller" //"JavaScript" + LatexString + "SmallTwo"
        : ancestorHasTag(node, "FOOTNOTE")
        ? "JavaScript" + LatexString + "Footnote"
        : ancestorHasTag(node, "EXERCISE")
        ? "JavaScript" + LatexString + "Small"
        : "JavaScript" + LatexString;

      const separator =
        "\\end{" +
        codeEnv +
        "}\n" +
        "\\end{lrbox}" +
        "\\Usebox{\\UnbreakableBox}\\\\" +
        midSpace +
        "\\begin{lrbox}{\\UnbreakableBox}" +
        "\\begin{" +
        codeEnv +
        "}\n";

      writeTo.push(preSpace);
      writeTo.push("\n\\begin{lrbox}{\\UnbreakableBox}");
      writeTo.push("\\begin{" + codeEnv + "}");
      writeTo.push("\n");
      writeTo.push(
        codeArr
          .join("")
          .replace(/###\n/g, separator)
          .replace(/}\nfunction/g, "}\n" + separator + "function")
          .trim()
      );
      writeTo.push("\n");
      writeTo.push("\\end{" + codeEnv + "}\n");
      writeTo.push("\\end{lrbox}");

      if (jsOutputSnippet) {
        if (indexTerms.length > 0) writeTo.push(indexTerms.pop());
        writeTo.push("\\Usebox{\\UnbreakableBox}\\MidBoxCmd");
        outputAdjacent = true;
      } else {
        if (indexTerms.length > 0) writeTo.push(indexTerms.pop());
        writeTo.push("\\Usebox{\\UnbreakableBox}");
        if (!followedByOtherSnippet && !skipPostPadding) {
          writeTo.push(postSpace);
        } else {
          // Adjacent snippets
        }
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

      // lines[0] =
      //   "/*!\\ifthenelse{\\boolean{show-links}}{\\makebox[0pt][l]{\\makebox[1.03\\textwidth][r]{\\href{" +
      //   url +
      //   "}{\\ensuremath{\\blacktriangleright}}}}{}}!*/" +
      //   lines[0];

      // writeTo.push("\n\\marginnote{\\href{" + url + "}{\\ensuremath{\\blacktriangleright}}}[2ex]" + "\\begin{JavaScriptClickable}\n");

      let codeEnv = ancestorHasTag(node, "FOOTNOTE")
        ? "JavaScriptClickableFootnote"
        : ancestorHasTag(node, "EXERCISE") || isSmall
        ? "JavaScriptClickableSmall"
        : "JavaScriptClickable";

      const separator =
        "\\end{" +
        codeEnv +
        "}\n" +
        "\\end{lrbox}" +
        "\\Usebox{\\UnbreakableBox}\\\\" +
        "\\begin{lrbox}{\\UnbreakableBox}" +
        "\\begin{" +
        codeEnv +
        "}\n";

      writeTo.push(preSpace);
      writeTo.push("\n\\begin{lrbox}{\\UnbreakableBox}");
      writeTo.push("\\begin{" + codeEnv + "}");
      writeTo.push("\n");
      writeTo.push(
        lines
          .join("\n")
          .replace(/###\n/g, separator)
          .replace(/}\nfunction/g, "}\n" + separator + "function")
          .trim()
      );
      writeTo.push("\n");
      writeTo.push("\\end{" + codeEnv + "}\n");
      writeTo.push("\\end{lrbox}");

      if (jsOutputSnippet) {
        if (indexTerms.length > 0) writeTo.push(indexTerms.pop());
        writeTo.push("\\Usebox{\\UnbreakableBox}\\MidBoxCmd");
        outputAdjacent = true;
      } else {
        if (indexTerms.length > 0) writeTo.push(indexTerms.pop());
        writeTo.push("\\Usebox{\\UnbreakableBox}");
        if (!followedByOtherSnippet && !skipPostPadding) {
          writeTo.push(postSpace);
        }
      }
    }
  }

  // const jsOutputSnippet = node.getElementsByTagName("JAVASCRIPT_OUTPUT")[0];

  if (jsOutputSnippet) {
    writeTo.push("\n\\begin{lrbox}{\\UnbreakableBox}");

    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\begin{JavaScriptOutput" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE") || isSmall) {
      writeTo.push("\n\\begin{JavaScriptOutput" + LatexString + "Small}");
    } else {
      writeTo.push("\n\\begin{JavaScriptOutput" + LatexString + "}");
    }

    const outputArr = [];
    recursiveProcessTextLatex(jsOutputSnippet.firstChild, outputArr);
    const outputStr = outputArr.join("").trimRight();

    writeTo.push(outputStr);

    if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("\n\\end{JavaScriptOutput" + LatexString + "Footnote}");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("\n\\end{JavaScriptOutput" + LatexString + "Small}");
    } else {
      writeTo.push("\n\\end{JavaScriptOutput" + LatexString + "}");
    }

    writeTo.push("\\end{lrbox}");
    if (outputAdjacent !== true) {
      writeTo.push(preSpace);
    } else {
    }
    // Ship out any remaining index terms at this point
    if (indexTerms.length > 0) {
      writeTo.push("\\nopagebreak");
      writeTo.push(indexTerms.pop());
      writeTo.push("\\nopagebreak%\n");
    }
    writeTo.push("\\Usebox{\\UnbreakableBox}");
    if (!followedByOtherSnippet && !skipPostPadding) {
      writeTo.push(postSpace);
    }
  }
};

export default processSnippetPdf;
