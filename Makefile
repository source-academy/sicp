# DOCS is the local target folder, before deployment
DOCS = docs_out

# temp folders for different editions
LATEX_PDF = latex_pdf
LATEX_EPUB = latex_epub
GENERATED_HTML_JS = html_js
GENERATED_HTML_SPLIT = html_split
GENERATED_JS = js_programs

# RESOURCES
FONTS = static/fonts
CSS = static/css
IMAGES = static/images

# NAMES OF GENERATED FILES
PDF_FILE = sicpjs.pdf
EPUB_FILE = sicpjs.epub
ZIP_FILE = sicpjs.zip

# make all editions
all: web split js pdf epub

# mobile-friendly web edition: files go to html_js
web:
	npm start web

# comparison edition: files go to html_split
split:
	npm start web split

# generate all js programs from SICP JS and put them in js_programs
js:
	npm start js

# If you exceed the TeX memory capacity on MikTeX:
# http://blog.analogmachine.org/2013/08/12/how-to-increase-miktex-2-9-memory/
# for some reason, "npm start pdf" needs to run twice
pdf: 
	npm start pdf; npm start pdf; \
	cd $(LATEX_PDF); \
	latexmk -silent -pdf -pdflatex="pdflatex --synctex=1" -f $(basename $(PDF_FILE))

# for some reason, "npm start epub" needs to run twice
epub:
	npm start epub; npm start epub; \
	cd $(LATEX_EPUB); pandoc $(basename $(EPUB_FILE)).tex --listings -o $(EPUB_FILE) --toc --epub-chapter-level=3 --number-sections --metadata=title:"Structure and Interpretation of Computer Programs—JavaScript Adaptation" --css ../$(CSS)/sicp.css --epub-cover-image=../$(IMAGES)/coverpage.png --epub-embed-font=../$(FONTS)/STIXGeneral-Bold-subset.woff --epub-embed-font=../$(FONTS)/STIXGeneral-Italic-subset.woff --epub-embed-font=../$(FONTS)/STIXGeneral-Regular-subset.woff --epub-embed-font=../$(FONTS)/STIXIntegralsD-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeFiveSym-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeFourSym-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeOneSym-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeThreeSym-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeTwoSym-Regular.woff --epub-embed-font=../$(FONTS)/dejamono-r-subset.woff --epub-embed-font=../$(FONTS)/dejasans-b-arrows.woff --epub-embed-font=../$(FONTS)/incons-r-subset.woff --epub-embed-font=../$(FONTS)/incons-rb-subset.woff --epub-embed-font=../$(FONTS)/incons-ri-subset.woff --epub-embed-font=../$(FONTS)/jsMath-cmex10-subset.woff --epub-embed-font=../$(FONTS)/linbio-r-subset.woff --epub-embed-font=../$(FONTS)/linbio-rb-subset.woff --epub-embed-font=../$(FONTS)/linbio-ri-subset.woff --epub-embed-font=../$(FONTS)/linlib-as-subset.woff --epub-embed-font=../$(FONTS)/linlib-r-subset.woff --epub-embed-font=../$(FONTS)/linlib-rb-subset.woff --epub-embed-font=../$(FONTS)/linlib-ri-subset.woff 

svg_pdf:
	./svg_to_pdf.sh

# remove all generated files
clean:
	rm -rf $(DOCS)/*
	rm -rf $(LATEX_PDF)/*
	rm -rf $(LATEX_EPUB)/*
	rm -rf $(GENERATED_HTML_JS)/*
	rm -rf $(GENERATED_HTML_SPLIT)/*
	rm -rf $(GENERATED_JS)/*
	rm -f $(ZIP_FILE)

# fire up local web server; after "make try", point browser to localhost:3000
try:
	cd $(DOCS); http-server --port 3000

# run all programs in js_programs and compare result with test cases
test:
	npm test

# check syntax of all programs in js_programs
check:
	npm check

# prepare installation by copying all generated files to docs_out folder
prepare: 
	[ ! -f $(LATEX_PDF)/$(PDF_FILE) ] || cp $(LATEX_PDF)/$(PDF_FILE) $(DOCS)
	[ ! -f $(LATEX_EPUB)/$(EPUB_FILE) ] || cp $(LATEX_EPUB)/$(EPUB_FILE) $(DOCS)
	[ ! -f $(GENERATED_HTML_JS)/index.html ] || cp -rf $(GENERATED_HTML_JS)/* $(DOCS)
	[ ! -d $(GENERATED_HTML_SPLIT) ] || ( rm -rf $(DOCS)/split; \
	                                      cp -rf $(GENERATED_HTML_SPLIT) $(DOCS)/split )
	[ ! -d $(GENERATED_JS) ] || ( zip -r $(ZIP_FILE) $(GENERATED_JS); \
	                              cp $(ZIP_FILE) $(DOCS) )

# install all files in docs_out to official website
install:
	cd $(DOCS); scp -p -r * sicp@web1.comp.nus.edu.sg:public_html; \
	echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg"

# install all files in docs_out to staging folder of official website
staging:
	cd $(DOCS); scp -p -r * sicp@web1.comp.nus.edu.sg:public_html/staging; \
	echo "check that everything works: https://sicp.comp.nus.edu.sg/staging"

# install all files in docs_out to http://www.comp.nus.edu.sg/~henz/sicp
henz:
	cd $(DOCS); scp -p -r * henz@suna.comp.nus.edu.sg:public_html/sicp; \
	echo "check that everything works: https://www.comp.nus.edu.sg/~henz/sicp"

# install all files in docs_out to henz@suna, and copy from there to staging folder
covid:
	cd $(DOCS); scp -p -r * henz@suna.comp.nus.edu.sg:sicp; \
	echo "next: ssh henz@suna.comp.nus.edu.sg"; \
	echo "finally: cd sicp; scp -p -r * sicp@web1.comp.nus.edu.sg:public_html/staging"
