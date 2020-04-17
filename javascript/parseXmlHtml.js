import path from "path";
import {getChildrenByTagName, ancestorHasTag} from './utilityFunctions';
import {
  checkIndexBadEndWarning
} from "./processingFunctions/warnings.js";
import { allFilepath, tableOfContent} from "./index.js";
import { html_links_part1, html_links_part2, beforeContentWrapper } from './htmlContent';
import { recursiveProcessTOC} from './generateTocHtml';

import {
  replaceTagWithSymbol,
  processEpigraphHtml,
  processFigureHtml,
  processExerciseHtml,
  processReferenceHtml,
  processSnippetHtml,
  processSnippetHtmlScheme,
  recursiveProcessPureText,
} from './processingFunctions';

let paragraph_count = 0;
let heading_count = 0;
let subsubsection_count = 0;
let footnote_count = 0;
let snippet_count = 0;
let exercise_count = 0;
let display_footnote_count = 0;
let chapArrIndex = 0;
let chapterTitle = "";
let displayTitle = "";
export let chapterIndex = "";
export let toIndexFolder = "../";

const tagsToRemoveDefault = new Set([
  "ATTRIBUTION",
  "AUTHOR",
  "#comment",
  "COMMENT",
  "CHANGE",
  "EDIT",
  "EXCLUDE",
  "HISTORY",
  "ORDER",
  "SCHEME",
  "SOLUTION",
  "INDEX",
  "NAME",
  "LABEL",
  "CODEINDEX",
  "EXPLANATION"
]);
// SOLUTION tag handled by processSnippet

const ignoreTagsDefault = new Set([
  "CHAPTERCONTENT",
  "NOBR",
  "span",
  "SPLIT",
  "SPLITINLINE",
  "JAVASCRIPT",
  //typos
  "JAVASCIPT",
  "JAVSCRIPT",
  "SPLTINLINE"
]);

const preserveTagsDefault = new Set([
  "B",
  "BLOCKQUOTE",
  "EM",
  "QUOTE",
  "SC",
  "UL",
  "LI",
  "OL",
  "SECTIONCONTENT",
  "CITATION",
  "TT",
  "TABLE",
  "table",
  "TR",
  "tr",
  "TD",
  "td",
  "kbd",
  "p",
  "REFERENCE"
]);

