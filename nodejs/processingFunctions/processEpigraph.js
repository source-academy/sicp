import { recursiveProcessText, processText } from '../parseXML';

export const processEpigraph = (node, writeTo) => {
  writeTo.push("\\epigraph{");
  let child = node.firstChild;
  let attribution = null;
  for (child; child; child = child.nextSibling) {
    if (child.nodeName == "ATTRIBUTION") {
      attribution = child;
      break;
    } else {
      processText(child, writeTo);
    }
  }

  if (attribution) {
    writeTo.push("}{--- ");

    const author = attribution.getElementsByTagName("AUTHOR")[0];
    if (author) {
      writeTo.push("\\textup{");
      recursiveProcessText(author.firstChild, writeTo);
      writeTo.push("}");
    }

    child = attribution.getElementsByTagName("TITLE")[0];
    if (child) {
      if (author) writeTo.push(", ");
      recursiveProcessText(child.firstChild, writeTo);
    }

    child = attribution.getElementsByTagName("DATE")[0];
    if (child) {
      writeTo.push(" (");
      recursiveProcessText(child.firstChild, writeTo);
      writeTo.push(")");
    }

    child = attribution.getElementsByTagName("INDEX")[0];
    if (child) {
      processText(child, writeTo);
    }
  }
  writeTo.push("}\n");
};

export default processEpigraph;
