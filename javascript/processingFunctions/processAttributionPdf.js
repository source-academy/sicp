import { recursiveProcessTextLatex, processTextLatex } from "../parseXmlLatex";

export const processAttributionPdf = (node, writeTo) => {
  const attribution = node;

  if (attribution) {
    const author = attribution.getElementsByTagName("AUTHOR")[0];
    if (author) {
      writeTo.push("\\quotationdash{}\\textup{");
      recursiveProcessTextLatex(author.firstChild, writeTo);
      writeTo.push("}");
    }

    let child = attribution.getElementsByTagName("TITLE")[0];
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
};

export default processAttributionPdf;
