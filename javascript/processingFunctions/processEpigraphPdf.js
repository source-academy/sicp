import { recursiveProcessTextLatex, processTextLatex } from "../parseXmlLatex";

export const processEpigraphPdf = (node, writeTo) => {
  writeTo.push("\\epigraph{");
  let child = node.firstChild;
  let attribution = null;
  for (child; child; child = child.nextSibling) {
    if (child.nodeName == "ATTRIBUTION") {
      attribution = child;
      break;
    } else {
      processTextLatex(child, writeTo);
    }
  }

  if (attribution) {
    writeTo.push("}{--- ");

    const author = attribution.getElementsByTagName("AUTHOR")[0];
    if (author) {
      writeTo.push("\\textup{");
      recursiveProcessTextLatex(author.firstChild, writeTo);
      writeTo.push("}");
    }

    child = attribution.getElementsByTagName("TITLE")[0];
    if (child) {
      if (author) writeTo.push(", ");
      recursiveProcessTextLatex(child.firstChild, writeTo);
    }

    child = attribution.getElementsByTagName("DATE")[0];
    if (child) {
      writeTo.push(" (");
      recursiveProcessTextLatex(child.firstChild, writeTo);
      writeTo.push(")");
    }

    child = attribution.getElementsByTagName("INDEX")[0];
    if (child) {
      processTextLatex(child, writeTo);
    }
  }
  writeTo.push("}\n");
};

export default processEpigraphPdf;
