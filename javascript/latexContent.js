import { adapters, adapters_with, authors, authors_with } from "constants";

const title = `\\begin{titlepage}
  \\centering
\\textbf{Generated: \\DTMnow}\\\\[1em]
  \\includegraphics[width=0.6\\textwidth]{./sicp.png}\\par
  {\\LARGE\\bfseries Structure and Interpretation of Computer
  Programs, Second Edition\\\\}
  {\\LARGE\\bfseries JavaScript Adaptation\\par}
  \\vspace{0.5cm}
  \\begin{flushright}
  {\\Large Harold Abelson and Gerald Jay Sussman \\\\}
  {\\large with Julie Sussman \\par}
  \\vspace{0.5cm}
  {\\textit{adapted to JavaScript by}\\par}
  {\\Large Martin Henz and Tobias Wrigstad \\\\}
  \\end{flushright}

  \\vspace{0.2cm}
  {\\small This work is licensed under a 
\\href{https://creativecommons.org/licenses/by-nc-sa/4.0/}{Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License}.}

  \\vspace{0.1cm}
{\\small All JavaScript programs in this work are licensed under the 
\\href{https://www.gnu.org/licenses/gpl-3.0.en.html}{GNU General Public License Version 3}.}

  \\vspace{0.1cm}
  {\\small The final version of this work will be published by The MIT Press under a 
\\href{https://creativecommons.org/licenses/by-nc-sa/4.0/}{Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License}.}

\\end{titlepage}
\\pagestyle{main}
`;

