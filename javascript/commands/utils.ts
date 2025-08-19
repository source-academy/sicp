import fs from "node:fs";
import fse from "fs-extra";
import path from "node:path";
import { ending, frontmatter, preamble } from "../latexContent.js";

const __dirname = path.resolve(import.meta.dirname);

export const createMain = (
  inputDir: string,
  outputDir: string,
  parseType: string
) => {
  // TODO: Use fs-extra to auto create subfolders
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
  // FIXME: Remove any
  const chaptersFound: any[] = [];
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

const latexmkrcContent = `$pdflatex = "xelatex %O %S";
$pdf_mode = 1;
$dvi_mode = 0;
$postscript_mode = 0;`;
