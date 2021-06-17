import { getChildrenByTagName, ancestorHasTag } from "./utilityFunctions";
import { allFilepath, tableOfContent } from "./index.js";

import {
  replaceTagWithSymbol,
  processEpigraphJson,
  processFigureJson,
  processExerciseJson,
  processReferenceJson,
  processSnippetJson,
  recursiveProcessPureText,
  recursivelyProcessTextSnippetJson
} from "./processingFunctions";

let paragraph_count = 0;
let heading_count = 0;
let footnote_count = 0;
let snippet_count = 0;
let exercise_count = 0;
let subsubsection_count = 0;
let display_footnote_count = 0;
let chapArrIndex = 0;
let chapterTitle = "";
let displayTitle = "";
export let chapterIndex = "";

export const tagsToRemove = new Set([
  "#comment",
  "ATTRIBUTION",
  "AUTHOR",
  "COMMENT",
  "WEB_ONLY",
  "PDF_ONLY",
  "EDIT",
  "EXCLUDE",
  "HISTORY",
  "ORDER",
  "SCHEME",
  "SOLUTION", // SOLUTION tag handled by processSnippet
  "INDEX",
  "CAPTION",
  "NAME",
  "LABEL",
  "CODEINDEX",
  "EXPLANATION"
]);

const ignoreTags = new Set([
  "CHAPTERCONTENT",
  "NOBR",
  "SPLIT",
  "SPLITINLINE",
  "JAVASCRIPT",
  "CITATION",
  "SECTIONCONTENT",
  "p"
]);

export const addBodyToObj = (obj, node, body) => {
  obj["tag"] = node.nodeName;

  if (body) {
    obj["body"] = body;
  }
};

export const addArrayToObj = (obj, node, array) => {
  obj["tag"] = node.nodeName;

  let body = "";
  array.forEach(x => (body += x));
  obj["body"] = body;
};

const processContainer = (node, obj) => {
  addBodyToObj(obj, node, displayTitle);
  obj["tag"] = "SECTION";

  const name = getChildrenByTagName(node, "NAME")[0];
  recursiveProcessTextJson(name.nextSibling, obj);
};

