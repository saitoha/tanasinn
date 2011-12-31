/* $Id: image.c,v 1.36 2003/07/07 15:49:03 ukai Exp $ */

#include "fm.h"
#include <sys/types.h>
#include <sys/stat.h>
#include <signal.h>
#include <errno.h>
#include <unistd.h>
#ifdef HAVE_WAITPID
#include <sys/wait.h>
#endif

#ifdef USE_IMAGE

static int image_index = 0;

/* display image */

typedef struct _termialImage {
    ImageCache *cache;
    short x;
    short y;
    short sx;
    short sy;
    short width;
    short height;
} TerminalImage;

static TerminalImage *terminal_image = NULL;
static int n_terminal_image = 0;
static int max_terminal_image = 0;
static int openImgdisplay();
int getCharSize();

void
initImage()
{
    if (activeImage)
	return;
    if (getCharSize())
	activeImage = TRUE;
}

int
getCharSize()
{
    int w = 0, h = 0;
    printf("\x1b]99;w3m-getcharsize:%d:%d\x07", COLS, LINES);
    fscanf(stdin, "%d %d", &w, &h);
    if (!(w > 0 && h > 0))
	return FALSE;
    if (!set_pixel_per_char)
	pixel_per_char = (int)(1.0 * w / COLS + 0.5);
    if (!set_pixel_per_line)
	pixel_per_line = (int)(1.0 * h / LINES + 0.5);
    return TRUE;
}

void
termImage()
{
    clearImage();
}

static int
openImgdisplay()
{
    activeImage = TRUE;
    return TRUE;
}

void
addImage(ImageCache * cache, int x, int y, int sx, int sy, int w, int h)
{
    TerminalImage *i;

    if (!activeImage)
	return;
    if (n_terminal_image >= max_terminal_image) {
	max_terminal_image = max_terminal_image ? (2 * max_terminal_image) : 8;
	terminal_image = New_Reuse(TerminalImage, terminal_image,
				   max_terminal_image);
    }
    i = &terminal_image[n_terminal_image];
    i->cache = cache;
    i->x = x;
    i->y = y;
    i->sx = sx;
    i->sy = sy;
    i->width = w;
    i->height = h;
    n_terminal_image++;
}

void
drawImage()
{
    static char buf[1024];
    int j, draw = FALSE;
    TerminalImage *i;

    if (!activeImage)
	return;
    if (!n_terminal_image) {
	fputs("\x1b]99;w3m-clear\x07", stdout);
    fflush(stdout);
	return;
    }


    for (j = 0; j < n_terminal_image; j++) {
	i = &terminal_image[j];
	if (!(i->cache->loaded & IMG_FLAG_LOADED &&
	      i->width > 0 && i->height > 0))
	    continue;
    if (!activeImage)
    activeImage = TRUE;
	if (i->cache->index > 0) {
	    i->cache->index *= -1;
	    ;	/* DrawImage() */
	}
	else
	    ;	/* DrawImage(redraw) */
	sprintf(buf, "\x1b]99;w3m-draw:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%s\x07",
        i->cache->index > 0 ? 0 : 1,
		(-i->cache->index - 1) % MAX_IMAGE + 1, i->x, i->y,
		(i->cache->width > 0) ? i->cache->width : 0,
		(i->cache->height > 0) ? i->cache->height : 0,
		i->sx, i->sy, i->width, i->height, i->cache->file);
	fputs(buf, stdout);
    fflush(stdout);
	draw = TRUE;
    }
    if (!draw)
	return;
    touch_cursor();
    refresh();
}

void
clearImage()
{
	fputs("\x1b]99;w3m-clear\x07", stdout);
    fflush(stdout);
    n_terminal_image = 0;
}

/* load image */

#ifndef MAX_LOAD_IMAGE
#define MAX_LOAD_IMAGE 8
#endif
static int n_load_image = 0;
static Hash_sv *image_hash = NULL;
static Hash_sv *image_file = NULL;
static GeneralList *image_list = NULL;
static ImageCache **image_cache = NULL;
static Buffer *image_buffer = NULL;

void
deleteImage(Buffer *buf)
{
    AnchorList *al;
    Anchor *a;
    int i;

    if (!buf)
	return;
    al = buf->img;
    if (!al)
	return;
    for (i = 0, a = al->anchors; i < al->nanchor; i++, a++) {
	if (a->image && a->image->cache &&
	    a->image->cache->loaded != IMG_FLAG_UNLOADED &&
	    !(a->image->cache->loaded & IMG_FLAG_DONT_REMOVE) &&
	    a->image->cache->index < 0)
	    unlink(a->image->cache->file);
    }
    loadImage(NULL, IMG_FLAG_STOP);
}

