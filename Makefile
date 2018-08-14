javascript:
	$(MAKE) -C rails javascript
scheme:
	$(MAKE) -C rails scheme
clean:
	rm -rf rails-html
	$(MAKE) -C rails clean

install:	
	cd rails-html; zip -r sicp.zip *; mv sicp.zip ..; cd ..; scp sicp.zip cs1101s@sunfire.comp.nus.edu.sg:public_html/sicp; echo "LOG IN AND UNZIP: ssh cs1101s@sunfire.comp.nus.edu.sg, then cd public_html/sicp; unzip sicp.zip; chmod -R 755 *"
