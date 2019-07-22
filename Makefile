all: clean web pdf

web:
	$(MAKE) -C rails javascript

pdf: 
	npm start
	cd latex && latexmk -xelatex -pdf sicpjs

epub:
	npm start epub && npm start epub
	cd latex && pandoc sicpjs.tex --listings -o sicp.epub --toc --epub-chapter-level=3 --number-sections --css ../css/sicp.css --epub-cover-image=../rails/public/chapters/coverpage.png

clean:
	rm -rf rails-html
	$(MAKE) -C rails clean
	rm -rf latex

install: all
	cp latex/sicpjs.pdf rails-html; cd rails-html; scp -r * sicp@web1.comp.nus.edu.sg:public_html; echo "check the website and make sure everything works: https://sicp.comp.nus.edu.sg"