void
getAllImage(Buffer *buf)
{
    AnchorList *al;
    Anchor *a;
    ParsedURL *current;
    int i;

    image_buffer = buf;
    if (!buf)
	return;
    buf->image_loaded = TRUE;
    al = buf->img;
    if (!al)
	return;
    current = baseURL(buf);
    for (i = 0, a = al->anchors; i < al->nanchor; i++, a++) {
	if (a->image) {
	    a->image->cache = getImage(a->image, current, buf->image_flag);
	    if (a->image->cache &&
		a->image->cache->loaded == IMG_FLAG_UNLOADED)
		buf->image_loaded = FALSE;
	}
    }
}

void
showImageProgress(Buffer *buf)
{
    AnchorList *al;
    Anchor *a;
    int i, l, n;

    if (!buf)
	return;
    al = buf->img;
    if (!al)
	return;
    for (i = 0, l = 0, n = 0, a = al->anchors; i < al->nanchor; i++, a++) {
	if (a->image && a->hseq >= 0) {
	    n++;
	    if (a->image->cache && a->image->cache->loaded & IMG_FLAG_LOADED)
		l++;
	}
    }
    if (n) {
	message(Sprintf("%d/%d images loaded", l, n)->ptr,
		buf->cursorX + buf->rootX, buf->cursorY + buf->rootY);
	refresh();
    }
}

void
loadImage(Buffer *buf, int flag)
{
    ImageCache *cache;
    struct stat st;
    int i, draw = FALSE;
    /* int wait_st; */

    if (maxLoadImage > MAX_LOAD_IMAGE)
	maxLoadImage = MAX_LOAD_IMAGE;
    else if (maxLoadImage < 1)
	maxLoadImage = 1;
    if (n_load_image == 0)
	n_load_image = maxLoadImage;
    if (!image_cache) {
	image_cache = New_N(ImageCache *, MAX_LOAD_IMAGE);
	bzero(image_cache, sizeof(ImageCache *) * MAX_LOAD_IMAGE);
    }
    for (i = 0; i < n_load_image; i++) {
	cache = image_cache[i];
	if (!cache)
	    continue;
	if (lstat(cache->touch, &st))
	    continue;
	if (cache->pid) {
	    kill(cache->pid, SIGKILL);
	    /*
	     * #ifdef HAVE_WAITPID
	     * waitpid(cache->pid, &wait_st, 0);
	     * #else
	     * wait(&wait_st);
	     * #endif
	     */
	    cache->pid = 0;
	}
	if (!stat(cache->file, &st)) {
	    cache->loaded = IMG_FLAG_LOADED;
	    if (getImageSize(cache)) {
		if (image_buffer)
		    image_buffer->need_reshape = TRUE;
	    }
	    draw = TRUE;
	}
	else
	    cache->loaded = IMG_FLAG_ERROR;
	unlink(cache->touch);
	image_cache[i] = NULL;
    }

    for (i = (buf != image_buffer) ? 0 : maxLoadImage; i < n_load_image; i++) {
	cache = image_cache[i];
	if (!cache)
	    continue;
	if (cache->pid) {
	    kill(cache->pid, SIGKILL);
	    /*
	     * #ifdef HAVE_WAITPID
	     * waitpid(cache->pid, &wait_st, 0);
	     * #else
	     * wait(&wait_st);
	     * #endif
	     */
	    cache->pid = 0;
	}
	unlink(cache->touch);
	image_cache[i] = NULL;
    }

    if (flag == IMG_FLAG_STOP) {
	image_list = NULL;
	image_file = NULL;
	n_load_image = maxLoadImage;
	image_buffer = NULL;
	return;
    }

    if (draw && image_buffer) {
	drawImage();
	showImageProgress(image_buffer);
    }

    image_buffer = buf;

    if (!image_list)
	return;
    for (i = 0; i < n_load_image; i++) {
	if (image_cache[i])
	    continue;
	while (1) {
	    cache = (ImageCache *) popValue(image_list);
	    if (!cache) {
		for (i = 0; i < n_load_image; i++) {
		    if (image_cache[i])
			return;
		}
		image_list = NULL;
		image_file = NULL;
		if (image_buffer)
		    displayBuffer(image_buffer, B_NORMAL);
		return;
	    }
	    if (cache->loaded == IMG_FLAG_UNLOADED)
		break;
	}
	image_cache[i] = cache;

	flush_tty();
	if ((cache->pid = fork()) == 0) {
	    Buffer *b;
	    /*
	     * setup_child(TRUE, 0, -1);
	     */
	    setup_child(FALSE, 0, -1);
	    image_source = cache->file;
	    b = loadGeneralFile(cache->url, cache->current, NULL, 0, NULL);
	    if (!b || !b->real_type || strncasecmp(b->real_type, "image/", 6))
		unlink(cache->file);
#if defined(HAVE_SYMLINK) && defined(HAVE_LSTAT)
	    symlink(cache->file, cache->touch);
#else
	    {
		FILE *f = fopen(cache->touch, "w");
		if (f)
		    fclose(f);
	    }
#endif
	    exit(0);
	}
	else if (cache->pid < 0) {
	    cache->pid = 0;
	    return;
	}
    }
}

