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
 * The Initial Developer of the Original Code is
 * Hayaki Saito.
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2011
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";


function generateEntries(paths) 
{
  var file,
      directory,
      path,
      entries,
      i = 0;

  for (; i < paths.length; ++i) {

    path = paths[i];

    try {
      directory = coUtils.Components.createLocalFile(path);
      if (directory.exists() && directory.isDirectory()) {
        entries = directory.directoryEntries;
        while (entries.hasMoreElements()) {
          file = entries.getNext()
            .QueryInterface(Components.interfaces.nsIFile);
          if ("WINNT" === coUtils.Runtime.os 
              && file.isFile()
              && !file.path.match(/\.(dll|manifest)$/)) {
            yield file;
          } else {
            if (file.isSymlink() || file.isExecutable()) {
              yield file;
            } 
          }
        }
      }
    } catch (e) {
      coUtils.Debug.reportError(e);
    }
  }
}

/** 
 * @class ProgramCompleter
 */
var ProgramCompleter = new Class().extends(Plugin);
ProgramCompleter.definition = {

  id: "program-completer",

  _files: null,
  _search_path: null,

  getInfo: function getInfo()
  {
    return {
      name: _("Program Completer"),
      version: "0.1",
      description: _("Provides the completion information of executable programs.")
    };
  },

  "[persistable, watchable] enabled_when_startup": true,

  /** Installs itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstalls itself. 
   *  @param {InstallContext} context A InstallContext object.
   */
  "[uninstall]":
  function uninstall(context)
  {
  },

  "[subscribe('get/completer/program'), pnp]":
  function onCompletersRequested(broker)
  {
    return this;
  },

  _getSearchPath: function _getSearchPath()
  {
    var environment = coUtils.Components.getEnvironment(),
        path = environment.get("PATH"),
        // detect delimiter for PATH string
        delimiter = ("WINNT" === coUtils.Runtime.os) ? ";": ":", 
        paths;

    // split PATH string by delimiter and get existing paths
    paths = path.split(delimiter).filter(
      function filterProc(path) 
      {
        if (!path) {
          return false;
        }
        try {
          coUtils.File.exists(path);
        } catch (e) {
          return false;
        }
        return true;
      });
    return paths;
  },

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function startSearch(source, listener)
  {
    var lower_source = source.toLowerCase(),
        data,
        autocomplete_result;

    if (null === this._files) {
      this._prepareCompletionData();
    }

    data = this._files.map(
      function(file) 
      {
        var path = file.path;
        
        if ("WINNT" === coUtils.Runtime.os) {
          path = path
            .replace(/\\/g, "/")
            .replace(/.exe$/ig, "")
            .replace(
              /^([a-zA-Z]):/, 
              function() "/cygdrive/" + arguments[1].toLowerCase());
        } 
        return {
          name: path,
          value: path,
        };
      }).filter(
        function(data)
        {
          return -1 !== data.name
            .toLowerCase()
            .indexOf(lower_source);
        });

    if (0 === data.length) {
      listener.doCompletion(null);
      return -1;
    }

    autocomplete_result = {
      type: "text",
      query: source, 
      labels: data.map(
        function(data) 
        {
          return data.name.split("/").pop();
        }),
      comments: data.map(
        function(data)
        {
          return data.value;
        }),
      data: data,
    };

    listener.doCompletion(autocomplete_result);
    return 0;
  },

  _prepareCompletionData: function _prepareCompletionData()
  {
    var search_paths,
        files, 
        autocomplete_result,
        search_path = this._search_path,
        map,
        keys,
        key,
        i;

    if (null === this._search_path) {
      if ("WINNT" === coUtils.Runtime.os) {
        map = (coUtils.Runtime.getBinPath() || "/bin:/usr/local/bin")
          .split(":")
          .map(function mapFunc(posix_path) 
          {
            var cygwin_root = coUtils.Runtime.getCygwinRoot(),
                win_path = posix_path.replace(/\//g, "\\");

            return cygwin_root + "\\" + win_path;
          }).reduce(
            function(map, path) 
            {
              var key = path.replace(/\\$/, "");

              map[key] = undefined;
              return map; 
            }, {});

        keys = Object.keys(map);
        search_path = [];
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          search_path.push(key);
        }
      } else {
        search_path = this._getSearchPath();
      }
      this._search_path = search_path;
    }

    this._files = [file for (file in generateEntries(search_path))];
  },

  "[subscribe('event/idle'), pnp]": 
  function onIdle()
  {
    if (null !== this._files) {
      try {
        this._prepareCompletionData();
      } catch(e) {
        // pass
        this._files = []; 
      }
    }
  },
};

/**
 * @fn main
 * @brief Module entry point
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  new ProgramCompleter(desktop);
}

// EOF
