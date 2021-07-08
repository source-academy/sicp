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
\\pagestyle{chapter-open}
`;

export const preamble = `\\documentclass[7x10]{../mitpress/mit}

\\synctex=1

\\newboolean{show-links}
\\setboolean{show-links}{false}

\\newenvironment{Quote}
               {\\list{}{\\rightmargin\\leftmargin}%
                \\item[]\\hspace*{-1ex}}
               {\\endlist}

\\hyphenation{ECMA-Script where-by produc-ing con-clu-sion in-for-ma-tion sec-tion}

\\usepackage{etoolbox}
\\makeatletter
\\pretocmd{\\@schapter}{\\setcounter{footnote}{0}}{}{}
\\pretocmd{\\@chapter}{\\setcounter{footnote}{0}}{}{}
\\makeatother

\\usepackage[
  justification=RaggedRight, % Change to 'justified' once hyphenation is checked
  singlelinecheck=off,
  labelfont={small,bf},
  textfont=small,
  skip=1pc,
  labelsep=quad
  ]{caption}

\\raggedbottom

%%% NOTE: all the vertical heights of the document is controlled here
\\setlength\\headsep{1pc}
\\setlength\\headheight{1pc}
\\setlength\\textheight{50pc}

\\usepackage[T1]{fontenc}
\\usepackage{textcomp}
\\usepackage[utf8]{inputenc}
\\usepackage{mathptmx}
%% \\usepackage[bf,big,raggedright,nobottomtitles]{titlesec}
\\usepackage[american]{babel}
\\usepackage[multidot]{grffile}

\\ifxetex
\\setmonofont[Ligatures=TeX]{Latin Modern Mono}
\\else
\\ifdefined\\DeclareUnicodeCharacter
  \\DeclareUnicodeCharacter{1F00}{-}
  \\DeclareUnicodeCharacter{1F00}{\\alpha}
\\fi
\\usepackage[activate={true,nocompatibility},final,tracking=true,kerning=true,spacing=false,factor=1100,stretch=10,shrink=10]{microtype}
\\fi

\\usepackage{adjustbox}
\\usepackage[fleqn]{amsmath}
\\usepackage{needspace}
\\usepackage{amssymb}
\\usepackage{cprotect}
\\usepackage{csquotes}
\\usepackage[shortlabels]{enumitem}
\\setlist{itemsep=0.5ex}
\\setlist[itemize,1]{label={\\textbullet},left=1pt .. 10pt}
%% \\setlist[itemize,1]{label={\\textbullet},left=7pt .. \\parindent}
\\setlist[enumerate,1]{left=-3pt .. \\parindent}
\\usepackage{emptypage}
\\usepackage{float}
\\renewcommand{\\topfraction}{0.9}
\\usepackage{caption}
\\DeclareCaptionLabelSeparator{goldilocks}{\\hspace{7pt}}
\\captionsetup{labelsep=goldilocks}
\\usepackage{imakeidx}
\\usepackage{subcaption}
\\usepackage{underscore}
\\usepackage{datetime2}

\\def\\normalcodesize{\\fontsize{9.8}{11pt}\\selectfont}
\\def\\exercisecodesize{\\fontsize{9}{11pt}\\selectfont}
\\def\\figurecodesize{\\fontsize{8.7}{10pt}\\selectfont}
\\def\\footnotecodesize{\\fontsize{8}{9pt}\\selectfont}

%% NOTE! the following are redefined (and changed back again) below
\\def\\INLINECODESIZE{\\fontsize{10.6pt}{13pt}\\selectfont}
\\def\\inlinecodesize{\\protect\\INLINECODESIZE}
\\def\\inlineexercisecodesize{\\fontsize{9.5pt}{12pt}\\selectfont}
\\def\\inlinefootnotecodesize{\\fontsize{9pt}{11pt}\\selectfont}

\\def\\normaloutputcodesize{\\fontsize{9.8}{11pt}\\selectfont}
\\def\\exerciseoutputcodesize{\\fontsize{9}{10pt}\\selectfont}
\\def\\figureoutputcodesize{\\fontsize{8.7}{10pt}\\selectfont}
\\def\\footnoteoutputcodesize{\\fontsize{8}{9pt}\\selectfont}

