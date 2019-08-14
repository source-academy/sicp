const title = `\\begin{titlepage}
  \\centering
  \\includegraphics[width=0.8\\textwidth]{./sicp.png}\\par
  {\\LARGE\\bfseries Structure and Interpretation of Computer\\\\
  Programs — JavaScript Adaptation\\par}
  \\vspace{0.5cm}
  \\begin{flushright}
  {\\Large Harold Abelson and Gerald Jay Sussman \\\\}
  {\\large with Julie Sussman \\\\ — \\textit{authors} \\par}
  \\vspace{0.5cm}
  {\\Large Martin Henz and Tobias Wrigstad\\\\}
  {\\large with Liu Hang, Feng Piaopiao, Jolyn Tan and Chan Ger Hean \\\\
   — \\textit{adapters to JavaScript}\\par}
  \\end{flushright}
\\end{titlepage}`

export const preamble = `\\documentclass[a4paper, 12pt]{report}
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
\\newcounter{ExerciseDisplayNumber}[chapter]
\\renewcommand{\\theExercise}{\\thechapter.\\arabic{ExerciseDisplayNumber}}

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

\\hyphenation{Solution}

\\newsavebox\\lstbox

\\makeindex

\\title{Structure and Interpretation of Computer Programs,
JavaScript Adaptation}

\\author{Harold Abelson and Gerald Jay Sussman\\\\with Julie Sussman\\\\\\textit{authors}\\\\[20mm]Martin Henz\\\\with Tobias Wrigstad, Liu Hang, Feng Piaopiao and Chan Ger Hean\\\\\\textit{adapters to JavaScript}}

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