const processTextFunctions = {
  "#text": (node, obj) => {
    // ignore the section/subsection tags at the end of chapter/section files
    if (!node.nodeValue.match(/&(\w|\.|\d)+;/)) {
      const body = node.nodeValue;
      if (body.trim()) {
        addBodyToObj(obj, node, body);
      }
    }
  },

  // Container tags: tag containing other elements and a heading
  SECTION: processContainer,

  CHAPTER: processContainer,

  MATTER: processContainer,

  REFERENCES: processContainer,

  SUBSECTION: processContainer,

  WEBPREFACE: processContainer,

  // e.g. section 4.4.4.4
  SUBSUBSECTION: (node, obj) => {
    subsubsection_count += 1;
    heading_count += 1;
    const name = getChildrenByTagName(node, "NAME")[0];

    obj["id"] = `#sec${chapterIndex}.${subsubsection_count}`;

    addBodyToObj(
      obj,
      node,
      `${chapterIndex}.${subsubsection_count}\u00A0\u00A0\u00A0` +
        name.firstChild.nodeValue
    );
    obj["tag"] = "SECTION";

    recursiveProcessTextJson(name.nextSibling, obj);
  },

  AMP: (node, obj) => {
    addBodyToObj(obj, node, "&amp;");
    obj["tag"] = "#text";
  },

  B: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  EM: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  LI: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  TT: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  TABLE: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  TR: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  TD: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  WEB_ONLY: (node, obj) => {
    recursiveProcessTextJson(node.firstChild, obj);
  },

  REFERENCE: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  br: (node, obj) => {
    addBodyToObj(obj, node, false);
    obj["tag"] = "BR";
  },

  BR: (node, obj) => processTextFunctions["br"](node, obj),

  EM_NO_INDEX: (node, obj) => {
    node.nodeName = "EM";
    processTextJson(node, obj);
  },

  EPIGRAPH: (node, obj) => {
    processEpigraphJson(node, obj);
  },

  BLOCKQUOTE: (node, obj) => {
    processEpigraphJson(node, obj);
  },

  NOINDENT: (_node, _obj) => {},

  EXERCISE_STARTING_WITH_ITEMS: (_node, _obj) => {},

  EXERCISE_FOLLOWED_BY_TEXT: (_node, _obj) => {},

  EXERCISE: (node, obj) => {
    exercise_count += 1;
    addBodyToObj(obj, node, false);
    processExerciseJson(node, obj, chapArrIndex, exercise_count);
  },

  FIGURE: (node, obj) => {
    addBodyToObj(obj, node, false);
    processFigureJson(node, obj);
  },

  FOOTNOTE: (node, obj) => {
    footnote_count += 1;
    // clone the current FOOTNOTE node and its children
    let cloneNode = node.cloneNode(true);
    cloneNode.nodeName = "DISPLAYFOOTNOTE";
    let parent = node.parentNode;
    // the last parentNode is <#document> the second last node is either <CHAPTER>/<(SUB)SECTION>
    while (parent.parentNode.parentNode) {
      parent = parent.parentNode;
    }
    // append the cloned node as the last elements inside <CHAPTER>/<SECTION> node
    parent.appendChild(cloneNode);

    obj["tag"] = "FOOTNOTE_REF";
    obj["id"] = `footnote-link-${footnote_count}`;
    obj["body"] = `${footnote_count}`;
    obj[
      "href"
    ] = `/interactive-sicp/${chapterIndex}#footnote-${footnote_count}`;
  },

  DISPLAYFOOTNOTE: (node, obj) => {
    display_footnote_count += 1;

    addBodyToObj(obj, node, false);
    obj["id"] = `#footnote-${display_footnote_count}`;
    obj["count"] = display_footnote_count;
    obj[
      "href"
    ] = `/interactive-sicp/${chapterIndex}#footnote-link-${display_footnote_count}`;

    recursiveProcessTextJson(node.firstChild, obj);
  },

  H2: (node, obj) => {
    node.nodeName = "h2";

    processTextJson(node, obj);
  },

  META: (node, obj) => {
    let s = node.firstChild.nodeValue;
    s = s.replace(/-/g, "-").replace(/ /g, "\\ ");
    addBodyToObj(obj, node, s);
  },

  METAPHRASE: (node, obj) => {
    const childObj = {};
    recursiveProcessTextJson(node.firstChild, childObj);
    let arr = [];
    arr.push("\u3008"); //langle
    arr = arr.concat(childObj["child"].map(x => x["body"]));
    arr.push("\u3009"); //rangle
    addArrayToObj(obj, node, arr);
    obj["tag"] = "#text";
  },

  LINK: (node, obj) => {
    const writeTo = [];
    recursiveProcessPureText(node.firstChild, writeTo);
    addArrayToObj(obj, node, writeTo);
    obj["href"] = node.getAttribute("address");
  },

  LATEX: (node, obj) => {
    const writeTo = [];
    recursiveProcessPureText(node.firstChild, writeTo);

    let math = "";
    writeTo.forEach(x => (math += x));

    math = math.replace(/mbox/g, "text"); // replace mbox with text

    addBodyToObj(obj, node, math);
  },

  LATEXINLINE: (node, obj) => {
    const writeTo = [];
    recursiveProcessPureText(node.firstChild, writeTo, {
      removeNewline: "all"
    });

    let math = "";
    writeTo.forEach(x => (math += x));

    math = math.replace(/mbox/g, "text"); // replace mbox with text

    addBodyToObj(obj, node, math);
  },

  LaTeX: (node, obj) => {
    addBodyToObj(obj, node, false);
  },

  TeX: (node, obj) => {
    addBodyToObj(obj, node, false);
  },

  NAME: (node, obj) => {
    recursiveProcessTextJson(node.firstChild, obj);
  },

  P: (node, obj) => {
    node.nodeName = "p";
    processTextJson(node, obj);
  },

  TEXT: (node, obj) => {
    paragraph_count += 1;

    addBodyToObj(obj, node, false);
    obj["id"] = "#p" + paragraph_count;
    recursiveProcessTextJson(node.firstChild, obj);
  },

  REF: (node, obj) => {
    processReferenceJson(node, obj, chapterIndex);
  },

  SCHEMEINLINE: (node, obj) =>
    processTextFunctions["JAVASCRIPTINLINE"](node, obj),

  JAVASCRIPTINLINE: (node, obj) => {
    const writeTo = [];
    if (ancestorHasTag(node, "NAME")) {
      recursiveProcessPureText(node.firstChild, writeTo, {
        removeNewline: "all"
      });
    } else {
      recursiveProcessPureText(node.firstChild, writeTo, {
        removeNewline: "all"
      });
    }
    addArrayToObj(obj, node, writeTo);
    obj["tag"] = "JAVASCRIPTINLINE";
  },

  SNIPPET: (node, obj) => {
    if (node.getAttribute("HIDE") == "yes") {
      return;
    } else if (node.getAttribute("LATEX") == "yes") {
      addBodyToObj(obj, node, false);
      obj["latex"] = true;
      obj["eval"] = false;

      const writeTo = [];

      const textprompt = getChildrenByTagName(node, "JAVASCRIPT_PROMPT")[0];
      if (textprompt) {
        recursivelyProcessTextSnippetJson(textprompt.firstChild, writeTo);
      }

      const textit = getChildrenByTagName(node, "JAVASCRIPT")[0];
      if (textit) {
        recursivelyProcessTextSnippetJson(textit.firstChild, writeTo);
      } else {
        recursivelyProcessTextSnippetJson(node.firstChild, writeTo);
      }

      const textoutput = getChildrenByTagName(node, "JAVASCRIPT_OUTPUT")[0];
      if (textoutput) {
        recursivelyProcessTextSnippetJson(textoutput.firstChild, writeTo);
      }

      obj["body"] = "";
      writeTo.forEach(x => (obj["body"] += x));

      return;
    }

    snippet_count += 1;
    addBodyToObj(obj, node, false);
    obj["latex"] = false;
    obj["id"] = snippet_count;
    processSnippetJson(node, obj);
  },

  SPACE: (node, obj) => {
    addBodyToObj(obj, node, "\u00A0");
    obj["tag"] = "#text";
    recursiveProcessTextJson(node.firstChild, obj);
  },

  OL: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  UL: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  SUBINDEX: (node, obj) => {
    // should occur only within INDEX
    // also should only exist after stuff in the main index
    addBodyToObj(obj, node, "!");
    const order = getChildrenByTagName(node, "ORDER")[0];
    if (order) {
      recursiveProcessTextJson(order.firstChild, obj);
      addBodyToObj(obj, node, "@");
    }
    recursiveProcessTextJson(node.firstChild, obj);
  },

  SUBHEADING: (node, obj) => {
    heading_count += 1;
    addBodyToObj(obj, node, false);
    obj["id"] = `#h${heading_count}`;
    recursiveProcessTextJson(node.firstChild, obj);
  },

  SUBSUBHEADING: (node, obj) => {
    heading_count += 1;
    addBodyToObj(obj, node, false);
    obj["id"] = `#h${heading_count}`;
    recursiveProcessTextJson(node.firstChild, obj);
  },

  QUOTE: (node, obj) => {
    processTextJson(node.firstChild, obj);
    obj["body"] = '"' + obj["body"] + '"';
  }
};

