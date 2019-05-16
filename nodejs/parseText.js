import replaceTagWithSymbol from './replaceTagWithSymbol';
import processFigure from './processFigure';

const tagsToRemove = new Set(["#comment", "COMMENT", "CHANGE", "EXCLUDE", "HISTORY", "SCHEME", "SCHEMEINLINE"]);
const ignoreTags = new Set(["JAVASCRIPT", "P", "SPLIT", "SPLITINLINE", "NOBR"]);

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
  if (removeNewline) {
    writeTo.push(node.nodeValue.replace(/[\r\n]+/g, " "));
  } else {
    writeTo.push(node.nodeValue);
  }
  return recursiveProcessText(node.nextSibling, writeTo)
}

export const recursiveProcessText = (node, writeTo) => {
  if (!node) return;
  if (!processText(node, writeTo)){
    // console.log("recusive process:\n" + node.toString());
  }
  return recursiveProcessText(node.nextSibling, writeTo)
}

export const processText = (node, writeTo) => {
  const name = node.nodeName;
  switch (name) {
    case "#text":
      const trimedValue = node.nodeValue.replace(/\n/, " ").replace(/\s+/g, " ");
      if (!trimedValue.match(/^\s*$/)) {
        writeTo.push(trimedValue.replace(/%/g, "\\%"));
      }
      return true;

    case "EM":
    case "em":
      writeTo.push("{\\em ");
      recursiveProcessText(node.firstChild, writeTo);
      writeTo.push("}");
      return true;

    case "FIGURE":
      processFigure(node, writeTo);
      return true;

    case "FOOTNOTE":
      writeTo.push("\n\\cprotect\\footnote{");
      recursiveProcessText(node.firstChild, writeTo);
      writeTo.push("}\n");
      return true;

    case "INDEX":
      processIndex(node, writeTo);
      return true;

    case "JAVASCRIPTINLINE":
    case "SCHEMEINLINE":
      writeTo.push("\\lstinline|");
      recursiveProcessPureText(node.firstChild, writeTo, true);
      writeTo.push("|");
      return true;

    case "LATEX":
    case "LATEXINLINE":
      recursiveProcessPureText(node.firstChild, writeTo);
      return true;

    case "OL":
      writeTo.push("\n\\begin{enumerate}\n");
      processList(node.firstChild, writeTo);
      writeTo.push("\\end{enumerate}\n");
      return true;

    case "QUOTE":
      writeTo.push("\\enquote{");
      recursiveProcessText(node.firstChild, writeTo);
      writeTo.push("}");
      return true;

    case "REF":
      writeTo.push("~\\ref{" 
        + node.getAttribute("NAME")
        + "}");
      return true;

    case "SNIPPET":
      processSnippet(node, writeTo);
      return true;

    case "UL":
      writeTo.push("\n\\begin{itemize}\n");
      processList(node.firstChild, writeTo);
      writeTo.push("\\end{itemize}\n");
      return true;

    default:
      if (replaceTagWithSymbol(node, writeTo)) {
        return true;
      } else if (ignoreTags.has(name) && !tagsToRemove.has(name)) {
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
  writeTo.push("}\n");
}

