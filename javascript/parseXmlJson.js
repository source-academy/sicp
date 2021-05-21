import { getChildrenByTagName, ancestorHasTag } from "./utilityFunctions";
import { allFilepath, tableOfContent } from "./index.js";

import {
  replaceTagWithSymbol,
  processBlockquoteHtml,
  processEpigraphHtml,
  processFigureJson,
  processExerciseJson,
  processReferenceHtml,
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

const tagsToRemoveDefault = new Set([
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
  "SCHEMEINLINE",
  "SOLUTION",
  "INDEX",
  "CAPTION",
  "NAME",
  "LABEL",
  "CODEINDEX",
  "EXPLANATION"
]);
// SOLUTION tag handled by processSnippet

const ignoreTagsDefault = new Set([
  "CHAPTERCONTENT",
  "NOBR",
  "SPLIT",
  "SPLITINLINE"
]);

const preserveTagsDefault = new Set([
  "B",
  "EM",
  "QUOTE",
  "SC",
  "UL",
  "LI",
  "SECTIONCONTENT",
  "CITATION",
  "TT",
  "TABLE",
  "TR",
  "TD",
  "p",
  "REFERENCE"
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

const processTextFunctionsDefaultHtml = {
  WEB_ONLY: (node, obj) => {
    recursiveProcessText(node.firstChild, obj);
  },

  "#text": (node, obj) => {
    // ignore the section/subsection tags at the end of chapter/section files
    if (!node.nodeValue.match(/&(\w|\.|\d)+;/)) {
      let body = node.nodeValue.replace(/\r?\n|\r/g, " ").replace(/  +/g, ' ');
      if (body.trim()) {
        addBodyToObj(obj, node, body);
      }
    }
  },

  ABOUT: (node, obj) => {
    addBodyToObj(obj, node, displayTitle);

    if (node.getAttribute("WIP") === "yes") {
      addBodyToObj(
        obj,
        node,
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }

    let childNode = node.firstChild;
    while (childNode.nodeName != "NAME") {
      childNode = childNode.nextSibling;
    }

    recursiveProcessText(childNode.nextSibling, obj);
  },
  REFERENCES: (node, obj) =>
    processTextFunctionsHtml["ABOUT"](node, obj),
  WEBPREFACE: (node, obj) =>
    processTextFunctionsHtml["ABOUT"](node, obj),
  MATTER: (node, obj) => processTextFunctionsHtml["ABOUT"](node, obj),

  APOS: (node, obj) => {
    addBodyToObj(obj, node, "'");
  },

  br: (node, obj) => {
    addBodyToObj(obj, node, "<br>");
  },

  BR: (node, obj) => processTextFunctionsHtml["br"](node, obj),

  CHAPTER: (node, obj) => {
    addBodyToObj(obj, node, displayTitle);

    if (node.getAttribute("WIP") === "yes") {
      addBodyToObj(
        obj,
        node,
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, obj);
  },

  EM_NO_INDEX: (node, obj) => {
    node.nodeName = "EM";
    processText(node, obj);
  },

  EPIGRAPH: (node, obj) => {
    const writeTo = [];
    processEpigraphHtml(node, writeTo);
    addArrayToObj(obj, node, writeTo);
  },

  BLOCKQUOTE: (node, obj) => {
    const writeTo = [];
    processBlockquoteHtml(node, writeTo);
    addArrayToObj(obj, node, writeTo);
  },

  NOINDENT: (node, obj) => {},

  EXERCISE_STARTING_WITH_ITEMS: (node, obj) => {},

  EXERCISE_FOLLOWED_BY_TEXT: (node, obj) => {},

  EXERCISE: (node, obj) => {
    exercise_count += 1;
    const writeTo = [];
    processExerciseJson(node, writeTo, chapArrIndex, exercise_count);
    addArrayToObj(obj, node, writeTo);
  },

  FIGURE: (node, obj) => {
    recursiveProcessText(node.firstChild, obj);
    addBodyToObj(obj,node,false);
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
  },

  DISPLAYFOOTNOTE: (node, obj) => {
    display_footnote_count += 1;

    if (display_footnote_count == 1) {
      addBodyToObj(obj, node, false);
    }
    
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
    addBodyToObj(obj, node, "$\\langle{}$<EM>");
    recursiveProcessText(node.firstChild, obj);
    addBodyToObj(obj, node, "</EM>$\\rangle$");
  },

  IMAGE: (node, obj) => {
    addBodyToObj(
      obj,
      node,
      `<IMAGE src="${toIndexFolder}${node.getAttribute("src")}"/>`
    );
  },

  LINK: (node, obj) => {
    addBodyToObj(
      obj,
      node,
      "<a address='" +
        node.getAttribute("address") +
        "' href='" +
        node.getAttribute("address") +
        "'>"
    );
    recursiveProcessText(node.firstChild, obj);
    addBodyToObj(obj, node, "</a>");
  },

  LATEX: (node, obj) =>
    processTextFunctionsHtml["LATEXINLINE"](node, obj),
  LATEXINLINE: (node, obj) => {
    const writeTo = [];
    recursiveProcessPureText(node.firstChild, writeTo);
    let math = "";
    writeTo.forEach(x => math += x);
    math = math.trim();
    math = math.replace(/\$/g, "");
    math = math.replace(/^\\\[/, "");
    math = math.replace(/\\\]$/, "");
    addBodyToObj(jsonObj, node, math);
  },

  LaTeX: (node, obj) => {
    addBodyToObj(
      obj,
      node,
      `<span class="texhtml" style="font-family: 'CMU Serif', cmr10, LMRoman10-Regular, 'Latin Modern Math', 'Nimbus Roman No9 L', 'Times New Roman', Times, serif;">L<span style="text-transform: uppercase; font-size: 0.75em; vertical-align: 0.25em; margin-left: -0.36em; margin-right: -0.15em; line-height: 1ex;">a</span>T<span style="text-transform: uppercase; vertical-align: -0.5ex; margin-left: -0.1667em; margin-right: -0.125em; line-height: 1ex;">e</span>X</span>`
    );
  },

  TeX: (node, obj) => {
    addBodyToObj(
      obj,
      node,
      `<span class="texhtml" style="font-family: 'CMU Serif', cmr10, LMRoman10-Regular, 'Latin Modern Math', 'Nimbus Roman No9 L', 'Times New Roman', Times, serif;">T<span style="text-transform: uppercase; vertical-align: -0.5ex; margin-left: -0.1667em; margin-right: -0.125em; line-height: 1ex;">e</span>X</span>`
    );
  },

  MATTERSECTION: (node, obj) => {
    heading_count += 1;
    addBodyToObj(
      obj,
      node,
      `
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h1>
    `
    );
    recursiveProcessText(node.firstChild, obj);
    addBodyToObj(obj, node, "</h1></div>");
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
    recursiveProcessText(node.firstChild, obj);
  },

  REF: (node, obj) => {
    const writeTo = [];
    processReferenceHtml(node, writeTo, chapterIndex);
    addArrayToObj(obj, node, writeTo);
  },

  SECTION: (node, obj) => {
    addBodyToObj(obj, node, displayTitle);

    if (node.getAttribute("WIP") === "yes") {
      addBodyToObj(
        obj,
        node,
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, obj);
  },

  // SCHEMEINLINE: (node, obj) =>
  //   processTextFunctionsHtml["JAVASCRIPTINLINE"](node, obj),

  JAVASCRIPTINLINE: (node, obj) => {
    const writeTo = [];
    if (ancestorHasTag(node, "NAME")) {
      recursiveProcessPureText(node.firstChild, writeTo, {
        removeNewline: "all"
      });
    } else {
      // addBodyToObj(obj, node, "<kbd>");
      recursiveProcessPureText(node.firstChild, writeTo, {
        removeNewline: "all"
      });
      // addBodyToObj(obj, node, "</kbd>");
    }
    addArrayToObj(obj, node, writeTo);
  },

  SNIPPET: (node, obj) => {
    if (node.getAttribute("HIDE") == "yes") {
      return;
    } else if (node.getAttribute("LATEX") == "yes") {
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
    // const snippet = { tag: node.nodeName };
    // obj.push(snippet);
    processSnippetJson(node, obj);
  },

  SPACE: (node, obj) => {
    addBodyToObj(obj, node, "\u00A0");
    recursiveProcessText(node.firstChild, obj);
  },

  OL: (node, obj) => {
    addBodyToObj(obj, node, `<OL type="`);
    addBodyToObj(
      obj,
      node,
      ancestorHasTag(node, "EXERCISE") ? `a">` : `1">`
    );
    recursiveProcessText(node.firstChild, obj);
    addBodyToObj(obj, node, "</OL>");
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

    if (node.getAttribute("WIP") === "yes") {
      addBodyToObj(
        obj,
        node,
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, obj);
  },

  // e.g. section 4.4.4.4
  SUBSUBSECTION: (node, obj) => {
    subsubsection_count += 1;
    heading_count += 1;
    const name = getChildrenByTagName(node, "NAME")[0];
    addBodyToObj(
      obj,
      node,
      `
      <div class='permalink'>
        <a name='sec${chapterIndex}.${subsubsection_count}' class='permalink'></a><h1>
    `
    );
    if (chapterIndex !== "prefaces") {
      addBodyToObj(
        obj,
        node,
        `${chapterIndex}.${subsubsection_count}\u00A0\u00A0\u00A0`
      );
    }
    recursiveProcessText(name.firstChild, obj);
    addBodyToObj(obj, node, "</h1></div>");
    recursiveProcessText(name.nextSibling, obj);
  },

  SUBHEADING: (node, obj) => {
    heading_count += 1;
    addBodyToObj(
      obj,
      node,
      `
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h2>
    `
    );
    recursiveProcessText(node.firstChild, obj);
    addBodyToObj(obj, node, "</h2></div>");
  },

  SUBSUBHEADING: (node, obj) => {
    heading_count += 1;
    addBodyToObj(
      obj,
      node,
      `
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h3>
    `
    );
    recursiveProcessText(node.firstChild, obj);
    addBodyToObj(obj, node, "</h3></div>");
  }
};

let processTextFunctionsHtml = processTextFunctionsDefaultHtml;
export let tagsToRemove = tagsToRemoveDefault;
let ignoreTags = ignoreTagsDefault;
let preserveTags = preserveTagsDefault;

export const processText = (node, obj) => {
  const name = node.nodeName;
  if (processTextFunctionsHtml[name]) {
    processTextFunctionsHtml[name](node, obj);
    return true;
  } else {
    const newTag = [];
    if (replaceTagWithSymbol(node, newTag)) {
      obj.nodeName = newTag[0];
      addBodyToObj(obj, node, false);
      return true;
    } else if (tagsToRemove.has(name)) {
      return true;
    } else if (ignoreTags.has(name)) {
      recursiveProcessText(node.firstChild, obj);
      return true;
    } else if (preserveTags.has(name)) {
      recursiveProcessText(node.firstChild, obj);
      return true;
    }
  }
  console.log("WARNING Unrecognised Tag:\n" + node.toString() + "\n");
  return false;
};

export const recursiveProcessText = (node, obj, sibling=false) => {
  if (!node) return;

  if (!sibling) {
    const child = [];
    obj["child"] = child;
    obj = child;
  }

  const next = {};
  processText(node, next);

  if (next['tag'] || next['child']) {
    obj.push(next);
  }

  return recursiveProcessText(node.nextSibling, obj, true);
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
