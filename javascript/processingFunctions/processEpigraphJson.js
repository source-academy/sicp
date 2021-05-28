import { recursiveProcessText, processText, addBodyToObj } from "../parseXmlJson";

export const processEpigraphJson = (node, obj) => {
  addBodyToObj(obj, node, false);
  const childArr = [];
  obj['child'] = childArr;

  let child = node.firstChild;
  let attribution = null;
  for (child; child; child = child.nextSibling) {
    if (child.nodeName == "ATTRIBUTION") {
      attribution = child;
      break;
    } else {
      const childObj = {};
      processText(child, childObj);
      if (childObj['tag']) {
        childArr.push(childObj);
      }
    }
  }

  if (attribution) {
    const author = attribution.getElementsByTagName("AUTHOR")[0];
    if (author) {
      const childObj = {};
      recursiveProcessText(author.firstChild, childObj);
      obj['author'] = childObj;
    }

    const title = attribution.getElementsByTagName("TITLE")[0];
    if (title) {
      const childObj = {};
      recursiveProcessText(title.firstChild, childObj);
      obj['title'] = childObj;
    }

    const date = attribution.getElementsByTagName("DATE")[0];
    if (date) {
      const childObj = {};
      recursiveProcessText(date.firstChild, childObj);
      obj['date'] = childObj;
    }

    const index = attribution.getElementsByTagName("INDEX")[0];
    if (index) {
      const childObj = {};
      processText(index, childObj);
      obj['index'] = {};
    }
  }
};

export default processEpigraphJson;
