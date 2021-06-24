import fs from "fs";
import fse from "fs-extra";
import util from "util";
import path from "path";

import { DOMParser as dom } from "xmldom";

const readdir = util.promisify(fs.readdir);
const open = util.promisify(fs.open);
const readFile = util.promisify(fs.readFile);

// latex (pdf & epub version)
import {
  switchParseFunctionsLatex,
  recursiveProcessTextLatex
} from "./parseXmlLatex";
import { setupSnippetsPdf } from "./processingFunctions/processSnippetPdf";
import { preamble, epub_preamble, frontmatter, ending } from "./latexContent";
const latexmkrcContent = `$pdflatex = "xelatex %O %S";
$pdf_mode = 1;
$dvi_mode = 0;
$postscript_mode = 0;`;

// html (web version)
import { switchTitle } from "./htmlContent";
import { switchParseFunctionsHtml, parseXmlHtml } from "./parseXmlHtml";
import { setupSnippetsHtml } from "./processingFunctions/processSnippetHtml";
import { setupReferences } from "./processingFunctions/processReferenceHtml";
import { generateTOC, sortTOC, indexHtml } from "./generateTocHtml";
export let allFilepath = [];
export let tableOfContent = {};

// js (javascrirpt programs)
import { parseXmlJs } from "./parseXmlJs";
import { setupSnippetsJs } from "./processingFunctions/processSnippetJs";
import { setupSnippetsEpub } from "./processingFunctions/processSnippetEpub";
import { getAnswers } from "./processingFunctions/processExercisePdf";

// json (for cadet frontend)
import { parseXmlJson } from "./parseXmlJson";
import { setupSnippetsJson } from "./processingFunctions/processSnippetJson";
import { createTocJson } from "./generateTocJson";
import { setupReferencesJson } from "./processingFunctions/processReferenceJson";

let parseType;
let version;
let outputDir; // depends on parseType
const inputDir = path.join(__dirname, "../xml");

const ensureDirectoryExists = (path, cb) => {
  fs.mkdir(path, err => {
    if (err) {
      if (err.code == "EEXIST") cb(null);
      // ignore the error if the folder already exists
      else cb(err); // something else went wrong
    } else cb(null); // successfully created folder
  });
};

async function translateXml(filepath, filename, option) {
  const fullFilepath = path.join(inputDir, filepath, filename);
  const fileToRead = await open(fullFilepath, "r");
  // if (err) {
  //   console.log(err);
  //   return;
  // }
  const data = await readFile(fileToRead, { encoding: "utf-8" });
  // if (err) {
  //   console.log(err);
  //   return;
  // }
  const doc = new dom().parseFromString(data);
  const writeTo = [];

  if (parseType == "pdf" || parseType == "epub") {
    if (option == "setupSnippet") {
      setupSnippetsPdf(doc.documentElement);
      setupSnippetsEpub(doc.documentElement);
      return;
    }
    console.log(path.join(filepath, filename));
    // parsing over here
    recursiveProcessTextLatex(doc.documentElement, writeTo);

    ensureDirectoryExists(path.join(outputDir, filepath), err => {
      if (err) {
        console.log(err);
        return;
      }
      const outputFile = path.join(
        outputDir,
        filepath,
        filename.replace(/\.xml$/, "") + ".tex"
      );
      const stream = fs.createWriteStream(outputFile);
      stream.once("open", fd => {
        stream.write(writeTo.join(""));
        stream.end();
      });
    });
    return;
  }

  if (parseType == "web") {
    const relativeFilePath = path.join(
      filepath,
      filename.replace(/\.xml$/, "") + ".html"
    );

    if (option == "generateTOC") {
      generateTOC(doc, tableOfContent, relativeFilePath);
      return;
    } else if (option == "setupSnippet") {
      //console.log("setting up " + filepath + " " + filename);
      setupSnippetsHtml(doc.documentElement);
      setupReferences(doc.documentElement, relativeFilePath);
      return;
    } else if (option == "parseXml") {
      // parsing over here
      parseXmlHtml(doc, writeTo, relativeFilePath);

      const outputFile = path.join(
        outputDir,
        "/chapters",
        tableOfContent[relativeFilePath].index + ".html"
      );
      const stream = fs.createWriteStream(outputFile);
      stream.once("open", fd => {
        stream.write(writeTo.join(""));
        stream.end();
      });
    }
    return;
  }

  if (parseType == "js") {
    if (option == "setupSnippet") {
      setupSnippetsJs(doc.documentElement);
      return;
    }
    console.log(path.join(filepath, filename));

    const relativeFileDir = path.join(
      outputDir,
      filepath,
      filename.replace(/\.xml$/, "") + ""
    );
    ensureDirectoryExists(path.join(outputDir, filepath), err => {});
    ensureDirectoryExists(relativeFileDir, err => {
      if (err) {
        //console.log(err);
        return;
      }
      parseXmlJs(doc, writeTo, relativeFileDir);
    });
    return;
  }

  if (parseType == "json") {
    const relativeFilePath = path.join(
      filepath,
      filename.replace(/\.xml$/, "") + ".html"
    );

    if (option == "generateTOC") {
      generateTOC(doc, tableOfContent, relativeFilePath);
      return;
    } else if (option == "setupSnippet") {
      setupSnippetsJson(doc.documentElement);
      setupReferencesJson(doc.documentElement, relativeFilePath);
      return;
    } else if (option == "parseXml") {
      const jsonObj = [];
      parseXmlJson(doc, jsonObj, relativeFilePath);

      const outputFile = path.join(
        outputDir,
        tableOfContent[relativeFilePath].index + ".json"
      );
      const stream = fs.createWriteStream(outputFile);
      stream.once("open", fd => {
        stream.write(JSON.stringify(jsonObj));
        stream.end();
      });
    }
    return;
  }
}