\\newenvironment{Parsing}{%
  \\par%
  \\vspace{1.2em}%
  \\noindent%
  \\begin{minipage}{1.0\\linewidth}\\vspace*{-0.85\\baselineskip}\\normalcodesize\\noindent\\begin{math}\\begin{array}{@{}rcl}}{%
                                                         \\end{array}\\end{math}%
                                                       \\end{minipage}%
                                                       \\par%
                                                       \\vspace{0.0em}%
                                                       \\noindent}
\\newenvironment{ParsingNoPostPadding}{%
  \\par%
  \\vspace{1.2em}%
  \\noindent%
  \\begin{minipage}{1.0\\linewidth}\\vspace*{-0.85\\baselineskip}\\normalcodesize\\noindent\\begin{math}\\begin{array}{@{}rcl}}{%
                                                         \\end{array}\\end{math}%
                                                       \\end{minipage}
                                                       \\par%
                                                       \\vspace{-1.8em}%
                                                      \\noindent}

\\newsavebox{\\UnbreakableBox}

\\usepackage{setspace}
% \\onehalfspacing

\\setlength{\\parskip}{0pt}
\\setlength{\\parindent}{15pt}%
\\setlength{\\mathindent}{2\\parindent}

\\setcounter{secnumdepth}{4}

\\usepackage{fancyhdr}
\\pagestyle{fancy}
\\floatpagestyle{fancy}

\\renewcommand{\\headrulewidth}{0.4pt}
\\fancyhead[LE,RO]{\\small\\it\\thepage}

\\renewcommand{\\footrulewidth}{0pt}
\\fancyfoot{}

