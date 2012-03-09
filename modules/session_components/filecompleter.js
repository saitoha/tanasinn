/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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


function generateFileEntries(path) 
{
  let directory = Components
    .classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
  try {
    directory.initWithPath(path);
    if (directory.exists() && directory.isDirectory()) {
      let entries = directory.directoryEntries;
      while (entries.hasMoreElements()) {
        let file = entries.getNext();
        yield file.QueryInterface(Components.interfaces.nsIFile);
      }
    }
  } catch (e) {
    coUtils.Debug.reportError(e);
  }
}

/**
 * @class CGICompleter
 *
 */
let CGICompleter = new Class().extends(Component);
CGICompleter.definition = {

  get id()
    "cgi_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('cgi'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let [all, space, name, next] = match;
    if (next) {
      let next_completer_info = completers.shift();
      if (next_completer_info) {
        let [next_completer, option] = next_completer_info.split("/");
        broker.notify(<>command/query-completion/{next_completer}</>, {
          source: source.substr(all.length),
          option: option,
          completers: completers,
        });
      } else {
        broker.notify("event/answer-completion", null);
      }
      return;
    }

    let directory = coUtils.File.getFileLeafFromVirtualPath(
      broker.runtime_path + "/" + broker.cgi_directory);
    let entries = generateFileEntries(directory.path);

    let lower_name = name.toLowerCase();
    let candidates = [
      {
        key: file.leafName, 
        value: file.path,
      } for (file in entries) 
        if (file.isExecutable() && -1 != file.leafName.toLowerCase().indexOf(lower_name))
    ];
    if (0 == candidates.length) {
      broker.notify("event/answer-completion", null);
      return;
    }
    broker.notify("event/answer-completion", {
      type: "text",
      query: source, 
      data: candidates.map(function(candidate) ({
        name: candidate.key,
        value: String(candidate.value),
      })),
    });
  },

};


/**
 * @class BatchCompleter
 *
 */
let BatchCompleter = new Class().extends(Component);
BatchCompleter.definition = {

  get id()
    "batch_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('batch'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let [all, space, name, next] = match;
    if (next) {
      let next_completer_info = completers.shift();
      if (next_completer_info) {
        let [next_completer, option] = next_completer_info.split("/");
        broker.notify(<>command/query-completion/{next_completer}</>, {
          source: source.substr(all.length),
          option: option,
          completers: completers,
        });
      } else {
        broker.notify("event/answer-completion", null);
      }
      return;
    }

    if ("global" == option) {
      broker = broker._broker;
    }

    let directory = coUtils.File.getFileLeafFromVirtualPath(
      broker.runtime_path + "/" + broker.batch_directory);
    let entries = generateFileEntries(directory.path);

    let lower_name = name.toLowerCase();
    let candidates = [
      {
        key: file.leafName.replace(/\.js$/, ""), 
        value: file.path,
      } for (file in entries) 
        if (-1 != file.leafName.toLowerCase().indexOf(lower_name))
    ];

    if (0 == candidates.length) {
      broker.notify("event/answer-completion", null);
      return;
    }
    broker.notify("event/answer-completion", {
      type: "text",
      query: source, 
      data: candidates.map(function(candidate) ({
        name: candidate.key,
        value: String(candidate.value),
      })),
    });
    return;
  },

};


/**
 * @class ProfileCompleter
 *
 */
let ProfileCompleter = new Class().extends(Component);
ProfileCompleter.definition = {

  get id()
    "profile-completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[completer('profile'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let match = source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let [all, space, name, next] = match;
    if (next) {
      let next_completer_info = completers.shift();
      if (next_completer_info) {
        let [next_completer, option] = next_completer_info.split("/");
        broker.notify(<>command/query-completion/{next_completer}</>, {
          source: source.substr(all.length),
          option: option,
          completers: completers,
        });
      } else {
        broker.notify("event/answer-completion", null);
      }
      return;
    }

    if ("global" == option) {
      broker = broker._broker;
    }

    let entries = coUtils.File.getFileEntriesFromSerchPath(
        [broker.runtime_path + "/" + broker.profile_directory]);

    let lower_name = name.toLowerCase();
    let candidates = [
      {
        key: file.leafName.replace(/\.js$/, ""), 
        value: file.path,
      } for (file in entries) 
        if (-1 != file.leafName.toLowerCase().indexOf(lower_name))
    ];
    if (0 == candidates.length) {
      broker.notify("event/answer-completion", null);
      return;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      data: candidates.map(function(candidate) ({
        name: candidate.key,
        value: String(candidate.value),
      })),
    };
    broker.notify("event/answer-completion", autocomplete_result);
    return;
  },

};


/**
 * @class FileCompleter
 *
 */
let FileCompleter = new Class().extends(Component);
FileCompleter.definition = {

  get id()
    "file-completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param source - The string to search for
   * @param listener - A listener to notify when the search is complete
   */
  "[completer('file'), enabled]":
  function complete(context)
  {
    let broker = this._broker;
    let { source, option, completers } = context;
    let pattern = /^\s*(?:(.*\/))?(.*)?/;
    let match = source.match(pattern);
    let [all, stem, leaf] = match;
    let candidates;
    let home = coUtils.File.getFileLeafFromVirtualPath("$Home");
    leaf = leaf || "";
    let lower_leaf = leaf.toLowerCase();
    let stem_length = 0;
    if (stem) {
      if (!coUtils.File.isAbsolutePath(stem)) {
        if ("WINNT" == coUtils.Runtime.os) {
          let cygwin_root = broker.uniget("get/cygwin-root");
          stem = cygwin_root + coUtils.File.getPathDelimiter() + stem;
        } else {
          stem = home.path + coUtils.File.getPathDelimiter() + stem;
        }
      }
      stem_length = stem.length;
      candidates = [file for (file in generateFileEntries(stem))];
    } else {
      candidates = [file for (file in generateFileEntries(home.path))];
      stem_length = home.path.length + 1;
    }
    candidates = candidates
      .map(function(file) file.path.substr(stem_length))
      .filter(function(path) path.toLowerCase().match(lower_leaf))
    if (0 == candidates.length) {
      broker.notify("event/answer-completion", autocomplete_result);
      return;
    }
    let autocomplete_result = {
      type: "text",
      query: leaf, 
      data: candidates.map(function(path) ({
        name: path, 
        value: path,
      })),
    };
    broker.notify("event/answer-completion", autocomplete_result);
  },

};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new CGICompleter(broker);
  new BatchCompleter(broker);
  new ProfileCompleter(broker);
  new FileCompleter(broker);
}


