import { recursiveProcessTextJson, processTextJson } from "../parseXmlJson";
import { recursiveProcessTextHtml } from "../parseXmlHtml";

export const processEpigraphJson = (node, obj) => {
  obj["tag"] = "EPIGRAPH";
  const childArr = [];
  obj["child"] = childArr;

  let child = node.firstChild;
  let attribution = null;
  for (child; child; child = child.nextSibling) {
    if (child.nodeName == "ATTRIBUTION") {
      attribution = child;
      break;
    } else {
      const childObj = {};
      processTextJson(child, childObj);
      childArr.push(childObj);
    }
  }

  if (attribution) {
    const author = attribution.getElementsByTagName("AUTHOR")[0];
    const title = attribution.getElementsByTagName("TITLE")[0];
    const date = attribution.getElementsByTagName("DATE")[0];

    if (author) {
      const childObj = {};
      recursiveProcessTextJson(author.firstChild, childObj);
      obj["author"] = " " + childObj["child"][0]["body"] + (title ? ", " : "");
    }

    if (title) {
      const childObj = {};
      recursiveProcessTextJson(title.firstChild, childObj);
      if (childObj["child"][0]["body"]) {
        obj["title"] = childObj["child"][0]["body"];
      } else {
        obj["title"] = childObj["child"][0]["child"][0]["body"];
      }
    }

    if (date) {
      const childObj = {};
      recursiveProcessTextJson(date.firstChild, childObj);
      obj["date"] = " (" + childObj["child"][0]["body"] + ")";
    }
  }
};

export default processEpigraphJson;
