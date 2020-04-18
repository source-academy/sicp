# DOCS is the local target folder, before deployment
DOCS = docs

# temp folders for different editions
LATEX_PDF = latex
LATEX_EPUB = latex
GENERATED_HTML_JS = sicpjs_html
GENERATED_HTML_SPLIT = sicp_split_html

# RESOURCES
FONTS = fonts
CSS = css
IMAGES = static

all: web pdf epub split

web:
	npm start web; npm start web

split:
	npm start web split; npm start web split

# If you exceed the TeX memory capacity on MikTeX:
# http://blog.analogmachine.org/2013/08/12/how-to-increase-miktex-2-9-memory/
pdf: 
	npm start pdf; npm start pdf; \
	cd $(LATEX_PDF); latexmk -pdf -pdflatex="pdflatex --synctex=1" -f sicpjs

epub:
	npm start epub; npm start epub; \
	cd $(LATEX_EPUB); pandoc sicpjs.tex --listings -o sicp.epub --toc --epub-chapter-level=3 --number-sections --metadata=title:"Structure and Interpretation of Computer Programs—JavaScript Adaptation" --css ../$(CSS)/sicp.css --epub-cover-image=../$(IMAGES)/coverpage.png --epub-embed-font=../$(FONTS)/STIXGeneral-Bold-subset.woff --epub-embed-font=../$(FONTS)/STIXGeneral-Italic-subset.woff --epub-embed-font=../$(FONTS)/STIXGeneral-Regular-subset.woff --epub-embed-font=../$(FONTS)/STIXIntegralsD-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeFiveSym-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeFourSym-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeOneSym-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeThreeSym-Regular.woff --epub-embed-font=../$(FONTS)/STIXSizeTwoSym-Regular.woff --epub-embed-font=../$(FONTS)/dejamono-r-subset.woff --epub-embed-font=../$(FONTS)/dejasans-b-arrows.woff --epub-embed-font=../$(FONTS)/incons-r-subset.woff --epub-embed-font=../$(FONTS)/incons-rb-subset.woff --epub-embed-font=../$(FONTS)/incons-ri-subset.woff --epub-embed-font=../$(FONTS)/jsMath-cmex10-subset.woff --epub-embed-font=../$(FONTS)/linbio-r-subset.woff --epub-embed-font=../$(FONTS)/linbio-rb-subset.woff --epub-embed-font=../$(FONTS)/linbio-ri-subset.woff --epub-embed-font=../$(FONTS)/linlib-as-subset.woff --epub-embed-font=../$(FONTS)/linlib-r-subset.woff --epub-embed-font=../$(FONTS)/linlib-rb-subset.woff --epub-embed-font=../$(FONTS)/linlib-ri-subset.woff 

svg_pdf:
	./svg_to_pdf.sh

clean:
	rm -r $(DOCS)/*; \
	rm -r $(LATEX_PDF)/*; \
	rm -r $(LATEX_EPUB)/*; \
	rm -r $(GENERATED_HTML_JS)/*; \
	rm -r $(GENERATED_HTML_SPLIT)/*

try:
	cd $(DOCS); http-server

prepare: 
	cp -f latex/sicpjs.pdf latex/sicp.epub $(DOCS); \
	cp -rf $(GENERATED_HTML_JS)/* $(DOCS); \
	rm -r $(DOCS)/split; cp -rf $(GENERATED_HTML_SPLIT) $(DOCS)/splitg

install:
	cd $(DOCS); scp -p -r * sicp@web1.comp.nus.edu.sg:public_html; echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg"

staging:
	cd $(DOCS); scp -p -r * sicp@web1.comp.nus.edu.sg:public_html/staging; echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg/staging"

henz:
	cd $(DOCS); scp -p -r * henz@suna.comp.nus.edu.sg:public_html/sicp; echo "check the website and make sure everything works: https://www.comp.nus.edu.sg/~henz/sicpg"