// for web version only
// process files according to allFilepath order after sorting
async function recursiveXmlToHtmlInOrder(option) {
  for (let i = 0; i < allFilepath.length; i++) {
    const xmlfilepath = allFilepath[i].replace(/\.html$/, "") + ".xml";
    // split the filepath and filename
    const filepath = xmlfilepath.match(/(.*)[\/\\](.*)/)[1];
    const file = xmlfilepath.match(/(.*)[\/\\](.*)/)[2];
    //console.log(i + " " + xmlfilepath + "add to promises\n");
    await translateXml(filepath, file, option);
  }
}

async function recursiveTranslateXml(filepath, option) {
  let files;
  const fullPath = path.join(inputDir, filepath);
  files = await readdir(fullPath);
  const promises = [];
  files.forEach(file => {
    if (file.match(/\.xml$/)) {
      // console.log(file + " being processed");
      if (
        (parseType == "web" || parseType == "json") &&
        file.match(/indexpreface/)
      ) {
        // remove index section for web textbook
      } else {
        if (option == "generateTOC") {
          allFilepath.push(
            path.join(filepath, file.replace(/\.xml$/, "") + ".html")
          );
        }
        promises.push(translateXml(filepath, file, option));
      }
    } else if (fs.lstatSync(path.join(fullPath, file)).isDirectory()) {
      promises.push(recursiveTranslateXml(path.join(filepath, file), option));
    }
  });
  await Promise.all(promises);
}

// create index.html content
// (to recreate non-split Mobile-friendly Web Edition: remove conditional)
const createIndexHtml = version => {
  const indexFilepath = path.join(outputDir, "index.html");
  const writeToIndex = [];
  indexHtml(writeToIndex);
  const stream = fs.createWriteStream(indexFilepath);
  stream.once("open", fd => {
    if (version === "split") {
      stream.write(writeToIndex.join(""));
    } else {
      stream.write(
        `<!doctype html><html lang="en"><body><A HREF="https://sourceacademy.org/sicpjs">Go to the new <B>Interactive SICP</B></A><br/><br/><A HREF="oldindex.html">...or go to the old Mobile-friendly Web Edition</A></body></html>`
      );
      const oldIndexFilepath = path.join(outputDir, "oldindex.html");
      const oldStream = fs.createWriteStream(oldIndexFilepath);
      oldStream.write(writeToIndex.join(""));
    }
    stream.end();
  });
};

