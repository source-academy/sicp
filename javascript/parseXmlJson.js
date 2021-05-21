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

export const addBodyToObj = (jsonObj, node, body) => {
  const child = {};

  child["tag"] = node.nodeName;

  if (body) {
    child["body"] = body;
  }

  jsonObj.push(child);
};

export const addArrayToObj = (jsonObj, node, array) => {
  const child = {};

  child["tag"] = node.nodeName;

  let body = "";
  array.forEach(x => (body += x));
  child["body"] = body;

  jsonObj.push(child);
};

const processTextFunctionsDefaultHtml = {
  WEB_ONLY: (node, jsonObj) => {
    recursiveProcessText(node.firstChild, jsonObj);
  },

  "#text": (node, jsonObj) => {
    // ignore the section/subsection tags at the end of chapter/section files
    if (!node.nodeValue.match(/&(\w|\.|\d)+;/)) {
      addBodyToObj(jsonObj, node, node.nodeValue);
    }
  },

  ABOUT: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, displayTitle);

    if (node.getAttribute("WIP") === "yes") {
      addBodyToObj(
        jsonObj,
        node,
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }

    let childNode = node.firstChild;
    while (childNode.nodeName != "NAME") {
      childNode = childNode.nextSibling;
    }

    recursiveProcessText(childNode.nextSibling, jsonObj);
  },
  REFERENCES: (node, jsonObj) =>
    processTextFunctionsHtml["ABOUT"](node, jsonObj),
  WEBPREFACE: (node, jsonObj) =>
    processTextFunctionsHtml["ABOUT"](node, jsonObj),
  MATTER: (node, jsonObj) => processTextFunctionsHtml["ABOUT"](node, jsonObj),

  APOS: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, "'");
  },

  br: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, "<br>");
  },

  BR: (node, jsonObj) => processTextFunctionsHtml["br"](node, jsonObj),

  CHAPTER: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, displayTitle);

    if (node.getAttribute("WIP") === "yes") {
      addBodyToObj(
        jsonObj,
        node,
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, jsonObj);
  },

  EM_NO_INDEX: (node, jsonObj) => {
    node.nodeName = "EM";
    processText(node, jsonObj);
  },

  EPIGRAPH: (node, jsonObj) => {
    const writeTo = [];
    processEpigraphHtml(node, writeTo);
    addArrayToObj(jsonObj, node, writeTo);
  },

  BLOCKQUOTE: (node, jsonObj) => {
    const writeTo = [];
    processBlockquoteHtml(node, writeTo);
    addArrayToObj(jsonObj, node, writeTo);
  },

  NOINDENT: (node, jsonObj) => {},

  EXERCISE_STARTING_WITH_ITEMS: (node, jsonObj) => {},

  EXERCISE_FOLLOWED_BY_TEXT: (node, jsonObj) => {},

  EXERCISE: (node, jsonObj) => {
    exercise_count += 1;
    processExerciseJson(node, jsonObj, chapArrIndex, exercise_count);
  },

  FIGURE: (node, jsonObj) => {
    const writeTo = [];
    recursiveProcessText(node.firstChild, jsonObj);
    processFigureJson(node, writeTo, chapArrIndex, snippet_count, false);
    addArrayToObj(jsonObj, node, writeTo);
  },

  FOOTNOTE: (node, jsonObj) => {
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

  DISPLAYFOOTNOTE: (node, jsonObj) => {
    display_footnote_count += 1;

    if (display_footnote_count == 1) {
      addBodyToObj(jsonObj, node, "<hr>\n");
    }

    recursiveProcessText(node.firstChild, jsonObj);
  },

  H2: (node, jsonObj) => {
    node.nodeName = "h2";

    processText(node, jsonObj);
  },

  META: (node, jsonObj) => {
    let s = node.firstChild.nodeValue;
    s = s.replace(/-/g, "$-$").replace(/ /g, "\\ ");
    addBodyToObj(jsonObj, node, "$" + s + "$");
  },

  METAPHRASE: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, "$\\langle{}$<EM>");
    recursiveProcessText(node.firstChild, jsonObj);
    addBodyToObj(jsonObj, node, "</EM>$\\rangle$");
  },

  IMAGE: (node, jsonObj) => {
    addBodyToObj(
      jsonObj,
      node,
      `<IMAGE src="${toIndexFolder}${node.getAttribute("src")}"/>`
    );
  },

  LINK: (node, jsonObj) => {
    addBodyToObj(
      jsonObj,
      node,
      "<a address='" +
        node.getAttribute("address") +
        "' href='" +
        node.getAttribute("address") +
        "'>"
    );
    recursiveProcessText(node.firstChild, jsonObj);
    addBodyToObj(jsonObj, node, "</a>");
  },

  LATEX: (node, jsonObj) =>
    processTextFunctionsHtml["LATEXINLINE"](node, jsonObj),
  LATEXINLINE: (node, jsonObj) => {
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

  LaTeX: (node, jsonObj) => {
    addBodyToObj(
      jsonObj,
      node,
      `<span class="texhtml" style="font-family: 'CMU Serif', cmr10, LMRoman10-Regular, 'Latin Modern Math', 'Nimbus Roman No9 L', 'Times New Roman', Times, serif;">L<span style="text-transform: uppercase; font-size: 0.75em; vertical-align: 0.25em; margin-left: -0.36em; margin-right: -0.15em; line-height: 1ex;">a</span>T<span style="text-transform: uppercase; vertical-align: -0.5ex; margin-left: -0.1667em; margin-right: -0.125em; line-height: 1ex;">e</span>X</span>`
    );
  },

  TeX: (node, jsonObj) => {
    addBodyToObj(
      jsonObj,
      node,
      `<span class="texhtml" style="font-family: 'CMU Serif', cmr10, LMRoman10-Regular, 'Latin Modern Math', 'Nimbus Roman No9 L', 'Times New Roman', Times, serif;">T<span style="text-transform: uppercase; vertical-align: -0.5ex; margin-left: -0.1667em; margin-right: -0.125em; line-height: 1ex;">e</span>X</span>`
    );
  },

  MATTERSECTION: (node, jsonObj) => {
    heading_count += 1;
    addBodyToObj(
      jsonObj,
      node,
      `
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h1>
    `
    );
    recursiveProcessText(node.firstChild, jsonObj);
    addBodyToObj(jsonObj, node, "</h1></div>");
  },

  NAME: (node, jsonObj) => {
    recursiveProcessText(node.firstChild, jsonObj);
  },

  P: (node, jsonObj) => {
    node.nodeName = "p";
    processText(node, jsonObj);
  },

  TEXT: (node, jsonObj) => {
    paragraph_count += 1;
    // addBodyToObj(jsonObj, node, "<div class='permalink'>");
    // addBodyToObj(
    //   jsonObj,
    //   node,
    //   "\n<a name='p" + paragraph_count + "' class='permalink'></a>"
    // );
    // addBodyToObj(jsonObj, node, "<p>");
    addBodyToObj(jsonObj, node, false);
    recursiveProcessText(node.firstChild, jsonObj);
    // addBodyToObj(jsonObj, node, "</p>");
    // addBodyToObj(jsonObj, node, "</div>");
  },

  REF: (node, jsonObj) => {
    const writeTo = [];
    processReferenceHtml(node, writeTo, chapterIndex);
    addArrayToObj(jsonObj, node, writeTo);
  },

  SECTION: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, displayTitle);

    if (node.getAttribute("WIP") === "yes") {
      addBodyToObj(
        jsonObj,
        node,
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, jsonObj);
  },

  SCHEMEINLINE: (node, jsonObj) =>
    processTextFunctionsHtml["JAVASCRIPTINLINE"](node, jsonObj),

  JAVASCRIPTINLINE: (node, jsonObj) => {
    const writeTo = [];
    if (ancestorHasTag(node, "NAME")) {
      recursiveProcessPureText(node.firstChild, writeTo, {
        removeNewline: "all"
      });
    } else {
      // addBodyToObj(jsonObj, node, "<kbd>");
      recursiveProcessPureText(node.firstChild, writeTo, {
        removeNewline: "all"
      });
      // addBodyToObj(jsonObj, node, "</kbd>");
    }
    addArrayToObj(jsonObj, node, writeTo);
  },

  SNIPPET: (node, jsonObj) => {
    if (node.getAttribute("HIDE") == "yes") {
      return;
    } else if (node.getAttribute("LATEX") == "yes") {
      const textprompt = getChildrenByTagName(node, "JAVASCRIPT_PROMPT")[0];
      if (textprompt) {
        recursiveProcessText(textprompt.firstChild, jsonObj, {
          removeNewline: "beginning&end"
        });
      }

      const textit = getChildrenByTagName(node, "JAVASCRIPT")[0];
      if (textit) {
        recursiveProcessText(textit.firstChild, jsonObj, {
          removeNewline: "beginning&end"
        });
      } else {
        recursiveProcessText(node.firstChild, jsonObj);
      }

      const textoutput = getChildrenByTagName(node, "JAVASCRIPT_OUTPUT")[0];
      if (textoutput) {
        recursiveProcessText(textoutput.firstChild, jsonObj, {
          removeNewline: "beginning&end"
        });
      }
      return;
    }

    snippet_count += 1;
    // addBodyToObj(
    //   jsonObj,
    //   node,
    //   "<div class='snippet' id='javascript_" +
    //     chapArrIndex +
    //     "_" +
    //     snippet_count +
    //     "_div'>"
    // );
    // addBodyToObj(jsonObj, node, "<div class='pre-prettyprint'>");
    // processSnippetHtml(node, writeTo, false);
    // writeTo = [];
    const snippet = { tag: node.nodeName };
    jsonObj.push(snippet);
    processSnippetJson(node, snippet);
    // writeTo.forEach(snippet => addBodyToObj(jsonObj, node, snippet));
    // addBodyToObj(jsonObj, node, "</div></div>");
  },

  SPACE: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, "\u00A0");
    recursiveProcessText(node.firstChild, jsonObj);
  },

  OL: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, `<OL type="`);
    addBodyToObj(
      jsonObj,
      node,
      ancestorHasTag(node, "EXERCISE") ? `a">` : `1">`
    );
    recursiveProcessText(node.firstChild, jsonObj);
    addBodyToObj(jsonObj, node, "</OL>");
  },

  SUBINDEX: (node, jsonObj) => {
    // should occur only within INDEX
    // also should only exist after stuff in the main index
    addBodyToObj(jsonObj, node, "!");
    const order = getChildrenByTagName(node, "ORDER")[0];
    if (order) {
      recursiveProcessText(order.firstChild, jsonObj);
      addBodyToObj(jsonObj, node, "@");
    }
    recursiveProcessText(node.firstChild, jsonObj);
  },

  SUBSECTION: (node, jsonObj) => {
    addBodyToObj(jsonObj, node, displayTitle);

    if (node.getAttribute("WIP") === "yes") {
      addBodyToObj(
        jsonObj,
        node,
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessText(name.nextSibling, jsonObj);
  },

  // e.g. section 4.4.4.4
  SUBSUBSECTION: (node, jsonObj) => {
    subsubsection_count += 1;
    heading_count += 1;
    const name = getChildrenByTagName(node, "NAME")[0];
    addBodyToObj(
      jsonObj,
      node,
      `
      <div class='permalink'>
        <a name='sec${chapterIndex}.${subsubsection_count}' class='permalink'></a><h1>
    `
    );
    if (chapterIndex !== "prefaces") {
      addBodyToObj(
        jsonObj,
        node,
        `${chapterIndex}.${subsubsection_count}\u00A0\u00A0\u00A0`
      );
    }
    recursiveProcessText(name.firstChild, jsonObj);
    addBodyToObj(jsonObj, node, "</h1></div>");
    recursiveProcessText(name.nextSibling, jsonObj);
  },

  SUBHEADING: (node, jsonObj) => {
    heading_count += 1;
    addBodyToObj(
      jsonObj,
      node,
      `
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h2>
    `
    );
    recursiveProcessText(node.firstChild, jsonObj);
    addBodyToObj(jsonObj, node, "</h2></div>");
  },

  SUBSUBHEADING: (node, jsonObj) => {
    heading_count += 1;
    addBodyToObj(
      jsonObj,
      node,
      `
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h3>
    `
    );
    recursiveProcessText(node.firstChild, jsonObj);
    addBodyToObj(jsonObj, node, "</h3></div>");
  }
};

let processTextFunctionsHtml = processTextFunctionsDefaultHtml;
export let tagsToRemove = tagsToRemoveDefault;
let ignoreTags = ignoreTagsDefault;
let preserveTags = preserveTagsDefault;

export const processText = (node, jsonObj) => {
  const name = node.nodeName;
  if (processTextFunctionsHtml[name]) {
    processTextFunctionsHtml[name](node, jsonObj);
    return true;
  } else {
    const newTag = [];
    if (replaceTagWithSymbol(node, newTag)) {
      addArrayToObj(jsonObj, node, newTag);
      return true;
    } else if (tagsToRemove.has(name)) {
      return true;
    } else if (ignoreTags.has(name)) {
      recursiveProcessText(node.firstChild, jsonObj);
      return true;
    } else if (preserveTags.has(name)) {
      //TODO
      //addBodyToObj(jsonObj, node, "<" + name + ">");
      // recursiveProcessText
      node.firstChild, jsonObj;
      //addBodyToObj(jsonObj, node, "</" + name + ">");
      return true;
    }
  }
  console.log("WARNING Unrecognised Tag:\n" + node.toString() + "\n");
  return false;
};

export const recursiveProcessText = (node, jsonObj) => {
  if (!node) return;

  const child = [];
  processText(node, child);
  if (child.length) {
    jsonObj.push({ child });
  }
  return recursiveProcessText(node.nextSibling, jsonObj);
};

export const parseXmlJson = (doc, jsonObj, filename) => {
  //console.log(allFilepath);
  chapterIndex = tableOfContent[filename].index;
  chapterTitle = tableOfContent[filename].title;

  if (chapterIndex.match(/[a-z]+/)) {
    displayTitle = chapterTitle;
  } else {
    displayTitle = chapterIndex + "\u00A0\u00A0" + chapterTitle;
  }

  //toIndexFolder = tableOfContent[filename].relativePathToMain;
  //console.log(chapterIndex + " " + chapterTitle);
  paragraph_count = 0;
  footnote_count = 0;
  display_footnote_count = 0;
  heading_count = 0;
  subsubsection_count = 0;
  snippet_count = 0;
  exercise_count = 0;
  chapArrIndex = allFilepath.indexOf(filename);
  console.log(`${chapArrIndex} parsing chapter ${chapterIndex}`);

  // beforeContent(jsonObj);
  recursiveProcessText(doc.documentElement, jsonObj);
  // afterContent(jsonObj);
};
