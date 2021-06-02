import {
  recursiveProcessTextHtml,
  processTextHtml,
  toIndexFolder
} from "../parseXmlHtml";
import { referenceStore } from "./processReferenceHtml";

export const processFigureHtml = (node, writeTo) => {
  // console.log("processing FIGURE");
  // console.log(node);

  // FIGURE can have FIGURE inside; src of image can be
  // in either the outer or the inner FIGURE
  // (inner FIGURE should be called IMAGE, but isn't)

  // get src of image; if src is null, there is no image
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  }

  // get scale_factor, default: 100%
  let scale_fraction = null;
  if (node.getAttribute("scale")) {
    scale_fraction = node.getAttribute("scale");
  } else if (
    node.getElementsByTagName("FIGURE") &&
    node.getElementsByTagName("FIGURE")[0] &&
    node.getElementsByTagName("FIGURE")[0].getAttribute("scale")
  ) {
    scale_fraction = node
      .getElementsByTagName("FIGURE")[0]
      .getAttribute("scale");
  }
  if (node.getAttribute("web_scale")) {
    scale_fraction = node.getAttribute("web_scale");
  } else if (
    node.getElementsByTagName("FIGURE") &&
    node.getElementsByTagName("FIGURE")[0] &&
    node.getElementsByTagName("FIGURE")[0].getAttribute("web_scale")
  ) {
    scale_fraction = node
      .getElementsByTagName("FIGURE")[0]
      .getAttribute("web_scale");
  }

  // every outer FIGURE must have a LABEL
  const label = node.getElementsByTagName("LABEL")[0];

  // handle case where figure does not have label (figure in original sicp)
  if (src && !label) {
    writeTo.push(`
      <img src="${toIndexFolder}${src}">`);
    return;
  }

  // get href and displayed name from "referenceStore"
  const referenceName = label.getAttribute("NAME");
  // console.log("reference name is " + referenceName);
  const href = referenceStore[referenceName]
    ? referenceStore[referenceName].href
    : "";
  // console.log("lookup successful");
  const displayName = referenceStore[referenceName]
    ? referenceStore[referenceName].displayName
    : "";

  writeTo.push(`<FIGURE>`);

  if (src) {
    if (scale_fraction) {
      const scale_fraction_number = parseFloat(scale_fraction);
      const scale_percentage = scale_fraction_number * 100;
      writeTo.push(`
      <img style="width: ${scale_percentage}%" id="fig_${displayName}" src="${toIndexFolder}${src}">`);
    } else {
      writeTo.push(`
      <img id="fig_${displayName}" src="${toIndexFolder}${src}">`);
    }
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

  writeTo.push(`</FIGURE>`);
};

export default processFigureHtml;