export const preamble = `
\\documentclass[7x10]{../mitpress/times}

\\usepackage[
  paper=a4paper,
  layoutsize={7in, 10in},
  layoutoffset={15mm, 15mm},
%%
  text={32pc, 49pc},
  footskip=28pt,
  headsep=2pc,
  headheight=12pt,
  inner=5.5pc,
%%
  showcrop=true,
  showframe=false %% Turn on to see all text size boxes
  ]{geometry}

\\raggedbottom

\\usepackage[T1]{fontenc}
\\usepackage{textcomp}
\\usepackage[utf8]{inputenc}
\\DeclareUnicodeCharacter{1F00}{-}
\\usepackage{mathptmx}
%% \\usepackage[bf,big,raggedright,nobottomtitles]{titlesec}
\\usepackage[british]{babel}
\\usepackage[multidot]{grffile}
\\usepackage[activate={true,nocompatibility},final,tracking=true,kerning=true,spacing=false,factor=1100,stretch=10,shrink=10]{microtype}

\\title{Structure and Interpretation of Computer Programs, Second Edition}
\\author{Harold Abelson and Gerald Jay Sussman with Julie Sussman \\newline adapted to JavaScript by Martin Henz and Tobias Wrigstad}

\\usepackage{adjustbox}
\\usepackage{amsmath}
\\usepackage{needspace}
\\usepackage{amssymb}
\\usepackage{cprotect}
\\usepackage{csquotes}
\\usepackage[shortlabels]{enumitem}
\\setlist{noitemsep}
\\setlist[itemize]{leftmargin=1em}
\\setlist[itemize,1]{label={--}}
\\usepackage{etoolbox}
\\usepackage{float}
\\renewcommand{\\topfraction}{0.9}
\\usepackage{imakeidx}
\\usepackage{subcaption}
\\usepackage{underscore}
\\usepackage{datetime2}

\\def\\normalcodesize{\\fontsize{9.8}{11pt}\\selectfont}
\\def\\exercisecodesize{\\fontsize{9}{10pt}\\selectfont}
\\def\\figurecodesize{\\fontsize{8.7}{10pt}\\selectfont}
\\def\\footnotecodesize{\\fontsize{8}{9pt}\\selectfont}

\\usepackage{setspace}
% \\onehalfspacing

\\setlength{\\parskip}{0pt}
\\setlength{\\parindent}{15pt}%

\\setcounter{secnumdepth}{5}

\\usepackage{titleps}
\\newpagestyle{main}{
  \\setheadrule{0pt}
  \\sethead{}{}{}
  \\setfoot{}{\\small\\thepage}{}
}
\\newpagestyle{prefaces}{
  \\setheadrule{0.4pt}
  \\sethead[\\small\\it\\thepage][][\\small\\it Prefaces]
          {\\small\\it Prefaces}{}{\\small\\thepage}
  \\setfoot{}{}{}
}
\\newpagestyle{forewords}{
  \\setheadrule{0.4pt}
  \\sethead[\\small\\it\\thepage][][\\small\\it Forewords]
          {\\small\\it Forewords}{}{\\small\\thepage}
  \\setfoot{}{}{}
}
\\newpagestyle{acknowledgements}{
  \\setheadrule{0.4pt}
  \\sethead[\\small\\it\\thepage][][\\small\\it Acknowledgements]
          {\\small\\it Acknowledgements}{}{\\small\\thepage}
  \\setfoot{}{}{}
}
\\newpagestyle{section}{
  \\setheadrule{0.4pt}
  \\sethead[\\small\\it\\thepage][][\\small\\it\\thesection\\quad\\chaptertitle]
          {\\small\\it\\thesection\\quad\\chaptertitle}{}{\\small\\thepage}
  \\setfoot{}{}{}
}
\\newpagestyle{subsection}{
  \\setheadrule{0.4pt}
  \\sethead[\\small\\it\\thepage][][\\small\\it\\thesubsection\\quad\\chaptertitle]
          {\\small\\it\\thesubsection\\quad\\chaptertitle}{}{\\small\\it\\thepage}
  \\setfoot{}{}{}
}


\\usepackage{graphicx}
\\graphicspath{ {../static/} }

\\usepackage[answerdelayed]{exercise}
\\newcounter{ExerciseDisplayNumber}[chapter]
\\renewcommand{\\theExercise}{\\thechapter.\\arabic{ExerciseDisplayNumber}}
%\\addtolength{\\ExerciseSkipBefore}{1em}
\\addtolength{\\Exelabelsep}{12pt}
\\renewcommand{\\ExerciseHeader}{\\smallskip\\par\\needspace{2\\baselineskip}\\centerline{\\fontsize{8.5}{13}\\usefont{T1}{phv}{b}{n}{\\ExerciseName~\\ExerciseHeaderNB\\ExerciseHeaderTitle \\ExerciseHeaderOrigin}\\smallskip}}

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
  keywords={function,if,else,return,const,let,break,for,while,true,false,var,null}, %% removing continue for now
  %% keywords={const, let, break, case, catch, continue, debugger, default, delete, do, else, finally, for, function, if, in, instanceof, return, switch, this, throw, try, typeof, var, void, while, with},
  morecomment=[l]{//},
  morecomment=[s]{/*}{*/},
  morestring=[b]',
  morestring=[b]",
  columns=fullflexible,
  sensitive=true
}

\\lstset{
   language=JavaScript,
   basicstyle=\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\linespread{1.0}\\usefont{T1}{ptm}{m}{it},
   stringstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{n},
   showstringspaces=false,
   showspaces=false,
   deletekeywords={continue},
   escapechar=^
}

\\newcommand{\\OptionalPar}[2][]{\\ensuremath{\\text{\\textrm{\\sl #2}}_{#1}}}
% mhyphen{} in math mode creates hyphen character (META in parseXmlLatex.js)
\\mathchardef\\mhyphen="2D 

%% \\usepackage[svgnames]{xcolor} %% This line moved into times.cls
\\definecolor{LeftBarClickable}{RGB}{187, 187, 187}

\\lstdefinestyle{JavaScriptLatex}{
   language=JavaScript,
   basicstyle=\\normalcodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\linespread{1.0}\\usefont{T1}{ptm}{m}{it},
   stringstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{n},
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
\\lstnewenvironment{JavaScriptLatex}{\\lstset{style=JavaScriptLatex,aboveskip=2.5ex,belowskip=1.8ex}}{}

\\lstdefinestyle{JavaScriptLatexSmall}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\linespread{1.0}\\usefont{T1}{ptm}{m}{it},
   stringstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{n},
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
\\lstnewenvironment{JavaScriptLatexSmall}{\\lstset{style=JavaScriptLatexSmall,aboveskip=2.5ex,belowskip=1.8ex}}{}

\\lstdefinestyle{JavaScriptLatexFootnote}{
   language=JavaScript,
   basicstyle=\\footnotecodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\linespread{1.0}\\usefont{T1}{ptm}{m}{it},
   stringstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{n},
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
\\lstnewenvironment{JavaScriptLatexFootnote}{\\lstset{style=JavaScriptLatexFootnote,aboveskip=2.5ex,belowskip=1.8ex}}{}

\\lstdefinestyle{JavaScript}{
   language=JavaScript,
   basicstyle=\\normalcodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\linespread{1.0}\\usefont{T1}{ptm}{m}{it},
   stringstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{n},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstnewenvironment{JavaScript}{\\lstset{style=JavaScript,aboveskip=2.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptClickable}{\\lstset{style=JavaScript,frame=leftline,aboveskip=2.5ex,belowskip=1.8ex,escapeinside={/*!}{!*/}}}{}

\\lstdefinestyle{JavaScriptSmall}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\linespread{1.0}\\usefont{T1}{ptm}{m}{it},
   stringstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{n},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstnewenvironment{JavaScriptSmall}{\\lstset{style=JavaScriptSmall,aboveskip=2.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptClickableSmall}{\\lstset{style=JavaScriptSmall,frame=leftline,aboveskip=2.5ex,belowskip=1.8ex,escapeinside={/*!}{!*/}}}{}

\\lstdefinestyle{JavaScriptFootnote}{
   language=JavaScript,
   basicstyle=\\footnotecodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\linespread{1.0}\\usefont{T1}{ptm}{m}{it},
   stringstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{n},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstnewenvironment{JavaScriptFootnote}{\\lstset{style=JavaScriptFootnote,aboveskip=2.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptClickableFootnote}{\\lstset{style=JavaScriptFootnote,frame=leftline,aboveskip=2.5ex,belowskip=1.8ex,escapeinside={/*!}{!*/}}}{}

\\lstdefinestyle{JavaScriptOutput}{
   language=JavaScript,
   basicstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{sl},
%   keywordstyle=\\linespread{1.0}\\fontsize{11}{12}\\usefont{T1}{lmtt}{b}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstdefinestyle{JavaScriptOutputLatex}{
   language=JavaScript,
   basicstyle=\\linespread{1.0}\\usefont{T1}{lmtt}{m}{sl},
%   keywordstyle=\\linespread{1.0}\\fontsize{11}{12}\\usefont{T1}{lmtt}{b}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstnewenvironment{JavaScriptOutput}{\\lstset{style=JavaScriptOutput,aboveskip=-0.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptOutputLatex}{\\lstset{style=JavaScriptOutputLatex,aboveskip=-0.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptPrompt}{\\lstset{style=JavaScriptOutput,aboveskip=2.5ex,belowskip=-3.0ex}}{}
\\lstnewenvironment{JavaScriptPromptLatex}{\\lstset{style=JavaScriptOutputLatex,aboveskip=2.5ex,belowskip=-3.0ex}}{}
\\lstnewenvironment{JavaScriptLonely}{\\lstset{style=JavaScriptOutput,aboveskip=2.5ex,belowskip=2.5ex}}{}
\\lstnewenvironment{JavaScriptLonelyLatex}{\\lstset{style=JavaScriptOutputLatex,aboveskip=2.5ex,belowskip=2.5ex}}{}

\\lstdefinestyle{JavaScriptOutputSmall}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\linespread{1.0}\\usefont{T1}{lmtt}{m}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstdefinestyle{JavaScriptOutputLatexSmall}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\linespread{1.0}\\usefont{T1}{lmtt}{m}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}

\\lstnewenvironment{JavaScriptOutputSmall}{\\lstset{style=JavaScriptOutputSmall,aboveskip=-0.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptOutputLatexSmall}{\\lstset{style=JavaScriptOutputLatexSmall,aboveskip=-0.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptPromptSmall}{\\lstset{style=JavaScriptSmall,aboveskip=2.5ex,belowskip=-3.0ex}}{}
\\lstnewenvironment{JavaScriptPromptLatexSmall}{\\lstset{style=JavaScriptOutputLatexSmall,aboveskip=2.5ex,belowskip=-3.0ex}}{}
\\lstnewenvironment{JavaScriptLonelySmall}{\\lstset{style=JavaScriptOutputSmall,aboveskip=2.5ex,belowskip=2.5ex}}{}
\\lstnewenvironment{JavaScriptLonelyLatexSmall}{\\lstset{style=JavaScriptOutputLatexSmall,aboveskip=2.5ex,belowskip=2.5ex}}{}

\\lstdefinestyle{JavaScriptOutputFootnote}{
   language=JavaScript,
   basicstyle=\\footnotecodesize\\linespread{1.0}\\usefont{T1}{lmtt}{m}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstdefinestyle{JavaScriptOutputLatexFootnote}{
   language=JavaScript,
   basicstyle=\\footnotecodesize\\linespread{1.0}\\usefont{T1}{lmtt}{m}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}

\\lstnewenvironment{JavaScriptOutputFootnote}{\\lstset{style=JavaScriptOutputFootnote,aboveskip=-0.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptOutputLatexFootnote}{\\lstset{style=JavaScriptOutputLatexFootnote,aboveskip=-0.5ex,belowskip=1.8ex}}{}
\\lstnewenvironment{JavaScriptPromptFootnote}{\\lstset{style=JavaScriptOutputFootnote,aboveskip=2.5ex,belowskip=-3.0ex}}{}
\\lstnewenvironment{JavaScriptPromptLatexFootnote}{\\lstset{style=JavaScriptOutputLatexFootnote,aboveskip=2.5ex,belowskip=-3.0ex}}{}
\\lstnewenvironment{JavaScriptLonelyFootnote}{\\lstset{style=JavaScriptOutputFootnote,aboveskip=2.5ex,belowskip=2.5ex}}{}
\\lstnewenvironment{JavaScriptLonelyLatexFootnote}{\\lstset{style=JavaScriptOutputLatexFootnote,aboveskip=2.5ex,belowskip=2.5ex}}{}

\\usepackage{epigraph}
\\renewcommand{\\textflush}{flushepinormal}
% \\makeatletter
% \\newlength\\interepigraphskip
% \\setlength\\interepigraphskip{1ex}
% \\renewcommand\\epigraph[3][\\interepigraphskip]{\\vspace{\\beforeepigraphskip}
%   {\\epigraphsize\\begin{\\epigraphflush}\\begin{minipage}{\\epigraphwidth}
%     \\@epitext{#2}\\\\[#1] \\@episource{#3}
%     \\end{minipage}\\end{\\epigraphflush}
%     \\vspace{\\afterepigraphskip}}}
% \\makeatother
\\setlength\\epigraphwidth{11cm}
\\setlength\\epigraphrule{0pt}

\\usepackage[colorlinks=true, urlcolor=blue, linkcolor=blue, citecolor=blue]{hyperref}

\\usepackage[maxfloats=266]{morefloats}

\\setlength\\marginparwidth{2.3cm}

%\\setlength\\marginparpush{13pt}

\\DeclareRobustCommand{\\indexmarginpar}[1]{%
 \\marginpar[{\\setstretch{0.5}\\raggedleft\\color{blue}\\footnotesize\\sffamily#1}]{\\parbox{\\marginparwidth}{\\setstretch{0.5}\\raggedright\\color{blue}\\footnotesize\\sffamily#1}}}

\\DeclareRobustCommand{\\indexdeclarationmarginpar}[1]{%
 \\marginpar[{\\setstretch{0.5}\\raggedleft\\color{purple}\\footnotesize\\sffamily#1}]{{\\setstretch{0.5}\\raggedright\\color{purple}\\footnotesize\\sffamily#1}}}

\\DeclareRobustCommand{\\indexusemarginpar}[1]{%
 \\marginpar[{\\setstretch{0.5}\\raggedleft\\color{red}\\footnotesize\\sffamily#1}]{{\\setstretch{0.5}\\raggedright\\color{red}\\footnotesize\\sffamily#1}}}

\\DeclareRobustCommand{\\subindexmarginpar}[1]{%
 \\marginpar[{\\setstretch{0.5}\\raggedleft\\color{DarkGreen}\\footnotesize\\sffamily#1}]{\\parbox{\\marginparwidth}{\\setstretch{0.5}\\raggedright\\color{DarkGreen}\\footnotesize\\sffamily#1}}}

\\DeclareRobustCommand{\\subindexusemarginpar}[1]{%
 \\marginpar[{\\setstretch{0.5}\\raggedleft\\color{Turquoise}\\footnotesize\\sffamily#1}]{\\parbox{\\marginparwidth}{\\setstretch{0.5}\\raggedright\\color{Turquoise}\\footnotesize\\sffamily#1}}}

\\DeclareRobustCommand{\\subindexdeclarationmarginpar}[1]{%
 \\marginpar[{\\setstretch{0.5}\\raggedleft\\color{green}\\footnotesize\\sffamily#1}]{\\parbox{\\marginparwidth}{\\setstretch{0.5}\\raggedright\\color{green}\\footnotesize\\sffamily#1}}}

\\DeclareRobustCommand{\\ordermarginpar}[1]{%
 \\marginpar[{\\setstretch{0.5}\\raggedleft\\color{brown}\\footnotesize\\sffamily#1}]{\\parbox{\\marginparwidth}{\\setstretch{0.5}\\raggedright\\color{brown}\\footnotesize\\sffamily#1}}}

\\newcommand{\\indexinline}[1]{{\\color{blue}\\textsf{[#1]} }}
\\newcommand{\\indexdeclarationinline}[1]{{\\color{purple}\\textsf{[#1]} }}
\\newcommand{\\indexuseinline}[1]{{\\color{red}\\textsf{[#1]} }}
\\newcommand{\\subindexinline}[1]{{\\color{DarkGreen}\\textsf{[#1]} }}
\\newcommand{\\subindexdeclarationinline}[1]{{\\color{green}\\textsf{[#1]} }}
\\newcommand{\\subindexuseinline}[1]{{\\color{Turquoise}\\textsf{[#1]} }}
\\newcommand{\\orderinline}[1]{{\\color{brown}\\textsf{[#1]} }}
\\newcommand{\\seeinline}[1]{{\\color{black}\\textsf{[#1]} }}
\\newcommand{\\seealsoinline}[1]{{\\color{gray}\\textsf{[#1]} }}

\\newcommand{\\lt}{\\ensuremath{<}}% Less than
\\newcommand{\\gt}{\\ensuremath{>}}% Greater than

\\hyphenation{Solution Java-Script}

\\newsavebox\\lstbox

\\newcommand{\\gobbleit}[1]{}
\\newcommand{\\Also}[1]{\\emph{See also} #1}
\\newcommand{\\nn}[1]{#1$\\,$\\emph{n}}
\\newcommand{\\nndd}[1]{\\emph{#1}$\\,$\\emph{n}}
\\newcommand{\\xx}[2]{#2 (ex. #1)}
\\newcommand{\\xxdd}[2]{\\emph{#2} (ex. #1)}
\\newcommand{\\ff}[2]{#2 (fig. #1)}
\\newcommand{\\dd}[1]{\\textit{#1}}
\\newcommand\\klammeraffe{@}

\\makeindex

% to avoid spurious white space around index entries
\\let\\oldindex\\index
\\renewcommand*{\\index}[1]{\\oldindex{#1}\\ignorespaces\\ignorespacesafterend}

\\begin{document}

${title}

\\begin{singlespace}
{\\hypersetup{linkcolor=black}
\\tableofcontents{}
}
\\end{singlespace}


\\pagestyle{forewords}

\\input{./others/02foreword02.tex}

\\cleardoublepage
\\pagestyle{prefaces}

\\input{./others/03prefaces03.tex}

\\cleardoublepage
\\pagestyle{acknowledgements}

\\input{./others/04acknowledgements04.tex}

`;

export const ending = `
\\input{./others/06see06.tex}

\\pagestyle{plain}

\\addcontentsline{toc}{chapter}{List Of Exercises}
\\listofexercises

%\\chapter*{Solution To Exercises}
%\\addcontentsline{toc}{chapter}{Solution To Exercises}
%\\shipoutAnswer

\\input{./others/97references97.tex}

\\indexprologue{\\input{./others/98indexpreface98.tex}}
\\printindex

%\\input{./others/99making99.tex}

\\end{document}`;
