

all: cp932.txt.js jis0212.txt.js jis0208.txt.js jis0201.txt.js


cp932.txt.js: cp932.txt
	./convert.pl $< > $@

jis0212.txt.js: jis0212.txt
	./convert.pl $< > $@

jis0208.txt.js: jis0208.txt
	./convert.pl $< > $@

jis0201.txt.js: jis0201.txt
	./convert.pl $< > $@

cp932.txt:
	curl -o $@ http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP932.TXT 

jis0212.txt:
	curl -o $@ http://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/JIS/JIS0212.TXT

jis0208.txt:
	curl -o $@ http://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/JIS/JIS0208.TXT

jis0201.txt:
	curl -o $@ http://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/JIS/JIS0201.TXT

clean:
	rm *.txt.js

