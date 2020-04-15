DOCS = docs

all: web pdf epub
	cp latex/sicpjs.pdf latex/sicp.epub $(DOCS); 

web:
	npm start web
	cd sicpjs_html

split:
	npm start web split
	cd sicp_split_html

# If you exceed the TeX memory capacity on MikTeX:
# http://blog.analogmachine.org/2013/08/12/how-to-increase-miktex-2-9-memory/
pdf: 
	npm start pdf
	cd latex && latexmk -pdf -pdflatex="pdflatex --synctex=1" -f sicpjs

epub:
	npm start epub
	cd latex && pandoc sicpjs.tex --listings -o sicp.epub --toc --epub-chapter-level=3 --number-sections --metadata=title:"Structure and Interpretation of Computer Programs—JavaScript Adaptation" --css ../css/sicp.css --epub-cover-image=../rails/public/chapters/coverpage.png --epub-embed-font=../epub3/fonts/STIXGeneral-Bold-subset.woff --epub-embed-font=../epub3/fonts/STIXGeneral-Italic-subset.woff --epub-embed-font=../epub3/fonts/STIXGeneral-Regular-subset.woff --epub-embed-font=../epub3/fonts/STIXIntegralsD-Regular.woff --epub-embed-font=../epub3/fonts/STIXSizeFiveSym-Regular.woff --epub-embed-font=../epub3/fonts/STIXSizeFourSym-Regular.woff --epub-embed-font=../epub3/fonts/STIXSizeOneSym-Regular.woff --epub-embed-font=../epub3/fonts/STIXSizeThreeSym-Regular.woff --epub-embed-font=../epub3/fonts/STIXSizeTwoSym-Regular.woff --epub-embed-font=../epub3/fonts/dejamono-r-subset.woff --epub-embed-font=../epub3/fonts/dejasans-b-arrows.woff --epub-embed-font=../epub3/fonts/incons-r-subset.woff --epub-embed-font=../epub3/fonts/incons-rb-subset.woff --epub-embed-font=../epub3/fonts/incons-ri-subset.woff --epub-embed-font=../epub3/fonts/jsMath-cmex10-subset.woff --epub-embed-font=../epub3/fonts/linbio-r-subset.woff --epub-embed-font=../epub3/fonts/linbio-rb-subset.woff --epub-embed-font=../epub3/fonts/linbio-ri-subset.woff --epub-embed-font=../epub3/fonts/linlib-as-subset.woff --epub-embed-font=../epub3/fonts/linlib-r-subset.woff --epub-embed-font=../epub3/fonts/linlib-rb-subset.woff --epub-embed-font=../epub3/fonts/linlib-ri-subset.woff 

svg_pdf:
	./svg_to_pdf.sh

clean:
	rm -rf $(DOCS)/*
	$(MAKE) -C rails clean
	rm -rf latex

install: all
	cd $(DOCS); scp -r * sicp@web1.comp.nus.edu.sg:public_html; echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg"

deploy_to_staging: all
	cd $(DOCS); scp -r * sicp@web1.comp.nus.edu.sg:public_html/staging; echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg"

tocs1101s: all
	cd $(DOCS); scp -r * cs1101s@sunfire.comp.nus.edu.sg:web1_public_html/. ; echo "now: ssh cs1101s@sunfire.comp.nus.edu.sg and: "; echo "scp -r web1_public_html/* sicp@web1.comp.nus.edu.sg:public_html"


