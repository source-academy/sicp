import { getChildrenByTagName, ancestorHasTag } from "./utilityFunctions.js";
import { allFilepath, tableOfContent } from "./index.js";
import path from "path";
import fs from "fs";

import {
  replaceTagWithSymbol,
  processEpigraphJson,
  processFigureJson,
  processExerciseJson,
  processReferenceJson,
  processSnippetJson,
  recursiveProcessPureText,
  recursivelyProcessTextSnippetJson
} from "./processingFunctions/index.js";

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

const __dirname = path.resolve(import.meta.dirname);

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
  "SOLUTION", // SOLUTION tag handled by processExerciseJson
  //"INDEX",
  "CAPTION",
  "NAME",
  "LABEL",
  "CODEINDEX",
  "EXPLANATION",
  "NOINDENT",
  "EXERCISE_FOLLOWED_BY_TEXT",
  "SOFT_HYP",
  "WATCH",
  "KEEP_TOGETHER",
  "START_KEEP_TOGETHER",
  "STOP_KEEP_TOGETHER",
  "SHRINK_PARAGRAPH",
  "STRETCH_PARAGRAPH",
  "DONT_BREAK_PAGE",
  "DO_BREAK_PAGE",
  "FORCE_PAGE_BREAK_AND_FILL",
  "FILBREAK",
  "LONG_PAGE",
  "SHORT_PAGE"
]);

const ignoreTags = new Set([
  "CHAPTERCONTENT",
  "SPLIT",
  "SPLITINLINE",
  "JAVASCRIPT",
  "CITATION",
  "SECTIONCONTENT",
  "p",
  "WEB_ONLY"
]);

type TrieEnd = {
  value: string;
  pureIndex: [string, string][];
  subIndex: { value: string; id: [string, string]; order: string }[];
};

type TrieTree = {
  [key: string]: TrieTree | { value: TrieEnd };
};
export const trieTree: TrieTree = {};
export const trieTreeText = {};
export const writeSearchData = () => {
  const outputDir = path.join(__dirname, "../json");
  const outputFile = path.join(outputDir, "searchData.json");
  const searchData = {
    textbook: textBook,
    indexSearch: trieTree,
    userSearch: trieTreeText
  };
  fs.writeFile(outputFile, JSON.stringify(searchData), err => {
    if (err) {
      console.error(err);
    } else {
      console.log(`SearchData object written to ${outputFile}`);
    }
  });
};

var index = [];
var count = 0;
var globalTitle;
var globalExerciseID = [];
var sectionExerciseArrayIndex = [];
var sectionExerciseIndexCount = 0;
var textBook = {};
function reportErrors() {
  console.log("ERROR");
  console.log("ERROR");
  console.log("ERROR");
  console.log("ERROR");
}
function maintainTextTrie(arr) {
  function add2(word, idarray) {
    if (
      idarray == null ||
      idarray[0] == null ||
      idarray[1] == null ||
      idarray[0].includes("footnote") ||
      idarray[1].includes("footnote")
    ) {
      return;
    }
    //console.log(idarray[1]);
    let current = trieTreeText;
    for (let j = 0; j < word.length; j++) {
      let char = word[j];
      if (!current.hasOwnProperty(char)) {
        current[char] = {};
      }

      current = current[char];
    }

    if (!current.value) {
      current.value = [];
    }

    if (
      !current.value.some(
        array =>
          array[0] === idarray[0] &&
          array[1] === idarray[1] &&
          array[2] === idarray[2]
      )
    ) {
      current.value.push(idarray);
    }
  }
  const tem = {};
  const sectionId = arr[0]["id"];
  textBook[sectionId] = tem;

  for (let i = 1; i < arr.length; i++) {
    if ((arr[i].tag = "TEXT" && arr[i].child)) {
      const sentences = {};
      const paragraphId = arr[i]["id"];
      tem[paragraphId] = sentences;
      const childs = arr[i]["child"];
      for (let j = 0; j < childs.length; j++) {
        if (childs[j].tag != "#text") {
          continue;
        }
        let line = childs[j]["body"];
        line = line.trim().replace(/\s+/g, " ");
        sentences[j] = line;
        line = line.toLowerCase().replace(/[^a-z0-9" "]/gi, "");
        let words = line.split(" ").filter(a => a != "" && a != '"');
        for (let k = 0; k < words.length; k++) {
          const word = words[k];

          add2(word, [sectionId, paragraphId, j]);
        }
      }
    }
  }
}

