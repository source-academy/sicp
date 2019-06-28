web:
	$(MAKE) -C rails javascript

pdf: 
	npm start
	cd latex && latexmk -xelatex -pdf sicpjs

clean:
	rm -rf rails-html
	$(MAKE) -C rails clean
	rm -rf latex

install:	
	cp latex/sicpjs.pdf rails-html; cd rails-html; tar cfv sicp.tar *; mv sicp.tar ..; cd ..; scp sicp.tar sicp@web1.comp.nus.edu.sg:public_html; echo "LOG IN AND UNTAR: ssh sicp@web1.comp.nus.edu.sg, then cd public_html; tar xfv sicp.tar"
