import replaceTagWithSymbol from './replaceTagWithSymbol';
import processFigure from './processFigure';

const tagsToRemove = new Set(["#comment", "COMMENT", "CHANGE", "EXCLUDE", "HISTORY", "SCHEME", "SCHEMEINLINE", "EXERCISE", "SOLUTION"]);
const ignoreTags = new Set(["JAVASCRIPT", "SPLIT", "SPLITINLINE", "NOBR"]);

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

  "BLOCKQUOTE": ((node, writeTo) => {
    writeTo.push("\n\\begin{quote}");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("\\end{quote}\n");
  }),

  "EM": ((node, writeTo) => processTextFunctions["em"](node, writeTo)),
  "em": ((node, writeTo) => {
    writeTo.push("{\\em ");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}");
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
    writeTo.push("\n\\cprotect\\footnote{");
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n");
  }),

  "INDEX": ((node, writeTo) => {
    processIndex(node, writeTo);
  }),

  "LABEL": ((node, writeTo) => {
    writeTo.push("\\label{"
      + node.getAttribute("NAME")
      + "}\n");
  }),

  "LATEX": ((node, writeTo) => processTextFunctions["LATEXINLINE"](node, writeTo)),
  "LATEXINLINE": ((node, writeTo) => {
    recursiveProcessPureText(node.firstChild, writeTo);
  }),

  "NAME": ((node, writeTo) => {
    recursiveProcessText(node.firstChild, writeTo);
    writeTo.push("}\n");
  }),

  "OL": ((node, writeTo) => {
    writeTo.push("\n\\begin{enumerate}\n");
    processList(node.firstChild, writeTo);
    writeTo.push("\\end{enumerate}\n");
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
    writeTo.push("~\\ref{" 
      + node.getAttribute("NAME")
      + "}");
  }),

  "SCHEMEINLINE": ((node, writeTo) => processTextFunctions["JAVASCRIPTINLINE"](node, writeTo)),
  "JAVASCRIPTINLINE": ((node, writeTo) => {
    writeTo.push("\\lstinline|");
    recursiveProcessPureText(node.firstChild, writeTo, true);
    writeTo.push("|");
  }),

  "SNIPPET": ((node, writeTo) => {
    processSnippet(node, writeTo);
  }),

  "SUBHEADING": ((node, writeTo) => {
    writeTo.push("\\subsubsection{");
    recursiveProcessText(node.firstChild, writeTo);
  }),

  "UL": ((node, writeTo) => {
    writeTo.push("\n\\begin{itemize}\n");
    processList(node.firstChild, writeTo);
    writeTo.push("\\end{itemize}\n");
  })
}

export const processList = (node, writeTo) => {
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
    writeTo.push("\n\\begin{lstlisting}");
    recursiveProcessPureText(jsSnippet.firstChild, writeTo);
    writeTo.push("\\end{lstlisting}\n");
  }
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

export const processIndex = (index, writeTo) => {
  writeTo.push("\\index{");
  for (let child = index.firstChild; child; child = child.nextSibling) {
    const name = child.nodeName;
    switch (name) {
      case "SUBINDEX":
        writeTo.push("!");
        recursiveProcessText(child.firstChild, writeTo);
        break;

      default:
        processText(child, writeTo);
    }
  }
  writeTo.push("}");
}

