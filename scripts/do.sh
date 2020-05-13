#! /usr/bin/env bash

# DOCS is the local target folder, before deployment
DOCS="docs_out"

# temp folders for different editions
LATEX_PDF="latex_pdf"
LATEX_EPUB="latex_epub"
GENERATED_HTML_JS="html_js"
GENERATED_HTML_SPLIT="html_split"
GENERATED_JS="js_programs"

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
    elif [ "$1" == "golive" ]; then
	golive
    elif [ "$1" == "prepare" ]; then
	prepare
    elif [ "$1" == "staging" ]; then
	staging
    elif [ "$1" == "via" ]; then
	via
    else
        echo "Please run this command from the git root directory."
        false  # exit 1
    fi
}

pdf() {
	yarn process pdf; yarn process pdf; \
	cd ${LATEX_PDF}; \
	latexmk -silent -pdf -pdflatex="pdflatex --synctex=1" -f ${OUTPUT_FILE}
}

epub() {
	yarn process epub; yarn process epub; \
	cd ${LATEX_EPUB}; pandoc ${OUTPUT_FILE}.tex --listings -o ${EPUB_FILE} --toc --epub-chapter-level=3 --number-sections --metadata=title:"Structure and Interpretation of Computer Programs—JavaScript Adaptation" --css ../${CSS}/sicp.css --epub-cover-image=../${IMAGES}/coverpage.png --epub-embed-font=../${FONTS}/STIXGeneral-Bold-subset.woff --epub-embed-font=../${FONTS}/STIXGeneral-Italic-subset.woff --epub-embed-font=../${FONTS}/STIXGeneral-Regular-subset.woff --epub-embed-font=../${FONTS}/STIXIntegralsD-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeFiveSym-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeFourSym-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeOneSym-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeThreeSym-Regular.woff --epub-embed-font=../${FONTS}/STIXSizeTwoSym-Regular.woff --epub-embed-font=../${FONTS}/dejamono-r-subset.woff --epub-embed-font=../${FONTS}/dejasans-b-arrows.woff --epub-embed-font=../${FONTS}/incons-r-subset.woff --epub-embed-font=../${FONTS}/incons-rb-subset.woff --epub-embed-font=../${FONTS}/incons-ri-subset.woff --epub-embed-font=../${FONTS}/jsMath-cmex10-subset.woff --epub-embed-font=../${FONTS}/linbio-r-subset.woff --epub-embed-font=../${FONTS}/linbio-rb-subset.woff --epub-embed-font=../${FONTS}/linbio-ri-subset.woff --epub-embed-font=../${FONTS}/linlib-as-subset.woff --epub-embed-font=../${FONTS}/linlib-r-subset.woff --epub-embed-font=../${FONTS}/linlib-rb-subset.woff --epub-embed-font=../${FONTS}/linlib-ri-subset.woff 
}

clean() {
	echo "rm -rf ${DOCS}/* "
	echo "rm -rf ${LATEX_PDF}/* "
	echo "rm -rf ${LATEX_EPUB}/* "
	echo "rm -rf ${GENERATED_HTML_JS}/* "
	echo "rm -rf ${GENERATED_HTML_SPLIT}/* "
	echo "rm -rf ${GENERATED_JS}/*"
	echo "rm -f ${ZIP_FILE}"
}

prepare() {
 	[ ! -f ${LATEX_PDF}/${PDF_FILE} ] || cp ${LATEX_PDF}/${PDF_FILE} ${DOCS}
 	[ ! -f ${LATEX_EPUB}/${EPUB_FILE} ] || cp ${LATEX_EPUB}/${EPUB_FILE} ${DOCS}
 	[ ! -f ${GENERATED_HTML_JS}/index.html ] || cp -rf ${GENERATED_HTML_JS}/* ${DOCS}
 	[ ! -d ${GENERATED_HTML_SPLIT} ] || ( rm -rf ${DOCS}/split; \
 	                                      cp -rf ${GENERATED_HTML_SPLIT} ${DOCS}/split )
 	[ ! -d ${GENERATED_JS} ] || ( zip -r ${ZIP_FILE} ${GENERATED_JS}; \
 	                              cp ${ZIP_FILE} ${DOCS} )
}

# install all files in docs_out to official website
golive() {
 	cd ${DOCS}; scp -p -r * sicp@web1.comp.nus.edu.sg:public_html; \
 	echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg"
}

# install all files in docs_out to staging folder of official website
staging() {
 	cd ${DOCS}; scp -p -r * sicp@web1.comp.nus.edu.sg:public_html/staging; \
 	echo "check that everything works: https://sicp.comp.nus.edu.sg/staging"
}

# install all files in docs_out to henz@suna, and copy from there to staging folder
via() {
 	cd ${DOCS}; scp -p -r * henz@suna.comp.nus.edu.sg:sicp; \
 	echo "next: ssh henz@suna.comp.nus.edu.sg"; \
 	echo "finally: cd sicp; scp -p -r * sicp@web1.comp.nus.edu.sg:public_html/staging"
}

main $1
