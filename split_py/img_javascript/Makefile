#%.png: %.dvi
#	dvipng -T tight -x 1200 -z 9 -o $@ $?

#%.png: %.ps
#	convert -trim -density 130x130 $? $@

scheme_inline_footnote_%.png: scheme_inline_footnote_%.pdf
	convert -trim -density 100x100 $? scheme_inline_footnote_$*_trimmed.png; \
	convert -transparent white -shave 14x0 scheme_inline_footnote_$*_trimmed.png scheme_inline_footnote_$*.png

scheme_inline_%.png: scheme_inline_%.pdf
	convert -trim -density 130x130 $? scheme_inline_$*_trimmed.png; \
	convert -transparent white -shave 18x0 scheme_inline_$*_trimmed.png scheme_inline_$*.png

javascript_inline_footnote_%.png: javascript_inline_footnote_%.pdf
	convert -trim -density 100x100 $? javascript_inline_footnote_$*_trimmed.png ; \
	convert -transparent white -shave 14x0 javascript_inline_footnote_$*_trimmed.png javascript_inline_footnote_$*.png

javascript_inline_%.png: javascript_inline_%.pdf
	convert -trim -density 130x130 $? javascript_inline_$*_trimmed.png; \
	convert -transparent white -shave 18x0 javascript_inline_$*_trimmed.png javascript_inline_$*.png

javascript_noeval_%.png: javascript_noeval_%.pdf
	convert -trim -density 130x130 $? javascript_noeval_$*_trimmed.png; \
	convert -transparent white -border 5x5 -bordercolor transparent javascript_noeval_$*_trimmed.png javascript_noeval_$*.png

scheme_noeval_%.png: scheme_noeval_%.pdf
	convert -trim -density 130x130 $? scheme_noeval_$*_trimmed.png; \
	convert -transparent white -border 5x5 -bordercolor transparent scheme_noeval_$*_trimmed.png scheme_noeval_$*.png

latex_inline_footnote_%.png: latex_inline_footnote_%.pdf
	convert -trim -density 100x100 $? latex_inline_footnote_$*_trimmed.png ; \
	convert -transparent white -shave 14x0 latex_inline_footnote_$*_trimmed.png latex_inline_footnote_$*.png

latex_inline_%.png: latex_inline_%.pdf
	convert -trim -density 130x130 $? latex_inline_$*_trimmed.png; \
	convert -transparent white -shave 18x0 latex_inline_$*_trimmed.png latex_inline_$*.png

latex_%.png: latex_%.pdf
	convert -transparent white -trim -density 130x130 $? latex_$*.png

scheme_footnote_%.png: scheme_footnote_%.pdf
	convert -trim -density 100x100 $? scheme_footnote_$*_trimmed.png; \
	convert -border 5x5 -bordercolor white scheme_footnote_$*_trimmed.png scheme_footnote_$*_border.png; \
	convert -colorize 25,20,5 scheme_footnote_$*_border.png $@

javascript_footnote_%.png: javascript_footnote_%.pdf
	convert -trim -density 100x100 $? javascript_footnote_$*_trimmed.png; \
	convert -border 5x5 -bordercolor white javascript_footnote_$*_trimmed.png javascript_footnote_$*_border.png; \
	convert -colorize 25,20,5 javascript_footnote_$*_border.png $@

%.png: %.pdf
	convert -trim -density 130x130 $? $*_trimmed.png; \
	convert -border 5x5 -bordercolor white $*_trimmed.png $*_border.png; \
	convert -colorize 25,20,5 $*_border.png $@

%.ps: %.dvi
	dvips -o $@ $?

%.dvi: %.tex
	latex $*

%.pdf: %.tex
	pdflatex $*

# uuencoding from http://madboa.com/geek/openssl/#encrypt-base64

%.png.uu: %.png
	openssl enc -base64 -in $? > $@

fresh: tidy
	rm -f javascript_*.png scheme_*.png latex_*.png

tidy: 
	rm -f *.tex; \
	rm -f *.dvi; \
	rm -f *.log; \
	rm -f *.aux; \
	rm -f *.pdf; \
	rm -f *~; \
	rm -f *_trimmed.png; \
	rm -f *_border.png
