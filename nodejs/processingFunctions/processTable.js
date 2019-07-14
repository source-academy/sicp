import { recursiveProcessText, processText } from '../parseXML';

export const processTable = (node, writeTo) => {
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

export default processTable;