export const processTextJson = (node, obj) => {
  const name = node.nodeName;
  if (processTextFunctions[name]) {
    processTextFunctions[name](node, obj);
    return true;
  } else {
    const newTag = [];
    if (replaceTagWithSymbol(node, newTag)) {
      addBodyToObj(obj, node, newTag[0]);
      obj["tag"] = "#text";
      return true;
    } else if (tagsToRemove.has(name)) {
      return true;
    } else if (ignoreTags.has(name)) {
      recursiveProcessTextJson(node.firstChild, obj);
      return true;
    }
  }
  console.log("WARNING Unrecognised Tag:\n" + node.toString() + "\n");
  return false;
};

export const recursiveProcessTextJson = (node, obj, prevSibling = false) => {
  if (!node) return;

  // no prevSibling if we are processing the child node
  if (!prevSibling) {
    const child = [];
    obj["child"] = child;
    obj = child;
  }

  let next = {};
  processTextJson(node, next);

  // remove child array if empty
  if (next["child"] && next["child"].length === 0) {
    next["child"] = undefined;
  }

  // Join nested child if no tag
  if (!next["tag"] && next["child"]) {
    const child = next["child"];

    // handle first element of child
    if (child[0]["tag"] === "#text" && prevSibling["tag"] === "#text") {
      prevSibling["body"] += child[0]["body"];
    } else {
      obj.push(child[0]);
      prevSibling = child[0];
    }

    for (let i = 1; i < next["child"].length; i++) {
      obj.push(child[i]);
      prevSibling = child[i];
    }
  } else if (next["tag"] === "#text" && prevSibling["tag"] === "#text") {
    // Join 2 adjacent objects if they are both text
    prevSibling["body"] += next["body"];
  } else if (next["tag"] || next["child"]) {
    obj.push(next);

    prevSibling = next;
  } else if (!prevSibling) {
    // no previous sibling
    prevSibling = next;
  }

  return recursiveProcessTextJson(node.nextSibling, obj, prevSibling);
};

export const parseXmlJson = (doc, obj, filename) => {
  chapterIndex = tableOfContent[filename].index;
  chapterTitle = tableOfContent[filename].title;

  if (chapterIndex.match(/[a-z]+/)) {
    displayTitle = chapterTitle;
  } else {
    displayTitle = chapterIndex + "\u00A0\u00A0" + chapterTitle;
  }

  paragraph_count = 0;
  footnote_count = 0;
  display_footnote_count = 0;
  heading_count = 0;
  subsubsection_count = 0;
  snippet_count = 0;
  exercise_count = 0;
  chapArrIndex = allFilepath.indexOf(filename);
  console.log(`${chapArrIndex} parsing chapter ${chapterIndex}`);

  recursiveProcessTextJson(doc.documentElement, obj, true);
};
