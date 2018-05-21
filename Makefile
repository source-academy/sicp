javascript:
	$(MAKE) -C rails javascript
scheme:
	$(MAKE) -C rails scheme
clean:
	rm -rf rails-html
	$(MAKE) -C rails clean

