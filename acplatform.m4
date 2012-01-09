
# ----------------------------------------------------------------------------
# AC_COTERMINAL_OS 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_OS],
[AC_SUBST(COTERMINAL_OS)
 AC_MSG_CHECKING(target os)
 case $target_os in
 linux*)
     COTERMINAL_OS=Linux
     ;;
 darwin*)
     COTERMINAL_OS=Darwin
     ;;
 cygwin*)
     COTERMINAL_OS=WINNT
     ;;
 mingw*)
     COTERMINAL_OS=WINNT
     ;;
 *)
     COTERMINAL_OS=$(uname -s)
     ;;
 esac 
 AC_MSG_RESULT($COTERMINAL_OS)
 ])


# ----------------------------------------------------------------------------
# AC_COTERMINAL_OPEN
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_OPEN],
[AC_SUBST(COTERMINAL_OPEN)
 AC_MSG_CHECKING(open command)
 case $target_os in
 linux*)
     COTERMINAL_OPEN=xdg-open
     ;;
 darwin*)
     COTERMINAL_OPEN=open
     ;;
 cygwin*)
     COTERMINAL_OPEN=cygstart
     ;;
 mingw*)
     COTERMINAL_OPEN=explorer
     ;;
 *)
     COTERMINAL_OPEN=xdg-open
     ;;
 esac 
 AC_MSG_RESULT($COTERMINAL_OS)
 ])

# ----------------------------------------------------------------------------
# AC_COTERMINAL_ARCH 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_ARCH],
[AC_SUBST(COTERMINAL_ARCH)
 AC_MSG_CHECKING(target cpu architecture)
 COTERMINAL_ARCH=$target_cpu;

 case $target_cpu in
 i386|i686)
     COTERMINAL_ARCH=x86
     ;;
 x86_64)
     COTERMINAL_ARCH=x86_64
     ;;
 *)
     COTERMINAL_ARCH=$target_cpu
 esac

 AC_MSG_RESULT($COTERMINAL_ARCH)
 ])

# ----------------------------------------------------------------------------
# AC_COTERMINAL_ABI 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_ABI],
[AC_SUBST(COTERMINAL_ABI)
 AC_SUBST(CXXFLAGS)
 AC_SUBST(COTERMINAL_INCLUDE)
 AC_MSG_CHECKING(target compiler ABI)
 AC_ARG_VAR(abi, [target architecture])

 if [[ $abi ]];
 then
    COTERMINAL_ABI=$abi
 else
    case $target_os in
    cygwin)
        COTERMINAL_ABI='msvc'
        CXXFLAGS='-DXP_WIN'
        ;;
    *)
        COTERMINAL_ABI='gcc3'
        CXXFLAGS='-Wall -fvisibility=hidden -fno-rtti -fno-exceptions -fshort-wchar -fPIC -fno-common -O2'
        ;;
    esac

 fi
 AC_MSG_RESULT($COTERMINAL_ABI)
 ])

# ----------------------------------------------------------------------------
# AC_COTERMINAL_PLATFORM 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_PLATFORM],
[AC_SUBST(COTERMINAL_SUFFIX)
 AC_SUBST(COTERMINAL_LDFLAGS)
 AC_SUBST(COTERMINAL_CC)
 AC_SUBST(COTERMINAL_CXX)
 AC_SUBST(COTERMINAL_LINK)
 AC_SUBST(COTERMINAL_PLATFORM)
 AC_COTERMINAL_OS
 AC_COTERMINAL_ARCH
 AC_COTERMINAL_ABI
 
 case "$target_os" in
 darwin*)
     if [[ "$target_cpu" = "i386" ]];
     then
         COTERMINAL_CC="gcc -arch i386"
         COTERMINAL_CXX="g++ -arch i386"
     else
         COTERMINAL_CC="gcc -arch x86_64"
         COTERMINAL_CXX="g++ -arch x86_64"
     fi
     COTERMINAL_LINK=$COTERMINAL_CC
     COTERMINAL_PLATFORM=mac-$COTERMINAL_ARCH
     ;;
 mingw32*)
     COTERMINAL_CC="i386-mingw32-gcc"
     COTERMINAL_CXX="i386-mingw32-g++"
     COTERMINAL_LINK=$COTERMINAL_CC
     COTERMINAL_PLATFORM=win-$COTERMINAL_ARCH
     ;;
 cygwin*)
     COTERMINAL_CC="cl -nologo"
     COTERMINAL_CXX="cl -nologo"
     COTERMINAL_LINK="link"
     COTERMINAL_PLATFORM=win-$COTERMINAL_ARCH
     ;;
 linux*)
     COTERMINAL_CC="gcc -march=$target_cpu"
     COTERMINAL_CXX="g++ -march=$target_cpu"
     COTERMINAL_LINK=$COTERMINAL_CC
     COTERMINAL_PLATFORM=linux-$COTERMINAL_ARCH
     ;;
 *)
     if [[ "$target_cpu" = "i386" ]];
     then
         COTERMINAL_CC="gcc -m32"
         COTERMINAL_CXX="g++ -m32"
     else
         COTERMINAL_CC="gcc -m64"
         COTERMINAL_CXX="g++ -m64"
     fi
#     COTERMINAL_CC="gcc -march=$target_cpu"
#     COTERMINAL_CXX="g++ -march=$target_cpu"
     COTERMINAL_LINK=$COTERMINAL_CC
     COTERMINAL_PLATFORM=$target_os-$COTERMINAL_ARCH
     ;;
 esac
])

# ----------------------------------------------------------------------------
# AC_COTERMINAL_MODULE_EXT 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_MODULE_EXT],
[AC_SUBST(COTERMINAL_MODULE_EXT)
 AC_SUBST(COTERMINAL_OBJ_EXT)
 AC_SUBST(COTERMINAL_AR_OUT)
 AC_MSG_CHECKING(target os)
 case $target_os in
 linux*)
     COTERMINAL_MODULE_EXT=so
     COTERMINAL_OBJ_EXT=o
     COTERMINAL_AR_OUT=" -o "
     ;;
 darwin*)
     COTERMINAL_MODULE_EXT=dylib
     COTERMINAL_OBJ_EXT=o
     COTERMINAL_AR_OUT=" -o "
     ;;
 cygwin*)
     COTERMINAL_MODULE_EXT=dll
     COTERMINAL_OBJ_EXT=obj
     COTERMINAL_AR_OUT=" /out:"
     ;;
 mingw*)
     COTERMINAL_MODULE_EXT=dll
     COTERMINAL_OBJ_EXT=obj
     COTERMINAL_AR_OUT=" /out:"
     ;;
 *)
     COTERMINAL_MODULE_EXT=so
     COTERMINAL_OBJ_EXT=o
     COTERMINAL_AR_OUT=" /out:"
     ;;
 esac 
 AC_MSG_RESULT($COTERMINAL_MODULE_EXT)
 ])

