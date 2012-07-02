
var process, desktop;

try {
  Components
    .classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader)
    .loadSubScript("resource://tanasinn/common/process.js");

  process = Components.classes['@zuse.jp/tanasinn/process;1']
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;

  process.notify("event/new-window-detected", window);

  desktop = process.uniget("get/desktop-from-window", window);

  desktop.start(window.document.documentElement);
} catch (e) {
  alert(e);
}

