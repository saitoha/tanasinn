
all: vim/src/vim

vim:
	hg clone https://vim.googlecode.com/hg/ vim

vim/src/vim: vim
	cd vim && \
	hg patch ../vim.patch -m "apply tanasinn patch." && \
       	./configure --enable-multibyte --with-feature=big && \
	make && \
	sudo make install
