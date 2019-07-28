all: clean web pdf epub

web:
	$(MAKE) -C rails javascript

# If you exceed the TeX memory capacity on MikTeX:
# http://blog.analogmachine.org/2013/08/12/how-to-increase-miktex-2-9-memory/
pdf: 
	npm start
	cd latex && latexmk -pdf -pdflatex="pdflatex --synctex=1" -f sicpjs

epub:
	npm start epub && npm start epub
	cd latex && pandoc sicpjs.tex --listings -o sicp.epub --toc --epub-chapter-level=3 --number-sections --metadata=title:"Structure and Interpretation of Computer Programs (JavaScript Adaptation)" --css ../css/sicp.css --epub-cover-image=../rails/public/chapters/coverpage.png

svg_pdf:
	./svg_to_pdf.sh

clean:
	rm -rf rails-html
	$(MAKE) -C rails clean
	rm -rf latex
	rm -rf latex_epub

install: all
	cp latex/sicpjs.pdf rails-html; cd rails-html; scp -r * sicp@web1.comp.nus.edu.sg:public_html; echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg"
