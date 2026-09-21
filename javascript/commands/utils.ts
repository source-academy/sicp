import fs from "node:fs";
import fse from "fs-extra";
import path from "node:path";
import { ending, frontmatter, preamble } from "../latexContent.js";
import { getEdition, getPublishedChapterCount } from "../editions.js";

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

  if (parseType == "programs" || parseType == "json" || parseType == "md") {
    return;
  }

  if (parseType == "web") {
    if (!fs.existsSync(path.join(outputDir, "/chapters"))) {
      fs.mkdirSync(path.join(outputDir, "/chapters"));
    }
    fse.copy(path.join(__dirname, "../../static"), outputDir, err => {
      if (err) return console.error(err);
    });
    return;
  }

  // for latex version only
  // create the root <edition>.tex file (sicpjs.tex / sicpy.tex)
  // FIXME: Remove any
  //
  // Chapters are always brought in with \include (never \input): index.ts
  // now generates every chapter's .tex fragment unconditionally for pdf, and
  // \includeonly below is what actually restricts which ones get typeset in
  // this compile. \include's own mechanism reads every listed chapter's .aux
  // file at the start of a run regardless of \includeonly, so as long as a
  // prior full compile (see scripts/do.sh's shadow pass, gated by
  // SICP_LATEX_INCLUDE_ALL) has produced a chapter's .aux at least once, a
  // forward \ref/\pageref into it keeps resolving to the real number even
  // while that chapter itself is excluded from being printed.
  const includeAllChapters = process.env.SICP_LATEX_INCLUDE_ALL === "1";
  const publishedChapterCount = getPublishedChapterCount();
  const chaptersFound: string[] = [];
  const files = fs.readdirSync(inputDir);
  files.forEach(file => {
    if (file.match(/^chapter(\d+)$/)) {
      chaptersFound.push(file);
    }
  });
  chaptersFound.sort();
  const includedChapters = chaptersFound.filter(chapter => {
    if (includeAllChapters) return true;
    const chapterMatch = chapter.match(/^chapter(\d+)$/)!;
    return Number(chapterMatch[1]) <= publishedChapterCount;
  });

  const stream = fs.createWriteStream(
    path.join(outputDir, getEdition().outputBaseName + ".tex")
  );
  stream.once("open", fd => {
    stream.write(preamble);
    // \includeonly is only legal in the preamble, i.e. before \begin{document}
    // -- which is the first line of `frontmatter` -- so it must be written
    // here, not alongside the \include lines below.
    stream.write(
      "\\includeonly{" +
        includedChapters
          .map(chapter => "./" + chapter + "/" + chapter)
          .join(",") +
        "}\n"
    );
    stream.write(frontmatter);
    chaptersFound.forEach(chapter => {
      const pathStr = "./" + chapter + "/" + chapter;
      stream.write("\\include{" + pathStr + "}\n");
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
