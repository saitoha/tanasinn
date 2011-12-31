
#include <stdio.h>
#include <limits.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    if (argc < 2)
        return -1;
    printf("[%s]\n", argv[1]);
    char buffer[PATH_MAX];
    printf("\x1b]98;putImage file://%s 8 4\x07", realpath(*++argv, buffer));
    return 0;
}
