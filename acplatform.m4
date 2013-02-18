
# ----------------------------------------------------------------------------
# AC_TANASINN_OS
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_OS],
[AC_SUBST(TANASINN_OS)
 AC_MSG_CHECKING(target os)
 case $target_os in
 linux*)
     TANASINN_OS=Linux
     ;;
 darwin*)
     TANASINN_OS=Darwin
     ;;
 cygwin*)
     TANASINN_OS=WINNT
     ;;
 mingw*)
     TANASINN_OS=WINNT
     ;;
 *)
     TANASINN_OS=$(uname -s)
     ;;
 esac
 AC_MSG_RESULT($TANASINN_OS)
 ])


# ----------------------------------------------------------------------------
# AC_TANASINN_OPEN
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_OPEN],
[AC_SUBST(TANASINN_OPEN)
 AC_MSG_CHECKING(open command)
 case $target_os in
 linux*)
     TANASINN_OPEN=xdg-open
     ;;
 darwin*)
     TANASINN_OPEN=open
     ;;
 cygwin*)
     TANASINN_OPEN=cygstart
     ;;
 mingw*)
     TANASINN_OPEN=explorer
     ;;
 *)
     TANASINN_OPEN=xdg-open
     ;;
 esac
 AC_MSG_RESULT($TANASINN_OPEN)
 ])

# ----------------------------------------------------------------------------
# AC_TANASINN_ARCH
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_ARCH],
[AC_SUBST(TANASINN_ARCH)
 AC_MSG_CHECKING(target cpu architecture)
 TANASINN_ARCH=$target_cpu;

 case $target_cpu in
 i386|i686)
     TANASINN_ARCH=x86
     ;;
 x86_64)
     TANASINN_ARCH=x86_64
     ;;
 *)
     TANASINN_ARCH=$target_cpu
 esac

 AC_MSG_RESULT($TANASINN_ARCH)
 ])

# ----------------------------------------------------------------------------
# AC_TANASINN_ABI
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_ABI],
[AC_SUBST(TANASINN_ABI)
 AC_SUBST(CXXFLAGS)
 AC_SUBST(TANASINN_INCLUDE)
 AC_MSG_CHECKING(target compiler ABI)
 AC_ARG_VAR(abi, [target architecture])

 if [[ $abi ]];
 then
    TANASINN_ABI=$abi
 else
    case $target_os in
    cygwin)
        TANASINN_ABI='msvc'
        CXXFLAGS='-DXP_WIN'
        ;;
    *)
        TANASINN_ABI='gcc3'
        CXXFLAGS='-Wall -fvisibility=hidden -fno-rtti -fno-exceptions -fshort-wchar -fPIC -fno-common -O2'
        ;;
    esac

 fi
 AC_MSG_RESULT($TANASINN_ABI)
 ])

# ----------------------------------------------------------------------------
# AC_TANASINN_PLATFORM
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_PLATFORM],
[AC_SUBST(TANASINN_SUFFIX)
 AC_SUBST(TANASINN_LDFLAGS)
 AC_SUBST(TANASINN_CC)
 AC_SUBST(TANASINN_CXX)
 AC_SUBST(TANASINN_LINK)
 AC_SUBST(TANASINN_PLATFORM)
 AC_TANASINN_OS
 AC_TANASINN_ARCH
 AC_TANASINN_ABI

 case "$target_os" in
 darwin*)
     if [[ "$target_cpu" = "i386" ]];
     then
         TANASINN_CC="gcc -arch i386"
         TANASINN_CXX="g++ -arch i386"
     else
         TANASINN_CC="gcc -arch x86_64"
         TANASINN_CXX="g++ -arch x86_64"
     fi
     TANASINN_LINK=$TANASINN_CC
     TANASINN_PLATFORM=mac-$TANASINN_ARCH
     ;;
 mingw32*)
     TANASINN_CC="i386-mingw32-gcc"
     TANASINN_CXX="i386-mingw32-g++"
     TANASINN_LINK=$TANASINN_CC
     TANASINN_PLATFORM=win-$TANASINN_ARCH
     ;;
 cygwin*)
     TANASINN_CC="cl -nologo"
     TANASINN_CXX="cl -nologo"
     TANASINN_LINK="link"
     TANASINN_PLATFORM=win-$TANASINN_ARCH
     ;;
 linux*)
     TANASINN_CC="gcc -march=$target_cpu"
     TANASINN_CXX="g++ -march=$target_cpu"
     TANASINN_LINK=$TANASINN_CC
     TANASINN_PLATFORM=linux-$TANASINN_ARCH
     ;;
 *)
     if [[ "$target_cpu" = "i386" ]];
     then
         TANASINN_CC="gcc -m32"
         TANASINN_CXX="g++ -m32"
     else
         TANASINN_CC="gcc -m64"
         TANASINN_CXX="g++ -m64"
     fi
#     TANASINN_CC="gcc -march=$target_cpu"
#     TANASINN_CXX="g++ -march=$target_cpu"
     TANASINN_LINK=$TANASINN_CC
     TANASINN_PLATFORM=$target_os-$TANASINN_ARCH
     ;;
 esac
])

# ----------------------------------------------------------------------------
# AC_TANASINN_MODULE_EXT
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_MODULE_EXT],
[AC_SUBST(TANASINN_MODULE_EXT)
 AC_SUBST(TANASINN_OBJ_EXT)
 AC_SUBST(TANASINN_AR_OUT)
 AC_MSG_CHECKING(target os)
 case $target_os in
 linux*)
     TANASINN_MODULE_EXT=so
     TANASINN_OBJ_EXT=o
     TANASINN_AR_OUT=" -o "
     ;;
 darwin*)
     TANASINN_MODULE_EXT=dylib
     TANASINN_OBJ_EXT=o
     TANASINN_AR_OUT=" -o "
     ;;
 cygwin*)
     TANASINN_MODULE_EXT=dll
     TANASINN_OBJ_EXT=obj
     TANASINN_AR_OUT=" /out:"
     ;;
 mingw*)
     TANASINN_MODULE_EXT=dll
     TANASINN_OBJ_EXT=obj
     TANASINN_AR_OUT=" /out:"
     ;;
 *)
     TANASINN_MODULE_EXT=so
     TANASINN_OBJ_EXT=o
     TANASINN_AR_OUT=" /out:"
     ;;
 esac
 AC_MSG_RESULT($TANASINN_MODULE_EXT)
 ])

