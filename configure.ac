#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ(2.61)
AC_INIT([coterminal],[0.1],[user@zuse.jp])

AC_CANONICAL_TARGET

#
## Checks for programs.
#AC_PROG_CXX
#AC_PROG_CC
#AC_PROG_CPP

AC_CHECK_PROG(PERL, perl, perl) 
[[ -z "${PERL}" ]] && AC_MSG_ERROR(perl was not found.)

AC_CHECK_PROG(ZIP, zip, zip) 
[[ -z "${ZIP}" ]] && AC_MSG_ERROR(zip was not found.)


## Checks for libraries.
#
## Checks for header files.
#AC_CHECK_HEADERS([sys/ioctl.h termios.h unistd.h])
#
## Checks for typedefs, structures, and compiler characteristics.
#AC_HEADER_STDBOOL
#AC_C_INLINE
#AC_TYPE_PID_T
#AC_TYPE_SIZE_T
#AC_TYPE_SSIZE_T
#
## Checks for library functions.
#AC_CHECK_FUNCS([setenv])
#

AC_SUBST([COTERMINAL_DISPLAY_NAME])
COTERMINAL_DISPLAY_NAME="coTerminal"

AC_SUBST([COTERMINAL_PACKAGE_NAME])
COTERMINAL_PACKAGE_NAME="coterminal"

AC_SUBST([COTERMINAL_PACKAGE_NAME_IN_UPPERCASE])
COTERMINAL_PACKAGE_NAME_IN_UPPERCASE="COTERMINAL"

AC_SUBST([COTERMINAL_PACKAGE_NAME_IN_TITLECASE])
COTERMINAL_PACKAGE_NAME_IN_TITLECASE="CoTerminal"

AC_SUBST([COTERMINAL_VENDER_DOMAIN])
COTERMINAL_VENDER_DOMAIN="zuse.jp"

AC_SUBST([COTERMINAL_MAINCLASS_CLSID])
COTERMINAL_MAINCLASS_CLSID="{8ab15470-ae93-11df-9b17-4f32a2ed9ec8}"

AC_DEFINE([COTERMINAL_MAINCLASS_CID_IN_STRUCTURE_FORMAT],
          [{0x8ab15470,0xae93,0x11df,{0x9b,0x17,0x4f,0x32,0xa2,0xed,0x9e,0xc8}}],
          [Main class CID in structure format.])

AC_SUBST([COTERMINAL_XPI_ID])
COTERMINAL_XPI_ID=$COTERMINAL_PACKAGE_NAME@$COTERMINAL_VENDER_DOMAIN

AC_SUBST([COTERMINAL_MAINCLASS_CONTRACT_ID])
COTERMINAL_MAINCLASS_CONTRACT_ID=@$COTERMINAL_VENDER_DOMAIN/$COTERMINAL_PACKAGE_NAME/coTeletypeSessionFactory$';'1

AC_SUBST([COTERMINAL_MAINCLASS_INTERFACE_NAME])
COTERMINAL_MAINCLASS_INTERFACE_NAME=coITeletypeSessionFactory

AC_DEFINE_UNQUOTED([COTERMINAL_MAINCLASS_CONTRACT_ID], 
          ["$COTERMINAL_MAINCLASS_CONTRACT_ID"],
          [Main class ContractID])

AC_SUBST([COTERMINAL_FIREFOX_APPID])
COTERMINAL_FIREFOX_APPID="{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"

AC_SUBST([COTERMINAL_BUILD_BINARY_COMPONENT])
case $target_os in
cygwin*)
    COTERMINAL_BUILD_BINARY_COMPONENT=0
    ;;
*)
    COTERMINAL_BUILD_BINARY_COMPONENT=1
    ;;
esac

m4_include([acplatform.m4])
AC_COTERMINAL_OS
AC_COTERMINAL_MODULE_EXT
AC_COTERMINAL_ARCH
AC_COTERMINAL_ABI
AC_COTERMINAL_PLATFORM

m4_include([acgecko.m4])
AC_COTERMINAL_GECKO_VERSION
AC_COTERMINAL_GECKO_ROOT_PATH
AC_COTERMINAL_XPI_PLATFORM_DIRECTORY
AC_COTERMINAL_XPIDL_PATH
AC_COTERMINAL_JS_PATH

# ----------------------------------------------------------------------------
# AC_COTERMINAL_OS 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TPUT_STRING],
[AC_SUBST([COTERMINAL_TPUT_MSTART])
 AC_SUBST([COTERMINAL_TPUT_MEND])
 AC_SUBST([COTERMINAL_TPUT_ESTART])
 AC_SUBST([COTERMINAL_TPUT_EEND])
 AC_MSG_CHECKING(host supports SGR sequence)

 case $host_os in
 cygwin*|mingw*)
     AC_MSG_RESULT(no)
     ;;
 *)
     AC_MSG_RESULT(yes)
     ;;
 esac 
 ])
AC_TPUT_STRING


#
#case $target_os in
#cygwin)
#    CC="cl -nologo"
#    CXX="cl -nologo"
#    CPP="cl -E -nologo"
#    CXXFLAGS="/DXP_WIN"
#    ;;
#darwin)
#    CC=gcc-4.2
#    CXX=g++-4.2
#    CXXFLAGS="-Wall -fvisibility=hidden -fno-rtti -fno-exceptions -fshort-wchar -fPIC -fno-common -O2"
#    ;;
#esac
#


AC_CONFIG_FILES([Makefile 
                 chrome.manifest 
                 install.rdf 
                 modules/common/config.js
                 ])

AC_OUTPUT
