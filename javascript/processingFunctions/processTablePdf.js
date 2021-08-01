import { recursiveProcessTextLatex } from "../parseXmlLatex";

export const processTable = (node, writeTo) => {
  const firstRow = node.getElementsByTagName("TR")[0];
  if (firstRow) {
    const colNum = firstRow.getElementsByTagName("TD").length;
    writeTo.push(
      "\n\\begin{quote}\n\\noindent\n\\bgroup\\def\\arraystretch{1.5}\\begin{tabular}{"
    );
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
      let nextRow = row.nextSibling;
      while (nextRow && nextRow.nodeName != "TR") {
        nextRow = nextRow.nextSibling;
      }
      if (nextRow && nextRow.getAttribute("SINGLESPACE") === "yes") {
        writeTo.push(" \\\\[-6pt]\n");
      } else if (nextRow && nextRow.getAttribute("DOUBLESPACE") === "yes") {
        writeTo.push(" \\\\[6pt]\n");
      } else {
        writeTo.push(" \\\\ \n");
      }
    }
    writeTo.push("\\end{tabular}\\egroup\n\\end{quote}\n");
  } else {
    recursiveProcessTextLatex(node.firstChild, writeTo);
  }
};

export default processTable;
