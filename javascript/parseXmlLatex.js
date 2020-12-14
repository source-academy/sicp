import { getChildrenByTagName, ancestorHasTag } from "./utilityFunctions";

import {
  replaceTagWithSymbol,
  processEpigraphPdf,
  processFigurePdf,
  processFigureEpub,
  generateImage,
  processExercisePdf,
  processExerciseEpub,
  processFileInput,
  processSnippetPdf,
  processSnippetEpub,
  processTablePdf,
  recursiveProcessPureText,
  processList,
  addName
} from "./processingFunctions";

// set true to generate index annotations
// in the margins of the text
const indexAnnotations = false;

const tagsToRemove = new Set([
  "#comment",
  "COMMENT",
  "CHANGE",
  "EDIT",
  "EXCLUDE",
  "HISTORY",
  "NAME",
  "ORDER",
  "SUBINDEX",
  "SEE",
  "SEEALSO",
  "OPEN",
  "CLOSE",
  "SCHEME",
  "SOLUTION",
  "WEB_ONLY"
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

const processTextFunctionsDefaultLatex = {
  PDF_ONLY: (node, writeTo) => {
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  "#text": (node, writeTo) => {
    const trimedValue = node.nodeValue
      .replace(/[\r\n]+/, " ")
      .replace(/\s+/g, " ")
      .replace(/\^/g, "^{}")
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
    writeTo.push("\\addcontentsline{toc}{chapter}{");
    writeTo.push(name + "}");
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },
  REFERENCES: (node, writeTo) =>
    processTextFunctionsLatex["ABOUT"](node, writeTo),
  WEBPREFACE: (node, writeTo) =>
    processTextFunctionsLatex["ABOUT"](node, writeTo),
  MATTER: (node, writeTo) => processTextFunctionsLatex["ABOUT"](node, writeTo),

  B: (node, writeTo) => {
    writeTo.push("\\textbf{");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}");
  },

  BR: (node, writeTo) => {
    writeTo.push("\\newline\\noindent%\n");
  },

  BLOCKQUOTE: (node, writeTo) => {
    writeTo.push("\\begin{quote}");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("\\end{quote}");
  },

  NOINDENT: (node, writeTo) => {
    writeTo.push("\\noindent ");
  },

  EXERCISE_STARTING_WITH_ITEMS: (node, writeTo) => {
    writeTo.push("\\vspace{-7mm}");
  },

  EXERCISE_FOLLOWED_BY_TEXT: (node, writeTo) => {
    writeTo.push("\\vspace{5mm}");
  },

  CITATION: (node, writeTo) => {
    // Currently just text. Not linked to biblography.
    const text = node.getElementsByTagName("TEXT")[0];
    if (text) {
      recursiveProcessTextLatex(text.firstChild, writeTo);
    } else {
      recursiveProcessTextLatex(node.firstChild, writeTo);
    }
  },

  EM: (node, writeTo) => processTextFunctionsLatex["em"](node, writeTo),
  em: (node, writeTo) => {
    writeTo.push("{\\em ");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}");
  },

  EPIGRAPH: (node, writeTo) => {
    processEpigraphPdf(node, writeTo);
  },

  EXERCISE: (node, writeTo) => {
    processExercisePdf(node, writeTo);
  },

  FIGURE: (node, writeTo) => {
    processFigurePdf(node, writeTo);
  },

  FOOTNOTE: (node, writeTo) => {
    writeTo.push("\\cprotect\\footnote{");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}");
  },

  H2: (node, writeTo) => {
    writeTo.push("\\subsection*{");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}");
  },

  INDEX: (node, writeTo) => {
    let margintext = "\\mymarginpar{";
    let inlinetext = "";
    writeTo.push("\\index{");

    // handle explicit order commands ORDER, DECLARATION, USE
    const order = getChildrenByTagName(node, "ORDER")[0];
    const declaration = getChildrenByTagName(node, "DECLARATION")[0];
    const use = getChildrenByTagName(node, "USE")[0];
    if (order) {
      recursiveProcessTextLatex(order.firstChild, writeTo);
      writeTo.push("@");
      //      margintext += order.firstChild + "}\\mymarginpar{\\klammeraffe ";
      //      inlinetext += order.firstChild + "\\klammeraffe ";
    } else if (declaration) {
      recursiveProcessTextLatex(declaration.firstChild, writeTo);
      writeTo.push("@");
      //      margintext += declaration.firstChild + "}\\mymarginpar{\\klammeraffe ";
      //      inlinetext += declaration.firstChild + "\\klammeraffe ";
    } else if (use) {
      recursiveProcessTextLatex(use.firstChild, writeTo);
      writeTo.push("@");
      //      margintext += use.firstChild + "}\\mymarginpar{\\klammeraffe ";
      //      inlinetext += use.firstChild + "\\klammeraffe ";
    }

    // render the actual index text
    const indexArr = [];
    recursiveProcessTextLatex(node.firstChild, indexArr);
    const indexStr = indexArr.join("");
    writeTo.push(indexStr);
    margintext += indexStr;
    inlinetext += indexStr;

    // render subindex
    const subIndex = getChildrenByTagName(node, "SUBINDEX")[0];
    if (subIndex) {
      const subIndexArr = [];
      recursiveProcessTextLatex(subIndex.firstChild, subIndexArr);
      const subIndexStr = subIndexArr.join("");
      writeTo.push("!");
      writeTo.push(subIndexStr);
      margintext += "}\\mymarginpar{!" + subIndexStr + "!";
      inlinetext += "!" + subIndexStr;
    }

    // render the page number and whatever needs to come after
    const open = getChildrenByTagName(node, "OPEN")[0];
    const close = getChildrenByTagName(node, "CLOSE")[0];
    const see = getChildrenByTagName(node, "SEE")[0];
    const seealso = getChildrenByTagName(node, "SEEALSO")[0];
    if (open) {
      writeTo.push("|(");
    } else if (close) {
      writeTo.push("|)");
    } else if (ancestorHasTag(node, "FOOTNOTE")) {
      writeTo.push("|nn");
    } else if (ancestorHasTag(node, "EXERCISE")) {
      writeTo.push("|xx{\\theExercise}");
    } else if (ancestorHasTag(node, "FIGURE")) {
      writeTo.push("|ff{\\thefigure}");
    } else if (declaration) {
      writeTo.push("|dd");
    } else if (see) {
      writeTo.push("|see{");
      recursiveProcessTextLatex(see.firstChild, writeTo);
      writeTo.push("}");
    } else if (seealso) {
      writeTo.push("|seealso{");
      recursiveProcessTextLatex(seealso.firstChild, writeTo);
      writeTo.push("}");
    }

    if (indexAnnotations) {
      if (
        ancestorHasTag(node, "FIGURE") ||
        ancestorHasTag(node, "FOOTNOTE") ||
        ancestorHasTag(node, "EPIGRAPH")
      ) {
        writeTo.push("}{\\color{DarkGreen}\\textsf{[" + inlinetext + "]}} ");
      } else {
        writeTo.push("}" + margintext + "}%\n");
      }
    } else {
      writeTo.push("}%\n");
    }
  },

  IMAGE: (node, writeTo) => {
    writeTo.push(
      "\\begin{figure}[H]\n\\centering" +
        generateImage(node.getAttribute("src")) +
        "\n\\end{figure}\n"
    );
  },

  LABEL: (node, writeTo) => {
    writeTo.push("\\label{" + node.getAttribute("NAME") + "}%\n");
  },

  LINK: (node, writeTo) => {
    writeTo.push("\\href{" + node.getAttribute("address") + "}{");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}");
  },

  LATEX: (node, writeTo) =>
    processTextFunctionsLatex["LATEXINLINE"](node, writeTo),
  LATEXINLINE: (node, writeTo) => {
    recursiveProcessPureText(node.firstChild, writeTo);
  },

  LaTeX: (node, writeTo) => {
    writeTo.push("\\LaTeX\\");
  },

  TeX: (node, writeTo) => {
    writeTo.push("\\TeX\\");
  },

  MATTERSECTION: (node, writeTo) => {
    writeTo.push("\\section*{");
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  P: (node, writeTo) => processTextFunctionsLatex["TEXT"](node, writeTo),
  TEXT: (node, writeTo) => {
    writeTo.push("\n\n");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("\n\n");
  },

  QUOTE: (node, writeTo) => {
    writeTo.push("``");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("''");
  },

  REF: (node, writeTo) => {
    writeTo.push("\\ref{" + node.getAttribute("NAME") + "}");
  },

  REFERENCE: (node, writeTo) => {
    writeTo.push("");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("\\\\[3mm]\n");
  },

  SC: (node, writeTo) => {
    writeTo.push("{\\scshape ");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}%\n");
  },

  CHAPTER: (node, writeTo) => {
    writeTo.push("\\chapter{");
    addName(node, writeTo);
    writeTo.push("\\pagestyle{main}%\n");
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SECTION: (node, writeTo) => {
    writeTo.push("\\section{");
    addName(node, writeTo);
    writeTo.push("\\pagestyle{section}%\n");
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SUBSECTION: (node, writeTo) => {
    writeTo.push("\\subsection{");
    addName(node, writeTo);
    writeTo.push("\\pagestyle{subsection}%\n");
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SUBSUBSECTION: (node, writeTo) => {
    writeTo.push("\\subsubsection{");
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SUBHEADING: (node, writeTo) => {
    writeTo.push("\\subsubsection*{");
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SUBSUBHEADING: (node, writeTo) => {
    writeTo.push("{\\noindent\\emph{");
    addName(node, writeTo);
    writeTo.push("}\n\n");
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SCHEMEINLINE: (node, writeTo) =>
    processTextFunctionsLatex["JAVASCRIPTINLINE"](node, writeTo),
  DECLARATION: (node, writeTo) =>
    processTextFunctionsLatex["JAVASCRIPTINLINE"](node, writeTo),
  JAVASCRIPTINLINE: (node, writeTo) => {
    if (node.getAttribute("break")) {
      writeTo.push(
        "{\\lstinline[breaklines=true, breakatwhitespace=true,mathescape=true]$"
      );
    } else {
      writeTo.push("{\\lstinline[mathescape=true]$");
    }
    recursiveProcessPureText(node.firstChild, writeTo, {
      removeNewline: "all",
      escapeCurlyBracket: true
    });
    writeTo.push("$}");
  },

  SNIPPET: (node, writeTo) => {
    processSnippetPdf(node, writeTo);
  },

  TABLE: (node, writeTo) => {
    processTablePdf(node, writeTo);
  },

  TT: (node, writeTo) => {
    writeTo.push("\\texttt{");
    recursiveProcessTextLatex(node.firstChild, writeTo, true);
    writeTo.push("}%\n");
  },

  OL: (node, writeTo) => {
    writeTo.push("\\begin{enumerate}");
    writeTo.push(
      ancestorHasTag(node, "EXERCISE") ? "[\\alph*.]\n" : "[\\arabic*.]\n"
    );
    processList(node.firstChild, writeTo);
    writeTo.push("\\end{enumerate}%\n");
  },

  UL: (node, writeTo) => {
    writeTo.push("\\begin{itemize}");
    processList(node.firstChild, writeTo);
    writeTo.push("\\end{itemize}%\n");
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
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },
  JAVASCRIPTINLINE: (node, writeTo) => {
    writeTo.push("{\\lstinline[mathescape=true, language=JavaScript]$");
    recursiveProcessPureText(node.firstChild, writeTo, {
      removeNewline: "all",
      escapeCurlyBracket: true
    });
    writeTo.push("$}%\n");
  },
  SNIPPET: (node, writeTo) => {
    processSnippetEpub(node, writeTo);
  },
  SUBSECTION: (node, writeTo) => {
    writeTo.push("\\subsection{");
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },
  SUBHEADING: (node, writeTo) => {
    writeTo.push("\\paragraph{");
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },
  SUBSUBSECTION: (node, writeTo) =>
    processTextFunctionsEpub["SUBHEADING"](node, writeTo)
};

let processTextFunctionsLatex = processTextFunctionsDefaultLatex;

export const switchParseFunctionsLatex = parseType => {
  if (parseType == "pdf") {
    processTextFunctionsLatex = processTextFunctionsDefaultLatex;
  } else if (parseType == "epub") {
    console.log("using parsetype epub");
    processTextFunctionsLatex = {
      ...processTextFunctionsDefaultLatex,
      ...processTextFunctionsEpub
    };
  }
};

export const processTextLatex = (node, writeTo) => {
  const name = node.nodeName;
  if (processTextFunctionsLatex[name]) {
    processTextFunctionsLatex[name](node, writeTo);
    return true;
  } else {
    if (replaceTagWithSymbol(node, writeTo) || tagsToRemove.has(name)) {
      return true;
    } else if (ignoreTags.has(name)) {
      recursiveProcessTextLatex(node.firstChild, writeTo);
      return true;
    }
  }
  console.log("WARNING Unrecognised Tag:\n" + node.toString() + "\n");
  return false;
};

export const recursiveProcessTextLatex = (node, writeTo) => {
  if (!node) return;
  processTextLatex(node, writeTo);
  return recursiveProcessTextLatex(node.nextSibling, writeTo);
};
