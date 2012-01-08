#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ(2.61)
AC_INIT([coterminal],[0.1],[coterminal@zuse.jp])

AC_CANONICAL_TARGET

# Checks for programs.

AC_CHECK_PROG(PERL, perl, perl) 
[[ -z "${PERL}" ]] && AC_MSG_ERROR(perl was not found.)

AC_CHECK_PROG(ZIP, zip, zip) 
[[ -z "${ZIP}" ]] && AC_MSG_ERROR(zip was not found.)

AC_CHECK_PROG(ASCIIDOC, asciidoc, asciidoc) 
#[[ -n "${ASCIIDOC}" ]] && AC_MSG_ERROR(zip was not found.)

AC_SUBST([COTERMINAL_PACKAGE_NAME])
COTERMINAL_PACKAGE_NAME="coterminal"

AC_SUBST([COTERMINAL_PACKAGE_NAME])
COTERMINAL_PACKAGE_NAME="coterminal"

AC_SUBST([COTERMINAL_VENDER_DOMAIN])
COTERMINAL_VENDER_DOMAIN="zuse.jp"

AC_SUBST([COTERMINAL_DISPLAY_NAME])
COTERMINAL_DISPLAY_NAME="coTerminal"

AC_SUBST([COTERMINAL_XPI_ID])
COTERMINAL_XPI_ID=$COTERMINAL_PACKAGE_NAME@$COTERMINAL_VENDER_DOMAIN

AC_SUBST([COTERMINAL_FIREFOX_APPID])
COTERMINAL_FIREFOX_APPID="{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"

m4_include([acplatform.m4])
AC_COTERMINAL_OS
AC_COTERMINAL_OPEN
#AC_COTERMINAL_MODULE_EXT
AC_COTERMINAL_ARCH
#AC_COTERMINAL_ABI
AC_COTERMINAL_PLATFORM

m4_include([acgecko.m4])
#AC_COTERMINAL_GECKO_VERSION
#AC_COTERMINAL_GECKO_ROOT_PATH
#AC_COTERMINAL_XPI_PLATFORM_DIRECTORY
#AC_COTERMINAL_XPIDL_PATH
AC_COTERMINAL_JS_PATH

# ----------------------------------------------------------------------------
# AC_COTERMINAL_OS 
# ----------------------------------------------------------------------------
#
AC_CONFIG_FILES([Makefile 
                 doc/Makefile
                 chrome.manifest 
                 install.rdf 
                 ])
AC_OUTPUT

