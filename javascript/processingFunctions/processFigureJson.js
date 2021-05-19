import {
  recursiveProcessText,
  processText
} from "../parseXmlJson";
import { referenceStore } from "./processReferenceHtml";

export const processFigureJson = (node, obj) => {
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

  const images = [];
  obj['images'] = images;

  if (src && !label) {
    const image = {};
    image["class"] = scale_factor;
    image["src"] = src;
    images.push(image);
    return;
  } else if (!src) {
    const images = node.getElementsByTagName("IMAGE");
    for (let i = 0; i < images.length; i++) {
      const image = {};
      image["class"] = scale_factor;
      image["src"] = images[i].getAttribute("src");
      images.push(image);
    }
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

  if (src && label) {
    const image = {};
    image["class"] = scale_factor;
    image["src"] = src;
    images.push(image);
  }

  const snippet = node.getElementsByTagName("SNIPPET")[0];
  if (snippet) {
    processText(snippet, obj);
  }

  const table = node.getElementsByTagName("TABLE")[0];
  if (table) {
    processText(table, obj);
  }

  const caption = node.getElementsByTagName("CAPTION")[0];
  if (caption) {
    if (!images[0]) {
      images.push({});
    }

    const captionBody = {};
    recursiveProcessText(caption.firstChild, captionBody);

    images[0]["captionHref"] = href;
    images[0]["captionName"] = "Figure " + displayName + " " + captionBody['child'][0]['body'];
  }
};

export default processFigureJson;
