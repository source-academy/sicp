#! /usr/bin/env bash

# DOCS is the local target folder, before deployment
DOCS="docs_out"

# temp folders for different editions
LATEX_PDF="latex_pdf"
LATEX_EPUB="latex_epub"
GENERATED_HTML="html_split"
GENERATED_JS="js_programs"
GENERATED_JSON="json"
PDF_FILE="sicpjs.pdf"
LOG_FILE="sicpjs.log"
EPUB_FILE="sicpjs.epub"

# RESOURCES
FONTS="static/fonts"
CSS="static/css"
IMAGES="static/images"

# NAMES OF GENERATED FILES
OUTPUT_FILE="sicpjs"
ZIP_FILE="sicpjs.zip"


main() {

    if [ "$1" == "pdf" ]; then
	pdf
    elif [ "$1" == "clean" ]; then
	clean
    elif [ "$1" == "epub" ]; then
	epub
    elif [ "$1" == "prepare" ]; then
	prepare
    else
        echo "Please run this command from the git root directory."
        false  # exit 1
    fi
}

pdf() {
	yarn process pdf; yarn process pdf; \
        cd ${LATEX_PDF}; \
        cp -f ../mitpress/crop.sty .; \
	latexmk -silent -pdf -pdflatex="pdflatex --synctex=1" -f ${OUTPUT_FILE}
}

epub() {
	yarn process epub; yarn process epub; \
	cd ${LATEX_EPUB}; pandoc ${OUTPUT_FILE}.tex --listings -o ${EPUB_FILE} --toc --epub-chapter-level=3 --number-sections --metadata=title:"Structure and Interpretation of Computer Programs—JavaScript Adaptation" --css ../${CSS}/sicp.css --epub-cover-image=../${IMAGES}/coverpage.png --epub-embed-font=../${FONTS}/STIXGeneral-Bold-subset.woff --epub-embed-font=../${FONTS}/STIXGeneral-Italic-subset.woff --epub-embed-font=../${FONTS}/STIXGeneral-Regular-subset.woff --epub-embed-font=../${FONTS}/STIXIntegralsD-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeFiveSym-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeFourSym-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeOneSym-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeThreeSym-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeTwoSym-Regular.woff --epub-embed-font=../${FONTS}/dejamono-r-subset.woff --epub-embed-font=../${FONTS}/dejasans-b-arrows.woff --epub-embed-font=../${FONTS}/incons-r-subset.woff --epub-embed-font=../${FONTS}/incons-rb-subset.woff --epub-embed-font=../${FONTS}/incons-ri-subset.woff --epub-embed-font=../${FONTS}/jsMath-cmex10-subset.woff --epub-embed-font=../${FONTS}/linbio-r-subset.woff --epub-embed-font=../${FONTS}/linbio-rb-subset.woff --epub-embed-font=../${FONTS}/linbio-ri-subset.woff --epub-embed-font=../${FONTS}/linlib-as-subset.woff --epub-embed-font=../${FONTS}/linlib-r-subset.woff --epub-embed-font=../${FONTS}/linlib-rb-subset.woff --epub-embed-font=../${FONTS}/linlib-ri-subset.woff 
}

clean() {
	rm -rf ${DOCS}/*
	rm -rf ${LATEX_PDF}/*
	rm -rf ${LATEX_EPUB}/*
	rm -rf ${GENERATED_HTML}/*
	rm -rf ${GENERATED_JS}/*
	rm -rf ${GENERATED_JSON}/*
	rm -f ${ZIP_FILE}
}

prepare() {
 	[ ! -f ${LATEX_PDF}/${PDF_FILE} ] || cp ${LATEX_PDF}/${PDF_FILE} ${DOCS}
 	[ ! -f ${LATEX_PDF}/${LOG_FILE} ] || cp ${LATEX_PDF}/${LOG_FILE} ${DOCS}
 	[ ! -f ${LATEX_EPUB}/${EPUB_FILE} ] || cp ${LATEX_EPUB}/${EPUB_FILE} ${DOCS}
 	[ ! -f ${GENERATED_HTML}/index.html ] || cp -rf ${GENERATED_HTML}/* ${DOCS}
 	[ ! -d ${GENERATED_JS} ] || ( zip -r ${ZIP_FILE} ${GENERATED_JS}; \
 	                              cp ${ZIP_FILE} ${DOCS} )
	[ ! -d ${GENERATED_JSON} ] || ( rm -rf ${DOCS}/json; \
                                    cp -rf ${GENERATED_JSON} ${DOCS}/json )
}

main $1
