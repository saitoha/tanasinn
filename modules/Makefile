
WGET=curl -O
PERL=perl
UNICODE_SOURCE=UnicodeData.txt
EASTASIAN_SOURCE=EastAsianWidth.txt
WCWIDTH_JS=unicode/wcwidth.js
WCWIDTH_GENERATOR=WcwidthGenerator.pl

MSTART="\\033[32m====================\>\\033[36m"
MEND="\\033[0m"
ESTART="\\033[31m"
EEND="\\033[36m"

all: $(MAKEFILE) $(WCWIDTH_JS)

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

$(WCWIDTH_JS): $(UNICODE_SOURCE) $(EASTASIAN_SOURCE) $(WCWIDTH_GENERATOR)
	@echo "$(MSTART) Generate JavaScript module....$(MEND)" 
	$(PERL) ./$(WCWIDTH_GENERATOR) > $@ || ($(RM) $@; exit 1)
	@echo "$(MSTART) Done. $(ESTART)$@$(EEND) generated. $(MEND)" 

$(UNICODE_SOURCE):
	@echo "$(MSTART) Get $@ from unicode.org....$(MEND)" 
	$(WGET) "http://unicode.org/Public/UNIDATA/$@"
	@echo "$(MSTART) Done.$(MEND)" 

$(EASTASIAN_SOURCE):
	@echo "$(MSTART) Get $@ from unicode.org....$(MEND)" 
	$(WGET) "http://unicode.org/Public/UNIDATA/$@"
	@echo "$(MSTART) Done.$(MEND)" 

clean:
	$(RM) $(WCWIDTH_JS)

maintainer-clean:
	$(RM) $(WCWIDTH_JS) $(UNICODE_SOURCE) $(EASTASIAN_SOURCE)

