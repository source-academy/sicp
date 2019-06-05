import replaceTagWithSymbol from './replaceTagWithSymbol';
import processFigure from './processFigure';

const tagsToRemove = new Set(["#comment", "COMMENT", "CHANGE", "EDIT", "EXCLUDE", "HISTORY", "SCHEME", "SCHEMEINLINE", "SOLUTION"]);
const ignoreTags = new Set(["JAVASCRIPT", "span", "SPLIT", "SPLITINLINE", "NOBR"]);

export const processTextFunctions = {
  "#text": ((node, writeTo) => {
    const trimedValue = node.nodeValue.replace(/[\r\n]+/, " ").replace(/\s+/g, " ");
    if (!trimedValue.match(/^\s*$/)) {
      writeTo.push(trimedValue.replace(/%/g, "\\%"));
    }
  }),

  "B": ((node, writeTo) => {
    writeTo.push("\\textbf{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  }),

  "BR": ((node, writeTo) => {
    writeTo.push("\n\\noindent ");
  }),

  "BLOCKQUOTE": ((node, writeTo) => {
    writeTo.push("\n\\begin{quote}");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("\\end{quote}\n");
  }),

  "CITATION": ((node, writeTo) => {
    // Currently just text. Not linked to biblography.
    const text = node.getElementsByTagName("TEXT")[0]; 
    if (text) {
      recursiveProcessText(text.firstChild, writeTo);
    } else {
      recursiveProcessText(node.firstChild, writeTo);
    }
  }),

  "EM": ((node, writeTo) => processTextFunctions["em"](node, writeTo)),
  "em": ((node, writeTo) => {
    writeTo.push("{\\em ");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  }),

  "EXERCISE": ((node, writeTo) => {
    processExercise(node, writeTo);
  }),

  "FIGURE": ((node, writeTo) => {
    processFigure(node, writeTo);
  }),

  "IMAGE": ((node, writeTo) => {
    writeTo.push("\n\\includegraphics{" 
    + node.getAttribute("src").replace(/\.gif$/, ".png").replace(/_/g, "\\string_")
    + "}\n");
  }),

  "FOOTNOTE": ((node, writeTo) => {
    writeTo.push("\\cprotect\\footnote{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n");
  }),

  "H2": ((node, writeTo) => {
    writeTo.push("\n\\subsection*{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n");
  }),

  "INDEX": ((node, writeTo) => {
    writeTo.push("\\index{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  }),

  "LABEL": ((node, writeTo) => {
    writeTo.push("\\label{"
      + node.getAttribute("NAME")
      + "}\n");
  }),

  "LINK": ((node, writeTo) => {
    writeTo.push("\\href{"
      + node.getAttribute("address")
      + "}{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  }),

  "LATEX": ((node, writeTo) => processTextFunctions["LATEXINLINE"](node, writeTo)),
  "TREETAB": ((node, writeTo) => processTextFunctions["LATEXINLINE"](node, writeTo)),
  "LATEXINLINE": ((node, writeTo) => {
    recursiveProcessPureText(node.firstChild, writeTo);
  }),

  "NAME": ((node, writeTo) => {
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n\n");
  }),

  "OL": ((node, writeTo) => {
    writeTo.push("\n\\begin{enumerate}\n");
    processList(node.firstChild, writeTo);
    writeTo.push("\\end{enumerate}\n");
  }),

  "ORDER": ((node, writeTo) => {
    // should occur only within INDEX
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("@");
  }),

  "P": ((node, writeTo) => processTextFunctions["TEXT"](node, writeTo)),
  "TEXT": ((node, writeTo) => {
    writeTo.push("\n\n");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("\n");
  }),

  "QUOTE": ((node, writeTo) => {
    writeTo.push("\\enquote{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  }),

  "REF": ((node, writeTo) => {
    writeTo.push("\\ref{" 
      + node.getAttribute("NAME")
      + "}");
  }),

  "REFERENCE": ((node, writeTo) => {
    // Doesn't do anything special
    writeTo.push("\n");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("\n");
  }),

  "SC": ((node, writeTo) => {
    writeTo.push("{\\scshape ");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
  }),

  "SCHEMEINLINE": ((node, writeTo) => processTextFunctions["JAVASCRIPTINLINE"](node, writeTo)),
  "JAVASCRIPTINLINE": ((node, writeTo) => {
    writeTo.push("\n{\\lstinline[mathescape=true]|");
    recursiveProcessPureText(node.firstChild, writeTo, true);
    writeTo.push("|}");
  }),

  "SNIPPET": ((node, writeTo) => {
    processSnippet(node, writeTo);
  }),

  "SUBHEADING": ((node, writeTo) => {
    writeTo.push("\\subsubsection{");
    recursiveProcessText(node.firstChild, writeTo);
  }),

  "SUBINDEX": ((node, writeTo) => {
    // should occur only within INDEX
    writeTo.push("!");
    recursiveProcessText(node.firstChild, writeTo);
  }),

  "TABLE": ((node, writeTo) => {
    processTable(node, writeTo);
  }),

  "TT": ((node, writeTo) => {
    writeTo.push("\\texttt{");
    recursiveProcessText(node.firstChild, writeTo, true);
    writeTo.push("}");
  }),

  "UL": ((node, writeTo) => {
    writeTo.push("\n\\begin{itemize}\n");
    processList(node.firstChild, writeTo);
    writeTo.push("\\end{itemize}\n");
  })
}

const recursiveProcessPureText = (node, writeTo, removeNewline = false) => {
  if (!node) return;
  if (!replaceTagWithSymbol(node, writeTo)) {
    if (removeNewline) {
      writeTo.push(node.nodeValue.replace(/[\r\n]+/g, " "));
    } else {
      writeTo.push(node.nodeValue);
    }
  }
  return recursiveProcessPureText(node.nextSibling, writeTo)
}

export const recursiveProcessText = (node, writeTo) => {
  if (!node) return;
  if (!processText(node, writeTo)){
    console.log("recusive process:\n" + node.toString());
  }
  return recursiveProcessText(node.nextSibling, writeTo)
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
    } else {
      return false;
    }
  }
}

const processList = (node, writeTo) => {
  if (!node) return;
  if (node.nodeName == "LI"){
    writeTo.push("\\item{");
    recursiveProcessText(node.firstChild, writeTo)
    writeTo.push("}\n");
  } 
  return processList(node.nextSibling, writeTo);
}

export const processSnippet = (node, writeTo) => {
  const jsSnippet = node.getElementsByTagName("JAVASCRIPT")[0]; 
  if (jsSnippet) {
    writeTo.push("\n\\begin{lstlisting}[mathescape=true]");
    recursiveProcessPureText(jsSnippet.firstChild, writeTo);
    writeTo.push("\\end{lstlisting}");
  }
}

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
}

let unlabeledEx = 0;
const processExercise = (node, writeTo) => {
  const label = node.getElementsByTagName("LABEL")[0];
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
  if (solution) {
    writeTo.push("[title={\\hyperref[" + labelName + "-Answer]{Link to solution}}]");
    if (!label) {
      writeTo.push("\n\\label{" + labelName + "}");
    }
  }
  writeTo.push("\n");

  recursiveProcessText(node.firstChild, writeTo);
  writeTo.push("\n\\end{Exercise}\n");

  if (solution) {
    writeTo.push("\n\\begin{Answer}[ref={" + labelName + "}]\n");
    recursiveProcessText(solution.firstChild, writeTo);
    writeTo.push("\n\\end{Answer}\n");
  }
}