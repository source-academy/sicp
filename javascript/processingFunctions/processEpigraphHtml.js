import { recursiveProcessTextHtml, processTextHtml } from "../parseXmlHtml";

export const processEpigraphHtml = (node, writeTo) => {
  writeTo.push("<blockquote class='blockquote'>");
  let child = node.firstChild;
  let attribution = null;
  for (child; child; child = child.nextSibling) {
    if (child.nodeName == "ATTRIBUTION") {
      attribution = child;
      break;
    } else {
      processTextHtml(child, writeTo);
    }
  }

  if (attribution) {
    writeTo.push("<div class='chapter-text-ATTRIBUTION'>\n");

    const author = attribution.getElementsByTagName("AUTHOR")[0];
    if (author) {
      writeTo.push("<span class='chapter-text-AUTHOR'>");
      recursiveProcessTextHtml(author.firstChild, writeTo);
      writeTo.push("</span>\n");
    }

    child = attribution.getElementsByTagName("TITLE")[0];
    if (child) {
      if (author) writeTo.push("<span class='chapter-text-TITLE'>");
      recursiveProcessTextHtml(child.firstChild, writeTo);
      writeTo.push("</span>\n");
    }

    child = attribution.getElementsByTagName("DATE")[0];
    if (child) {
      writeTo.push("<span class='chapter-text-DATE'>");
      recursiveProcessTextHtml(child.firstChild, writeTo);
      writeTo.push("</span>\n");
    }

    child = attribution.getElementsByTagName("INDEX")[0];
    if (child) {
      processTextHtml(child, writeTo);
    }
    writeTo.push("</div>\n");
  }
  writeTo.push("</blockquote>\n");
};

export default processEpigraphHtml;
