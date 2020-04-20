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

all: web split js pdf epub

web:
	npm start web

split:
	npm start web split

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

clean:
	rm -rf $(DOCS)/*
	rm -rf $(LATEX_PDF)/*
	rm -rf $(LATEX_EPUB)/*
	rm -rf $(GENERATED_HTML_JS)/*
	rm -rf $(GENERATED_HTML_SPLIT)/*
	rm -rf $(GENERATED_JS)/*
	rm -f $(ZIP_FILE)

try:
	cd $(DOCS); http-server

prepare: 
	[ ! -f $(LATEX_PDF)/$(PDF_FILE) ] || cp $(LATEX_PDF)/$(PDF_FILE) $(DOCS)
	[ ! -f $(LATEX_EPUB)/$(EPUB_FILE) ] || cp $(LATEX_EPUB)/$(EPUB_FILE) $(DOCS)
	[ ! -f $(GENERATED_HTML_JS)/index.html ] || cp -rf $(GENERATED_HTML_JS)/* $(DOCS)
	[ ! -d $(GENERATED_HTML_SPLIT) ] || ( rm -rf $(DOCS)/split; \
	                                      cp -rf $(GENERATED_HTML_SPLIT) $(DOCS)/split )
	[ ! -d $(GENERATED_JS) ] || ( zip -r $(ZIP_FILE) $(GENERATED_JS); \
	                              cp $(ZIP_FILE) $(DOCS) )

install:
	cd $(DOCS); scp -p -r * sicp@web1.comp.nus.edu.sg:public_html; \
	echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg"

staging:
	cd $(DOCS); scp -p -r * sicp@web1.comp.nus.edu.sg:public_html/staging; \
	echo "check that everything works: https://sicp.comp.nus.edu.sg/staging"

henz:
	cd $(DOCS); scp -p -r * henz@suna.comp.nus.edu.sg:public_html/sicp; \
	echo "check that everything works: https://www.comp.nus.edu.sg/~henz/sicp"

covid:
	cd $(DOCS); scp -p -r * henz@suna.comp.nus.edu.sg:sicp; \
	echo "next: ssh henz@suna.comp.nus.edu.sg" \
	echo "finally: cd sicp; scp -p -r * sicp@web1.comp.nus.edu.sg:public_html/staging"
