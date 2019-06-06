web:
	$(MAKE) -C rails javascript

pdf: 
	babel-node ./nodejs/index.js
	cd latex && latexmk -xelatex -pdf sicpjs

clean:
	rm -rf rails-html
	$(MAKE) -C rails clean
	rm -rf latex

install:	
	cd rails-html; zip -r sicp.zip *; mv sicp.zip ..; cd ..; scp sicp.zip cs1101s@sunfire.comp.nus.edu.sg:public_html/sicp; echo "LOG IN AND UNZIP: ssh cs1101s@sunfire.comp.nus.edu.sg, then cd public_html/sicp; unzip sicp.zip; chmod -R 755 *"
