
WGET=wget
PERL=perl
SOURCE=EastAsianWidth.txt
OUTFILE=eastasian.js
GENERATOR=EastAsianWidthDetectorGenerator.pl

MSTART="\\033[32m====================\>\\033[36m"
MEND="\\033[0m"
ESTART="\\033[31m"
EEND="\\033[36m"


all: $(MAKEFILE) $(OUTFILE)

../configure: ../configure.ac ../acgecko.m4 ../acplatform.m4
#	@echo "$(MSTART) Regenerate configure script....$(MEND)" 
#	cd .. && autoconf
#	@echo "$(MSTART) Done.$(MEND)" 

Makefile: ../configure
#	@echo "$(MSTART) Regenerate Makefile....$(MEND)" 
#	cd .. && ./configure
#	@echo "$(MSTART) Done.$(MEND)" 
#	$(MAKE)
#	exit 1

$(OUTFILE): $(SOURCE) $(GENERATOR)
	@echo "$(MSTART) Generate JavaScript module....$(MEND)" 
	$(PERL) ./$(GENERATOR) > $@ || ($(RM) $@; exit 1)
	@echo "$(MSTART) Done. $(ESTART)$@$(EEND) generated. $(MEND)" 

$(SOURCE):
	@echo "$(MSTART) Get $(SOURCE) from unicode.org....$(MEND)" 
	$(WGET) "http://unicode.org/Public/UNIDATA/$@"
	@echo "$(MSTART) Done.$(MEND)" 

clean:

maintainer-clean:
	$(RM) $(OUTFILE) $(SOURCE)