\\renewcommand{\\chaptermark}[1]{\\markboth{Chapter\\,\\thechapter\\quad{}#1}{}}
\\renewcommand{\\sectionmark}[1]{\\markright{\\thesection\\quad{}#1}}
\\renewcommand{\\subsectionmark}[1]{\\markright{\\thesubsection\\quad{}#1}}

\\fancypagestyle{TOC}{
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\fancyhead[LE,RO]{\\small\\usefont{T1}{ptm}{m}{it}\\thepage}
  \\fancyhead[RE]{\\small\\usefont{T1}{ptm}{m}{it} Contents}
  \\fancyhead[LO]{\\small\\usefont{T1}{ptm}{m}{it} Contents}
}

\\fancypagestyle{chapter-open}{
  \\renewcommand{\\headrulewidth}{0pt}
  \\fancyhead{}
}

\\fancypagestyle{Foreword}{
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\fancyhead[LE,RO]{\\small\\usefont{T1}{ptm}{m}{it}\\thepage}
  \\fancyhead[RE]{\\small\\usefont{T1}{ptm}{m}{it} Foreword}
  \\fancyhead[LO]{\\small\\usefont{T1}{ptm}{m}{it} Foreword}
}

\\fancypagestyle{Foreword1984}{
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\fancyhead[LE,RO]{\\small\\usefont{T1}{ptm}{m}{it}\\thepage}
  \\fancyhead[RE]{\\small\\usefont{T1}{ptm}{m}{it} Foreword to SICP, 1984}
  \\fancyhead[LO]{\\small\\usefont{T1}{ptm}{m}{it} Foreword to SICP, 1984}
}

\\fancypagestyle{Preface}{
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\fancyhead[LE,RO]{\\small\\usefont{T1}{ptm}{m}{it}\\thepage}
  \\fancyhead[RE]{\\small\\usefont{T1}{ptm}{m}{it} Preface}
  \\fancyhead[LO]{\\small\\usefont{T1}{ptm}{m}{it} Preface}
}

\\fancypagestyle{Preface1996}{
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\fancyhead[LE,RO]{\\small\\usefont{T1}{ptm}{m}{it}\\thepage}
  \\fancyhead[RE]{\\small\\usefont{T1}{ptm}{m}{it} Preface to SICP, 1996}
  \\fancyhead[LO]{\\small\\usefont{T1}{ptm}{m}{it} Preface to SICP, 1996}
}

\\fancypagestyle{Preface1984}{
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\fancyhead[LE,RO]{\\small\\usefont{T1}{ptm}{m}{it}\\thepage}
  \\fancyhead[RE]{\\small\\usefont{T1}{ptm}{m}{it} Preface to SICP, 1984}
  \\fancyhead[LO]{\\small\\usefont{T1}{ptm}{m}{it} Preface to SICP, 1984}
}

\\fancypagestyle{Acknowledgements}{
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\fancyhead[LE,RO]{\\small\\usefont{T1}{ptm}{m}{it}\\thepage}
  \\fancyhead[RE]{\\small\\usefont{T1}{ptm}{m}{it} Acknowledgements}
  \\fancyhead[LO]{\\small\\usefont{T1}{ptm}{m}{it} Acknowledgements}
}

\\fancypagestyle{Main}{
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\fancyhead[LE,RO]{\\small\\usefont{T1}{ptm}{m}{it}\\thepage}
  \\fancyhead[RE]{\\small\\usefont{T1}{ptm}{m}{it}\\nouppercase{\\leftmark}}
  \\fancyhead[LO]{\\small\\usefont{T1}{ptm}{m}{it}\\nouppercase{\\rightmark}}
}

\\usepackage{graphicx}
\\graphicspath{{../static/}}

% \\usepackage[answerdelayed]{exercise}
\\newcounter{ExerciseDisplayNumber}[chapter]
\\newcommand{\\theExercise}{\\thechapter.\\arabic{ExerciseDisplayNumber}}
\\renewcommand{\\theExerciseDisplayNumber}{\\thechapter.\\arabic{ExerciseDisplayNumber}}

\\newenvironment{Exercise}{%
  \\def\\inlinecodesize{\\protect\\inlineexercisecodesize}
  \\refstepcounter{ExerciseDisplayNumber}\\needspace{\\baselineskip}%
  \\subsubsection*{Exercise~\\theExercise}
  \\addcontentsline{loe}{exercise}{\\protect{\\textbf{\\thechapter.\\arabic{ExerciseDisplayNumber}}}}
  \\begingroup\\small
  }{
  \\endgroup
}

\\newcommand{\\listexercisename}{List of Exercises}
\\newcommand{\\LOE}{\\addtocontents{loe}{\\end{multicols}\\begin{multicols}{5}}}

\\makeatletter
\\def\\renewcounter#1{%
\\@ifundefined{c@#1}
{\\@latex@error{counter #1 undefined}\\@ehc}%
\\relax
\\let\\@ifdefinable\\@rc@ifdefinable
\\@ifnextchar[{\\@newctr{#1}}{}}
\\def\\ext@exercise{loe}
\\newcommand{\\ExerciseLevelInToc}[1]{\\def\\toc@exercise{#1}}
\\ExerciseLevelInToc{exercise}
\\newcommand{\\ListOfExerciseInToc}{\\def\\ext@exercise{toc}\\ExerciseLevelInToc{paragraph}}
\\newcommand\\listofexercises{%
\\@mkboth{\\MakeUppercase\\listexercisename}%
{\\MakeUppercase\\listexercisename}%
\\addtolength{\\columnsep}{4mm}
\\begin{multicols}{5}
  \\@starttoc{\\ext@exercise}%
\\end{multicols}
}
\\makeatother


%%%% \\usepackage[answerdelayed]{exercise}
%%%% \\newcounter{ExerciseDisplayNumber}[chapter]
%%%% \\renewcommand{\\theExercise}{\\thechapter.\\arabic{ExerciseDisplayNumber}}
%%%% %\\addtolength{\\ExerciseSkipBefore}{1em}
%%%% \\addtolength{\\Exelabelsep}{12pt}
%%%% \\renewcommand{\\ExerciseHeader}{\\smallskip\\par\\needspace{2\\baselineskip}\\centerline{\\fontsize{8.5}{13}\\usefont{T1}{phv}{b}{n}{\\ExerciseName~\\ExerciseHeaderNB\\ExerciseHeaderTitle \\ExerciseHeaderOrigin}\\smallskip}}

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

\\newcommand{\\JS}{\\lstinline[mathescape=false,basicstyle=\\usefont{T1}{lmtt}{m}{n}\\protect\\inlinecodesize,keywordstyle=\\usefont{T1}{lmtt}{b}{n}\\protect\\inlinecodesize]}
\\newcommand{\\JSMathEscape}{\\lstinline[mathescape=true,basicstyle=\\usefont{T1}{lmtt}{m}{n}\\protect\\inlinecodesize,keywordstyle=\\usefont{T1}{lmtt}{b}{n}\\protect\\inlinecodesize]}


\\lstdefinelanguage{JavaScript}{
  keywords={function,if,else,return,const,let,break,for,while,true,false,var,null}, %% removing continue for now
  %% keywords={const, let, break, case, catch, continue, debugger, default, delete, do, else, finally, for, function, if, in, instanceof, return, switch, this, throw, try, typeof, var, void, while, with},
  morecomment=[l]{//},
  morecomment=[s]{/*}{*/},
  morestring=[b]\`,
  morestring=[b]',
  morestring=[b]",
  columns=fullflexible,
  sensitive=true
}

%% \\newcommand{\\PreBoxCmd}{\\par\\vspace{4pt plus 2pt minus 2pt}\\noindent}
%% \\newcommand{\\PostBoxCmd}{\\par\\vspace{6pt plus 2pt minus 2pt}\\noindent}
%% \\newcommand{\\MidBoxCmd}{\\par\\noindent}

%% \\newcommand{\\PreBoxCmd}{\\par\\vspace{6pt}\\noindent}
%% \\newcommand{\\PostBoxCmd}{\\par\\vspace{9pt}\\noindent}
%% \\newcommand{\\MidBoxCmd}{\\nopagebreak\\par\\noindent}
%%\\newcommand{\\Usebox}{\\usebox{\\UnbreakableBox}}

%%%% \\newcommand{\\PreBoxCmd}{{\\vskip 0.6em}\\noindent}
%%%% \\newcommand{\\PostBoxCmd}{{\\vskip 0.8em}\\noindent}
%%%% \\newcommand{\\PromptInputSpace}{\\par\\noindent}
%%%% % \\newcommand{\\PromptInputSpace}{\\nopagebreak{\\vskip -0.15em}\\noindent}
%%%% \\newcommand{\\InputOutputSpace}{\\nopagebreak{\\vskip 0.8em}\\noindent}
%%%% \\newcommand{\\InputOutputNoSpace}{\\nopagebreak{\\vskip 0.0em}\\noindent}
%%%% \\newcommand{\\MidBoxCmd}{\\nopagebreak{\\vskip 0pt}\\noindent}
%%%% 
%%%% \\newcommand{\\Usebox}[1]{\\raisebox{1ex}[\\height]{\\usebox{\\UnbreakableBox}}}
%%%% %% \\newcommand{\\Usebox}[1]{\\raisebox{0.5ex}[\\height]{\\fbox{\\usebox{#1}}}} %% UNCOMMENT TO SEE BOXES AROUND ALL SNIPPETS

\\newcommand{\\PreBoxCmd}{{\\vskip 0.8em}\\noindent}
\\newcommand{\\PostBoxCmd}{{\\vskip 0.6em}\\noindent}
\\newcommand{\\PreBoxCmdFn}{\\nopagebreak{\\vskip 0.4em}\\noindent}
\\newcommand{\\PostBoxCmdFn}{\\nopagebreak{\\vskip 0.2em}\\noindent}
\\newcommand{\\PromptInputSpace}{\\nopagebreak\\par\\noindent}
\\newcommand{\\InputOutputSpace}{\\nopagebreak{\\vskip 0.8em}\\noindent}
\\newcommand{\\InputOutputNoSpace}{\\nopagebreak{\\vskip 0.0em}\\noindent}
\\newcommand{\\MidBoxCmd}{\\nopagebreak{\\vskip 0pt}\\noindent}

\\newcommand{\\Usebox}[1]{{\\raisebox{0.75ex}[\\height][\\dimexpr\\depth-0.55ex\\relax]{\\usebox{\\UnbreakableBox}}}} 

\\setlength{\\fboxsep}{0pt}
\\setlength{\\fboxrule}{0.1pt}

\\lstset{
   language=JavaScript,
   basicstyle=\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\usefont{T1}{ptm}{m}{it},
   showstringspaces=false,
   showspaces=false,
   escapechar=^
}

\\makeatletter
\\lst@CCPutMacro
    \\lst@ProcessOther {"2D}{\\lst@ttfamily{-{}}{-}}
    \\@empty\\z@\\@empty
\\makeatother

\\newcommand{\\OptionalPar}[2][]{\\ensuremath{\\text{\\textrm{\\sl #2}}_{#1}}}
% mhyphen{} in math mode creates hyphen character (META in parseXmlLatex.js)
\\mathchardef\\mhyphen="2D 

%% \\usepackage[svgnames]{xcolor} %% This line moved into times.cls
\\definecolor{LeftBarClickable}{RGB}{187, 187, 187}

\\lstdefinestyle{JavaScriptLatex}{
   language=JavaScript,
   basicstyle=\\normalcodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\usefont{T1}{ptm}{m}{it},
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
\\lstnewenvironment{JavaScriptLatex}{\\lstset{style=JavaScriptLatex}}{}

\\lstdefinestyle{JavaScriptLatexSmall}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\usefont{T1}{ptm}{m}{it},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   resetmargins=true,
   escapechar=^
}
\\lstnewenvironment{JavaScriptLatexSmall}{\\lstset{style=JavaScriptLatexSmall}}{}

\\lstdefinestyle{JavaScriptLatexFootnote}{
   language=JavaScript,
   basicstyle=\\footnotecodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\usefont{T1}{ptm}{m}{it},
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
\\lstnewenvironment{JavaScriptLatexFootnote}{\\lstset{style=JavaScriptLatexFootnote}}{}

\\lstdefinestyle{JavaScript}{
   language=JavaScript,
   basicstyle=\\normalcodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\usefont{T1}{ptm}{m}{it},
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
\\lstnewenvironment{JavaScript}{\\lstset{style=JavaScript}}{}
\\lstnewenvironment{JavaScriptClickable}{\\lstset{style=JavaScript,escapeinside={/*!}{!*/}}}{}

\\lstdefinestyle{JavaScriptSmall}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\usefont{T1}{ptm}{m}{it},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   rulecolor=\\color{LeftBarClickable},
   resetmargins=true,
   escapechar=^
}
\\lstnewenvironment{JavaScriptSmall}{\\lstset{style=JavaScriptSmall}}{}
\\lstnewenvironment{JavaScriptClickableSmall}{\\lstset{style=JavaScriptSmall,escapeinside={/*!}{!*/}}}{}

\\lstdefinestyle{JavaScriptFootnote}{
   language=JavaScript,
   basicstyle=\\footnotecodesize\\usefont{T1}{lmtt}{m}{n},
   keywordstyle=\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\usefont{T1}{ptm}{m}{it},
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
\\lstnewenvironment{JavaScriptFootnote}{\\lstset{style=JavaScriptFootnote}}{}
\\lstnewenvironment{JavaScriptClickableFootnote}{\\lstset{style=JavaScriptFootnote,escapeinside={/*!}{!*/}}}{}

\\lstdefinestyle{JavaScriptOutput}{
   language=JavaScript,
   basicstyle=\\normaloutputcodesize\\usefont{T1}{lmtt}{m}{sl},
%   keywordstyle=\\fontsize{11}{12}\\usefont{T1}{lmtt}{b}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   deletekeywords={null},
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstdefinestyle{JavaScriptOutputLatex}{
   language=JavaScript,
   basicstyle=\\normaloutputcodesize\\usefont{T1}{lmtt}{m}{sl},
%   keywordstyle=\\fontsize{11}{12}\\usefont{T1}{lmtt}{b}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   deletekeywords={null},
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}

\\lstnewenvironment{JavaScriptOutput}{\\lstset{style=JavaScriptOutput}}{}
\\lstnewenvironment{JavaScriptOutputLatex}{\\lstset{style=JavaScriptOutputLatex}}{}
\\lstnewenvironment{JavaScriptPrompt}{\\lstset{style=JavaScriptOutput}}{}
\\lstnewenvironment{JavaScriptPromptLatex}{\\lstset{style=JavaScriptOutputLatex}}{}
\\lstnewenvironment{JavaScriptLonely}{\\lstset{style=JavaScriptOutput,aboveskip=1ex,belowskip=1ex}}{}
\\lstnewenvironment{JavaScriptLonelyLatex}{\\lstset{style=JavaScriptOutputLatex,aboveskip=1ex,belowskip=1ex}}{}

\\lstnewenvironment{JavaScriptOutputSmall}{\\lstset{style=JavaScriptOutputSmall}}{}
\\lstnewenvironment{JavaScriptOutputLatexSmall}{\\lstset{style=JavaScriptOutputLatexSmall}}{}
\\lstnewenvironment{JavaScriptPromptSmall}{\\lstset{style=JavaScriptOutputSmall}}{}
\\lstnewenvironment{JavaScriptPromptLatexSmall}{\\lstset{style=JavaScriptOutputLatexSmall}}{}
\\lstnewenvironment{JavaScriptLonelySmall}{\\lstset{style=JavaScriptOutputSmall,aboveskip=1ex,belowskip=1ex}}{}
\\lstnewenvironment{JavaScriptLonelyLatexSmall}{\\lstset{style=JavaScriptOutputLatexSmall,aboveskip=1ex,belowskip=1ex}}{}

\\lstnewenvironment{JavaScriptOutputFootnote}{\\lstset{style=JavaScriptOutputFootnote}}{}
\\lstnewenvironment{JavaScriptOutputLatexFootnote}{\\lstset{style=JavaScriptOutputLatexFootnote}}{}
\\lstnewenvironment{JavaScriptPromptFootnote}{\\lstset{style=JavaScriptOutputFootnote}}{}
\\lstnewenvironment{JavaScriptPromptLatexFootnote}{\\lstset{style=JavaScriptOutputLatexFootnote}}{}
\\lstnewenvironment{JavaScriptLonelyFootnote}{\\lstset{style=JavaScriptOutputFootnote,aboveskip=1ex,belowskip=1ex}}{}
\\lstnewenvironment{JavaScriptLonelyLatexFootnote}{\\lstset{style=JavaScriptOutputLatexFootnote,aboveskip=1ex,belowskip=1ex}}{}


\\lstdefinestyle{JavaScriptOutputSmall}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\usefont{T1}{lmtt}{m}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   deletekeywords={null},
   rulecolor=\\color{LeftBarClickable},
   resetmargins=true,
   escapechar=^
}
\\lstdefinestyle{JavaScriptOutputLatexSmall}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\usefont{T1}{lmtt}{m}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   deletekeywords={null},
   rulecolor=\\color{LeftBarClickable},
   resetmargins=true,
   escapechar=^
}

\\lstdefinestyle{JavaScriptOutputFootnote}{
   language=JavaScript,
   basicstyle=\\footnotecodesize\\usefont{T1}{lmtt}{m}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=false,
   framerule=0.5ex,
   framesep=1em,
   deletekeywords={null},
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}
\\lstdefinestyle{JavaScriptOutputLatexFootnote}{
   language=JavaScript,
   basicstyle=\\footnotecodesize\\usefont{T1}{lmtt}{m}{sl},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   columns=fullflexible,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   framerule=0.5ex,
   framesep=1em,
   deletekeywords={null},
   rulecolor=\\color{LeftBarClickable},
   escapechar=^
}

\\lstdefinestyle{JavaScriptSmaller}{
   language=JavaScript,
   basicstyle=\\exercisecodesize\\usefont{T1}{lmtt}{m}{n}, %\\fontsize{8.5}{9.5pt}\\selectfont
   keywordstyle=\\usefont{T1}{lmtt}{b}{n},
   commentstyle=\\usefont{T1}{ptm}{m}{it},
   showstringspaces=false,
   showspaces=false,
   keepspaces=true,
   fontadjust=true,
   basewidth=0.55em,
   mathescape=true,
   resetmargins=true,
   escapechar=^
}
\\lstnewenvironment{JavaScriptSmaller}{\\lstset{style=JavaScriptLatexSmall}}{}

\\usepackage{epigraph}
%\\renewcommand{\\textflush}{flushepinormal} %% Uncomment to get justified epigraphs
\\renewcommand{\\sourceflush}{flushleft}
\\makeatletter
\\newlength\\interepigraphskip
\\setlength\\interepigraphskip{5pt}
\\setlength\\beforeepigraphskip{0pt}
\\setlength\\afterepigraphskip{13pt}
\\renewcommand\\epigraph[3][\\interepigraphskip]{\\vspace{\\beforeepigraphskip}
  {\\epigraphsize\\begin{\\epigraphflush}\\begin{minipage}{\\epigraphwidth}
    \\@epitext{#2}\\\\[#1] \\@episource{#3}
    \\end{minipage}\\end{\\epigraphflush}
    \\vspace{\\afterepigraphskip}}}
\\makeatother
\\setlength\\epigraphwidth{11cm}
\\setlength\\epigraphrule{0pt}
\\newcommand{\\quotationdash}{---} %% the purist can look for a "quotation dash" instead

%% \\usepackage[colorlinks=true, urlcolor=blue, linkcolor=blue, citecolor=blue]{hyperref} %% colorlinks=false for final build

\\usepackage{xcolor}

\\definecolor{DarkGreen}{rgb}{0.0, 0.2, 0.13}
\\definecolor{Turquoise}{rgb}{0.19, 0.84, 0.78}

\\usepackage[maxfloats=266]{morefloats}

\\setlength\\marginparwidth{4cm}

\\setlength\\marginparsep{7pt}

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

\\let\\oldaddcontentsline\\addcontentsline
\\makeindex[\columnsep=2pc]

% to avoid spurious white space around index entries
\\let\\oldindex\\index
\\renewcommand*{\\index}[1]{\\oldindex{#1}\\ignorespaces\\ignorespacesafterend}

`;

export const epub_preamble = `
\\newcommand{\\Big}{\\ensuremath{}}   % ignore Big for now
\\newcommand{\\mhyphen}{\\ensuremath{-}}   % a first approximation of math hyphen
`;

export const frontmatter = `
\\begin{document}
\\renewcommand\\rmdefault{ptm}
\\renewcommand\\ttdefault{lmtt}

\\frontmatter

\\HalfTitle{Structure and Interpretation of Computer Programs, Second Edition --- JavaScript Adaptation}

\\halftitlepage

\\cleardoublepage

\\Title{Structure and Interpretation of Computer Programs}
\\Booksubtitle{JavaScript Adaptation}

\\edition{}

\\BookAuthor{Harold Abelson and Gerald Jay Sussman with Julie Sussman \\newline adapted to JavaScript by Martin Henz and Tobias Wrigstad}

\\imprint{The MIT Press\\\\
Cambridge, Massachusetts\\\\
London, England}

\\begin{copyrightpage}
\\textcopyright\\ [YEAR] Massachusetts Institute of Technology

All rights reserved. No part of this book may be reproduced in any form by any electronic or mechanical means (including photocopying, recording, or information storage and retrieval) without permission in writing from the publisher.

This book was set in --------- by ---------. Printed and bound in the United States of America.

Library of Congress Cataloging-in-Publication Data is available.

ISBN:

10\\quad9\\quad8\\quad7\\quad6\\quad5\\quad4\\quad3\\quad2\\quad1
\\end{copyrightpage}

\\dedication{\\hspace{2.5cm}\\normalsize This book is dedicated, in respect and admiration, \\\\[2mm]
\\hspace{3.45cm}to the spirit that lives in the computer.}

\\begin{epigraphpage}
\\epigraph{\\hspace{-1.05cm}\\begin{minipage}{11.5cm}\\normalsize\`\`I think it's extraordinarily important that we in computer science keep
fun in computing. When it started out, it was an awful lot of fun. Of
course, the paying customers got shafted every now and then, and after a
while we began to take their complaints seriously. We began to feel as
though we really were responsible for the successful, error-free, perfect
use of these machines. I don't think we are. I think we're responsible for
stretching them, setting them off in new directions, and keeping fun in the
house. Fun comes in many ways. Fun comes in making a discovery, proving a
theorem, writing a program, breaking a code. Whatever form or sense it
comes in I hope the field of computer science never loses its sense of fun.
Above all, I hope we don't become missionaries. What you know about
computing other people will learn. Don't feel as though the key to
successful computing is only in your hands. What's in your hands, I think
and hope, is intelligence: the ability to see the machine as more than when
you were first led up to it, that you can make it more.''\\end{minipage}}{\\normalsize\\hspace{-1.2cm}\\quotationdash{}Alan J. Perlis (April 1, 1922--February 7, 1990)}
\\end{epigraphpage}


%% \\\\hypersetup{linkcolor=black} %% For final build
\\pagestyle{TOC}
\\thispagestyle{chapter-open}
\\tableofcontents{}
\\cleardoublepage

\\pagestyle{Main}
\\pagestyle{Foreword}
\\input{./others/02foreword02.tex}
\\pagestyle{Foreword1984}
\\input{./others/02foreword84.tex}

\\cleardoublepage
\\pagestyle{Preface}
\\input{./others/03prefaces03.tex}
\\pagestyle{Preface1996}
\\input{./others/03prefaces96.tex}
\\pagestyle{Preface1984}
\\input{./others/03prefaces84.tex}

\\cleardoublepage
\\pagestyle{Acknowledgements}
\\input{./others/04acknowledgements04.tex}
\\input{./others/05acknowledgements05.tex}

\\cleardoublepage

\\HalfTitle{Structure and Interpretation of Computer Programs, Second Edition --- JavaScript Adaptation}
\\halftitlepage
\\cleardoublepage

\\mainmatter
\\pagestyle{Main}

`;

export const ending = `
\\input{./others/06see06.tex}

%\\chapter*{Solution To Exercises}
%\\addcontentsline{toc}{chapter}{Solution To Exercises}
%\\shipoutAnswer

\\newpage
\\markboth{References}{References}
\\input{./others/97references97.tex}

\\newpage
\\markboth{}{}
%% Shrink code size
\\def\\inlinecodesize{\\protect\\inlineexercisecodesize}

%% imakeidx package not working as advertized in our case, due to "mit" class file
%% so we are resorting to the following hack:
%% (1) create a phantom section for hyperref to link the following table-of-contents
%%     entry correctly
%% (2) manually add the table-of-contents line for "Index"
%% (3) suppress creation of table-of-contents lines by re-declaring addcontentsline
%%     to be a noop
%% (4) print the index via "mit" printindex, where the headline is a vbox that 
%%     contains the desired prologue
%% (5) restore the original addcontentsline

\\phantomsection
\\addcontentsline{toc}{chapter}{Index}
\\renewcommand{\\addcontentsline}[3]{}
\\printindex{sicpjs}{\\vbox{Index\\vspace{8mm}\\newline \\small \\normalfont Page numbers for JavaScript declarations are in \\textit{italics}.\\newline Page numbers followed by \\textit{n} indicate footnotes.}}
\\renewcommand{\\addcontentsline}[3]{\\oldaddcontentsline{#1}{#2}{#3}}

%% Restore code size
\\def\\inlinecodesize{\\protect\\INLINECODESIZE}

\\newpage
\\markboth{}{}
\\chapter*{List of Exercises}
\\LOE{}
\\addcontentsline{toc}{chapter}{List of Exercises}
\\listofexercises

%\\chapter*{Solution To Exercises}
%\\addcontentsline{toc}{chapter}{Solution To Exercises}
%\\shipoutAnswer

%\\input{./others/99making99.tex}

\\end{document}
`;
