
# ----------------------------------------------------------------------------
# AC_COTERMINAL_GECKO_VERSION
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_GECKO_VERSION],
[AC_SUBST(COTERMINAL_GECKO_VERSION)
 AC_MSG_CHECKING(gecko version)
 AC_ARG_VAR(GECKOVER, [GECKO runtime version])

 if [[ $geckover ]];
 then
    COTERMINAL_GECKO_VERSION=$geckover
 else
    COTERMINAL_GECKO_VERSION=7.0
 fi

 AC_MSG_RESULT($COTERMINAL_GECKO_VERSION)
 ])

# ----------------------------------------------------------------------------
# AC_COTERMINAL_GECKO_ROOT_PATH 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_GECKO_ROOT_PATH],
[AC_SUBST(COTERMINAL_GECKO_ROOT_PATH)
 AC_SUBST(COTERMINAL_GECKO_INCLUDE)
 AC_SUBST(COTERMINAL_GECKO_LIBPATH)
 AC_SUBST(COTERMINAL_GECKO_LIBS)
 AC_SUBST(COTERMINAL_GECKO_MAJOR_VERSION)

 AC_MSG_CHECKING(gecko root path)
 AC_ARG_WITH(gecko, [  --with-gecko=GECKO gecko root path],,)

 if [[ $with_gecko ]];
 then
    COTERMINAL_GECKO_ROOT_PATH=$with_gecko
 else
     CURRENT=$PWD
     while [[ $PWD != "/" ]];
     do
        if [[ -d third_party/xulrunner ]];
        then
            if [[ $host_os = cygwin ]];
            then
                COTERMINAL_GECKO_ROOT_PATH=$(cygpath -ma $PWD)/third_party/xulrunner
            else
                COTERMINAL_GECKO_ROOT_PATH=$PWD/third_party/xulrunner
            fi
            break;
        fi
        cd ..
     done
     cd $CURRENT
 fi
 AC_MSG_RESULT($COTERMINAL_GECKO_ROOT_PATH)

 AC_MSG_CHECKING(gecko include path)
 COTERMINAL_GECKO_INCLUDE=" -I$COTERMINAL_GECKO_ROOT_PATH/$COTERMINAL_GECKO_VERSION/include/$COTERMINAL_PLATFORM "
 COTERMINAL_GECKO_INCLUDE+=" -I$COTERMINAL_GECKO_ROOT_PATH/$COTERMINAL_GECKO_VERSION/include "
 AC_MSG_RESULT($COTERMINAL_GECKO_INCLUDE_PATH)

 AC_MSG_CHECKING(gecko LDFLAG)
 case $target_os in
 cygwin*)
     COTERMINAL_LDFLAGS="/DLL "
     COTERMINAL_LIBPATH_FLAG=" /LIBPATH:"
     ;;
 darwin*)
     COTERMINAL_LDFLAGS=-dynamiclib
     COTERMINAL_LIBPATH_FLAG="-L"
     ;;
 *)
     COTERMINAL_LDFLAGS=-shared
     COTERMINAL_LIBPATH_FLAG="-L"
     ;;
 esac
 AC_MSG_RESULT($COTERMINAL_LDFLAG)

 AC_MSG_CHECKING(gecko LIBPATH flag)
 COTERMINAL_GECKO_LIBPATH=" $COTERMINAL_LIBPATH_FLAG\"$COTERMINAL_GECKO_ROOT_PATH/$COTERMINAL_GECKO_VERSION/lib/$COTERMINAL_PLATFORM\" "
 AC_MSG_RESULT($COTERMINAL_GECKO_LIBPATH)


 AC_MSG_CHECKING(gecko major version)
 COTERMINAL_GECKO_MAJOR_VERSION=`echo $COTERMINAL_GECKO_VERSION | sed -e "s/\\..*\$//"`
 AC_DEFINE_UNQUOTED(GECKO_MAJOR_VERSION, [$COTERMINAL_GECKO_MAJOR_VERSION], [Gecko runtime major version.])
 AC_MSG_RESULT($COTERMINAL_GECKO_MAJOR_VERSION)


 AC_MSG_CHECKING(gecko LIBS flag)
 case $COTERMINAL_GECKO_VERSION in
 1*)
     case $target_os in
     cygwin*)
         COTERMINAL_GECKO_LIBS=" xpcom.lib nspr4.lib xpcomglue_s.lib"
         ;;
     *)
         COTERMINAL_GECKO_LIBS=" -lxpcom -lnspr4 -lxpcomglue_s"
         ;;
     esac
     ;;
 
 2*)
     case $target_os in
     cygwin*)
         COTERMINAL_GECKO_LIBS=" xpcomglue_s_nomozalloc.lib xpcom.lib nspr4.lib mozalloc.lib"
         ;;
     *)
        COTERMINAL_GECKO_LIBS=" -lxpcomglue_s_nomozalloc -lxpcom -lnspr4 -lmozalloc"
         ;;
     esac
     ;;
 *)
     case $target_os in
     cygwin*)
         COTERMINAL_GECKO_LIBS=" xpcomglue_s_nomozalloc.lib xpcom.lib nspr4.lib mozalloc.lib"
         ;;
     *)
         COTERMINAL_GECKO_LIBS=" -lstdc++ -lxpcomglue_s_nomozalloc -lxpcom -lnspr4 -lmozalloc"
         ;;
     esac
     ;;
 esac
 AC_MSG_RESULT($COTERMINAL_GECKO_LIBS)






 ])

# ----------------------------------------------------------------------------
# AC_COTERMINAL_XPI_PLATFORM_DIRECTORY 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_XPI_PLATFORM_DIRECTORY],
[AC_SUBST(COTERMINAL_XPI_PLATFORM_DIRECTORY)
 AC_MSG_CHECKING(Platform directory)

 COTERMINAL_XPI_PLATFORM_DIRECTORY="platform/$COTERMINAL_GECKO_VERSION/$COTERMINAL_OS""_$COTERMINAL_ARCH-$COTERMINAL_ABI"

 AC_MSG_RESULT($COTERMINAL_XPI_PLATFORM_DIRECTORY)
 ])


# ----------------------------------------------------------------------------
# AC_COTERMINAL_XPIDL_PATH 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_XPIDL_PATH],
[AC_SUBST(COTERMINAL_XPIDL_PATH)
 AC_MSG_CHECKING(xpidl path)
 AC_ARG_WITH(xpidl, [  --with-xpidl=XPIDL xpidl path],,)

 if [[ $with_xpidl ]];
 then
    COTERMINAL_XPIDL_PATH=$with_xpidl
 else
    COTERMINAL_XPIDL_PATH=$PWD/tools/bin/$COTERMINAL_PLATFORM/xpidl
 fi

 AC_MSG_RESULT($COTERMINAL_XPIDL_PATH)
 ])

# ----------------------------------------------------------------------------
# AC_COTERMINAL_JS_PATH 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_COTERMINAL_JS_PATH],
[AC_SUBST(COTERMINAL_JS_PATH)
 AC_MSG_CHECKING(js path)
 AC_ARG_WITH(js, [  --with-js=JS js path],,)
 
 if [[ $with_js ]];
 then
    COTERMINAL_JS_PATH=$with_js
 else
    COTERMINAL_JS_PATH=$PWD/tools/bin/$COTERMINAL_PLATFORM/js
 fi

 AC_MSG_RESULT($COTERMINAL_JS_PATH)
 ])

