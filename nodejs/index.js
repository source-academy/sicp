const fs = require('fs');
const path = require('path');

const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

import parseXML from './parseXML.js'; 

const inputDir = path.join(__dirname, '../xml');
const outputDir = path.join(__dirname, '../latex');

const preamble = `\\documentclass{report}

\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{cprotect}
\\usepackage{csquotes}
\\usepackage{epigraph}
\\usepackage{etoolbox}
\\usepackage{graphicx}
\\usepackage{listings}
\\usepackage{makeidx}
\\usepackage{subcaption}
\\usepackage{underscore}

\\graphicspath{ {../rails/public/chapters/} }

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
  keywords={const, break, case, catch, continue, debugger, default, delete, do, else, finally, for, function, if, in, instanceof, new, return, switch, this, throw, try, typeof, var, void, while, with},
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
   escapechar={^}
}

\\newcommand{\\lt}{\\symbol{"3C}}% Less than
\\newcommand{\\gt}{\\symbol{"3E}}% Greater than

\\setlength\\epigraphwidth{11cm}
\\setlength\\epigraphrule{0pt}

\\makeindex

\\begin{document}\n`;

const ending = `\n\\printindex\n
\\end{document}`;

const ensureDirectoryExists = (path, cb) => {
  fs.mkdir(path, (err) => {
    if (err) {
      if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
      else cb(err); // something else went wrong
    } else cb(null); // successfully created folder
  });
}

const xmlToLatex = (filepath, filename) => {
  const fullFilepath = path.join(inputDir, filepath, filename);
  fs.open(fullFilepath, 'r', (err, fileToRead) => {
    if (err) {
      console.log(err);
      return;
    }
    fs.readFile(fileToRead, {encoding: 'utf-8'}, (err,data) => {
      if (err) {
        console.log(err);
        return;
      }
      const doc = new dom().parseFromString(data);
      const writeTo = [];

      parseXML(doc.documentElement, writeTo);
      ensureDirectoryExists(path.join(outputDir, filepath), (err) => {
        if (err) {
          console.log(err);
          return;
        }
				const outputFile = path.join(outputDir, filepath, filename.replace(/\.xml$/, '') + '.tex');
        const stream = fs.createWriteStream(outputFile);
        stream.once('open', (fd) => {
				  stream.write(writeTo.join(""));
				  stream.end();
				});
      });
    });
  });
}

const recursiveXmlToLatex = (filepath) => {
  const fullPath = path.join(inputDir, filepath);
  fs.readdir(fullPath, (err, files) => {
    files.forEach(file => {
      if (file.match(/\.xml$/)) {
        // console.log(file + " being processed");
        xmlToLatex(filepath, file);
      } 
      else if (fs.lstatSync(path.join(fullPath, file)).isDirectory()){
        recursiveXmlToLatex(path.join(filepath, file));
      }
    });
  });
}

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
  const stream = fs.createWriteStream(path.join(outputDir, "main.tex"));
  stream.once('open', (fd) => {
    stream.write(preamble);
    chaptersFound.forEach(chapter => {
      const pathStr = chapter + "/" + chapter + ".tex";
      stream.write("\\input{" + pathStr + "}\n");
    });
    stream.write(ending);
    stream.end();
  });
}

const main = () => {
  createMainLatex();
  recursiveXmlToLatex('');
}

main();