const createMain = () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  if (parseType == "js" || parseType == "json") {
    return;
  }

  if (parseType == "web") {
    if (!fs.existsSync(path.join(outputDir, "/chapters"))) {
      fs.mkdirSync(path.join(outputDir, "/chapters"));
    }
    fse.copy(path.join(__dirname, "/../static"), outputDir, err => {
      if (err) return console.error(err);
    });
    return;
  }

  // for latex version only
  // create sicpjs.tex file
  const chaptersFound = [];
  const files = fs.readdirSync(inputDir);
  files.forEach(file => {
    if (file.match(/chapter/)) {
      chaptersFound.push(file);
    }
  });
  const stream = fs.createWriteStream(path.join(outputDir, "sicpjs.tex"));
  stream.once("open", fd => {
    stream.write(preamble);
    stream.write(frontmatter);
    if (parseType == "epub") {
      stream.write(epub_preamble);
    }
    chaptersFound.forEach(chapter => {
      const pathStr = "./" + chapter + "/" + chapter + ".tex";
      stream.write("\\input{" + pathStr + "}\n");
    });
    stream.write(ending);
    stream.end();
  });
  // makes the .latexmkrc file
  const latexmkrcStream = fs.createWriteStream(
    path.join(outputDir, ".latexmkrc")
  );
  latexmkrcStream.once("open", fd => {
    latexmkrcStream.write(latexmkrcContent);
    latexmkrcStream.end();
  });
};

async function main() {
  parseType = process.argv[2];
  if (parseType == "pdf" || parseType == "epub") {
    if (parseType == "pdf") {
      outputDir = path.join(__dirname, "../latex_pdf");
    }
    if (parseType == "epub") {
      outputDir = path.join(__dirname, "../latex_epub");
    }

    switchParseFunctionsLatex(parseType);
    createMain();

    console.log("setup snippets\n");
    await recursiveTranslateXml("", "setupSnippet");
    console.log("setup snippets done\n");

    await recursiveTranslateXml("", "parseXml");

    // Dump all the answers somewhere
    // This must be called efter the recursiveTranslateXml has collected all the answers
    const answerStream = fs.createWriteStream(
      path.join(outputDir, "answers.tex")
    );
    answerStream.once("open", fd => {
      answerStream.write(getAnswers().join("\n\n%-----\n\n"));
      answerStream.end();
    });
  } else if (parseType == "web") {
    version = process.argv[3];

    if (!version) {
      version = "js";
      outputDir = path.join(__dirname, "../html_js");
    } else if (version == "split") {
      outputDir = path.join(__dirname, "../html_split");
    } else if (version == "scheme") {
      outputDir = path.join(__dirname, "../html_scheme");
    }

    switchParseFunctionsHtml(version);
    switchTitle(version);
    createMain();

    console.log("\ngenerate table of content\n");
    await recursiveTranslateXml("", "generateTOC");
    allFilepath = sortTOC(allFilepath);
    console.log(tableOfContent);
    //console.log(allFilepath);
    //console.log(allFilepath.slice(50));
    createIndexHtml(version);

    console.log("setup snippets and references\n");
    await recursiveXmlToHtmlInOrder("setupSnippet");
    //console.log(referenceStore);
    console.log("setup snippets and references done\n");

    recursiveXmlToHtmlInOrder("parseXml");
  } else if (parseType == "js") {
    outputDir = path.join(__dirname, "../js_programs");

    createMain();
    console.log("setup snippets\n");
    await recursiveTranslateXml("", "setupSnippet");
    console.log("setup snippets done\n");
    recursiveTranslateXml("", "parseXml");
  } else if (parseType == "json") {
    outputDir = path.join(__dirname, "../json");

    createMain();

    console.log("\ngenerate table of content\n");
    await recursiveTranslateXml("", "generateTOC");
    allFilepath = sortTOC(allFilepath);
    createTocJson(outputDir);

    console.log("setup snippets and references\n");
    await recursiveXmlToHtmlInOrder("setupSnippet");
    console.log("setup snippets and references done\n");

    recursiveXmlToHtmlInOrder("parseXml");
  }
}

main();
