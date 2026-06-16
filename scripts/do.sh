#! /usr/bin/env bash

# Fail early
set -euo pipefail

# Select the edition to match javascript/editions.ts (SICP_EDITION env var).
# Unset or anything other than "py" -> JavaScript edition (default).
EDITION="$(printf '%s' "${SICP_EDITION:-}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
if [ "${EDITION}" = "py" ]; then
    LANG_KEY="py"
    OUTPUT_BASE="sicpy"
else
    LANG_KEY="js"
    OUTPUT_BASE="sicpjs"
fi

# DOCS is the local target folder, before deployment
DOCS="docs_out"

# temp folders for the selected edition (named <base>_<lang>, matching index.ts)
LATEX_PDF="latex_pdf_${LANG_KEY}"
GENERATED_HTML="html_split_${LANG_KEY}"
GENERATED_JS="programs_${LANG_KEY}"
GENERATED_JSON="json_${LANG_KEY}"
PDF_FILE="${OUTPUT_BASE}.pdf"

# RESOURCES
FAVICON="static/assets/sourcepower.ico"
STYLESHEET="static/assets/styles/stylesheet.css"
FONTS="static/fonts"
CSS="static/css"
IMAGES="static/images"

# NAMES OF GENERATED FILES
OUTPUT_FILE="${OUTPUT_BASE}"
ZIP_FILE="${OUTPUT_BASE}.zip"


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
	# Wipe generated artifacts in ${LATEX_PDF} but keep the tracked files:
	# .gitignore and any hand-paginated*.ind used by the manual pre-MIT-Press
	# index workflow (GitHub issue #1236). The hand-paginated files may be
	# absent (e.g. the Python edition). Done in place so nothing is stranded.
	if [ -d "${LATEX_PDF}" ]; then
		find "${LATEX_PDF}" -mindepth 1 -maxdepth 1 \
			! -name '.*' ! -name 'hand-paginated*.ind' -exec rm -rf {} +
	fi
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