const processTextFunctionsDefaultHtml = {

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
         writeTo.push(`<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`)
    }
    let childNode = node.firstChild;
    while (childNode.nodeName != "NAME") {
      childNode = childNode.nextSibling;
    }
    recursiveProcessTextHtml(childNode.nextSibling, writeTo);
    writeTo.push("\n</MATTER></div></div>\n");
  },
  REFERENCES: (node, writeTo) => processTextFunctionsHtml["ABOUT"](node, writeTo),
  WEBPREFACE: (node, writeTo) => processTextFunctionsHtml["ABOUT"](node, writeTo),
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
      writeTo.push(`<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`)
 }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessTextHtml(name.nextSibling, writeTo);
    writeTo.push("\n</CHAPTER></div></div>\n");
  },

  em: (node, writeTo) => {
    node.nodeName = "EM";
    processTextHtml(node, writeTo);
  },

  EM_NO_INDEX: (node, writeTo) => {
    node.nodeName = "EM";
    processTextHtml(node, writeTo);
  },


  EPIGRAPH: (node, writeTo) => {
    processEpigraphHtml(node, writeTo);
  },

  EXERCISE: (node, writeTo) => {
    exercise_count += 1;
    processExerciseHtml(node, writeTo, chapArrIndex, exercise_count);
  },

  FIGURE: (node, writeTo) => {
    processFigureHtml(node, writeTo);
  },

  FOOTNOTE: (node, writeTo) => {
    footnote_count += 1;
    writeTo.push(`<a class='superscript' id='footnote-link-${footnote_count}' href='#footnote-${footnote_count}'>[${footnote_count}]</a>`);
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
    if (display_footnote_count == 1) {writeTo.push("<hr>\n");}
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

  
  IMAGE: (node, writeTo) => {
    writeTo.push(`<IMAGE src="${toIndexFolder}${node.getAttribute("src")}"/>`);
  },
  

  LINK: (node, writeTo) => {
    writeTo.push("<a address='" + node.getAttribute("address") + "' href='" + node.getAttribute("address") + "'>");
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push("</a>");
  },

  LATEX: (node, writeTo) => processTextFunctionsHtml["LATEXINLINE"](node, writeTo),
  TREETAB: (node, writeTo) => processTextFunctionsHtml["LATEXINLINE"](node, writeTo),
  LATEXINLINE: (node, writeTo) => {
    recursiveProcessPureText(node.firstChild, writeTo);
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
        <div class='SECTION'><SECTION>
    `);
    
    if (node.getAttribute("WIP") === "yes") {
         writeTo.push(`<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`)
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessTextHtml(name.nextSibling, writeTo);
    writeTo.push("\n</SECTION></div></div>\n");
  },

  SCHEMEINLINE: (node, writeTo) =>
    processTextFunctionsHtml["JAVASCRIPTINLINE"](node, writeTo),

  JAVASCRIPTINLINE: (node, writeTo) => {
    if(ancestorHasTag(node, "NAME")){
      recursiveProcessPureText(node.firstChild, writeTo, { removeNewline: "all" });
    } else {
      writeTo.push("<kbd>");
      recursiveProcessPureText(node.firstChild, writeTo, { removeNewline: "all" });
      writeTo.push("</kbd>"); 
    }
  },

  SNIPPET: (node, writeTo) => {
    if (node.getAttribute("HIDE") == "yes") {
      return;
    } else if (node.getAttribute("LATEX") == "yes") {
      writeTo.push("<kbd class='snippet'>");
      const textit = getChildrenByTagName(node, "JAVASCRIPT")[0];
      if (textit) {
        recursiveProcessPureText(textit.firstChild, writeTo, { removeNewline: "beginning&end" });
      } else {
        recursiveProcessTextHtml(node.firstChild, writeTo);
      }
      writeTo.push("</kbd>");
      return;
    } 
    snippet_count += 1;
    writeTo.push("<div class='snippet' id='javascript_"+chapArrIndex+"_"+snippet_count+"_div'>")
    writeTo.push("<div class='pre-prettyprint'>");
    processSnippetHtml(node, writeTo);
    writeTo.push("</div></div>");
  },

  SPACE: (node, writeTo) => {
    writeTo.push(" ");
    recursiveProcessTextHtml(node.firstChild, writeTo);
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
        <div class='SECTION'><SECTION>
    `);
    
    if (node.getAttribute("WIP") === "yes") {
      writeTo.push(`<div style="color:red" class="wip-stamp">Note: this section is a work in progress!</div>`)
    }
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessTextHtml(name.nextSibling, writeTo);
    writeTo.push("\n</SUBSECTION></div></div>\n");
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

  // e.g. section 4.4.4
  SUBSUBSECTION: (node, writeTo) => {
    subsubsection_count += 1;
    heading_count += 1;
    const name = getChildrenByTagName(node, "NAME")[0];
    writeTo.push(`
      <div class='permalink'>
        <a name='sec${chapterIndex}.${subsubsection_count}' class='permalink'></a><h1>
    `);
    writeTo.push(`${chapterIndex}.${subsubsection_count} `);
    recursiveProcessTextHtml(name.firstChild, writeTo);
    writeTo.push("</h1></div>");
    recursiveProcessTextHtml(name.nextSibling, writeTo);
  },

  SUBSUBSUBSECTION:(node, writeTo) => {
    writeTo.push("<SUBSUBSUBSECTION>\n");
    const name = getChildrenByTagName(node, "NAME")[0];
    recursiveProcessTextHtml(name.firstChild, writeTo);
    recursiveProcessTextHtml(name.nextSibling, writeTo);
    writeTo.push("\n</SUBSUBSUBSECTION>\n");
  }
};

