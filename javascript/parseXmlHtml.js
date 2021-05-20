import { getChildrenByTagName, ancestorHasTag } from "./utilityFunctions";
import { allFilepath, tableOfContent } from "./index.js";
import {
  html_links_part1,
  html_links_part2,
  beforeContentWrapper
} from "./htmlContent";
import { recursiveProcessTOC } from "./generateTocHtml";

import {
  replaceTagWithSymbol,
  processBlockquoteHtml,
  processEpigraphHtml,
  processFigureHtml,
  processExerciseHtml,
  processReferenceHtml,
  processSnippetHtml,
  processSnippetHtmlScheme,
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
  "SPLITINLINE",
  "JAVASCRIPT"
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

const processTextFunctionsDefaultHtml = {
  WEB_ONLY: (node, writeTo) => {
    recursiveProcessTextHtml(node.firstChild, writeTo);
  },

  "#text": (node, writeTo) => {
    // ignore the section/subsection tags at the end of chapter/section files
    if (!node.nodeValue.match(/&(\w|\.|\d)+;/)) {
      writeTo.push(node.nodeValue);
    }
  },

  ABOUT: (node, writeTo) => {
    writeTo.push(`
      <div class='chapter-title'>
        <div class='permalink'>
        <a name='top' class='permalink'> 
    `);
    writeTo.push(displayTitle);
    writeTo.push(`
        </a>
        </div>
      </div>
      <div class='chapter-text'>
        <div class='MATTER'><MATTER>
    `);

    if (node.getAttribute("WIP") === "yes") {
      writeTo.push(
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    let childNode = node.firstChild;
    while (childNode.nodeName != "NAME") {
      childNode = childNode.nextSibling;
    }
    recursiveProcessTextHtml(childNode.nextSibling, writeTo);
    writeTo.push("\n</MATTER></div></div>\n");
  },
  REFERENCES: (node, writeTo) =>
    processTextFunctionsHtml["ABOUT"](node, writeTo),
  WEBPREFACE: (node, writeTo) =>
    processTextFunctionsHtml["ABOUT"](node, writeTo),
  MATTER: (node, writeTo) => processTextFunctionsHtml["ABOUT"](node, writeTo),

  APOS: (node, writeTo) => {
    writeTo.push("'");
  },

  br: (node, writeTo) => {
    writeTo.push("<br>");
  },

  BR: (node, writeTo) => processTextFunctionsHtml["br"](node, writeTo),

  CHAPTER: (node, writeTo) => {
    writeTo.push(`
      <div class='chapter-title'>
        <div class='permalink'>
        <a name='top' class='permalink'> 
    `);
    writeTo.push(displayTitle);
    writeTo.push(`
        </a>
        </div>
      </div>
      <div class='chapter-text'>
        <div class='CHAPTER'><CHAPTER>
    `);

    if (node.getAttribute("WIP") === "yes") {
      writeTo.push(
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessTextHtml(name.nextSibling, writeTo);
    writeTo.push("\n</CHAPTER></div></div>\n");
  },

  EM_NO_INDEX: (node, writeTo) => {
    node.nodeName = "EM";
    processTextHtml(node, writeTo);
  },

  EPIGRAPH: (node, writeTo) => {
    processEpigraphHtml(node, writeTo);
  },

  BLOCKQUOTE: (node, writeTo) => {
    processBlockquoteHtml(node, writeTo);
  },

  NOINDENT: (node, writeTo) => {},

  EXERCISE_STARTING_WITH_ITEMS: (node, writeTo) => {},

  EXERCISE_FOLLOWED_BY_TEXT: (node, writeTo) => {},

  EXERCISE: (node, writeTo) => {
    exercise_count += 1;
    processExerciseHtml(node, writeTo, chapArrIndex, exercise_count);
  },

  FIGURE: (node, writeTo) => {
    recursiveProcessTextHtml(node.firstChild, writeTo);
    processFigureHtml(node, writeTo);
  },

  FOOTNOTE: (node, writeTo) => {
    footnote_count += 1;
    writeTo.push(
      `<a class='superscript' id='footnote-link-${footnote_count}' href='#footnote-${footnote_count}'>[${footnote_count}]</a>`
    );
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

  DISPLAYFOOTNOTE: (node, writeTo) => {
    display_footnote_count += 1;
    if (display_footnote_count == 1) {
      writeTo.push("<hr>\n");
    }
    writeTo.push(`
    <div class='footnote'>`);
    writeTo.push(`
      <a class='footnote-number' id='footnote-${display_footnote_count}' href='#footnote-link-${display_footnote_count}'>`);
    writeTo.push(`[${display_footnote_count}] </a>
    <FOOTNOTE>
    `);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push(`
    </FOOTNOTE></div>

    `);
  },

  H2: (node, writeTo) => {
    node.nodeName = "h2";
    processTextHtml(node, writeTo);
  },

  META: (node, writeTo) => {
    writeTo.push("$");
    let s = node.firstChild.nodeValue;
    s = s.replace(/-/g, "$-$").replace(/ /g, "\\ ");
    writeTo.push(s);
    writeTo.push("$");
  },

  METAPHRASE: (node, writeTo) => {
    writeTo.push("$\\langle{}$<EM>");
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</EM>$\\rangle$");
  },

  IMAGE: (node, writeTo) => {
    writeTo.push(`<IMAGE src="${toIndexFolder}${node.getAttribute("src")}"/>`);
  },

  LINK: (node, writeTo) => {
    writeTo.push(
      "<a address='" +
        node.getAttribute("address") +
        "' href='" +
        node.getAttribute("address") +
        "'>"
    );
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</a>");
  },

  LATEX: (node, writeTo) =>
    processTextFunctionsHtml["LATEXINLINE"](node, writeTo),
  LATEXINLINE: (node, writeTo) => {
    recursiveProcessPureText(node.firstChild, writeTo);
  },

  LaTeX: (node, writeTo) => {
    writeTo.push(
      `<span class="texhtml" style="font-family: 'CMU Serif', cmr10, LMRoman10-Regular, 'Latin Modern Math', 'Nimbus Roman No9 L', 'Times New Roman', Times, serif;">L<span style="text-transform: uppercase; font-size: 0.75em; vertical-align: 0.25em; margin-left: -0.36em; margin-right: -0.15em; line-height: 1ex;">a</span>T<span style="text-transform: uppercase; vertical-align: -0.5ex; margin-left: -0.1667em; margin-right: -0.125em; line-height: 1ex;">e</span>X</span>`
    );
  },

  TeX: (node, writeTo) => {
    writeTo.push(
      `<span class="texhtml" style="font-family: 'CMU Serif', cmr10, LMRoman10-Regular, 'Latin Modern Math', 'Nimbus Roman No9 L', 'Times New Roman', Times, serif;">T<span style="text-transform: uppercase; vertical-align: -0.5ex; margin-left: -0.1667em; margin-right: -0.125em; line-height: 1ex;">e</span>X</span>`
    );
  },

  MATTERSECTION: (node, writeTo) => {
    heading_count += 1;
    writeTo.push(`
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h1>
    `);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</h1></div>");
  },

  NAME: (node, writeTo) => {
    recursiveProcessTextHtml(node.firstChild, writeTo);
  },

  P: (node, writeTo) => {
    node.nodeName = "p";
    processTextHtml(node, writeTo);
  },

  TEXT: (node, writeTo) => {
    paragraph_count += 1;
    writeTo.push("<div class='permalink'>");
    writeTo.push("\n<a name='p" + paragraph_count + "' class='permalink'></a>");
    writeTo.push("<p>");
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</p>");
    writeTo.push("</div>");
  },

  REF: (node, writeTo) => {
    processReferenceHtml(node, writeTo, chapterIndex);
  },

  SECTION: (node, writeTo) => {
    writeTo.push(`
      <div class='chapter-title'>
        <div class='permalink'>
        <a name='top' class='permalink'> 
    `);
    writeTo.push(displayTitle);
    writeTo.push(`
        </a>
        </div>
      </div>
      <div class='chapter-text'>
        <div class='SECTION'>
    `);

    if (node.getAttribute("WIP") === "yes") {
      writeTo.push(
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessTextHtml(name.nextSibling, writeTo);
    writeTo.push("\n</div></div>\n");
  },

  SCHEMEINLINE: (node, writeTo) =>
    processTextFunctionsHtml["JAVASCRIPTINLINE"](node, writeTo),

  JAVASCRIPTINLINE: (node, writeTo) => {
    if (ancestorHasTag(node, "NAME")) {
      recursiveProcessPureText(node.firstChild, writeTo, {
        removeNewline: "all"
      });
    } else {
      writeTo.push("<kbd>");
      recursiveProcessPureText(node.firstChild, writeTo, {
        removeNewline: "all"
      });
      writeTo.push("</kbd>");
    }
  },

  SNIPPET: (node, writeTo) => {
    if (node.getAttribute("HIDE") == "yes") {
      return;
    } else if (node.getAttribute("LATEX") == "yes") {
      const textprompt = getChildrenByTagName(node, "JAVASCRIPT_PROMPT")[0];
      if (textprompt) {
        writeTo.push("<kbd class='snippet'>");
        recursiveProcessTextHtml(textprompt.firstChild, writeTo, {
          removeNewline: "beginning&end"
        });
        writeTo.push("</kbd>");
      }

      writeTo.push("<kbd class='snippet'>");
      const textit = getChildrenByTagName(node, "JAVASCRIPT")[0];
      if (textit) {
        recursiveProcessTextHtml(textit.firstChild, writeTo, {
          removeNewline: "beginning&end"
        });
      } else {
        recursiveProcessTextHtml(node.firstChild, writeTo);
      }
      writeTo.push("</kbd>");

      const textoutput = getChildrenByTagName(node, "JAVASCRIPT_OUTPUT")[0];
      if (textoutput) {
        writeTo.push("<kbd class='snippet'>");
        recursiveProcessTextHtml(textoutput.firstChild, writeTo, {
          removeNewline: "beginning&end"
        });
        writeTo.push("</kbd>");
      }

      return;
    }
    snippet_count += 1;
    writeTo.push(
      "<div class='snippet' id='javascript_" +
        chapArrIndex +
        "_" +
        snippet_count +
        "_div'>"
    );
    writeTo.push("<div class='pre-prettyprint'>");
    processSnippetHtml(node, writeTo, false);
    writeTo.push("</div></div>");
  },

  SPACE: (node, writeTo) => {
    writeTo.push("&nbsp;");
    recursiveProcessTextHtml(node.firstChild, writeTo);
  },

  FIXED_SPACE: (node, writeTo) => {
    writeTo.push("<kbd>&nbsp;</kbd>");
    recursiveProcessTextHtml(node.firstChild, writeTo);
  },

  OL: (node, writeTo) => {
    writeTo.push(`<OL type="`);
    writeTo.push(ancestorHasTag(node, "EXERCISE") ? `a">` : `1">`);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</OL>");
  },

  SUBINDEX: (node, writeTo) => {
    // should occur only within INDEX
    // also should only exist after stuff in the main index
    writeTo.push("!");
    const order = getChildrenByTagName(node, "ORDER")[0];
    if (order) {
      recursiveProcessTextHtml(order.firstChild, writeTo);
      writeTo.push("@");
    }
    recursiveProcessTextHtml(node.firstChild, writeTo);
  },

  SUBSECTION: (node, writeTo) => {
    writeTo.push(`
      <div class='chapter-title'>
        <div class='permalink'>
        <a name='top' class='permalink'> 
    `);
    writeTo.push(displayTitle);
    writeTo.push(`
        </a>
        </div>
      </div>
      <div class='chapter-text'>
        <div class='SECTION'>
    `);

    if (node.getAttribute("WIP") === "yes") {
      writeTo.push(
        `<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`
      );
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessTextHtml(name.nextSibling, writeTo);
    writeTo.push("\n</div></div>\n");
  },

  // e.g. section 4.4.4.4
  SUBSUBSECTION: (node, writeTo) => {
    subsubsection_count += 1;
    heading_count += 1;
    const name = getChildrenByTagName(node, "NAME")[0];
    writeTo.push(`
      <div class='permalink'>
        <a name='sec${chapterIndex}.${subsubsection_count}' class='permalink'></a><h1>
    `);
    if (chapterIndex !== "prefaces") {
      writeTo.push(`${chapterIndex}.${subsubsection_count}&nbsp;&nbsp;&nbsp;`);
    }
    recursiveProcessTextHtml(name.firstChild, writeTo);
    writeTo.push("</h1></div>");
    recursiveProcessTextHtml(name.nextSibling, writeTo);
  },

  SUBHEADING: (node, writeTo) => {
    heading_count += 1;
    writeTo.push(`
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h2>
    `);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</h2></div>");
  },

  SUBSUBHEADING: (node, writeTo) => {
    heading_count += 1;
    writeTo.push(`
      <div class='permalink'>
        <a name='h${heading_count}' class='permalink'></a><h3>
    `);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</h3></div>");
  }
};

const processTextFunctionsSplit = {
  WEB_ONLY: (node, writeTo) => {
    writeTo.push("<div class='webonly'>");
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</div>");
  },

  PDF_ONLY: (node, writeTo) => {
    writeTo.push("<div class='pdfonly'>");
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</div>");
  },

  COMMENT: (node, writeTo) => {
    writeTo.push("<span class='comment'>");
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</span>");
  },

  SCHEME: (node, writeTo) => {
    writeTo.push(`<span style="color:green">`);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push(`</span>`);
  },

  JAVASCRIPT: (node, writeTo) => {
    writeTo.push(`<span style="color:blue">`);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push(`</span>`);
  },

  SPLIT: (node, writeTo) => {
    const scheme = getChildrenByTagName(node, "SCHEME")[0];
    const js = getChildrenByTagName(node, "JAVASCRIPT")[0];
    writeTo.push(`<table width="100%">
        <colgroup><col width="48%"><col width="1%"><col width="51%"></colgroup>
        <tr>
          <td class="meta" style = "color:grey; text-align: center">Original</td>
          <td></td>
          <td class="meta" style = "color:grey; text-align: center">JavaScript</td>
        </tr>`);
    writeTo.push(`
        <tr><td>`);
    if (scheme) {
      writeTo.push(`<span style="color:green">`);
      recursiveProcessTextHtml(scheme.firstChild, writeTo);
      writeTo.push(`</span>`);
    }
    writeTo.push(`    </td>
          <td></td>
          <td>`);
    if (js) {
      writeTo.push(`<span style="color:blue">`);
      recursiveProcessTextHtml(js.firstChild, writeTo);
      writeTo.push(`</span>`);
    }
    writeTo.push(`</td></tr>`);
    writeTo.push(`</table>`);
  },

  FOOTNOTE: (node, writeTo) => {
    footnote_count += 1;
    writeTo.push(
      `<a class='superscript' id='footnote-link-${footnote_count}' href='#footnote-${footnote_count}'`
    );

    if (ancestorHasTag(node, "SCHEME")) {
      writeTo.push(`style="color:green"`);
    } else if (ancestorHasTag(node, "JAVASCRIPT")) {
      writeTo.push(`style="color:blue"`);
    }

    writeTo.push(`>[${footnote_count}]</a>`);
    // clone the current FOOTNOTE node and its children
    let cloneNode = node.cloneNode(true);
    cloneNode.nodeName = "DISPLAYFOOTNOTE";

    if (ancestorHasTag(node, "SCHEME")) {
      cloneNode.setAttribute("version", "scheme");
    } else if (ancestorHasTag(node, "JAVASCRIPT")) {
      cloneNode.setAttribute("version", "js");
    }

    let parent = node.parentNode;
    // the last parentNode is <#document> the second last node is either <CHAPTER>/<(SUB)SECTION>
    while (parent.parentNode.parentNode) {
      parent = parent.parentNode;
    }
    // append the cloned node as the last elements inside <CHAPTER>/<SECTION> node
    parent.appendChild(cloneNode);
  },

  DISPLAYFOOTNOTE: (node, writeTo) => {
    display_footnote_count += 1;
    if (display_footnote_count == 1) {
      writeTo.push("<hr>\n");
    }
    writeTo.push(`
    <div class='footnote'>`);
    if (node.getAttribute("version") == "scheme") {
      writeTo.push(`<span style="color:green">`);
    } else if (node.getAttribute("version") == "js") {
      writeTo.push(`<span style="color:blue">`);
    }
    writeTo.push(`
      <a class='footnote-number' id='footnote-${display_footnote_count}' href='#footnote-link-${display_footnote_count}' `);
    if (node.getAttribute("version") == "scheme") {
      writeTo.push(`style="color:green"`);
    } else if (node.getAttribute("version") == "js") {
      writeTo.push(`style="color:blue"`);
    }
    writeTo.push(`>[${display_footnote_count}] </a>
    <FOOTNOTE>
    `);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push(`
    </FOOTNOTE>`);
    if (node.getAttribute("version")) {
      writeTo.push(`</span>`);
    }
    writeTo.push(`</div>
    
    `);
  },

  SNIPPET: (node, writeTo) => {
    if (node.getAttribute("HIDE") == "yes") {
      return;
    } else if (node.getAttribute("LATEX") == "yes") {
      const textprompt = getChildrenByTagName(node, "JAVASCRIPT_PROMPT")[0];
      if (textprompt) {
        writeTo.push("<kbd class='snippet'>");
        recursiveProcessTextHtml(textprompt.firstChild, writeTo, {
          removeNewline: "beginning&end"
        });
        writeTo.push("</kbd>");
      }

      writeTo.push("<kbd class='snippet'>");
      const textit = getChildrenByTagName(node, "JAVASCRIPT")[0];
      if (textit) {
        recursiveProcessTextHtml(textit.firstChild, writeTo, {
          removeNewline: "beginning&end"
        });
      } else {
        recursiveProcessTextHtml(node.firstChild, writeTo);
      }
      writeTo.push("</kbd>");

      const textoutput = getChildrenByTagName(node, "JAVASCRIPT_OUTPUT")[0];
      if (textoutput) {
        writeTo.push("<kbd class='snippet'>");
        recursiveProcessTextHtml(textoutput.firstChild, writeTo, {
          removeNewline: false
        });
        writeTo.push("</kbd>");
      }

      return;
    }
    snippet_count += 1;

    const scheme = getChildrenByTagName(node, "SCHEME")[0];
    const js = getChildrenByTagName(node, "JAVASCRIPT")[0];
    const scheme_output = getChildrenByTagName(node, "SCHEMEOUTPUT")[0];
    const js_output = getChildrenByTagName(node, "JAVASCRIPT_OUTPUT")[0];
    if ((scheme || scheme_output) && (js || js_output)) {
      writeTo.push(`<table width="100%">
          <colgroup><col width="48%"><col width="52%"></colgroup>
          `);
      writeTo.push(`
          <tr>
            <td>`);
      //writeTo.push(`<span style="color:green">`);
      writeTo.push(
        "<div class='snippet' id='javascript_" +
          chapArrIndex +
          "_" +
          snippet_count +
          "_div'>"
      );
      writeTo.push("<div class='pre-prettyprint'>");
      processSnippetHtmlScheme(node, writeTo);
      writeTo.push("</div></div>");
      //writeTo.push(`</span>`);

      writeTo.push(`    </td>
            <td>`);
      //writeTo.push(`<span style="color:blue">`);
      writeTo.push(
        "<div class='snippet' id='javascript_" +
          chapArrIndex +
          "_" +
          snippet_count +
          "_div'>"
      );
      writeTo.push("<div class='pre-prettyprint'>");
      processSnippetHtml(node, writeTo, true);
      writeTo.push("</div></div>");
      //writeTo.push(`</span>`);

      writeTo.push(`</td></tr>`);
      writeTo.push(`</table>`);
    } else {
      writeTo.push(
        "<div class='snippet' id='javascript_" +
          chapArrIndex +
          "_" +
          snippet_count +
          "_div'>"
      );
      writeTo.push("<div class='pre-prettyprint'>");
      processSnippetHtmlScheme(node, writeTo);
      processSnippetHtml(node, writeTo, true);
      writeTo.push("</div></div>");
    }
  }
};

let processTextFunctionsHtml = processTextFunctionsDefaultHtml;
export let tagsToRemove = tagsToRemoveDefault;
let ignoreTags = ignoreTagsDefault;
let preserveTags = preserveTagsDefault;

export const switchParseFunctionsHtml = version => {
  if (version == "js") {
    console.log("generate sicp.js web textbook");
    tagsToRemove = tagsToRemoveDefault;
    ignoreTags = ignoreTagsDefault;
    preserveTags = preserveTagsDefault;
    processTextFunctionsHtml = processTextFunctionsDefaultHtml;
  } else if (version == "split") {
    console.log("generate split version of web textbook");
    tagsToRemove.delete("SCHEME");
    tagsToRemove.delete("SPLIT");
    ignoreTags.delete("JAVASCRIPT");
    processTextFunctionsHtml = {
      ...processTextFunctionsDefaultHtml,
      ...processTextFunctionsSplit
      // the second object overwrites the first one
    };
  } else if (version == "scheme") {
    console.log("generate sicp schceme web textook");
  }
};

export const processTextHtml = (node, writeTo) => {
  const name = node.nodeName;
  if (processTextFunctionsHtml[name]) {
    processTextFunctionsHtml[name](node, writeTo);
    return true;
  } else {
    if (replaceTagWithSymbol(node, writeTo) || tagsToRemove.has(name)) {
      return true;
    } else if (ignoreTags.has(name)) {
      recursiveProcessTextHtml(node.firstChild, writeTo);
      return true;
    } else if (preserveTags.has(name)) {
      writeTo.push("<" + name + ">");
      recursiveProcessTextHtml(node.firstChild, writeTo);
      writeTo.push("</" + name + ">");
      return true;
    }
  }
  console.log("WARNING Unrecognised Tag:\n" + node.toString() + "\n");
  return false;
};

export const recursiveProcessTextHtml = (node, writeTo) => {
  if (!node) return;
  processTextHtml(node, writeTo);
  return recursiveProcessTextHtml(node.nextSibling, writeTo);
};

const beforeContent = writeTo => {
  writeTo.push(html_links_part1);
  writeTo.push(`
  <meta name="description" content="${displayTitle}" />
    <title>
      ${displayTitle}
    </title>
    `);
  html_links_part2(writeTo, toIndexFolder, "js");
  recursiveProcessTOC(0, writeTo, "sidebar", "./");
  writeTo.push("</div>\n");
  writeTo.push(beforeContentWrapper);
};

const afterContent = writeTo => {
  writeTo.push(`
    <div class='nav'>
  `);

  if (chapArrIndex > 0) {
    writeTo.push(`
        <a class='btn btn-secondary btn-nav' href='./${
          tableOfContent[allFilepath[chapArrIndex - 1]].index
        }.html'>&lt; Previous</a>
    `);
  }
  writeTo.push(`
    <div style='flex-grow: 1;'></div>
  `);

  if (chapArrIndex < allFilepath.length - 1) {
    writeTo.push(`
        <a class='btn btn-secondary btn-nav' id='${chapArrIndex + 2}' href='./${
      tableOfContent[allFilepath[chapArrIndex + 1]].index
    }.html'>Next &gt;</a>
      `);
  }
  writeTo.push(`</div>
    <div class='chapter_sign'>
      ${displayTitle}
    </div>
    <script> var chapter_id = ${chapArrIndex + 1}; </script>
    <script> var chapter_path = "chapters/${chapterIndex}.html"; </script>
    <div class='next-page'></div>
    </div>
    </div> <!-- /.container -->
    </body></html>`);
};

export const parseXmlHtml = (doc, writeTo, filename) => {
  //console.log(allFilepath);
  chapterIndex = tableOfContent[filename].index;
  chapterTitle = tableOfContent[filename].title;

  if (chapterIndex.match(/[a-z]+/)) {
    displayTitle = chapterTitle;
  } else {
    displayTitle = chapterIndex + "&nbsp;&nbsp;" + chapterTitle;
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

  beforeContent(writeTo);
  recursiveProcessTextHtml(doc.documentElement, writeTo);
  afterContent(writeTo);
};