function maintainIndexTrie() {
  function add(obj, trie: TrieTree) {
    let current: TrieTree | { value: TrieEnd } = trie;

    if (obj["parse"] == null || obj["parse"]["value"] == null) {
      if (obj["parse"]["DECLARATION"]) {
        obj["parse"]["value"] = obj["parse"]["DECLARATION"]["value"];
      } else if (obj["parse"]["JAVASCRIPTINLINE"]) {
        obj["parse"]["value"] = obj["parse"]["JAVASCRIPTINLINE"]["value"];
      } else if (obj["parse"]["USE"]) {
        obj["parse"]["value"] = obj["parse"]["USE"]["value"];
      } else if (obj["parse"]["FUNCTION"]) {
        obj["parse"]["value"] = "FUNCTION";
      } else if (obj["parse"]["OPERATOR"]) {
        obj["parse"]["value"] = "OPERATOR";
      } else if (obj["parse"]["PRIMITIVE"]) {
        obj["parse"]["value"] = "PRIMITIVE";
      } else if (obj["parse"]["PARSING"]) {
        obj["parse"]["value"] = "PARSING";
      } else {
        //console.log(obj);
        return;
      }
    }

    var index = obj["parse"]["value"];

    for (let char of index) {
      // FIXME: Once we can type `char` as `string`, fix the type gymnastics
      const key = char.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(current, key)) {
        current[key as keyof typeof current] = {};
      }
      current = (current as any)[key]!;
    }
    if (!current.value) {
      current.value = { value: index, pureIndex: [], subIndex: [] };
    }

    if (obj["parse"]["SUBINDEX"]) {
      if (obj["parse"]["SUBINDEX"]["value"] === undefined) {
        if (obj["parse"]["SUBINDEX"]["DECLARATION"]) {
          obj["parse"]["SUBINDEX"]["value"] =
            obj["parse"]["SUBINDEX"]["DECLARATION"]["value"];
        } else if (obj["parse"]["SUBINDEX"]["ORDER"]) {
          obj["parse"]["SUBINDEX"]["value"] =
            obj["parse"]["SUBINDEX"]["ORDER"]["value"];
        } else if (obj["parse"]["SUBINDEX"]["JAVASCRIPTINLINE"]) {
          obj["parse"]["SUBINDEX"]["value"] =
            obj["parse"]["SUBINDEX"]["JAVASCRIPTINLINE"]["value"];
        } else if (obj["parse"]["SUBINDEX"]["USE"]) {
          obj["parse"]["SUBINDEX"]["value"] =
            obj["parse"]["SUBINDEX"]["USE"]["value"];
        } else if (obj["parse"]["SUBINDEX"]["SPLITINLINE"]) {
          obj["parse"]["SUBINDEX"]["value"] =
            obj["parse"]["SUBINDEX"]["SPLITINLINE"]["value"];
        } else {
          current.value.pureIndex.push(obj["parentId"]);
        }
      }
      if (obj["parse"]["SUBINDEX"]["value"] === undefined) {
        //console.log(obj);
        return;
      }

      let toAdd = {};
      toAdd["value"] = obj["parse"]["SUBINDEX"]["value"];
      toAdd["id"] = obj["parentId"];

      if (obj["parse"]["ORDER"]) {
        toAdd["order"] = obj["parse"]["ORDER"]["value"];
      } else {
        toAdd["order"] = obj["parse"]["SUBINDEX"]["value"];
      }
      // TODO: Use type guard instead
      const _current = current as { value: TrieEnd };
      if (
        !_current.value.subIndex.find(
          obj =>
            obj.value === toAdd.value &&
            obj.id[0] === toAdd.id[0] &&
            obj.id[1] === toAdd.id[1]
        )
      ) {
        _current.value.subIndex.push(toAdd);
        for (let i = 0; i < _current.value.subIndex.length; i++) {
          //console.log(current.value.subIndex[i]["order"].toString.localeCompare("gh"));
          _current.value.subIndex.sort((a, b) =>
            a["order"].localeCompare(b.order)
          );
        }
      }
    } else {
      // TODO: Use type guard instead
      const _current = current as { value: TrieEnd };
      _current.value.pureIndex.push(obj["parentId"]);
    }
  }
  let len = index.length;
  let j = 0;
  for (let i = 0; i < len; i++) {
    if (index[i]["Exercise"] == true) {
      index[i]["parentId"][1] = globalExerciseID[j];
      if (j >= globalExerciseID.length) {
        //reportErrors();
      }
      //console.log(globalExerciseID[j] + "   " + globalExerciseID + "  " + j )
      j++;
    }
  }
  /*
    if(j!=globalExerciseID.length) {
     reportErrors();
    } */
  //index.push(globalExerciseID);
  //arr.push(index);
  const len2 = index.length;
  for (let i = 0; i < len; i++) {
    add(index[i], trieTree);
  }
  index = [];
  sectionExerciseIndexCount = 0;
  globalExerciseID = [];
  sectionExerciseArrayIndex = [];
}

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

  SIGNATURE: (node, obj) => processTextFunctions["EPIGRAPH"](node, obj),

  EPIGRAPH: (node, obj) => {
    processEpigraphJson(node, obj);
  },

  BLOCKQUOTE: (node, obj) => {
    processEpigraphJson(node, obj);
  },

  EXERCISE: (node, obj) => {
    exercise_count += 1;
    processExerciseJson(node, obj, chapArrIndex, exercise_count);
    let id = obj["id"];
    addExerciseIds(node, id);
    function addExerciseIds(node, id) {
      if (node.nodeName == "#text") {
        return;
      }
      if (node.nodeName == "INDEX") {
        globalExerciseID.push(id);
        return;
      }
      if (node.nodeName == "Exercise") {
        return;
      }
      if (tagsToRemove.has(node.nodeName)) {
        return;
      }
      var childs = node.childNodes;
      if (childs == null) {
        return;
      }
      var len = childs.length;
      for (let i = 0; i < len; i++) {
        let c = childs[i];
        addExerciseIds(c, id);
      }
    }
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
    obj["href"] =
      `/sicpjs/${chapterIndex}#footnote-link-${display_footnote_count}`;

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
    if (
      node.firstChild &&
      node.firstChild.data &&
      node.firstChild.data.search("@") >= 0
    ) {
      node.firstChild.data = node.firstChild.data.replace(/_@/g, "_");
      node.firstChild.nodeValue = node.firstChild.nodeValue.replace(/_@/g, "_");
    }

    const writeTo = [];
    recursiveProcessPureText(node.firstChild, writeTo, {
      removeNewline: "all"
    });

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

      // Test for underscores within /texttt{}
      const regexp = /\\texttt{[a-zA-Z]+_[a-zA-Z_]+}/g;
      const matches = [...obj["body"].matchAll(regexp)];
      if (matches.length) {
        for (const match of matches) {
          const matchStr = match[0].toString();
          const newStr = matchStr.replace(/_/g, "\\_");
          obj["body"] = obj["body"].replace(matchStr, newStr);
        }
      }

      return;
    }

    snippet_count += 1;
    addBodyToObj(obj, node, false);
    obj["latex"] = false;
    obj["id"] = snippet_count;
    processSnippetJson(node, obj);
  },
  INDEX: (node, obj) => {
    var tem = {};
    var parse = {};
    tem["Exercise"] = false;
    tem["parentId"] = [globalTitle, generateID(node, tem)];
    tem["parse"] = parse;
    generateValue(node, parse);
    index.push(tem);
    function generateID(node, tem) {
      if (!node.parentNode) {
        //console.log(node);
        return;
      }
      var n = node.parentNode.nodeName;
      if (n == "DISPLAYFOOTNOTE") {
        return `#footnote-${display_footnote_count}`;
      } else if (n == "SUBSECTION") {
        return `#sec${chapterIndex}.${subsubsection_count}`;
      } else if (n == "EXERCISE") {
        sectionExerciseIndexCount++;
        tem["Exercise"] = true;
        return sectionExerciseIndexCount - 1;
      } else if (n == "TEXT") {
        return "#p" + paragraph_count;
      } else if (n == "SUBSUBSECTION") {
        return `#sec${chapterIndex}.${subsubsection_count}`;
      } else if (n == "SECTION") {
        return `#h${heading_count}`;
      } else if (n == "EPIGRAPH") {
        return "EPIGRAPH";
      } else {
        //console.log(n + "and the new type of the parentNode is" +node.parentNode.parentNode.nodeName );
        return generateID(node.parentNode, tem);
      }
    }
    function generateValue(node, ob) {
      if (node.nodeName == "#text") {
        ob["value"] = node.nodeValue;
        return;
      }
      if (node.nodeValue && node.nodeValue != "#text") {
        //console.log(node.nodeName);
        ob["value"] = node.nodeValue;
        return;
      }

      var childs = node.childNodes;
      const len = childs.length;
      for (let i = 0; i < len; i++) {
        var c = childs[i];
        if (c.nodeName == "#text") {
          if (!ob["value"]) {
            ob["value"] = "";
          }
          ob["value"] += c.nodeValue;
          continue;
        }
        ob[c.nodeName] = {};
        generateValue(c, ob[c.nodeName]);
      }
    }
  } /*

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
  },*/,

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
    const createDoubleQuotationMark = () => ({
      body: '"',
      tag: "#text"
    });

    const createSingleQuotationMark = () => ({
      body: "'",
      tag: "#text"
    });

    recursiveProcessTextJson(node.firstChild, obj);

    if (ancestorHasTag(node, "QUOTE")) {
      obj["child"].unshift(createSingleQuotationMark());
      obj["child"].push(createSingleQuotationMark());
    } else {
      obj["child"].unshift(createDoubleQuotationMark());
      obj["child"].push(createDoubleQuotationMark());
    }
  },

  SECTION: (node, obj) => {
    heading_count += 1;
    addBodyToObj(obj, node, false);
    obj["tag"] = "SUBHEADING";
    obj["id"] = `#h${heading_count}`;
    const name = {};
    obj["child"] = [name];

    processTextJson(getChildrenByTagName(node, "NAME")[0], name);
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
  //console.log("WARNING Unrecognised Tag:\n" + node.toString() + "\n");
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

var c = 0;
export const generateSearchData = (doc, filename) => {
  const arr = [];

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
  console.log(
    `${chapArrIndex} parsing search data for chapter ${chapterIndex}`
  );

  // Add section title
  const title = {
    id: `/sicpjs/${chapterIndex}`,
    tag: "TITLE",
    body: displayTitle.trim()
  };
  globalTitle = `/sicpjs/${chapterIndex}`;
  //globaleE = chapArrIndex.charAt(0);
  arr.push(title);

  const name = getChildrenByTagName(doc.documentElement, "NAME")[0];

  if (chapterIndex == "prefaces96") {
    const sections = getChildrenByTagName(doc.documentElement, "SECTION");

    const preface96Title = {};
    processTextJson(sections[0], preface96Title);
    const preface96 = [];
    recursiveProcessTextJson(
      getChildrenByTagName(sections[0], "NAME")[0].nextSibling,
      preface96,
      title
    );

    const preface84Title = {};
    processTextJson(sections[1], preface84Title);
    const preface84 = [];
    recursiveProcessTextJson(sections[1].nextSibling, preface84, title);

    arr.push(preface96Title);
    for (let i = 0; i < preface96.length; i++) {
      arr.push(preface96[i]);
    }
    arr.push(preface84Title);
    console.log(preface84.length);
    for (let i = 0; i < preface84.length; i++) {
      arr.push(preface84[i]);
    }
  } else if (name) {
    recursiveProcessTextJson(name.nextSibling, arr, title);
    maintainIndexTrie();
    maintainTextTrie(arr);
    if (chapterIndex == "making-of") {
      writeSearchData();
    }
  }
};
