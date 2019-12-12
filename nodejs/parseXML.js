import {getChildrenByTagName, ancestorHasTag} from './utilityFunctions';
import {
  checkIndexBadEndWarning
} from "./processingFunctions/warnings.js";

import {
  replaceTagWithSymbol,
  processEpigraph,
  processFigure,
  processFigureEpub,
  generateImage,
  processExercise,
  processExerciseEpub,
  processFileInput,
  processSnippet,
  processSnippetEpub,
  processTable,
  recursiveProcessPureText,
  processList,
  addName,
} from './processingFunctions';

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

const processTextFunctionsDefault = {
  "#text": (node, writeTo) => {
    const trimedValue = node.nodeValue
      .replace(/[\r\n]+/, " ")
      .replace(/\s+/g, " ")
      .replace(/\^/g, "\^{}")
      .replace(/%/g, "\\%");
    if (trimedValue.match(/&(\w|\.)+;/)) {
      processFileInput(trimedValue.trim(), writeTo);
    } else {
      writeTo.push(trimedValue);
    }
    // if (!trimedValue.match(/^\s*$/)) {
    // }
  },

  ABOUT: (node, writeTo) => {
    writeTo.push("\\chapter*{");
    const name = addName(node, writeTo);
    writeTo.push("\n\\addcontentsline{toc}{chapter}{");
    writeTo.push(name + '}\n\n');
    recursiveProcessText(node.firstChild, writeTo);
  },
  REFERENCES: (node, writeTo) => processTextFunctions["ABOUT"](node, writeTo),
  WEBPREFACE: (node, writeTo) => processTextFunctions["ABOUT"](node, writeTo),
  MATTER: (node, writeTo) => processTextFunctions["ABOUT"](node, writeTo),

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

  CHAPTER: (node, writeTo) => {
    writeTo.push("\\chapter{");
    addName(node, writeTo);
    writeTo.push("\\pagestyle{main}\n");
    recursiveProcessText(node.firstChild, writeTo);
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


  EPIGRAPH: (node, writeTo) => {
    processEpigraph(node, writeTo);
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
  TREETAB: (node, writeTo) => processTextFunctions["LATEXINLINE"](node, writeTo),
  LATEXINLINE: (node, writeTo) => {
    recursiveProcessPureText(node.firstChild, writeTo);
  },

  MATTERSECTION: (node, writeTo) => {
    writeTo.push("\\section*{");
    addName(node, writeTo);
    recursiveProcessText(node.firstChild, writeTo);
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

  SECTION: (node, writeTo) => {
    writeTo.push("\\section{");
    addName(node, writeTo);
    writeTo.push("\\pagestyle{section}\n");

      if (node.getAttribute("WIP") === "yes") {
          writeTo.push("\\begin{center}\\fbox{\\textcolor{red}{Note: this section is a work in progress!}}\\end{center}")
      }

    recursiveProcessText(node.firstChild, writeTo);
  },

  SUBHEADING: (node, writeTo) => {
    writeTo.push("\\subsubsection{");
    addName(node, writeTo);

    recursiveProcessText(node.firstChild, writeTo);
  },
  SUBSUBSECTION: (node, writeTo) => processTextFunctions["SUBHEADING"](node, writeTo),

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

  SUBSECTION: (node, writeTo) => {
    writeTo.push("\\subsection{");
    addName(node, writeTo);
    writeTo.push("\\pagestyle{subsection}\n");

      if (node.getAttribute("WIP") === "yes") {
          writeTo.push("\\begin{center}\\fbox{\\textcolor{red}{Note: this section is a work in progress!}}\\end{center}")
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

const processTextFunctionsEpub = {
  EXERCISE: (node, writeTo) => {
    processExerciseEpub(node, writeTo);
  },
  FIGURE: (node, writeTo) => {
    processFigureEpub(node, writeTo);
  },
  SECTION: (node, writeTo) => {
    writeTo.push("\\section{");
    addName(node, writeTo);
    recursiveProcessText(node.firstChild, writeTo);
  },
  JAVASCRIPTINLINE: (node, writeTo) => {
    writeTo.push("{\\lstinline[mathescape=true, language=JavaScript]$");
    recursiveProcessPureText(node.firstChild, writeTo, { removeNewline: true });
    writeTo.push("$}");
  },
  SNIPPET: (node, writeTo) => {
    processSnippetEpub(node, writeTo);
  },
  SUBSECTION: (node, writeTo) => {
    writeTo.push("\\subsection{");
    addName(node, writeTo);
    recursiveProcessText(node.firstChild, writeTo);
  },
  SUBHEADING: (node, writeTo) => {
    writeTo.push("\\paragraph{");
    addName(node, writeTo);
    recursiveProcessText(node.firstChild, writeTo);
  },
  SUBSUBSECTION: (node, writeTo) => processTextFunctionsEpub["SUBHEADING"](node, writeTo),    
}

let processTextFunctions = processTextFunctionsDefault;

export const switchParseFunctions = (parseType) => {
  if (parseType == "pdf") {
    processTextFunctions = processTextFunctionsDefault;
  } else if (parseType == "epub") {
    console.log('using parsetype epub')
    processTextFunctions = {
      ...processTextFunctionsDefault,
      ...processTextFunctionsEpub,
    };
  }
}

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
  console.log("WARNING Unrecognised Tag:\n" + node.toString() + "\n");
  return false;
};

export const recursiveProcessText = (node, writeTo) => {
  if (!node) return;
  processText(node, writeTo);
  return recursiveProcessText(node.nextSibling, writeTo);
};

