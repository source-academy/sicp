import { adapters, adapters_with, authors, authors_with } from "constants";

const title = `\\begin{titlepage}
  \\centering
  \\includegraphics[width=0.6\\textwidth]{./sicp.png}\\par
  {\\LARGE\\bfseries Structure and Interpretation of Computer\\\\
  Programs — JavaScript Adaptation\\par}
  \\vspace{0.5cm}
  \\begin{flushright}
  {\\Large Martin Henz and Tobias Wrigstad \\\\}
  {\\large with Chan Ger Hean, He Xinyue, Liu Hang, \\\\ Feng Piaopiao, Jolyn Tan and Wang Qian \\\\
   — \\textit{adapters to JavaScript}\\par}
  \\vspace{0.5cm}
  {\\large \\textit{original textbook by} \\\\}
  {\\Large Harold Abelson and Gerald Jay Sussman \\\\}
  {\\large with Julie Sussman \\par}
  \\end{flushright}

  \\vspace{0.2cm}
  {This work is licensed under a \\href{https://creativecommons.org/licenses/by-nc-sa/4.0/}{Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License}.}

  \\vspace{0.1cm}
{All JavaScript programs in this work are licensed under the \\href{https://www.gnu.org/licenses/gpl-3.0.en.html}{GNU General Public License Version 3}.}

  \\vspace{0.1cm}
  {The final version of this work will be published by The MIT Press under a \\href{https://creativecommons.org/licenses/by-nc-sa/4.0/}{Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License}.}

\\end{titlepage}
`;

export const preamble = `\\documentclass[a4paper, 12pt]{report}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\DeclareUnicodeCharacter{1F00}{-}
\\usepackage{libertine}
\\usepackage[libertine]{newtxmath}
\\usepackage[mono,extrasp=0em,scale=0.95]{inconsolata}
\\usepackage[sf,bf,big,raggedright,nobottomtitles]{titlesec}
\\usepackage[british]{babel}
\\usepackage[multidot]{grffile}
\\usepackage[activate={true,nocompatibility},final,tracking=true,kerning=true,spacing=true,factor=1100,stretch=10,shrink=10]{microtype}

\\usepackage{adjustbox}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{cprotect}
\\usepackage{csquotes}
\\usepackage[shortlabels]{enumitem}
\\setlist{label={--}}
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
\\graphicspath{ {../static/} }

\\usepackage[answerdelayed]{exercise}
\\newcounter{ExerciseDisplayNumber}[chapter]
\\renewcommand{\\theExercise}{\\thechapter.\\arabic{ExerciseDisplayNumber}}
\\addtolength{\\ExerciseSkipBefore}{1em}

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
  columns=fixed,
  sensitive=true
}

\\lstset{
   language=JavaScript,
   basicstyle=\\linespread{1.0}\\ttfamily,
   showstringspaces=false,
   showspaces=false,
   escapechar=^
}

\\usepackage[svgnames]{xcolor}
\\definecolor{LeftBarClickable}{RGB}{187, 187, 187}

\\lstdefinestyle{JavaScript}{
   language=JavaScript,
   basicstyle=\\linespread{1.0}\\ttfamily,
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstnewenvironment{JavaScript}{\\lstset{style=JavaScript}}{}
\\lstnewenvironment{JavaScriptClickable}{\\lstset{style=JavaScript,frame=leftline,escapeinside={/*!}{!*/}}}{}
\\lstdefinestyle{JavaScriptOutput}{
   language=JavaScript,
   basicstyle=\\linespread{1.0}\\slshape,
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstnewenvironment{JavaScriptOutput}{\\lstset{style=JavaScriptOutput}}{}

\\usepackage{epigraph}
\\setlength\\epigraphwidth{11cm}
\\setlength\\epigraphrule{0pt}

\\usepackage[colorlinks=true, urlcolor=blue, linkcolor=blue, citecolor=blue]{hyperref}

\\newcommand{\\lt}{\\ensuremath{<}}% Less than
\\newcommand{\\gt}{\\ensuremath{>}}% Greater than

\\hyphenation{Solution}

\\newsavebox\\lstbox

\\makeindex

\\begin{document}

${title}

\\begin{singlespace}
{\\hypersetup{linkcolor=black}
\\tableofcontents{}
}
\\end{singlespace}

\\input{./others/02foreword02.tex}

\\input{./others/03prefaces03.tex}

\\input{./others/04acknowledgements04.tex}

`;

export const ending = `
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
