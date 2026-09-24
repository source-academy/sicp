#%.png: %.dvi
#	dvipng -T tight -x 1200 -z 9 -o $@ $?

#%.png: %.ps
#	convert -trim -density 130x130 $? $@

%.png: %.pdf
	convert -rotate "-90" -density 70x70 $? $*_rotated.png; \
	convert -trim -transparent white $*_rotated.png $*.png

%.pdf: %.tex
	pdflatex $*

clean:
	rm background.png background.pdf