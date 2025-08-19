import fs from "node:fs";
import util from "util";
import path from "path";

import { DOMParser as dom } from "xmldom";

const readdir = util.promisify(fs.readdir);
const open = util.promisify(fs.open);
const readFile = util.promisify(fs.readFile);

// latex (pdf version)
import {
  switchParseFunctionsLatex,
  recursiveProcessTextLatex
} from "./parseXmlLatex.js";
import { setupSnippetsPdf } from "./processingFunctions/processSnippetPdf.js";

// html (comparison version)
import { switchTitle } from "./htmlContent.js";
import { switchParseFunctionsHtml, parseXmlHtml } from "./parseXmlHtml.js";
import { setupSnippetsHtml } from "./processingFunctions/processSnippetHtml.js";
import { setupReferences } from "./processingFunctions/processReferenceHtml.js";
import { generateTOC, sortTOC, indexHtml } from "./generateTocHtml.js";
export let allFilepath = [];
export let tableOfContent = {};

// js (javascript programs)
import { parseXmlJs } from "./parseXmlJs.js";
import { setupSnippetsJs } from "./processingFunctions/processSnippetJs.js";
import { getAnswers } from "./processingFunctions/processExercisePdf.js";

// json (for cadet frontend)
import { testIndexSearch } from "./searchRewriteTest.js";
import { parseXmlJson } from "./parseXmlJson.js";
import { writeRewritedSearchData } from "./searchRewrite.js";
import { setupSnippetsJson } from "./processingFunctions/processSnippetJson.js";
import { createTocJson } from "./generateTocJson.js";
import { setupReferencesJson } from "./processingFunctions/processReferenceJson.js";
import { createMain } from "./commands/utils.js";
import type { WriteBuffer } from "./types.js";

export let parseType;
let version;
let outputDir: string; // depends on parseType

const __dirname = path.resolve(import.meta.dirname);
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

  if (parseType == "pdf") {
    if (option == "setupSnippet") {
      setupSnippetsPdf(doc.documentElement);
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

// for comparison version only
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
  const writeToIndex: WriteBuffer = [];
  indexHtml(writeToIndex);
  const stream = fs.createWriteStream(indexFilepath);
  stream.once("open", fd => {
    stream.write(writeToIndex.join(""));
    stream.end();
  });
};

async function main() {
  parseType = process.argv[2];
  if (parseType == "pdf") {
    outputDir = path.join(__dirname, "../latex_pdf");

    switchParseFunctionsLatex(parseType);
    createMain(inputDir, outputDir, parseType);

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

    if (version == "split") {
      outputDir = path.join(__dirname, "../html_split");
    } else if (version == "scheme") {
      outputDir = path.join(__dirname, "../html_scheme");
    }

    switchParseFunctionsHtml(version);
    switchTitle(version);
    createMain(inputDir, outputDir, parseType);

    console.log("\ngenerate table of content\n");
    await recursiveTranslateXml("", "generateTOC");
    allFilepath = sortTOC(allFilepath);
    //console.log(tableOfContent);
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

    createMain(inputDir, outputDir, parseType);
    console.log("setup snippets\n");
    await recursiveTranslateXml("", "setupSnippet");
    console.log("setup snippets done\n");
    recursiveTranslateXml("", "parseXml");
  } else if (parseType == "json") {
    outputDir = path.join(__dirname, "../json");

    createMain(inputDir, outputDir, parseType);

    console.log("\ngenerate table of content\n");
    await recursiveTranslateXml("", "generateTOC");
    allFilepath = sortTOC(allFilepath);
    createTocJson(outputDir);

    console.log("setup snippets and references\n");
    await recursiveXmlToHtmlInOrder("setupSnippet");
    console.log("setup snippets and references done\n");

    await recursiveXmlToHtmlInOrder("parseXml");
    writeRewritedSearchData();
    // this is meant to be temp; also, will remove the original "generateSearchData" after the updation at the frontend is completed.
    //testIndexSearch();
  }
}

main();
