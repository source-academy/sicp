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
  "EXPLANATION",
  "NOINDENT",
  "EXERCISE_STARTING_WITH_ITEMS",
  "EXERCISE_FOLLOWED_BY_TEXT"
]);

const ignoreTags = new Set([
  "CHAPTERCONTENT",
  "NOBR",
  "SPLIT",
  "SPLITINLINE",
  "JAVASCRIPT",
  "CITATION",
  "SECTIONCONTENT",
  "p",
  "WEB_ONLY"
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

const processText = (body, obj) => {
  obj["body"] = body;
  obj["tag"] = "#text";
};

const processTagWithChildren = (node, obj) => {
  obj["tag"] = node.nodeName;
  recursiveProcessTextJson(node.firstChild, obj);
};

const processLatex = (node, obj, inline) => {
  const writeTo = [];

  if (inline) {
    recursiveProcessPureText(node.firstChild, writeTo, {
      removeNewline: "all"
    });
  } else {
    recursiveProcessPureText(node.firstChild, writeTo);
  }

  let math = "";
  writeTo.forEach(x => (math += x));

  math = math.replace(/mbox/g, "text"); // replace mbox with text

  obj["body"] = math;
  obj["tag"] = "LATEX";
};

const processTextFunctions = {
  // Text tags: tag that is parsed as text
  "#text": (node, obj) => {
    // ignore the section/subsection tags at the end of chapter/section files
    if (!node.nodeValue.match(/&(\w|\.|\d)+;/)) {
      const body = node.nodeValue;
      if (body.trim()) {
        processText(body, obj);
      }
    }
  },

  AMP: (_node, obj) => {
    processText("&amp;", obj);
  },

  DOLLAR: (_node, obj) => {
    processText("$", obj);
  },

  SPACE: (node, obj) => {
    processText("\u00A0", obj);
    recursiveProcessTextJson(node.firstChild, obj);
  },

  // Tags with children and no body
  B: processTagWithChildren,

  EM: processTagWithChildren,

  LI: processTagWithChildren,

  TT: processTagWithChildren,

  TABLE: processTagWithChildren,

  TR: processTagWithChildren,

  TD: processTagWithChildren,

  REFERENCE: processTagWithChildren,

  OL: processTagWithChildren,

  UL: processTagWithChildren,

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

  EXERCISE: (node, obj) => {
    exercise_count += 1;
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
    obj["id"] = `#footnote-link-${footnote_count}`;
    obj["body"] = `${footnote_count}`;
    obj["href"] = `/sicpjs/${chapterIndex}#footnote-${footnote_count}`;
  },

  DISPLAYFOOTNOTE: (node, obj) => {
    display_footnote_count += 1;

    addBodyToObj(obj, node, false);
    obj["id"] = `#footnote-${display_footnote_count}`;
    obj["count"] = display_footnote_count;
    obj[
      "href"
    ] = `/sicpjs/${chapterIndex}#footnote-link-${display_footnote_count}`;

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

  LATEX: (node, obj) => processLatex(node, obj, false),

  LATEXINLINE: (node, obj) => processLatex(node, obj, true),

  LaTeX: (_node, obj) => {
    obj["tag"] = "LATEX";
    obj["body"] = "$\\LaTeX$";
  },

  TeX: (_node, obj) => {
    obj["tag"] = "LATEX";
    obj["body"] = "$\\TeX$";
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
      recursiveProcessPureText(
        node.firstChild.data
          ? node.firstChild.data.replace(/@/g, "")
          : node.firstChild,
        writeTo,
        {
          removeNewline: "all"
        }
      );
    } else {
      recursiveProcessPureText(
        node.firstChild.data
          ? node.firstChild.data.replace(/@/g, "")
          : node.firstChild,
        writeTo,
        {
          removeNewline: "all"
        }
      );
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
      processText(newTag[0], obj);
      return true;
    } else if (ignoreTags.has(name)) {
      recursiveProcessTextJson(node.firstChild, obj);
      return true;
    } else if (tagsToRemove.has(name)) {
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

  // handle subsubsection seperately
  if (node.nodeName === "SUBSUBSECTION") {
    subsubsection_count += 1;
    heading_count += 1;

    const name = getChildrenByTagName(node, "NAME")[0];

    const title = {
      id: `#sec${chapterIndex}.${subsubsection_count}`,
      tag: "TITLE",
      body:
        `${chapterIndex}.${subsubsection_count}\u00A0\u00A0\u00A0` +
        name.firstChild.nodeValue
    };

    obj.push(title);

    recursiveProcessTextJson(name.nextSibling, obj, title);
    return recursiveProcessTextJson(node.nextSibling, obj, true);
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

export const parseXmlJson = (doc, arr, filename) => {
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

  // Add section title
  const title = {
    id: `/sicpjs/${chapterIndex}`,
    tag: "TITLE",
    body: displayTitle.trim()
  };
  arr.push(title);

  const name = getChildrenByTagName(doc.documentElement, "NAME")[0];
  if (name) {
    recursiveProcessTextJson(name.nextSibling, arr, title);
  }
};
