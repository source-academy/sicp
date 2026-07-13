#! /usr/bin/env bash

# Fail early
set -euo pipefail

# Select the edition to match javascript/editions.ts (SICP_EDITION env var).
# Unset or anything unrecognized -> JavaScript edition (default).
EDITION="$(printf '%s' "${SICP_EDITION:-}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
if [ "${EDITION}" = "py" ]; then
    LANG_KEY="py"
    OUTPUT_BASE="sicpy"
elif [ "${EDITION}" = "scm" ]; then
    LANG_KEY="scm"
    OUTPUT_BASE="sicp"
else
    LANG_KEY="js"
    OUTPUT_BASE="sicpjs"
fi

# DOCS is the local target folder, before deployment
DOCS="docs_out"

# temp folders for the selected edition (named <base>_<lang>, matching index.ts)
LATEX_PDF="latex_pdf_${LANG_KEY}"
GENERATED_HTML="html_split_${LANG_KEY}"
GENERATED_PROGRAMS="programs_${LANG_KEY}"
GENERATED_JSON="json_${LANG_KEY}"
GENERATED_MD="md_${LANG_KEY}"
PDF_FILE="${OUTPUT_BASE}.pdf"
MD_FILE="${OUTPUT_BASE}.md"

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
	rm -rf ${GENERATED_PROGRAMS}/*
	rm -rf ${GENERATED_JSON}/*
	rm -rf ${GENERATED_MD}/*
	rm -f ${ZIP_FILE}
}

prepare() {
	# The JavaScript edition publishes at the docs_out root. Other editions
	# publish under their own subfolders (split_<lang>/, json_<lang>/) and
	# under distinct artifact names (sicpy.pdf / sicpy.zip), so they are purely
	# additive and never disturb the JS site.
	if [ "${LANG_KEY}" = "js" ]; then
		WEB_DEST="${DOCS}"
		JSON_DEST="${DOCS}/json"
	else
		WEB_DEST="${DOCS}/split_${LANG_KEY}"
		JSON_DEST="${DOCS}/json_${LANG_KEY}"
	fi
	# ensure the stylesheet's destination exists for either edition
	mkdir -p "${WEB_DEST}/assets"
 	[ ! -f ${FAVICON} ] || cp ${FAVICON} ${WEB_DEST}/favicon.ico
 	[ ! -f ${STYLESHEET} ] || cp ${STYLESHEET} ${WEB_DEST}/assets/stylesheet.css
 	[ ! -f ${LATEX_PDF}/${PDF_FILE} ] || cp ${LATEX_PDF}/${PDF_FILE} ${DOCS}
	[ ! -f ${GENERATED_MD}/${MD_FILE} ] || cp ${GENERATED_MD}/${MD_FILE} ${DOCS}
	PDF_BASENAME="$(basename "${PDF_FILE}" .pdf)"
	cp "${LATEX_PDF}/${PDF_BASENAME}."{log,ilg,ind,idx} ${DOCS} || :
 	[ ! -f ${GENERATED_HTML}/index.html ] || cp -rf ${GENERATED_HTML}/* ${WEB_DEST}
 	[ ! -d ${GENERATED_PROGRAMS} ] || ( zip -r ${ZIP_FILE} ${GENERATED_PROGRAMS}; \
 	                              cp ${ZIP_FILE} ${DOCS} )
	[ ! -d ${GENERATED_JSON} ] || ( rm -rf ${JSON_DEST}; \
                                    cp -rf ${GENERATED_JSON} ${JSON_DEST} )
}

main $1
