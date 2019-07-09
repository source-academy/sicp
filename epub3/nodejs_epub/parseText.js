import replaceTagWithSymbol from "./replaceTagWithSymbol";
import processFigure, { generateImage } from "./processFigure";
import {
  checkIndexBadEndWarning,
  checkLongLineWarning
} from "./warnings.js";
import processSnippet from './processSnippet';
import recursiveProcessPureText from './recursiveProcessPureText';

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

let exerciseCounter = 0;

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
    exerciseCounter += 1;
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
      "\\begin{figure}[H]\n\\centering"
      + generateImage(node.getAttribute("src")) + "\n\\end{figure}\n"
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
    writeTo.push("{\\lstinline[mathescape=true, language=JavaScript]$");
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
  
  //writeTo.push("\n\\stepcounter{ExerciseDisplayNumber}\n\\begin{Exercise}");
  writeTo.push("\n\\subsubsection{Exercise}");
 
  if (solution && !label) {
    writeTo.push("\n\\label{" + labelName + "}");
  }
  writeTo.push("\n");

  recursiveProcessText(node.firstChild, writeTo);
  if (solution) {
    writeTo.push("\\hfill{\\hyperref[" + labelName + "-Answer]{Solution}}\\\\");
  }
  //writeTo.push("\n\\end{Exercise}\n");

  if (solution) {
    writeTo.push("\n\\subsubsection{Answer}\n");
    recursiveProcessText(solution.firstChild, writeTo);
    //writeTo.push("\n\\end{Answer}\n");
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
