export const getChildrenByTagName = (node, tagName) => {
  let child = node.firstChild;
  const childrenWithTag = [];
  while (child) {
    if (child.nodeName === tagName) {
      childrenWithTag.push(child);
    }
    child = child.nextSibling;
  }
  return childrenWithTag;
};

export const ancestorHasTag = (node, tagName) => {
  let parent = node.parentNode;
  while (parent) {
    if (parent.nodeName === tagName) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
};