import { recursiveProcessTextJson, processTextJson } from "../parseXmlJson";
import { referenceStore } from "./processReferenceJson";

export const processFigureJson = (node, obj) => {
  // FIGURE can have FIGURE inside; src of image can be
  // in either the outer or the inner FIGURE
  // (inner FIGURE should be called IMAGE, but isn't)

  // get src of image; if src is null, there is no image
  let src = node.getAttribute("src");
  if (!src && node.getElementsByTagName("FIGURE")[0]) {
    src = node.getElementsByTagName("FIGURE")[0].getAttribute("src");
  }
  // get scale_factor, default: 100%
  let scale_fraction = 1;

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

  // get href and displayed name from "referenceStore"
  const referenceName = label.getAttribute("NAME");
  const href = referenceStore[referenceName]
    ? referenceStore[referenceName].href
    : "";
  const displayName = referenceStore[referenceName]
    ? referenceStore[referenceName].displayName
    : "";

  if (src) {
    const scale_fraction_number = parseFloat(scale_fraction);
    const scale_percentage = scale_fraction_number * 100;

    if (scale_fraction !== 1) {
      obj["scale"] = `${scale_percentage}%`;
    }
    obj["src"] = `${src}`;
    obj["id"] = `#fig_${displayName}`;
  }

  const snippet = node.getElementsByTagName("SNIPPET")[0];
  if (snippet) {
    const snippetObj = {};
    obj["snippet"] = snippetObj;
    processTextJson(snippet, snippetObj);
  }

  const table = node.getElementsByTagName("TABLE")[0];
  if (table) {
    const tableObj = {};
    obj["table"] = tableObj;
    processTextJson(table, tableObj);
  }

  const caption = node.getElementsByTagName("CAPTION")[0];
  if (caption) {
    const captionBody = {};
    recursiveProcessTextJson(caption.firstChild, captionBody);

    obj["captionHref"] = href;
    obj["captionName"] = "Figure " + displayName + " ";
    obj["captionBody"] = captionBody["child"];
  }
};

export default processFigureJson;
