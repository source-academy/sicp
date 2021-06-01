import { getChildrenByTagName, ancestorHasTag } from "./utilityFunctions";
import { allFilepath, tableOfContent } from "./index.js";

import {
  replaceTagWithSymbol,
  processBlockquoteHtml,
  processEpigraphJson,
  processFigureJson,
  processExerciseJson,
  processReferenceJson,
  processSnippetJson,
  recursiveProcessPureText
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
export let toIndexFolder = "../";

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

const processTextFunctions = {
  AMP: (node, obj) => {
    addBodyToObj(obj, node, "&amp;");
    obj["tag"] = "#text";
  },
  B: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },
  EM: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },
  LI: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },
  TT: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },
  TABLE: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },
  TR: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },
  TD: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },
  WEB_ONLY: (node, obj) => {
    recursiveProcessText(node.firstChild, obj);
  },
  "#text": (node, obj) => {
    // ignore the section/subsection tags at the end of chapter/section files
    if (!node.nodeValue.match(/&(\w|\.|\d)+;/)) {
      const body = node.nodeValue;
      if (body.trim()) {
        addBodyToObj(obj, node, body);
      }
    }
  },

  ABOUT: (node, obj) => {
    addBodyToObj(obj, node, displayTitle);

    let childNode = node.firstChild;
    while (childNode.nodeName != "NAME") {
      childNode = childNode.nextSibling;
    }

    recursiveProcessText(childNode.nextSibling, obj);
  },
  REFERENCES: (node, obj) => processTextFunctions["ABOUT"](node, obj),
  REFERENCE: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },
  WEBPREFACE: (node, obj) => processTextFunctions["ABOUT"](node, obj),
  MATTER: (node, obj) => processTextFunctions["ABOUT"](node, obj),

  br: (node, obj) => {
    addBodyToObj(obj, node, false);
    obj["tag"] = "BR";
  },

  BR: (node, obj) => processTextFunctions["br"](node, obj),

  CHAPTER: (node, obj) => {
    addBodyToObj(obj, node, displayTitle);

    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, obj);
  },

  EM_NO_INDEX: (node, obj) => {
    node.nodeName = "EM";
    processText(node, obj);
  },

  EPIGRAPH: (node, obj) => {
    processEpigraphJson(node, obj);
  },

  BLOCKQUOTE: (node, obj) => {
    const writeTo = [];
    processBlockquoteHtml(node, writeTo);
    addArrayToObj(obj, node, writeTo);
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
    recursiveProcessText(node.firstChild, obj);
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

    recursiveProcessText(node.firstChild, obj);
  },

  H2: (node, obj) => {
    node.nodeName = "h2";

    processText(node, obj);
  },

  META: (node, obj) => {
    let s = node.firstChild.nodeValue;
    s = s.replace(/-/g, "$-$").replace(/ /g, "\\ ");
    addBodyToObj(obj, node, "$" + s + "$");
  },

  METAPHRASE: (node, obj) => {
    const childObj = {};
    recursiveProcessText(node.firstChild, childObj);
    const arr = childObj["child"].map(x => x["body"]);
    addArrayToObj(obj, node, arr);
  },

  LINK: (node, obj) => {
    addBodyToObj(obj, node, node.getAttribute("address"));

    recursiveProcessText(node.firstChild, obj);
  },

  LATEX: (node, obj) => processTextFunctions["LATEXINLINE"](node, obj),
  LATEXINLINE: (node, obj) => {
    const writeTo = [];
    recursiveProcessPureText(node.firstChild, writeTo, {
      removeNewline: "all"
    });

    let math = "";
    writeTo.forEach(x => (math += x));

    addBodyToObj(obj, node, math);
  },

  LaTeX: (node, obj) => {
    addBodyToObj(obj, node, false);
  },

  TeX: (node, obj) => {
    addBodyToObj(obj, node, false);
  },

  NAME: (node, obj) => {
    recursiveProcessText(node.firstChild, obj);
  },

  P: (node, obj) => {
    node.nodeName = "p";
    processText(node, obj);
  },

  TEXT: (node, obj) => {
    paragraph_count += 1;

    addBodyToObj(obj, node, false);
    obj["id"] = "#p" + paragraph_count;
    recursiveProcessText(node.firstChild, obj);
  },

  REF: (node, obj) => {
    processReferenceJson(node, obj, chapterIndex);
  },

  SCHEMEINLINE: (node, obj) =>
    processTextFunctions["JAVASCRIPTINLINE"](node, obj),

  SECTION: (node, obj) => {
    addBodyToObj(obj, node, displayTitle);

    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, obj);
  },

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

      const textprompt = getChildrenByTagName(node, "JAVASCRIPT_PROMPT")[0];
      if (textprompt) {
        recursiveProcessText(textprompt.firstChild, obj);
      }

      const textit = getChildrenByTagName(node, "JAVASCRIPT")[0];
      if (textit) {
        recursiveProcessText(textit.firstChild, obj);
      } else {
        recursiveProcessText(node.firstChild, obj);
      }

      const textoutput = getChildrenByTagName(node, "JAVASCRIPT_OUTPUT")[0];
      if (textoutput) {
        recursiveProcessText(textoutput.firstChild, obj);
      }
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
    recursiveProcessText(node.firstChild, obj);
  },

  OL: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },

  UL: (node, obj) => {
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },

  SUBINDEX: (node, obj) => {
    // should occur only within INDEX
    // also should only exist after stuff in the main index
    addBodyToObj(obj, node, "!");
    const order = getChildrenByTagName(node, "ORDER")[0];
    if (order) {
      recursiveProcessText(order.firstChild, obj);
      addBodyToObj(obj, node, "@");
    }
    recursiveProcessText(node.firstChild, obj);
  },

  SUBSECTION: (node, obj) => {
    addBodyToObj(obj, node, displayTitle);

    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, obj);
  },

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

    recursiveProcessText(name.nextSibling, obj);
  },

  SUBHEADING: (node, obj) => {
    heading_count += 1;
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },

  SUBSUBHEADING: (node, obj) => {
    heading_count += 1;
    addBodyToObj(obj, node, false);
    recursiveProcessText(node.firstChild, obj);
  },

  QUOTE: (node, obj) => {
    processText(node.firstChild, obj);
    obj["body"] = '"' + obj["body"] + '"';
  }
};

export const processText = (node, obj) => {
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
      recursiveProcessText(node.firstChild, obj);
      return true;
    }
  }
  console.log("WARNING Unrecognised Tag:\n" + node.toString() + "\n");
  return false;
};

export const recursiveProcessText = (node, obj, prevSibling = false) => {
  if (!node) return;

  if (!prevSibling) {
    const child = [];
    obj["child"] = child;
    obj = child;
  }

  const next = {};
  processText(node, next);

  if (next["tag"] === "#text" && prevSibling["tag"] === "#text") {
    prevSibling["body"] += next["body"];

    return recursiveProcessText(node.nextSibling, obj, prevSibling);
  } else if (next["tag"] || next["child"]) {
    obj.push(next);
  }

  return recursiveProcessText(node.nextSibling, obj, next);
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

  recursiveProcessText(doc.documentElement, obj, true);
};
