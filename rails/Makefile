# mkdir public/chapters
# cp -r img_original public/chapters/
javascript:
	cd config/initializers && cp -f constants.rb.def constants.rb && \
	sed -i'' -e '/LANGUAGE_VERSION/d' constants.rb && \
	echo "LANGUAGE_VERSION=\"javascript\"" >> constants.rb
	$(MAKE) generate
scheme:
	cd config/initializers && cp -f constants.rb.def constants.rb && \
	sed -i '/LANGUAGE_VERSION/d' constants.rb && \
	echo "LANGUAGE_VERSION=\"scheme\"" >> constants.rb
	$(MAKE) generate
generate:
	test -s config/initializers/constants.rb || \
    cp config/initializers/constants.rb.def config/initializers/constants.rb
	bundle install
	bundle exec rake db:migrate
	bundle exec rake db:schema:load
	rails runner app/helpers/import_textbook.rb "$(shell cd .. && echo $(PWD))"
	rails s -d
	bundle exec rake static:generate
	if test -f tmp/pids/server.pid; then kill `cat tmp/pids/server.pid`; fi
	mv out ../rails-html
clean:
	rm -rf out
	rm -f log/development.log
	rm -rf tmp/*
	rm -f db/development.sqlite3
	rm -f db/test.sqlite3
