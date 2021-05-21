import fs from "fs";
import util from "util";
import path from "path";

import { DOMParser as dom } from "xmldom";

const readdir = util.promisify(fs.readdir);
const open = util.promisify(fs.open);
const readFile = util.promisify(fs.readFile);

const inputDir = path.join(__dirname, "../xml");

const validTags = new Set([
  // symbols
  "APOS",
  "SPACE",
  "WJ",
  "AACUTE_LOWER",
  "AACUTE_UPPER",
  "AGRAVE_LOWER",
  "AGRAVE_UPPER",
  "ACIRC_LOWER",
  "EACUTE_LOWER",
  "EACUTE_UPPER",
  "EGRAVE_LOWER",
  "EGRAVE_UPPER",
  "ECIRC_LOWER",
  "OUML_LOWER",
  "OUML_UPPER",
  "UUML_LOWER",
  "UUML_UPPER",
  "CCEDIL_LOWER",
  "ELLIPSIS",
  "AMP",
  "DOLLAR",
  "SECT",
  "EMDASH",
  "ENDASH",
  "LaTeX",
  "TeX",
  "BREAK",

  // tagsToRemove (skip over when found)
  "#comment",
  "COMMENT",
  "WEB_ONLY",
  "PDF_ONLY",
  "EDIT",
  "EXCLUDE",
  "HISTORY",
  "NAME",
  "EXPECTED",
  "JAVASCRIPT_RUN",
  "JAVASCRIPT_TEST",
  "JAVASCRIPT_OUTPUT",
  "ORDER",
  "SCHEME",
  "SOLUTION",

  // ignoreTags (treat tag as meaningless wrapper)
  "CHAPTERCONTENT",
  "JAVASCRIPT",
  "NOBR",
  "SECTIONCONTENT",
  "span",
  "SPLIT",
  "SPLITINLINE",

  // part of processTextFunctionsDefaultLatex
  "#text",
  "ABOUT",
  "REFERENCES",
  "WEBPREFACE",
  "MATTER",
  "B",
  "BR",
  "BLOCKQUOTE",
  "CHAPTER",
  "CITATION",
  "EM",
  "em", // maybe remove this?
  "EPIGRAPH",
  "EXERCISE",
  "FIGURE",
  "FOOTNOTE",
  "H2",
  "INDEX",
  "IMAGE",
  "LABEL",
  "LINK",
  "LATEX",
  "TREETAB",
  "LATEXINLINE",
  "MATTERSECTION",
  "OL",
  "P",
  "TEXT",
  "QUOTE",
  "REF",
  "REFERENCE",
  "SC",
  "SECTION",
  "SUBSUBSECTION",
  "SCHEMEINLINE",
  "JAVASCRIPTINLINE",
  "SNIPPET",
  "SUBHEADING",
  "SUBINDEX",
  "SUBSECTION",
  "TABLE",
  "TT",
  "UL",

  // Didn't check what these are for
  "SUBSUBSUBSECTION",
  "SCHEMEOUTPUT",
  "CODEINDEX",

  // Processed seperately
  "LI",
  "REQUIRES",
  "EXAMPLE",

  // Epigraph
  "ATTRIBUTION",
  "AUTHOR",
  "TITLE",
  "DATE",

  // image
  "CAPTION",

  // Table
  "TD",
  "TR",
  "tr",
  "td",
  "kbd"
]);

const recursiveCheckChildrenForTagName = (node, tagName) => {
  let child = node.firstChild;
  let found = false;
  while (child) {
    if (child.nodeName === tagName) {
      console.log("Found invalid tag: " + tagName + ".");
      found = true;
    }
    if (recursiveCheckChildrenForTagName(child, tagName)) {
      found = true;
    }

    child = child.nextSibling;
  }
  return found;
};

const recursiveCheckChildrenForValidTag = node => {
  let child = node.firstChild;
  let found = false;
  while (child) {
    if (!validTags.has(child.nodeName)) {
      console.log(child.nodeName + " found.");
      found = true;
    }
    if (recursiveCheckChildrenForValidTag(child)) {
      found = true;
    }

    child = child.nextSibling;
  }
  return found;
};

async function recursiveCheckXmlForTag(filepath, tagName) {
  let files;
  const fullPath = path.join(inputDir, filepath);
  files = await readdir(fullPath);
  const promises = [];

  files.forEach(file => {
    if (file.match(/\.xml$/)) {
      promises.push(checkXmlForTag(filepath, file, tagName));
    } else if (fs.lstatSync(path.join(fullPath, file)).isDirectory()) {
      promises.push(
        recursiveCheckXmlForTag(path.join(filepath, file), tagName)
      );
    }
  });
  await Promise.all(promises);
}

async function checkXmlForTag(filepath, filename, tagName) {
  const fullFilepath = path.join(inputDir, filepath, filename);
  const fileToRead = await open(fullFilepath, "r");

  const data = await readFile(fileToRead, { encoding: "utf-8" });
  const doc = new dom().parseFromString(data);

  let found = false;
  if (tagName == "") {
    found = recursiveCheckChildrenForValidTag(doc.documentElement);
  } else {
    found = recursiveCheckChildrenForTagName(doc.documentElement, tagName);
  }
  if (found) {
    console.log("Found in " + filepath + "\n");
  }
}

async function main() {
  const args = process.argv;
  let tagName = "";
  if (args.length > 2 && args[2] != "") {
    tagName = args[2];
    console.log("\nLooking for tag: " + tagName + "\n");
  } else {
    console.log("\nLooking for all invalid tags.\n");
  }

  recursiveCheckXmlForTag("", tagName);
}

// babel-node ./javascript/findBadTags <tagname>

// Can provide 0 or 1 arguments.
// If no arguments provided, checks for all invalid tags.
// If argument provided, checks for all instances of the provided tag.
main();
