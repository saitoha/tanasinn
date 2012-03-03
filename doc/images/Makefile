
UNZIP=unzip
WGET=wget
DITAA_DIST_URL="http://sourceforge.jp/frs/g_redir.php?m=jaist&f=%2Fditaa%2Fditaa%2F0.9%2Fditaa0_9.zip"

all: busmodel.png hebp.png systemstack.png topic.png tty.png

ditaa0_9.jar: ditaa0_9.zip
	$(UNZIP) -u $< $@

ditaa0_9.zip:
	$(WGET) $(DITAA_DIST_URL) -O $@

clean:
	$(RM) *.zip *.jar busmodel.png hebp.png systemstack.png topic.png tty.png

busmodel.png: ditaa0_9.jar busmodel.ditaa
	./ditaa --no-separation $< -o $@
	chmod -x $@

hebp.png: ditaa0_9.jar hebp.ditaa
	./ditaa --no-separation --round-corners $< -o $@
	chmod -x $@

systemstack.png: ditaa0_9.jar systemstack.ditaa
	./ditaa --round-corners $< -o $@
	chmod -x $@

topic.png: ditaa0_9.jar topic.ditaa
	./ditaa --no-separation --round-corners $< -o $@
	chmod -x $@

tty.png: ditaa0_9.jar tty.ditaa
	./ditaa --round-corners $< -o $@
	chmod -x $@
