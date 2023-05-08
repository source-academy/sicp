import { getChildrenByTagName, ancestorHasTag } from "./utilityFunctions";

import { parseType } from "./index";

import {
  replaceTagWithSymbol,
  processEpigraphPdf,
  processAttributionPdf,
  processFigurePdf,
  generateImage,
  processExercisePdf,
  processFileInput,
  processSnippetPdf,
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
  "EDIT",
  "FRAGILE",
  "EXCLUDE",
  "FRAGILE",
  "HISTORY",
  "NAME",
  "ORDER",
  "PRIMITIVE",
  "OPERATOR",
  "FUNCTION",
  "PARSING",
  "SUBINDEX",
  "SEE",
  "SEEALSO",
  "OPEN",
  "CLOSE",
  "SCHEME",
  "WEB_ONLY",
  "SOLUTION"
]);
// SOLUTION tag handled by processSnippet

const ignoreTags = new Set([
  "CHAPTERCONTENT",
  "PYTHON",
  "SECTIONCONTENT",
  "span",
  "SPLIT",
  "PDF_ONLY"
]);

const processTextFunctionsDefaultLatex = {
  "#text": (node, writeTo) => {
    let trimedValue;
    if (ancestorHasTag(node, "SNIPPET")) {
      trimedValue = node.nodeValue;
    } else {
      trimedValue = node.nodeValue;
      if (
        node.parentNode.nodeName === "PYTHONINLINE" &&
        node.parentNode.parentNode.nodeName === "CAPTION"
      ) {
        trimedValue = trimedValue.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
      } else {
        if (node.parentNode.nodeName !== "PYTHONINLINE") {
          trimedValue = trimedValue.replace(/%/g, "\\%");
        }
      }
      trimedValue = trimedValue
        .replace(/[\r\n]+/, " ")
        .replace(/\s+/g, " ")
        .replace(/\^/g, "^{}");
    }
    if (trimedValue.match(/&(\w|\.)+;/)) {
      processFileInput(trimedValue.trim(), writeTo);
    } else {
      writeTo.push(trimedValue);
    }
    // if (!trimedValue.match(/^\s*$/)) {
    // }
  },

  SPLITINLINE: (node, writeTo) => {
    if (getChildrenByTagName(node, "PYTHONINLINE")[0]) {
      console.error("remove 'INLINE' from tag PYTHONINLINE");
    }
    if (getChildrenByTagName(node, "SCHEMEINLINE")[0]) {
      console.error("remove 'INLINE' from tag SCHEMEINLINE");
    }
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  ABOUT: (node, writeTo) => {
    writeTo.push("\\chapter*{");
    const name = addName(node, writeTo);
    writeTo.push("\\addcontentsline{toc}{chapter}{");
    writeTo.push(name + "}");
    writeTo.push("\\thispagestyle{chapter-open}\n");
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

  SOFT_HYP: (node, writeTo) => {
    writeTo.push("\\-");
  },

  WATCH: (node, writeTo) => {
    writeTo.push("\\marginalstar{}");
  },

  KEEP_TOGETHER: (node, writeTo) => {
    writeTo.push("\\interlinepenalty=10000 ");
  },

  START_KEEP_TOGETHER: (node, writeTo) => {
    writeTo.push("\\vbox{");
  },

  STOP_KEEP_TOGETHER: (node, writeTo) => {
    writeTo.push("}");
  },

  SHRINK_PARAGRAPH: (node, writeTo) => {
    let lines = node.getAttribute("lines") ? node.getAttribute("lines") : "4";
    writeTo.push("\\looseness=-" + lines + " ");
  },

  STRETCH_PARAGRAPH: (node, writeTo) => {
    let lines = node.getAttribute("lines") ? node.getAttribute("lines") : "4";
    writeTo.push("\\looseness=" + lines + " ");
  },

  DONT_BREAK_PAGE: (node, writeTo) => {
    let strength = node.getAttribute("strength")
      ? node.getAttribute("strength")
      : "4";
    writeTo.push("\\nopagebreak[" + strength + "]");
  },

  DO_BREAK_PAGE: (node, writeTo) => {
    let strength = node.getAttribute("strength")
      ? node.getAttribute("strength")
      : "4";
    writeTo.push("\\pagebreak[" + strength + "]");
  },

  FORCE_PAGE_BREAK_AND_FILL: (node, writeTo) => {
    writeTo.push("\\clearpage{}");
  },

  FILBREAK: (node, writeTo) => {
    writeTo.push("\\filbreak{}");
  },

  LONG_PAGE: (node, writeTo) => {
    let lines = node.getAttribute("lines") ? node.getAttribute("lines") : "1";
    writeTo.push("\\enlargethispage{" + lines + "\\baselineskip}");
  },

  SHORT_PAGE: (node, writeTo) => {
    let lines = node.getAttribute("lines") ? node.getAttribute("lines") : "1";
    writeTo.push("\\enlargethispage{-" + lines + "\\baselineskip}");
  },

  BLOCKQUOTE: (node, writeTo) => {
    writeTo.push("\\begin{quote}");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("\\end{quote}");
  },

  NOINDENT: (node, writeTo) => {
    writeTo.push("\\noindent ");
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

  SIGNATURE: (node, writeTo) => {
    writeTo.push("\\medskip\n\\begin{flushleft}");
    for (let child = node.firstChild; child; child = child.nextSibling) {
      if (child.nodeName == "ATTRIBUTION") {
        processAttributionPdf(node, writeTo);
        break;
      }
    }
    writeTo.push("\\end{flushleft}");
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
    writeTo.push("\\def\\inlinecodesize{\\fontsize{9pt}{10pt}\\selectfont}");
    const contentArr = [];
    recursiveProcessTextLatex(node.firstChild, contentArr);
    writeTo.push(contentArr.join("").trim());
    writeTo.push("}");
  },

  H2: (node, writeTo) => {
    writeTo.push("\\subsection*{");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}");
  },

  META: (node, writeTo) => {
    if (ancestorHasTag(node, "PYTHON_OUTPUT")) {
      writeTo.push("^");
    }
    writeTo.push("$\\mathit{");
    let s = node.firstChild.nodeValue;
    s = s.replace(/-/g, "\\mhyphen{}").replace(/ /g, "\\ ");
    writeTo.push(s);
    writeTo.push("}$");
    if (ancestorHasTag(node, "PYTHON_OUTPUT")) {
      writeTo.push("^");
    }
  },

  METAPHRASE: (node, writeTo) => {
    writeTo.push("$\\langle\\mathit{");
    const contentArr = [];
    recursiveProcessTextLatex(node.firstChild, contentArr);
    let s = contentArr.join("");
    s = s
      .replace(/-/g, "\\mhyphen{}")
      .replace(/, /g, ",\\,")
      .replace(/ /g, "\\,\\:");
    writeTo.push(s);
    writeTo.push("}\\rangle$");
  },

  INDEX: (node, writeTo) => {
    const primitive = getChildrenByTagName(node, "PRIMITIVE")[0];
    const operator = getChildrenByTagName(node, "OPERATOR")[0];
    const functioN = getChildrenByTagName(node, "FUNCTION")[0];
    const parsing = getChildrenByTagName(node, "PARSING")[0];
    const fragile = getChildrenByTagName(node, "FRAGILE")[0];
    let margintext = "";
    let inlinetext = "";
    let prefix = "";

    writeTo.push("\\index{");

    // prepare actual index string
    const indexArr = [];
    recursiveProcessTextLatex(node.firstChild, indexArr);
    let indexStr = indexArr.join("").trim();
    let marginStr = indexArr.join("").trim();
    if (primitive) {
      indexStr +=
        "primitive functions (ECMAScript equivalent in parentheses; those marked \\textit{ns} are not in the ECMAScript standard)";
      marginStr += "primitive functions (...)";
    }
    if (operator) {
      indexStr +=
        "operators (ECMAScript may allow additional operand type combinations)";
      marginStr += "operators (...)";
    }
    if (functioN) {
      indexStr += "function (JavaScript)";
      marginStr += "function (JavaScript)";
    }
    if (parsing) {
      indexStr += "parsing JavaScript";
      marginStr += "parsing JavaScript";
    }

    // handle explicit order commands ORDER, DECLARATION, USE
    const open = getChildrenByTagName(node, "OPEN")[0];
    if (open) {
      prefix += "$\\langle$";
    }
    const close = getChildrenByTagName(node, "CLOSE")[0];
    if (close) {
      prefix += "$\\rangle$";
    }
    const order = getChildrenByTagName(node, "ORDER")[0];
    let declaration = getChildrenByTagName(node, "DECLARATION")[0];
    const use = getChildrenByTagName(node, "USE")[0];
    if (declaration) {
      if (order) {
        // ORDER overrides
        recursiveProcessTextLatex(order.firstChild, writeTo);
      } else {
        declaration.firstChild.data = declaration.firstChild.data.replace(
          /_/g,
          " "
        );
        declaration.firstChild.nodeValue =
          declaration.firstChild.nodeValue.replace(/_/g, " ");
        recursiveProcessTextLatex(declaration.firstChild, writeTo);
      }
      writeTo.push("@");
      inlinetext += "\\indexdeclarationinline{" + prefix + marginStr + "}";
      margintext += "\\indexdeclarationmarginpar{" + prefix + marginStr + "}";
    } else if (use) {
      if (order) {
        // ORDER overrides
        recursiveProcessTextLatex(order.firstChild, writeTo);
      } else {
        use.firstChild.data = use.firstChild.data.replace(/_/g, " ");
        use.firstChild.nodeValue = use.firstChild.nodeValue.replace(/_/g, " ");
        recursiveProcessTextLatex(use.firstChild, writeTo);
      }
      writeTo.push("@");
      margintext += "\\indexusemarginpar{" + prefix + marginStr + "}";
      inlinetext += "\\indexuseinline{" + prefix + marginStr + "}";
    } else if (order) {
      recursiveProcessTextLatex(order.firstChild, writeTo);
      writeTo.push("@");
      margintext += "\\indexmarginpar{" + prefix + marginStr + "}";
      inlinetext += "\\indexinline{" + prefix + marginStr + "}";
    } else {
      writeTo.push(indexStr.replace(/-/g, " "));
      writeTo.push("@");
      margintext += "\\indexmarginpar{" + prefix + marginStr + "}";
      inlinetext += "\\indexinline{" + prefix + marginStr + "}";
    }

    // render the actual index text
    writeTo.push(indexStr);

    // display ORDER string in the margin
    if (order) {
      const orderArr = [];
      recursiveProcessTextLatex(order.firstChild, orderArr);
      const orderStr = orderArr.join("");
      margintext += "\\ordermarginpar{" + orderStr + "}";
      inlinetext += "\\orderinline{" + orderStr + "}";
    }

    // render subindex
    const subIndex = getChildrenByTagName(node, "SUBINDEX")[0];
    if (subIndex) {
      const subIndexArr = [];
      recursiveProcessTextLatex(subIndex.firstChild, subIndexArr);
      let subIndexStr = subIndexArr.join("");
      writeTo.push("!");

      // compute open/close prefix
      let prefix = "";
      let postfix = "";
      const open = getChildrenByTagName(subIndex, "OPEN")[0];
      const close = getChildrenByTagName(subIndex, "CLOSE")[0];
      if (open) {
        prefix += "$\\langle$";
        postfix += "|(";
      } else if (close) {
        prefix += "$\\rangle$";
        postfix += "|)";
      }

      const order = getChildrenByTagName(subIndex, "ORDER")[0];
      let declaration = getChildrenByTagName(subIndex, "DECLARATION")[0];
      const use = getChildrenByTagName(subIndex, "USE")[0];
      if (declaration) {
        if (order) {
          // ORDER overrides
          recursiveProcessTextLatex(order.firstChild, writeTo);
        } else {
          declaration.firstChild.data = declaration.firstChild.data.replace(
            /_/g,
            " "
          );
          declaration.firstChild.nodeValue =
            declaration.firstChild.nodeValue.replace(/_/g, " ");
          recursiveProcessTextLatex(declaration.firstChild, writeTo);
        }
        writeTo.push("@");
        margintext +=
          "\\subindexdeclarationmarginpar{" + prefix + subIndexStr + "}";
        inlinetext +=
          "\\subindexdeclarationinline{" + prefix + subIndexStr + "}";
      } else if (use) {
        if (order) {
          // ORDER overrides
          recursiveProcessTextLatex(order.firstChild, writeTo);
        } else {
          use.firstChild.data = use.firstChild.data.replace(/_/g, " ");
          use.firstChild.nodeValue = use.firstChild.nodeValue.replace(
            /_/g,
            " "
          );
          recursiveProcessTextLatex(use.firstChild, writeTo);
        }
        writeTo.push("@");
        margintext += "\\subindexusemarginpar{" + prefix + subIndexStr + "}";
        inlinetext += "\\subindexuseinline{" + prefix + subIndexStr + "}";
      } else if (order) {
        recursiveProcessTextLatex(order.firstChild, writeTo);
        writeTo.push("@");
        margintext += "\\subindexmarginpar{" + prefix + subIndexStr + "}";
        inlinetext += "\\subindexinline{" + prefix + subIndexStr + "}";
      } else {
        writeTo.push(subIndexStr.replace(/-/g, " "));
        writeTo.push("@");
        margintext += "\\subindexmarginpar{" + prefix + subIndexStr + "}";
        inlinetext += "\\subindexinline{" + prefix + subIndexStr + "}";
      }

      let ecmaString = "";
      const ecma = getChildrenByTagName(subIndex, "ECMA")[0];
      if (ecma) {
        const ecmaArr = [];
        recursiveProcessTextLatex(ecma.firstChild, ecmaArr);
        ecmaString = " (\\texttt{" + ecmaArr.join("") + "})";
      }

      writeTo.push(subIndexStr + ecmaString + postfix);
    }

    const see = getChildrenByTagName(node, "SEE")[0];
    const seealso = getChildrenByTagName(node, "SEEALSO")[0];

    declaration =
      declaration ||
      (subIndex && getChildrenByTagName(subIndex, "DECLARATION")[0]);

    // render the page number and whatever needs to come after
    if (open) {
      writeTo.push("|(");
    } else if (close) {
      writeTo.push("|)");
    } else if (ancestorHasTag(node, "FIGURE")) {
      writeTo.push("|ff{\\thefigure}");
    } else if (ancestorHasTag(node, "FOOTNOTE")) {
      if (declaration) {
        writeTo.push("|nndd");
      } else {
        writeTo.push("|nn");
      }
    } else if (ancestorHasTag(node, "EXERCISE")) {
      if (declaration) {
        writeTo.push("|xxdd{\\theExercise}");
      } else {
        writeTo.push("|xx{\\theExercise}");
      }
    } else if (declaration) {
      writeTo.push("|dd");
    } else if (see) {
      const seeArr = [];
      recursiveProcessTextLatex(see.firstChild, seeArr);
      const seeStr = seeArr.join("");
      inlinetext += "\\seeinline{" + seeStr + "}";
      writeTo.push("|see{");
      recursiveProcessTextLatex(see.firstChild, writeTo);
      writeTo.push("}");
    } else if (seealso) {
      const seeAlsoArr = [];
      recursiveProcessTextLatex(seealso.firstChild, seeAlsoArr);
      const seeAlsoStr = seeAlsoArr.join("");
      inlinetext += "\\seealsoinline{" + seeAlsoStr + "}";
      writeTo.push("|seealso{");
      recursiveProcessTextLatex(seealso.firstChild, writeTo);
      writeTo.push("}");
    }

    if (indexAnnotations) {
      if (
        ancestorHasTag(node, "FIGURE") ||
        ancestorHasTag(node, "FOOTNOTE") ||
        ancestorHasTag(node, "EPIGRAPH") ||
        fragile
      ) {
        writeTo.push("}" + inlinetext + "%\n");
      } else {
        writeTo.push("}" + margintext + "%\n");
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
    recursiveProcessPureText(node.firstChild, writeTo, { type: parseType });
  },

  LaTeX: (node, writeTo) => {
    writeTo.push("\\LaTeX{}");
  },

  TeX: (node, writeTo) => {
    writeTo.push("\\TeX{}");
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
    if (ancestorHasTag(node, "QUOTE")) {
      writeTo.push("`");
    } else {
      writeTo.push("``");
    }
    recursiveProcessTextLatex(node.firstChild, writeTo);
    if (ancestorHasTag(node, "QUOTE")) {
      writeTo.push("'");
    } else {
      writeTo.push("''");
    }
  },

  REF: (node, writeTo) => {
    writeTo.push("\\ref{" + node.getAttribute("NAME") + "}");
  },

  PAGEREF: (node, writeTo) => {
    writeTo.push("\\pageref{" + node.getAttribute("NAME") + "}");
  },

  REFERENCE: (node, writeTo) => {
    writeTo.push("\\item\n");
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SC: (node, writeTo) => {
    writeTo.push("{\\scshape ");
    recursiveProcessTextLatex(node.firstChild, writeTo);
    writeTo.push("}%\n");
  },

  CHAPTER: (node, writeTo) => {
    writeTo.push("\\chapter{");
    addName(node, writeTo);
    writeTo.push("\\LOE{} %% Insert break in list of Exercises\n");
    writeTo.push("\\thispagestyle{chapter-open}\n");
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SECTION: (node, writeTo) => {
    if (ancestorHasTag(node, "MATTER")) {
      writeTo.push("\\section*{");
    } else {
      writeTo.push("\\section{");
    }
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SUBSECTION: (node, writeTo) => {
    if (ancestorHasTag(node, "MATTER")) {
      writeTo.push("\\subsection*{");
    } else {
      writeTo.push("\\subsection{");
    }
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SUBSUBSECTION: (node, writeTo) => {
    if (ancestorHasTag(node, "MATTER")) {
      writeTo.push("\\subsubsection*{");
    } else {
      writeTo.push("\\subsubsection{");
    }
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SUBHEADING: (node, writeTo) => {
    writeTo.push("\\subsubsection*{");
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SUBSUBHEADING: (node, writeTo) => {
    writeTo.push("\\subparagraph{");
    addName(node, writeTo);
    recursiveProcessTextLatex(node.firstChild, writeTo);
  },

  SCHEMEINLINE: (node, writeTo) =>
    processTextFunctionsLatex["PYTHONINLINE"](node, writeTo),
  DECLARATION: (node, writeTo) =>
    processTextFunctionsLatex["PYTHONINLINE"](node, writeTo),
  USE: (node, writeTo) =>
    processTextFunctionsLatex["PYTHONINLINE"](node, writeTo),
  ECMA: (node, writeTo) => {},
  PYTHONINLINE: (node, writeTo) => {
    if (ancestorHasTag(node, "METAPHRASE")) {
      writeTo.push("}$");
      recursiveProcessPureText(node.firstChild, writeTo, { type: parseType });
      writeTo.push("$\\mathit{");
    } else {
      if (node.getAttribute("break")) {
        writeTo.push(
          "{\\lstinline[breaklines=true,breakatwhitespace=true,mathescape=false]~"
        );
      } else if (getChildrenByTagName(node, "META")[0]) {
        writeTo.push("{\\JSMathEscape~");
      } else if (
        node.firstChild.data &&
        node.firstChild.data.search("@") >= 0
      ) {
        if (parseType === "pdf") {
          if (node.firstChild.data.indexOf("$") === -1) {
            writeTo.push("{\\JSBreak~");
          } else {
            writeTo.push("{\\JSBreakNoEscape~");
          }
        } else {
          node.firstChild.data = node.firstChild.data.replace(/_@/g, "_");
          node.firstChild.nodeValue = node.firstChild.nodeValue.replace(
            /_@/g,
            "_"
          );
          node.firstChild.data = node.firstChild.data.replace(/@/g, "");
          node.firstChild.nodeValue = node.firstChild.nodeValue.replace(
            /@/g,
            ""
          );
          writeTo.push("{\\JS~");
        }
      } else {
        writeTo.push("{\\JS~");
      }
      // recursiveProcessTextLatex(node.firstChild, writeTo, { escapeCurlyBracket: false });
      recursiveProcessTextLatex(node.firstChild, writeTo, {
        escapeCurlyBracket: true
      });
      writeTo.push("~}");
    }
  },

  SNIPPET: (node, writeTo) => {
    processSnippetPdf(node, writeTo);
  },

  TABLE: (node, writeTo) => {
    processTablePdf(node, writeTo);
  },

  TT: (node, writeTo) => {
    writeTo.push("\\texttt{");
    recursiveProcessTextLatex(node.firstChild, writeTo);
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

let processTextFunctionsLatex = processTextFunctionsDefaultLatex;

export const switchParseFunctionsLatex = parseType => {
  processTextFunctionsLatex = processTextFunctionsDefaultLatex;
};

export const processTextLatex = (node, writeTo) => {
  const name = node.nodeName;
  if (processTextFunctionsLatex[name]) {
    processTextFunctionsLatex[name](node, writeTo);
    return true;
  } else {
    if (
      replaceTagWithSymbol(node, writeTo, parseType) ||
      tagsToRemove.has(name)
    ) {
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
