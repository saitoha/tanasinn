
WGET=wget
PERL=perl
UNICODE_SOURCE=UnicodeData.txt
EASTASIAN_SOURCE=EastAsianWidth.txt
CATEGORY_JS=common/category.js
EASTASIAN_JS=common/eastasian.js
CATEGORY_GENERATOR=UnicodeCategoryDetector.pl
EASTASIAN_GENERATOR=EastAsianWidthDetectorGenerator.pl

MSTART="\\033[32m====================\>\\033[36m"
MEND="\\033[0m"
ESTART="\\033[31m"
EEND="\\033[36m"


all: $(MAKEFILE) $(CATEGORY_JS) $(EASTASIAN_JS)

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

$(CATEGORY_JS): $(UNICODE_SOURCE) $(CATEGORY_GENERATOR)
	@echo "$(MSTART) Generate JavaScript module....$(MEND)" 
	$(PERL) ./$(CATEGORY_GENERATOR) > $@ || ($(RM) $@; exit 1)

	@echo "$(MSTART) Done. $(ESTART)$@$(EEND) generated. $(MEND)" 

$(EASTASIAN_JS): $(EASTASIAN_SOURCE) $(EASTASIAN_GENERATOR)
	@echo "$(MSTART) Generate JavaScript module....$(MEND)" 
	$(PERL) ./$(EASTASIAN_GENERATOR) > $@ || ($(RM) $@; exit 1)
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

maintainer-clean:
	$(RM) $(EASTASIAN_JS) $(EASTASIAN_SOURCE)

