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

"use strict";


function generateFileEntries(path) 
{
  var directory, entries, file;

  directory = Components
    .classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
  try {
    directory.initWithPath(path);
    if (directory.exists() && directory.isDirectory()) {
      entries = directory.directoryEntries;
      while (entries.hasMoreElements()) {
        file = entries.getNext();
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
var CGICompleter = new Class().extends(Component);
CGICompleter.definition = {

  id: "cgi_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('cgi'), enabled]":
  function complete(context)
  {
    var broker = this._broker,
        match = context.source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/),
        all,
        name,
        next,
        next_completer_info,
        next_completer,
        option,
        directory,
        entries,
        lower_name,
        candidates,
        completion_info;

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    all = match[0];
    name = match[2];
    next = match[3];

    if (next) {
      next_completer_info = context.completers.shift();
      if (next_completer_info) {
        completion_info = next_completer_info.split("/");
        next_completer = completion_info[0];
        option = completion_info[1];
        this.sendMessage(
          "command/query-completion/" + next_completer,
          {
            source: context.source.substr(all.length),
            option: option,
            completers: context.completers,
          });
      } else {
        this.sendMessage("event/answer-completion", null);
      }
      return;
    }

    directory = coUtils.File.getFileLeafFromVirtualPath(
      broker.runtime_path + "/" + broker.cgi_directory);
    entries = generateFileEntries(directory.path);

    lower_name = name.toLowerCase();
    candidates = [
      {
        key: file.leafName, 
        value: file.path,
      } for (file in entries) 
        if (file.isExecutable() && -1 !== file.leafName.toLowerCase().indexOf(lower_name))
    ];
    if (0 === candidates.length) {
      this.sendMessage("event/answer-completion", null);
      return;
    }
    this.sendMessage("event/answer-completion", {
      type: "text",
      query: context.source, 
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
var BatchCompleter = new Class().extends(Component);
BatchCompleter.definition = {

  id: "batch_completer",

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param context - The completion context object. 
   */
  "[completer('batch'), enabled]":
  function complete(context)
  {
    var broker = this._broker,
        match = context.source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/),
        all,
        name,
        next,
        next_completer_info,
        next_completer,
        option,
        directory,
        entries,
        lower_name,
        candidates;

    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }

    all = match[0];
    name = match[2];
    next = match[3];

    if (next) {
      next_completer_info = context.completers.shift();

      if (next_completer_info) {
        [next_completer, option] = next_completer_info.split("/");
        this.sendMessage(
          "command/query-completion/" + next_completer,
          {
            source: context.source.substr(all.length),
            option: option,
            completers: context.completers,
          });
      } else {
        this.sendMessage("event/answer-completion", null);
      }
      return;
    }

    if ("global" === context.option) {
      broker = broker._broker;
    }

    directory = coUtils.File.getFileLeafFromVirtualPath(
      broker.runtime_path + "/" + broker.batch_directory);
    entries = generateFileEntries(directory.path);

    lower_name = name.toLowerCase();
    candidates = [
      {
        key: file.leafName.replace(/\.js$/, ""), 
        value: file.path,
      } for (file in entries) 
        if (-1 !== file.leafName.toLowerCase().indexOf(lower_name))
    ];

    if (0 === candidates.length) {
      this.sendMessage("event/answer-completion", null);
      return;
    }
    this.sendMessage("event/answer-completion", {
      type: "text",
      query: context.source, 
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
var ProfileCompleter = new Class().extends(Component);
ProfileCompleter.definition = {

  id: "profile-completer",

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
    var broker, match, all, space, name, next,
        next_completer_info, next_completer, option,
        entries, lower_name, candidates;

    broker = this._broker;

    match = context.source.match(/^(\s*)([$_\-@a-zA-Z\.]*)(\s?)/);
    if (null === match) {
      this.sendMessage("event/answer-completion", null);
      return;
    }
    [all, space, name, next] = match;

    if (next) {
      next_completer_info = context.completers.shift();
      if (next_completer_info) {
        [next_completer, option] = next_completer_info.split("/");
        this.sendMessage("command/query-completion/" + next_completer, {
          source: context.source.substr(all.length),
          option: option,
          completers: context.completers,
        });
      } else {
        this.sendMessage("event/answer-completion", null);
      }
      return;
    }

    if ("global" === context.option) {
      broker = broker._broker;
    }

    entries = coUtils.File.getFileEntriesFromSerchPath(
        [broker.runtime_path + "/" + broker.profile_directory]);

    lower_name = name.toLowerCase();
    candidates = [
      {
        key: file.leafName.replace(/\.js$/, ""), 
        value: file.path,
      } for (file in entries) 
        if (-1 !== file.leafName.toLowerCase().indexOf(lower_name))
    ];

    if (0 === candidates.length) {
      this.sendMessage("event/answer-completion", null);
    } else {
      this.sendMessage(
        "event/answer-completion", 
        {
          type: "text",
          query: context.source, 
          data: candidates.map(
            function(candidate) 
            {
              return {
                name: candidate.key,
                value: String(candidate.value),
              };
            }),
        });
    }
  },

};


/**
 * @class FileCompleter
 *
 */
var FileCompleter = new Class().extends(Component);
FileCompleter.definition = {

  id: "file-completer",

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
    var broker, pattern, match, all, stem, leaf, candidates,
        home, lower_leaf, stem_length, cygwin_root;

    broker = this._broker;

    pattern = /^\s*(?:(.*\/))?(.*)?/;
    match = context.source.match(pattern);
    [all, stem, leaf] = match;
    candidates;
    home = coUtils.File.getFileLeafFromVirtualPath("$Home");

    leaf = leaf || "";

    lower_leaf = leaf.toLowerCase();
    stem_length = 0;

    if (stem) {
      if (!coUtils.File.isAbsolutePath(stem)) {
        if ("WINNT" === coUtils.Runtime.os) {
          cygwin_root = broker.cygwin_root;
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
      
    if (0 === candidates.length) {
      this.sendMessage("event/answer-completion", null);
    } else {
      this.sendMessage(
        "event/answer-completion",
        {
          type: "text",
          query: leaf, 
          data: candidates.map(
            function(path)
            {
              return {
                name: path, 
                value: path,
              }
            }),
        });
    }
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

// EOF
