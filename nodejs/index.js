import fs from "fs";
import path from "path";

import xpath from "xpath";
import { DOMParser as dom } from "xmldom";

import parseXML from "./parseXML.js";
import { setupSnippets } from './processSnippet';

const inputDir = path.join(__dirname, "../xml");
const outputDir = path.join(__dirname, "../latex");

const preamble = `\\documentclass[a4paper, 12pt]{report}
\\usepackage{adjustbox}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{cprotect}
\\usepackage{csquotes}
\\usepackage[shortlabels]{enumitem}
\\usepackage{etoolbox}
\\usepackage{float}
\\usepackage[margin=2.54cm]{geometry}
\\usepackage{imakeidx}
\\usepackage{subcaption}
\\usepackage{underscore}

\\usepackage{setspace}
\\onehalfspacing

\\setlength{\\parskip}{0.5em}
\\setlength{\\parindent}{0pt}%

\\usepackage{titleps}
\\newpagestyle{main}{
  \\setheadrule{0pt}
  \\sethead{\\chaptertitle}
    {} 
    {\\thechapter}
  \\setfoot{}{\\thepage}{}
}
\\newpagestyle{section}{
  \\setheadrule{0pt}
  \\sethead{\\chaptertitle}
    {} 
    {\\thesection}
  \\setfoot{}{\\thepage}{}
}
\\newpagestyle{subsection}{
  \\setheadrule{0pt}
  \\sethead{\\chaptertitle}
    {} 
    {\\thesubsection}
  \\setfoot{}{\\thepage}{}
}

\\usepackage{graphicx}
\\graphicspath{ {../rails/public/chapters/} }

\\usepackage[answerdelayed]{exercise}
\\renewcounter{Exercise}[chapter]
\\renewcommand{\\theExercise}{\\thechapter.\\arabic{Exercise}}

\\usepackage{listings}
\\expandafter\\patchcmd\\csname \\string\\lstinline\\endcsname{%
  \\leavevmode
  \\bgroup
}{%
  \\leavevmode
  \\ifmmode\\hbox\\fi
  \\bgroup
}{}{%
  \\typeout{Patching of \\string\\lstinline\\space failed!}%
}

\\lstdefinelanguage{JavaScript}{
  keywords={const, let, break, case, catch, continue, debugger, default, delete, do, else, finally, for, function, if, in, instanceof, new, return, switch, this, throw, try, typeof, var, void, while, with},
  morecomment=[l]{//},
  morecomment=[s]{/*}{*/},
  morestring=[b]',
  morestring=[b]",
  sensitive=true
}

\\lstset{
   language=JavaScript,
   basicstyle=\\ttfamily,
   showstringspaces=false,
   showspaces=false,
   escapeinside={/*!}{!*/}
}

\\usepackage{epigraph}
\\setlength\\epigraphwidth{11cm}
\\setlength\\epigraphrule{0pt}

\\usepackage[colorlinks=true, urlcolor=blue, linkcolor=blue, citecolor=blue]{hyperref}

\\newcommand{\\lt}{\\symbol{"3C}}% Less than
\\newcommand{\\gt}{\\symbol{"3E}}% Greater than

\\newsavebox\\lstbox

\\makeindex

\\begin{document}

\\input{./others/00pdftitle00.tex}

\\begin{singlespace}
{\\hypersetup{linkcolor=black}
\\tableofcontents{}
}
\\end{singlespace}

\\input{./others/02foreword02.tex}

\\input{./others/03prefaces03.tex}

\\input{./others/04acknowledgements04.tex}

`;

const ending = `
\\pagestyle{plain}

\\addcontentsline{toc}{chapter}{List Of Exercises}
\\listofexercises

\\chapter*{Solution To Exercises}
\\addcontentsline{toc}{chapter}{Solution To Exercises}
\\shipoutAnswer

\\input{./others/97references97.tex}

\\addcontentsline{toc}{chapter}{Index}
\\indexprologue{\\input{./others/98indexpreface98.tex}}
\\printindex

\\input{./others/99making99.tex}

\\end{document}`;

const latexmkrcContent = `$pdflatex = "xelatex %O %S";
$pdf_mode = 1;
$dvi_mode = 0;
$postscript_mode = 0;`;

const ensureDirectoryExists = (path, cb) => {
  fs.mkdir(path, err => {
    if (err) {
      if (err.code == "EEXIST") cb(null);
      // ignore the error if the folder already exists
      else cb(err); // something else went wrong
    } else cb(null); // successfully created folder
  });
};

const xmlToLatex = (filepath, filename) => {
  const fullFilepath = path.join(inputDir, filepath, filename);
  fs.open(fullFilepath, "r", (err, fileToRead) => {
    if (err) {
      console.log(err);
      return;
    }
    fs.readFile(fileToRead, { encoding: "utf-8" }, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const doc = new dom().parseFromString(data);
      const writeTo = [];

      console.log(path.join(filepath, filename));

      // parsing over here
      setupSnippets(doc.documentElement);
      parseXML(doc.documentElement, writeTo);

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
    });
  });
};

const recursiveXmlToLatex = filepath => {
  const fullPath = path.join(inputDir, filepath);
  fs.readdir(fullPath, (err, files) => {
    files.forEach(file => {
      if (file.match(/\.xml$/)) {
        // console.log(file + " being processed");
        xmlToLatex(filepath, file);
      } else if (fs.lstatSync(path.join(fullPath, file)).isDirectory()) {
        recursiveXmlToLatex(path.join(filepath, file));
      }
    });
  });
};

const createMainLatex = () => {
  const chaptersFound = [];
  const files = fs.readdirSync(inputDir);
  files.forEach(file => {
    if (file.match(/chapter/)) {
      chaptersFound.push(file);
    }
  });
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const stream = fs.createWriteStream(path.join(outputDir, "sicpjs.tex"));
  stream.once("open", fd => {
    stream.write(preamble);
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

const main = () => {
  createMainLatex();
  recursiveXmlToLatex("");
};

main();
