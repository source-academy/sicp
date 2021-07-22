#!/bin/bash

rm -f /tmp/file.pdf 
mv $1 /tmp/file.pdf
gs \
 -sOutputFile=$1 \
 -sDEVICE=pdfwrite \
 -sColorConversionStrategy=Gray \
 -dProcessColorModel=/DeviceGray \
 -dCompatibilityLevel=1.4 \
 -dNOPAUSE \
 -dBATCH \
 /tmp/file.pdf 