ImageCache *
getImage(Image * image, ParsedURL *current, int flag)
{
    Str key = NULL;
    ImageCache *cache;

    if (!activeImage)
	return NULL;
    if (!image_hash)
	image_hash = newHash_sv(100);
    if (image->cache)
	cache = image->cache;
    else {
	key = Sprintf("%d;%d;%s", image->width, image->height, image->url);
	cache = (ImageCache *) getHash_sv(image_hash, key->ptr, NULL);
    }
    if (cache && cache->index && abs(cache->index) <= image_index - MAX_IMAGE) {
	struct stat st;
	if (stat(cache->file, &st))
	    cache->loaded = IMG_FLAG_UNLOADED;
	cache->index = 0;
    }

    if (!cache) {
	if (flag == IMG_FLAG_SKIP)
	    return NULL;

	cache = New(ImageCache);
	cache->url = image->url;
	cache->current = current;
	cache->file = tmpfname(TMPF_DFL, image->ext)->ptr;
	cache->touch = tmpfname(TMPF_DFL, NULL)->ptr;
	cache->pid = 0;
	cache->index = 0;
	cache->loaded = IMG_FLAG_UNLOADED;
	cache->width = image->width;
	cache->height = image->height;
	putHash_sv(image_hash, key->ptr, (void *)cache);
    }
    if (flag != IMG_FLAG_SKIP) {
	if (cache->loaded == IMG_FLAG_UNLOADED) {
	    if (!image_file)
		image_file = newHash_sv(100);
	    if (!getHash_sv(image_file, cache->file, NULL)) {
		putHash_sv(image_file, cache->file, (void *)cache);
		if (!image_list)
		    image_list = newGeneralList();
		pushValue(image_list, (void *)cache);
	    }
	}
	if (!cache->index)
	    cache->index = ++image_index;
    }
    if (cache->loaded & IMG_FLAG_LOADED)
	getImageSize(cache);
    return cache;
}

int
getImageSize(ImageCache * cache)
{
    Str tmp;
    FILE *f;
    int w = 0, h = 0;

    if (!activeImage)
	return FALSE;
    if (!cache || !(cache->loaded & IMG_FLAG_LOADED) ||
	(cache->width > 0 && cache->height > 0))
	return FALSE;

    printf("\x1b]99;w3m-size:5:%s\x07", cache->file);
    fscanf(stdin, "%d %d", &w, &h);

    if (!(w > 0 && h > 0))
	return FALSE;
    w = (int)(w * image_scale / 100 + 0.5);
    if (w == 0)
	w = 1;
    h = (int)(h * image_scale / 100 + 0.5);
    if (h == 0)
	h = 1;
    if (cache->width < 0 && cache->height < 0) {
	cache->width = (w > MAX_IMAGE_SIZE) ? MAX_IMAGE_SIZE : w;
	cache->height = (h > MAX_IMAGE_SIZE) ? MAX_IMAGE_SIZE : h;
    }
    else if (cache->width < 0) {
	int tmp = (int)((double)cache->height * w / h + 0.5);
	cache->width = (tmp > MAX_IMAGE_SIZE) ? MAX_IMAGE_SIZE : tmp;
    }
    else if (cache->height < 0) {
	int tmp = (int)((double)cache->width * h / w + 0.5);
	cache->height = (tmp > MAX_IMAGE_SIZE) ? MAX_IMAGE_SIZE : tmp;
    }
    if (cache->width == 0)
	cache->width = 1;
    if (cache->height == 0)
	cache->height = 1;
    tmp = Sprintf("%d;%d;%s", cache->width, cache->height, cache->url);
    putHash_sv(image_hash, tmp->ptr, (void *)cache);
    return TRUE;
}
#endif
