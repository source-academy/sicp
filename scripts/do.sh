#! /usr/bin/env bash

# hand-paginated index file for LaTeX => PDF
HAND_PAGINATED="hand-paginated.ind"

# DOCS is the local target folder, before deployment
DOCS="docs_out"

# temp folders for different editions
LATEX_PDF="latex_pdf"
GENERATED_HTML="html_split"
GENERATED_JS="js_programs"
GENERATED_JSON="json"
PDF_FILE="sicpjs.pdf"

# RESOURCES
FAVICON="static/assets/sourcepower.ico"
STYLESHEET="static/assets/sourcepower.ico"
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
	latexmk -verbose -pdf -r ../scripts/latexmkrc -pdflatex="pdflatex --synctex=1" -f ${OUTPUT_FILE}
}

clean() {
	rm -rf ${DOCS}/*
	mv ${LATEX_PDF}/${HAND_PAGINATED} .
	rm -rf ${LATEX_PDF}/*
	mv ${HAND_PAGINATED} ${LATEX_PDF}
	rm -rf ${GENERATED_HTML}/*
	rm -rf ${GENERATED_JS}/*
	rm -rf ${GENERATED_JSON}/*
	rm -f ${ZIP_FILE}
}

prepare() {
 	[ ! -f ${FAVICON} ] || cp ${FAVICON} ${DOCS}/favicon.ico
 	[ ! -f ${STYLESHEET} ] || cp ${STYLESHEET} ${DOCS}/assets/stylesheet.css
 	[ ! -f ${LATEX_PDF}/${PDF_FILE} ] || cp ${LATEX_PDF}/${PDF_FILE} ${DOCS}
	PDF_BASENAME="$(basename "${PDF_FILE}" .pdf)"
	cp "${LATEX_PDF}/${PDF_BASENAME}."{log,ilg,ind,idx} ${DOCS} || :
 	[ ! -f ${GENERATED_HTML}/index.html ] || cp -rf ${GENERATED_HTML}/* ${DOCS}
 	[ ! -d ${GENERATED_JS} ] || ( zip -r ${ZIP_FILE} ${GENERATED_JS}; \
 	                              cp ${ZIP_FILE} ${DOCS} )
	[ ! -d ${GENERATED_JSON} ] || ( rm -rf ${DOCS}/json; \
                                    cp -rf ${GENERATED_JSON} ${DOCS}/json )
}

main $1