const processTextFunctionsSplit = {
  SCHEME: (node, writeTo) => {
    writeTo.push(`<span style="color:teal">`);
    recursiveProcessTextHtml(node.firstChild, writeTo)
    writeTo.push(`</span>`);
  },

  JAVASCRIPT: (node, writeTo) => {
    if (ancestorHasTag(node, "SPLITINLINE")) {
      writeTo.push("/");
    }
    writeTo.push(`<span style="color:blue">`);
    recursiveProcessTextHtml(node.firstChild, writeTo);
    writeTo.push(`</span>`);
  },

  SPLIT: (node, writeTo) => {
    const scheme = getChildrenByTagName(node, "SCHEME")[0];
    const js = getChildrenByTagName(node, "JAVASCRIPT")[0];
    if (scheme && js) {
      writeTo.push(`<table width="100%">
        <colgroup><col width="48%"><col width="1%"><col width="51%"></colgroup>
        <tr>
          <td class="meta" style = "color:grey; text-align: center">Original</td>
          <td></td>
          <td class="meta" style = "color:grey; text-align: center">JavaScript</td>
        </tr>`);
      writeTo.push(`
        <tr>
          <td>`);
      writeTo.push(`<span style="color:teal">`);
      recursiveProcessTextHtml(scheme.firstChild, writeTo)
      writeTo.push(`</span>`);
    
      writeTo.push(`    </td>
          <td></td>
          <td>`);
      writeTo.push(`<span style="color:blue">`);
      recursiveProcessTextHtml(js.firstChild, writeTo)
      writeTo.push(`</span>`);
      
      writeTo.push(`</td></tr>`);
      writeTo.push(`</table>`);
    } else if (js) {
      recursiveProcessTextHtml(js.firstChild, writeTo);
    } else if (scheme) {
      recursiveProcessTextHtml(scheme.firstChild, writeTo);
    }
  },

  FOOTNOTE: (node, writeTo) => {
    footnote_count += 1;
    writeTo.push(`<a class='superscript' id='footnote-link-${footnote_count}' href='#footnote-${footnote_count}'`);
    
    if (ancestorHasTag(node, "SCHEME")) {
      writeTo.push(`style="color:teal"`);
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
    if (display_footnote_count == 1) {writeTo.push("<hr>\n");}
    writeTo.push(`
    <div class='footnote'>`);
    if (node.getAttribute("version") == "scheme") {
      writeTo.push(`<span style="color:teal">`);
    } else if (node.getAttribute("version") == "js") {
      writeTo.push(`<span style="color:blue">`);
    }
    writeTo.push(`
      <a class='footnote-number' id='footnote-${display_footnote_count}' href='#footnote-link-${display_footnote_count}' `);
    if (node.getAttribute("version") == "scheme") {
      writeTo.push(`style="color:teal"`);
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
      writeTo.push("<kbd class='snippet'>");
      const textit = getChildrenByTagName(node, "JAVASCRIPT")[0];
      if (textit) {
        recursiveProcessPureText(textit.firstChild, writeTo, { removeNewline: "beginning&end" });
      } else {
        recursiveProcessTextHtml(node.firstChild, writeTo);
      }
      writeTo.push("</kbd>");
      return;
    } 
    snippet_count += 1;

    const scheme = getChildrenByTagName(node, "SCHEME")[0];
    const js = getChildrenByTagName(node, "JAVASCRIPT")[0];
    if (scheme && js) {
      writeTo.push(`<table width="100%">
          <colgroup><col width="48%"><col width="52%"></colgroup>
          `);
        writeTo.push(`
          <tr>
            <td>`);
        //writeTo.push(`<span style="color:teal">`);
        writeTo.push("<div class='snippet' id='javascript_"+chapArrIndex+"_"+snippet_count+"_div'>")
        writeTo.push("<div class='pre-prettyprint'>");
        processSnippetHtmlScheme(node, writeTo);
        writeTo.push("</div></div>");
        //writeTo.push(`</span>`);
      
        writeTo.push(`    </td>
            <td>`);
        //writeTo.push(`<span style="color:blue">`);
        writeTo.push("<div class='snippet' id='javascript_"+chapArrIndex+"_"+snippet_count+"_div'>")
        writeTo.push("<div class='pre-prettyprint'>");
        processSnippetHtml(node, writeTo);
        writeTo.push("</div></div>");
        //writeTo.push(`</span>`);
        
        writeTo.push(`</td></tr>`);
        writeTo.push(`</table>`);
    } else {
      writeTo.push("<div class='snippet' id='javascript_"+chapArrIndex+"_"+snippet_count+"_div'>")
      writeTo.push("<div class='pre-prettyprint'>");
      processSnippetHtmlScheme(node, writeTo);
      processSnippetHtml(node, writeTo);
      writeTo.push("</div></div>");
    }
  }
};

let processTextFunctionsHtml = processTextFunctionsDefaultHtml;
export let tagsToRemove = tagsToRemoveDefault;
let ignoreTags = ignoreTagsDefault;
let preserveTags = preserveTagsDefault;

export const switchParseFunctionsHtml = (version) => {
  if (version == "js") {
    console.log('generate sicp.js web textbook');
    tagsToRemove = tagsToRemoveDefault;
    ignoreTags = ignoreTagsDefault;
    preserveTags = preserveTagsDefault;
    processTextFunctionsHtml = processTextFunctionsDefaultHtml;
  } else if (version == "split") {
    console.log('generate split version of web textbook')
    tagsToRemove.delete("SCHEME");
    tagsToRemove.delete("SPLIT");
    ignoreTags.delete("JAVASCRIPT");
    processTextFunctionsHtml = {
      ...processTextFunctionsDefaultHtml,
      ...processTextFunctionsSplit,
      // the second object overwrites the first one
    };
  } else if (version == "scheme") {
    console.log('generate sicp schceme web textook')
  }
}

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
    } else if (preserveTags.has(name)){
      writeTo.push("<"+ name + ">");
      recursiveProcessTextHtml(node.firstChild, writeTo);
      writeTo.push("</"+ name + ">");
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

const beforeContent = (writeTo) => {
  writeTo.push(html_links_part1);
  writeTo.push(`
  <meta name="description" content="${displayTitle}" />
    <title>
      ${displayTitle}
    </title>
    `);
  html_links_part2(writeTo, toIndexFolder);
  recursiveProcessTOC(0, writeTo, "sidebar", "./");
  writeTo.push("</div>\n"); 
  writeTo.push(beforeContentWrapper);
}

const afterContent = (writeTo) => {

  writeTo.push(`
    <div class='nav'>
  `);

  if (chapArrIndex > 0) {
    writeTo.push(`
      <button type='button' class='btn btn-secondary' style='background-color: #fff;'>
        <a href='./${tableOfContent[allFilepath[chapArrIndex-1]].index}.html'>&lt; Previous</a>
      </button>
    `);
  }
  writeTo.push(`
    <div style='flex-grow: 1;'></div>
  `);
  
  if (chapArrIndex < allFilepath.length - 1) {
    writeTo.push(`
      <button type='button' class='btn btn-secondary' style='background-color: #fff;'>
        <a class='scroll-next' id='${chapArrIndex+2}' href='./${tableOfContent[allFilepath[chapArrIndex+1]].index}.html'>Next &gt;</a>
      </button>
      `);
  }
  writeTo.push(`</div>
    <div class='chapter_sign'>
      ${chapterIndex + " " + chapterTitle}
    </div>
    <script> var chapter_id = ${chapArrIndex + 1}; </script>
    <script> var chapter_path = "chapters/${chapterIndex}.html"; </script>
    <div class='next-page'></div>
    </div>
    </div> <!-- /.container -->
    </body></html>`);
}

export const parseXmlHtml = (doc, writeTo, filename) => {
  
  //console.log(allFilepath);
  chapterIndex = tableOfContent[filename].index;
  chapterTitle = tableOfContent[filename].title;
  
  if (chapterIndex.match(/[a-z]+/)) {
    displayTitle = chapterTitle;
  } else {
    displayTitle = chapterIndex + " " + chapterTitle;
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
}


