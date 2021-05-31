import {
  recursiveProcessTextHtml,
  processTextHtml,
  toIndexFolder
} from "../parseXmlHtml";
import { referenceStore } from "./processReferenceHtml";

export const processFigureHtml = (node, writeTo) => {
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  }

  let scale_factor = "scale_factor_0";
  if (
    !node.getAttribute("scale_factor") &&
    node.getElementsByTagName("FIGURE")[0]
  ) {
    scale_factor =
      "scale_factor_" +
      node.getElementsByTagName("FIGURE")[0].getAttribute("scale_factor");
  } else {
    scale_factor = "scale_factor_" + node.getAttribute("scale_factor");
  }

  const label = node.getElementsByTagName("LABEL")[0];

  if (src && !label) {
    writeTo.push(`
        <img class="${scale_factor}" src="${toIndexFolder}${src}">
      `);
    return;
  } else if (!src) {
    // console.log(node.toString());
    writeTo.push(`<FIGURE>`);
    const images = node.getElementsByTagName("IMAGE");
    for (let i = 0; i < images.length; i++) {
      writeTo.push(`
      <img class="${scale_factor}" src="${toIndexFolder}${images[
        i
      ].getAttribute("src")}">
      `);
    }
  }

  // get href and displayed name from "referenceStore"
  const referenceName = label.getAttribute("NAME");
  console.log("reference name is " + referenceName);
  const href = referenceStore[referenceName]
    ? referenceStore[referenceName].href
    : "";
  // console.log("lookup successful");
  const displayName = referenceStore[referenceName]
    ? referenceStore[referenceName].displayName
    : "";

  if (src && label) {
    writeTo.push(`
    <FIGURE>
      <img class="${scale_factor}" id="fig_${displayName}" src="${toIndexFolder}${src}">`);
  }

  const snippet = node.getElementsByTagName("SNIPPET")[0];
  if (snippet) {
    processTextHtml(snippet, writeTo);
  }

  const table = node.getElementsByTagName("TABLE")[0];
  if (table) {
    processTextHtml(table, writeTo);
  }

  const caption = node.getElementsByTagName("CAPTION")[0];
  if (caption) {
    writeTo.push(`
      <div class="chapter-text-CAPTION">
      <b><a class="caption" href="./${href}">Figure ${displayName} </a></b>`);
    recursiveProcessTextHtml(caption.firstChild, writeTo);
    writeTo.push("</div>");
  }

  writeTo.push(`
    </FIGURE>
  `);
};

export default processFigureHtml;
