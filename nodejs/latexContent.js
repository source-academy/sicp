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