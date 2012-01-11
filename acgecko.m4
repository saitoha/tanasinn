
# ----------------------------------------------------------------------------
# AC_TANASINN_GECKO_VERSION
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_GECKO_VERSION],
[AC_SUBST(TANASINN_GECKO_VERSION)
 AC_MSG_CHECKING(gecko version)
 AC_ARG_VAR(GECKOVER, [GECKO runtime version])

 if [[ $geckover ]];
 then
    TANASINN_GECKO_VERSION=$geckover
 else
    TANASINN_GECKO_VERSION=7.0
 fi

 AC_MSG_RESULT($TANASINN_GECKO_VERSION)
 ])

# ----------------------------------------------------------------------------
# AC_TANASINN_GECKO_ROOT_PATH 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_GECKO_ROOT_PATH],
[AC_SUBST(TANASINN_GECKO_ROOT_PATH)
 AC_SUBST(TANASINN_GECKO_INCLUDE)
 AC_SUBST(TANASINN_GECKO_LIBPATH)
 AC_SUBST(TANASINN_GECKO_LIBS)
 AC_SUBST(TANASINN_GECKO_MAJOR_VERSION)

 AC_MSG_CHECKING(gecko root path)
 AC_ARG_WITH(gecko, [  --with-gecko=GECKO gecko root path],,)

 if [[ $with_gecko ]];
 then
    TANASINN_GECKO_ROOT_PATH=$with_gecko
 else
     CURRENT=$PWD
     while [[ $PWD != "/" ]];
     do
        if [[ -d third_party/xulrunner ]];
        then
            if [[ $host_os = cygwin ]];
            then
                TANASINN_GECKO_ROOT_PATH=$(cygpath -ma $PWD)/third_party/xulrunner
            else
                TANASINN_GECKO_ROOT_PATH=$PWD/third_party/xulrunner
            fi
            break;
        fi
        cd ..
     done
     cd $CURRENT
 fi
 AC_MSG_RESULT($TANASINN_GECKO_ROOT_PATH)

 AC_MSG_CHECKING(gecko include path)
 TANASINN_GECKO_INCLUDE=" -I$TANASINN_GECKO_ROOT_PATH/$TANASINN_GECKO_VERSION/include/$TANASINN_PLATFORM "
 TANASINN_GECKO_INCLUDE+=" -I$TANASINN_GECKO_ROOT_PATH/$TANASINN_GECKO_VERSION/include "
 AC_MSG_RESULT($TANASINN_GECKO_INCLUDE_PATH)

 AC_MSG_CHECKING(gecko LDFLAG)
 case $target_os in
 cygwin*)
     TANASINN_LDFLAGS="/DLL "
     TANASINN_LIBPATH_FLAG=" /LIBPATH:"
     ;;
 darwin*)
     TANASINN_LDFLAGS=-dynamiclib
     TANASINN_LIBPATH_FLAG="-L"
     ;;
 *)
     TANASINN_LDFLAGS=-shared
     TANASINN_LIBPATH_FLAG="-L"
     ;;
 esac
 AC_MSG_RESULT($TANASINN_LDFLAG)

 AC_MSG_CHECKING(gecko LIBPATH flag)
 TANASINN_GECKO_LIBPATH=" $TANASINN_LIBPATH_FLAG\"$TANASINN_GECKO_ROOT_PATH/$TANASINN_GECKO_VERSION/lib/$TANASINN_PLATFORM\" "
 AC_MSG_RESULT($TANASINN_GECKO_LIBPATH)


 AC_MSG_CHECKING(gecko major version)
 TANASINN_GECKO_MAJOR_VERSION=`echo $TANASINN_GECKO_VERSION | sed -e "s/\\..*\$//"`
 AC_DEFINE_UNQUOTED(GECKO_MAJOR_VERSION, [$TANASINN_GECKO_MAJOR_VERSION], [Gecko runtime major version.])
 AC_MSG_RESULT($TANASINN_GECKO_MAJOR_VERSION)


 AC_MSG_CHECKING(gecko LIBS flag)
 case $TANASINN_GECKO_VERSION in
 1*)
     case $target_os in
     cygwin*)
         TANASINN_GECKO_LIBS=" xpcom.lib nspr4.lib xpcomglue_s.lib"
         ;;
     *)
         TANASINN_GECKO_LIBS=" -lxpcom -lnspr4 -lxpcomglue_s"
         ;;
     esac
     ;;
 
 2*)
     case $target_os in
     cygwin*)
         TANASINN_GECKO_LIBS=" xpcomglue_s_nomozalloc.lib xpcom.lib nspr4.lib mozalloc.lib"
         ;;
     *)
        TANASINN_GECKO_LIBS=" -lxpcomglue_s_nomozalloc -lxpcom -lnspr4 -lmozalloc"
         ;;
     esac
     ;;
 *)
     case $target_os in
     cygwin*)
         TANASINN_GECKO_LIBS=" xpcomglue_s_nomozalloc.lib xpcom.lib nspr4.lib mozalloc.lib"
         ;;
     *)
         TANASINN_GECKO_LIBS=" -lstdc++ -lxpcomglue_s_nomozalloc -lxpcom -lnspr4 -lmozalloc"
         ;;
     esac
     ;;
 esac
 AC_MSG_RESULT($TANASINN_GECKO_LIBS)






 ])

# ----------------------------------------------------------------------------
# AC_TANASINN_XPI_PLATFORM_DIRECTORY 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_XPI_PLATFORM_DIRECTORY],
[AC_SUBST(TANASINN_XPI_PLATFORM_DIRECTORY)
 AC_MSG_CHECKING(Platform directory)

 TANASINN_XPI_PLATFORM_DIRECTORY="platform/$TANASINN_GECKO_VERSION/$TANASINN_OS""_$TANASINN_ARCH-$TANASINN_ABI"

 AC_MSG_RESULT($TANASINN_XPI_PLATFORM_DIRECTORY)
 ])


# ----------------------------------------------------------------------------
# AC_TANASINN_XPIDL_PATH 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_XPIDL_PATH],
[AC_SUBST(TANASINN_XPIDL_PATH)
 AC_MSG_CHECKING(xpidl path)
 AC_ARG_WITH(xpidl, [  --with-xpidl=XPIDL xpidl path],,)

 if [[ $with_xpidl ]];
 then
    TANASINN_XPIDL_PATH=$with_xpidl
 else
    TANASINN_XPIDL_PATH=$PWD/tools/bin/$TANASINN_PLATFORM/xpidl
 fi

 AC_MSG_RESULT($TANASINN_XPIDL_PATH)
 ])

# ----------------------------------------------------------------------------
# AC_TANASINN_JS_PATH 
# ----------------------------------------------------------------------------
#
AC_DEFUN([AC_TANASINN_JS_PATH],
[AC_SUBST(TANASINN_JS_PATH)
 AC_MSG_CHECKING(js path)
 AC_ARG_WITH(js, [  --with-js=JS js path],,)
 
 if [[ $with_js ]];
 then
    TANASINN_JS_PATH=$with_js
 else
    TANASINN_JS_PATH=$PWD/tools/bin/$TANASINN_PLATFORM/js
 fi

 AC_MSG_RESULT($TANASINN_JS_PATH)
 ])

