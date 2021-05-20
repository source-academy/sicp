import { recursiveProcessTextLatex } from "../parseXmlLatex";

export const processTable = (node, writeTo) => {
  const firstRow = node.getElementsByTagName("TR")[0];
  if (firstRow) {
    const colNum = firstRow.getElementsByTagName("TD").length;
    writeTo.push("\n\\begin{quote}\n\\noindent\n\\begin{tabular}{");
    for (let i = 0; i < colNum; i++) {
      writeTo.push("l  ");
    }
    writeTo.push("} \n");
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
        recursiveProcessTextLatex(col.firstChild, writeTo);
      }
      writeTo.push(" \\\\ \n");
    }
    writeTo.push("\\end{tabular}\n\\end{quote}\n");
  } else {
    recursiveProcessTextLatex(node.firstChild, writeTo);
  }
};

export default processTable;
