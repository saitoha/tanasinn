#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ(2.61)

AC_INIT([tanasinn],[0.3.3.26],[user@zuse.jp])

AC_CANONICAL_TARGET

# Checks for programs.
AC_CHECK_PROG(PERL, perl, perl)
[[ -z "${PERL}" ]] && AC_MSG_ERROR(perl was not found.)

AC_CHECK_PROG(ZIP, zip, zip)
[[ -z "${ZIP}" ]] && AC_MSG_ERROR(zip was not found.)

AC_CHECK_PROG(TPUT, tput, tput)
AC_CHECK_PROG(CPP, cpp, cpp)
AC_CHECK_PROG(ASCIIDOC, asciidoc, asciidoc)
#[[ -n "${ASCIIDOC}" ]] && AC_MSG_ERROR(asciidoc was not found.)

AC_SUBST([TANASINN_PACKAGE_NAME])
TANASINN_PACKAGE_NAME="tanasinn"

AC_SUBST([TANASINN_VENDOR_DOMAIN])
TANASINN_VENDOR_DOMAIN="zuse.jp"

AC_SUBST([TANASINN_DISPLAY_NAME])
TANASINN_DISPLAY_NAME="tanasinn"

AC_SUBST([TANASINN_XPI_ID])
TANASINN_XPI_ID=$TANASINN_PACKAGE_NAME@$TANASINN_VENDOR_DOMAIN

AC_SUBST([TANASINN_FIREFOX_APPID])
TANASINN_FIREFOX_APPID="{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"

m4_include([acplatform.m4])
AC_TANASINN_OS
AC_TANASINN_OPEN
AC_TANASINN_ARCH
AC_TANASINN_PLATFORM

m4_include([acgecko.m4])
AC_TANASINN_JS_PATH

AC_CONFIG_FILES([Makefile
                 doc/define.h
                 doc/Makefile
                 doc/tanasinn/index.html
                 tools/bin/Makefile
                 modules/common/config.js
                 chrome.manifest
                 install.rdf])
AC_OUTPUT

