#!/bin/sh

# Using Inkscape 1.0rc1 (09960d6, 2020-04-09), Pango version: 1.43.0, on MacOS 10.14.6 

# DIR=`cd ..; pwd`

# # Process all svgs in the javascript version
# find $DIR/static/img_javascript -name "*.svg" | xargs -I _ inkscape -D --file=_ --export-pdf=_.pdf
# # Process all svgs in the original version
# find $DIR/static/img_original -name "*.svg" | xargs -I _ inkscape -D --file=_ --export-pdf=_.pdf

make svgs
