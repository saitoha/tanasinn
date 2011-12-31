

all: cp932.txt
	./convert.pl $< > $<.js

cp932.txt:
	curl -o cp932.txt http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP932.TXT 

