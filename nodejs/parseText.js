import lzString from "lz-string";
import replaceTagWithSymbol from "./replaceTagWithSymbol";
import processFigure from "./processFigure";
import {
  checkIndexBadEndWarning,
  checkLongLineWarning,
  missingRequireWarning
} from "./warnings.js";

const tagsToRemove = new Set([
  "#comment",
  "COMMENT",
  "CHANGE",
  "EDIT",
  "EXCLUDE",
  "HISTORY",
  "NAME",
  "ORDER",
  "SCHEME",
  "SOLUTION"
]);
// SOLUTION tag handled by processSnippet

const ignoreTags = new Set([
  "CHAPTERCONTENT",
  "JAVASCRIPT",
  "NOBR",
  "SECTIONCONTENT",
  "span",
  "SPLIT",
  "SPLITINLINE"
]);

export const processTextFunctions = {
  "#text": (node, writeTo) => {
    const trimedValue = node.nodeValue
      .replace(/[\r\n]+/, " ")
      .replace(/\s+/g, " ")
      .replace(/\^/g, "\\string^")
      .replace(/%/g, "\\%");
    writeTo.push(trimedValue);
    // if (!trimedValue.match(/^\s*$/)) {
    // }
  },

  B: (node, writeTo) => {
    writeTo.push("\\textbf{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  },

  BR: (node, writeTo) => {
    writeTo.push("\n\\noindent ");
  },

  BLOCKQUOTE: (node, writeTo) => {
    writeTo.push("\n\\begin{quote}");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("\\end{quote}\n");
  },

  CITATION: (node, writeTo) => {
    // Currently just text. Not linked to biblography.
    const text = node.getElementsByTagName("TEXT")[0];
    if (text) {
      recursiveProcessText(text.firstChild, writeTo);
    } else {
      recursiveProcessText(node.firstChild, writeTo);
    }
  },

  EM: (node, writeTo) => processTextFunctions["em"](node, writeTo),
  em: (node, writeTo) => {
    writeTo.push("{\\em ");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  },

  EXERCISE: (node, writeTo) => {
    processExercise(node, writeTo);
  },

  FIGURE: (node, writeTo) => {
    processFigure(node, writeTo);
  },

  FOOTNOTE: (node, writeTo) => {
    writeTo.push("\\cprotect\\footnote{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n");
  },

  H2: (node, writeTo) => {
    writeTo.push("\n\\subsection*{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n");
  },

  INDEX: (node, writeTo) => {
    writeTo.push("\\index{");
    const indexArr = [];
    const order = getChildrenByTagName(node, "ORDER")[0];
    if (order) {
      recursiveProcessText(order.firstChild, indexArr);
      indexArr.push("@");
    }
    recursiveProcessText(node.firstChild, indexArr);
    const indexStr = indexArr.join("").trim();

    // Do error checking
    checkIndexBadEndWarning(indexStr);
    writeTo.push(indexStr);
    writeTo.push("}");
  },

  IMAGE: (node, writeTo) => {
    writeTo.push(
      "\n\\includegraphics{" +
        node
          .getAttribute("src")
          .replace(/\.gif$/, ".png")
          .replace(/_/g, "\\string_") +
        "}\n"
    );
  },

  LABEL: (node, writeTo) => {
    writeTo.push("\\label{" + node.getAttribute("NAME") + "}\n");
  },

  LINK: (node, writeTo) => {
    writeTo.push("\\href{" + node.getAttribute("address") + "}{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  },

  LATEX: (node, writeTo) => processTextFunctions["LATEXINLINE"](node, writeTo),
  TREETAB: (node, writeTo) =>
    processTextFunctions["LATEXINLINE"](node, writeTo),
  LATEXINLINE: (node, writeTo) => {
    recursiveProcessPureText(node.firstChild, writeTo);
  },

  OL: (node, writeTo) => {
    writeTo.push("\n\\begin{enumerate}");
    writeTo.push(ancestorHasTag(node, "EXERCISE") ? "[a.]\n" : "\n");
    processList(node.firstChild, writeTo);
    writeTo.push("\\end{enumerate}\n");
  },

  P: (node, writeTo) => processTextFunctions["TEXT"](node, writeTo),
  TEXT: (node, writeTo) => {
    writeTo.push("\n\n");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("\n");
  },

  QUOTE: (node, writeTo) => {
    writeTo.push("\\enquote{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  },

  REF: (node, writeTo) => {
    writeTo.push("\\ref{" + node.getAttribute("NAME") + "}");
  },

  REFERENCE: (node, writeTo) => {
    // Doesn't do anything special
    writeTo.push("\n");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("\n");
  },

  SC: (node, writeTo) => {
    writeTo.push("{\\scshape ");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  },

  SCHEMEINLINE: (node, writeTo) =>
    processTextFunctions["JAVASCRIPTINLINE"](node, writeTo),
  JAVASCRIPTINLINE: (node, writeTo) => {
    writeTo.push("{\\lstinline[mathescape=true]$");
    recursiveProcessPureText(node.firstChild, writeTo, { removeNewline: true });
    writeTo.push("$}");
  },

  SNIPPET: (node, writeTo) => {
    processSnippet(node, writeTo);
  },

  SUBHEADING: (node, writeTo) => {
    writeTo.push("\\subsubsection{");
    addName(node, writeTo);
    recursiveProcessText(node.firstChild, writeTo);
  },

  SUBINDEX: (node, writeTo) => {
    // should occur only within INDEX
    // also should only exist after stuff in the main index
    writeTo.push("!");
    const order = getChildrenByTagName(node, "ORDER")[0];
    if (order) {
      recursiveProcessText(order.firstChild, writeTo);
      writeTo.push("@");
    }
    recursiveProcessText(node.firstChild, writeTo);
  },

  TABLE: (node, writeTo) => {
    processTable(node, writeTo);
  },

  TT: (node, writeTo) => {
    writeTo.push("\\texttt{");
    recursiveProcessText(node.firstChild, writeTo, true);
    writeTo.push("}");
  },

  UL: (node, writeTo) => {
    writeTo.push("\n\\begin{itemize}\n");
    processList(node.firstChild, writeTo);
    writeTo.push("\\end{itemize}\n");
  }
};

export const addName = (node, writeTo) => {
  const nameArr = [];
  recursiveProcessText(
    getChildrenByTagName(node, "NAME")[0].firstChild,
    nameArr
  );
  const name = nameArr.join("").trim();
  writeTo.push(name);
  writeTo.push("}\n\n");
  return name;
};

const recursiveProcessPureTextDefault = { removeNewline: false };
const recursiveProcessPureText = (
  node,
  writeTo,
  options = recursiveProcessPureTextDefault
) => {
  if (!node) return;
  if (!replaceTagWithSymbol(node, writeTo) && node.nodeName === "#text") {
    let value = node.nodeValue;
    if (options.removeNewline) {
      value = value.replace(/[\r\n]+/g, " ");
    }
    writeTo.push(value);
  }
  return recursiveProcessPureText(node.nextSibling, writeTo, options);
};

export const recursiveProcessText = (node, writeTo) => {
  if (!node) return;
  processText(node, writeTo);
  return recursiveProcessText(node.nextSibling, writeTo);
};

export const processText = (node, writeTo) => {
  const name = node.nodeName;
  if (processTextFunctions[name]) {
    processTextFunctions[name](node, writeTo);
    return true;
  } else {
    if (replaceTagWithSymbol(node, writeTo) || tagsToRemove.has(name)) {
      return true;
    } else if (ignoreTags.has(name)) {
      recursiveProcessText(node.firstChild, writeTo);
      return true;
    }
  }
  console.log("Unrecognised Tag:\n" + node.toString() + "\n");
  return false;
};

const processList = (node, writeTo) => {
  if (!node) return;
  if (node.nodeName == "LI") {
    writeTo.push("\\item{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n");
  }
  return processList(node.nextSibling, writeTo);
};

const sourceAcademyURL = "https://sourceacademy.nus.edu.sg";
// to change to localhost if required
// http://localhost:8075 

const requiredSnippets = {
  nameOfSnippet: "'code'"
};

export const processSnippet = (node, writeTo) => {
  if (node.getAttribute("HIDE") == "yes") {
    return;
  }
  const jsSnippet = node.getElementsByTagName("JAVASCRIPT")[0];
  if (jsSnippet) {
    const codeArr = [];
    recursiveProcessPureText(jsSnippet.firstChild, codeArr);
    const codeStr = codeArr.join("").trim();

    // Do warning for very long lines if no latex
    if (node.getAttribute("LATEX") !== "yes") {
      checkLongLineWarning(codeStr);
    }

    const requirements = node.getElementsByTagName("REQUIRE");
    const reqArr = [];
    for (let i = 0; requirements[i]; i++) {
      const required = requirements[i];
      if (requiredSnippets[required]) {
        reqArr.push(requiredSnippets[required]);
        reqArr.push("\n");
      } else {
        missingRequireWarning();
      }
    }
    const reqStr = reqArr.join("");

    const snippetName = node.getElementsByTagName("NAME")[0];
    if (snippetName) {
      requiredSnippets[snippetName] = reqStr + codeStr;
    }

    if (node.getAttribute("EVAL") === "no") {
      writeTo.push("\n\\begin{lstlisting}[mathescape=true]\n");
      writeTo.push(codeStr);
      writeTo.push("\n\\end{lstlisting}\n");
    } else {
      const examples = node.getElementsByTagName("REQUIRE");
      const exampleArr = [];
      for (let i = 0; examples[i]; i++) {
        exampleArr.push("\n");
        exampleArr.push(examples[i]);
      }
      const exampleStr = exampleArr.join("");

      // make url for source academy link
      const compressed = lzString.compressToEncodedURIComponent(
        reqStr + codeStr + exampleStr
      );
      const chap = "4";
      const ext = "";
      const url =
        sourceAcademyURL +
        "/playground#chap=" +
        chap +
        ext +
        "&prgrm=" +
        compressed;

      const chunks = (codeStr + "\n").match(/^((?:.*?[\r\n]+){1,6})((?:.|\n|\r)*)$/);
      // 6 lines plus rest
      writeTo.push(
        "\n\\begin{lrbox}{\\lstbox}\\begin{lstlisting}[mathescape=true]\n"
      );
      writeTo.push(chunks[1]);
      writeTo.push(
        "\\end{lstlisting}\\end{lrbox}"
      );

      if (chunks[2]) {
        writeTo.push("\n\\begin{lstlisting}[mathescape=true]\n");
        writeTo.push("/*!\\href{" + url + "}{\\usebox\\lstbox}!*/\n")
        writeTo.push(chunks[2]);
        writeTo.push("\\end{lstlisting}");
      } else {
        writeTo.push("\n\n\\href{" + url + "}{\\usebox\\lstbox}")
      }
      writeTo.push("\n\n");
    }
  }
};

const processTable = (node, writeTo) => {
  const firstRow = node.getElementsByTagName("TR")[0];
  if (firstRow) {
    const colNum = firstRow.getElementsByTagName("TD").length;
    writeTo.push("\n\n\\noindent\\begin{tabular}{ | ");
    for (let i = 0; i < colNum; i++) {
      writeTo.push("l | ");
    }
    writeTo.push("} \\hline\n");
    for (let row = node.firstChild; row; row = row.nextSibling) {
      if (row.nodeName != "TR") continue;
      let first = true;
      for (let col = row.firstChild; col; col = col.nextSibling) {
        if (col.nodeName != "TD") continue;
        if (first) {
          first = false;
        } else {
          writeTo.push(" & ");
        }
        recursiveProcessText(col.firstChild, writeTo);
      }
      writeTo.push(" \\\\ \\hline\n");
    }
    writeTo.push("\\end{tabular}\n\n");
  } else {
    recursiveProcessText(node.firstChild, writeTo);
  }
};

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

  writeTo.push("\n\\begin{Exercise}");
  if (solution && !label) {
    writeTo.push("\n\\label{" + labelName + "}");
  }
  writeTo.push("\n");

  recursiveProcessText(node.firstChild, writeTo);
  if (solution) {
    writeTo.push("\\hfill{\\hyperref[" + labelName + "-Answer]{Solution}}");
  }
  writeTo.push("\n\\end{Exercise}\n");

  if (solution) {
    writeTo.push("\n\\begin{Answer}[ref={" + labelName + "}]\n");
    recursiveProcessText(solution.firstChild, writeTo);
    writeTo.push("\n\\end{Answer}\n");
  }
};

const getChildrenByTagName = (node, tagName) => {
  let child = node.firstChild;
  const childrenWithTag = [];
  while (child) {
    if (child.nodeName === tagName) {
      childrenWithTag.push(child);
    }
    child = child.nextSibling;
  }
  return childrenWithTag;
};

const ancestorHasTag = (node, tagName) => {
  let parent = node.parentNode;
  while (parent) {
    if (parent.nodeName === tagName) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
};
