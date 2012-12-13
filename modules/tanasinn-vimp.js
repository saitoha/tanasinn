/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is tanasinn
 *
 * The Initial Developer of the Original Code is * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

try {

   /**
   * @fn getTanasinnProcess
   */
  var getTanasinnProcess = function getTanasinnProcess() 
      {
        var current_file = Components.stack
              .filename
              .split(" -> ").pop()
              .split("?").shift()
              .replace(/^liberator:\/\/template\//, ""),
            id = new Date().getTime(),
            file = current_file + "/../../tanasinn/modules/common/process.js?" + id,
            scope = {};

        Components
          .classes["@mozilla.org/moz/jssubscript-loader;1"]
          .getService(Components.interfaces.mozIJSSubScriptLoader)
          .loadSubScript(file, scope);
        
        return scope.g_process;
      },
      getDesktop = function getDesktop() 
      {
        var process = getTanasinnProcess(),
            desktops = process.notify("get/desktop-from-window", window),
            desktop;

        if (desktops) {
          desktop = desktops.filter(
            function filterProc(desktop)
            {
              return desktop;
            })[0];
          if (desktop) {
            return desktop;
          }
        }
        desktop = process.callSync("event/new-window-detected", window);
        return desktop;
      };

  var liberator = window.liberator,
      commands = liberator.modules.commands,
      completion = liberator.modules.completion,
      mappings = liberator.modules.mappings,
      modes = liberator.modules.modes,
      editor = liberator.modules.editor,
      desktop = getDesktop();
  
  /**
   * @command tanasinnlaunch 
   */
  commands.addUserCommand(["tanasinnlaunch", "tla[unch]"], 
    "Show tanasinn's Launcher.", 
    function tanasinnLaunch(args) 
    { 
      desktop.notify("command/show-launcher");
    }
  );
  
  /**
   * @command tanasinncommand 
   */
  commands.addUserCommand(["tanasinnstart", "tstart"], 
    "Run a operating system command on tanasinn.", 
    function tanasinnStart(args) 
    { 
      desktop.notify("command/start-session", args.string);
    },
    { 
      argCount: "?",
      completer: function (context) completion.shellCommand(context),
      bang: true,
      literal: 0,
    } 
  );
  
  /**
   * @command tanasinnsend 
   */
  commands.addUserCommand(["tanasinncommand", "tcommand"], 
    "Run a tanasinn command on active tanasinn sessions.", 
    function sendCommand(args) 
    { 
      desktop.notify("command/send-command", args.string);
    },
    { 
      argCount: "?",
      bang: true,
      literal: 0,
    } 
  );
  
  /**
   * @command tanasinnsendkeys
   */
  commands.addUserCommand(["tanasinnsendkeys", "tsend"], 
    "Send keys to tanasinn.", 
    function send_keys(args) 
    { 
      desktop.notify("command/send-keys", args.string);
    },
    { 
      argCount: "?",
      bang: true,
      literal: 0,
    } 
  );
  
  /**
   * Hooks "<C-i>" and "gF" key mappings and runs "g:tanasinneditorcommand" 
   * or "g:tanasinnviewsourcecommand", instead of default "editor" option.
   */
  var default_func = editor.editFileExternally;

  editor.editFileExternally = function editFileExternally(path) 
  {
    var editor_command = liberator.globalVariables.tanasinneditorcommand,
        viewsource_command = liberator.globalVariables.tanasinnviewsourcecommand,
        command;

    if (/^(?:http|https|ftp):\/\//.test(path)) {
      // when path is url spec. (path is expected to be escaped.)
      if (!viewsource_command) {
        default_func.apply(liberator.modules.editor, arguments);
      } else {
        // make nsIURL
        var url = Components
          .classes["@mozilla.org/network/standard-url;1"]
          .createInstance(Components.interfaces.nsIURL);
        url.spec = path;
        
        // make nsILocalFile
        var file = Components
          .classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsILocalFile);
        io.withTempFiles(
          function (tmpfile)
          {
try {
            // save URL to file
            var persist = Components
              .classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
              .createInstance(Components.interfaces.nsIWebBrowserPersist);
            persist.saveURI(url,
                            /* aCacheKey */ null,
                            /* aReferrer */ null,
                            /* aPostData */ null,
                            /* aExtraHeaders */ null,
                            tmpfile,
                            /* aPrivacyContext */ null);
            window.setTimeout(
              function timerFunc()
              {
                desktop.notify(
                  "command/start-session", 
                  viewsource_command.replace(/%/g, tmpfile.path));
              }, 1000);
} catch (e) {alert(e)}
          });
      };
    } else { // when path is native one.
      if (!editor_command) {
        default_func.apply(liberator.modules.editor, arguments);
      } else {
        command = editor_command.replace(/%/g, path);
        desktop.notify("command/start-session-and-wait", command);
      }
    }
  };

} catch (e) {
  var message = "Error at " + e.fileName + ":" + e.lineNumber + " " + String(e);
  liberator.log(message);
  liberator.echoerr(message);
}

// EOF
