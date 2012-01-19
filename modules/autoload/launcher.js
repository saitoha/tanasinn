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

/**
 * @abstruct CompleterBase
 */
let CompleterBase = new Abstruct().extends(Component);
CompleterBase.definition = {

  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker)
  {
    broker.subscribe(
      <>get/completer/{this.type}</>, 
      let (self = this) function() self);
  },

};

/**
 * @abstruct ComletionDisplayDriverBase
 */
let CompletionDisplayDriverBase = new Abstruct().extends(Component);
CompletionDisplayDriverBase.definition = {

  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker)
  {
    broker.subscribe(
      <>get/completion-display-driver/{this.type}</>, 
      let (self = this) function() self);
    broker.notify(<>initialized/{this.id}</>, this);
  },

};


function generateEntries(paths) 
{
  for (let [, path] in Iterator(paths)) {
    let directory = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    try {
      directory.initWithPath(path);
      if (directory.exists() && directory.isDirectory()) {
        let entries = directory.directoryEntries;
        while (entries.hasMoreElements()) {
          let file = entries.getNext()
            .QueryInterface(Components.interfaces.nsIFile);
          if ("WINNT" == coUtils.Runtime.os 
              && file.isFile()
              && !file.path.match(/\.(dll|manifest)$/)) {
            yield file;
          } else {
            if (file.isExecutable()) {
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
let ProgramCompleter = new Class().extends(CompleterBase);
ProgramCompleter.definition = {

  get id()
    "program-completer",

  get type()
    "program",

  cygwin_search_path: [
    "/bin", 
    "/usr/local/bin"
  ],

  _getSearchPath: function _getSearchPath()
  {
    let environment = Components
      .classes["@mozilla.org/process/environment;1"].
      getService(Components.interfaces.nsIEnvironment);
    let path = environment.get("PATH");
    let delimiter = ("WINNT" == coUtils.Runtime.os) ? ";": ":"
    let paths = path.split(delimiter)
      .filter(function(path) {
        if (!path)
          return false;
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
    let broker = this._broker;
    let lower_source = source.toLowerCase();
    let search_path;
    if ("WINNT" == coUtils.Runtime.os) {
      let search_path = this.cygwin_search_path.map(function(posix_path) 
      {
        return broker.cygwin_root + "\\" + posix_path.replace(/\//g, "\\");
      });
      let map = search_path.reduce(function(map, path) {
        let key = path.replace(/\\$/, "");
        map[key] = undefined;
        return map; 
      }, {});
      search_path = [key for ([key,] in Iterator(map))];
    } else {
      search_path = this._getSearchPath();
    }
    let files = [file for (file in generateEntries(search_path))];
    let data = files.map(function(file) {
      let path = file.path;
      if ("WINNT" == coUtils.Runtime.os) {
        path = path
          .replace(/\\/g, "/")
          .replace(/.exe$/ig, "")
          .replace(
            /^([a-zA-Z]):/, 
            function() String(<>/cygdrive/{arguments[1].toLowerCase()}</>));
      }
      return {
        name: path,
        value: path,
      };
    }).filter(function(data) {
      return -1 != data.name
        .toLowerCase()
        .indexOf(lower_source);
    });
    if (0 == data.length) {
      listener.doCompletion(null);
      return -1;
    }
    let autocomplete_result = {
      type: "text",
      query: source, 
      labels: data.map(function(data) data.name.split("/").pop()),
      comments: data.map(function(data) data.value),
      data: data,
    };
    listener.doCompletion(autocomplete_result);
    return 0;
  },

};

coUtils.Sessions = {

  _records: null,
  _dirty: true,

  session_data_path: "$Home/.tanasinn/sessions.txt",

  remove: function remove(request_id)
  {
    delete this._records[request_id];
    this._dirty = true;
    coUtils.Timer.setTimeout(function() {
      let backup_data_path = String(<>$Home/.tanasinn/persist/{request_id}.txt</>);
      let file = coUtils.File.getFileLeafFromAbstractPath(backup_data_path);
      if (file.exists()) {
        file.remove(true);
      }
      backup_data_path = String(<>$Home/.tanasinn/persist/{request_id}.png</>);
      file = coUtils.File.getFileLeafFromAbstractPath(backup_data_path);
      if (file.exists()) {
        file.remove(true);
      }
    }, 1000);
  },

  get: function get(request_id)
  {
    if (!this._records) {
      this.load();
    }
    return this._records[request_id];
  },

  load: function load() 
  {
    this._records = {};
    if (coUtils.File.exists(this.session_data_path)) {
      let sessions = coUtils.IO.readFromFile(this.session_data_path);
      let lines = sessions.split(/[\r\n]+/);
      lines.forEach(function(line) {
        let sequence = line.split(",");
        if (sequence.length > 4) {
          let [request_id, command, control_port, pid, ttyname] = sequence;
          this._records[request_id] = {
            request_id: request_id,
            command: command && coUtils.Text.base64decode(command),
            control_port: Number(control_port),
            pid: Number(pid),
            ttyname: ttyname,
          }
        };
      }, this);
    }
    this._dirty = false;
  },

  update: function update()
  {
    let lines = [""];
    for (let [request_id, record] in Iterator(this._records)) {
      let line = [
        request_id,
        coUtils.Text.base64encode(record.command),
        record.control_port,
        record.pid,
        record.ttyname
      ].join(",");
      lines.unshift(line);
    }
    let content = lines.join("\n");
    coUtils.IO.writeToFile(this.session_data_path, content);
    this._dirty = false;
  },

  getRecords: function getRecords()
  {
    if (!this._records) {
      this.load();
    }
    return this._records;
  },

};

let ProcessManager = new Class().extends(Component);
ProcessManager.definition = {

  get id()
    "process-manager",

  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker)
  {
    broker.notify(<>initialized/{this.id}</>, this);
  },

  /** Checks if the process is running. 
   *  It runs the command "kill -0 <pid>" and checks return value... if it 
   *  failed, the process is not available.
   *  @param {Number} pid the process ID to be checked.
   *  @return {Boolean} boolean value whether the specified process is 
   *                    available. 
   */
  processIsAvailable: function processIsAvailable(pid) 
  {
    return 0 == this.sendSignal(0, pid);
    if ("number" != typeof pid) {
      throw coUtils.Debug.Exception(
        _("sendSignal: Invalid argument is detected. [%s]"), 
        pid);
    }
    let runtime_path;
    let args;
    if ("WINNT" == coUtils.Runtime.os) {
      let broker = this._broker;
      runtime_path = String(<>{broker.cygwin_root}\bin\run.exe</>);
      args = [ "/bin/ps", "-p", String(pid) ];
    } else { // Darwin, Linux or FreeBSD
      runtime_path = "/bin/ps";
      args = [ "-p", String(pid) ];
    }

    // create new localfile object.
    let runtime = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    runtime.initWithPath(runtime_path);

    // create new process object.
    let process = Components
      .classes["@mozilla.org/process/util;1"]
      .createInstance(Components.interfaces.nsIProcess);
    process.init(runtime);

    try {
      process.run(/* blocking */ true, args, args.length);
    } catch (e) {
      coUtils.Debug.reportMessage(
        _("command '%s' failed."), 
        args.join(" "));
      return false;
    }
    return 0 == process.exitValue;
  },

  /** Sends a signal to specified process. it runs "kill" command.
   *  @param {Number} signal value to be sent.
   *  @param {Number} pid the process ID to be checked.
   *  @return {Number} a return value of kill command. 
   */
  sendSignal: function sendSignal(signal, pid) 
  {
    if ("number" != typeof signal || "number" != typeof pid) {
      throw coUtils.Debug.Exception(
        _("sendSignal: Invalid arguments are detected. [%s, %s]"), 
        signal, pid);
    }
    let runtime_path;
    let args;
    if ("WINNT" == coUtils.Runtime.os) {
      let broker = this._broker;
      runtime_path = String(<>{broker.cygwin_root}\bin\run.exe</>);
      args = [ "kill", "-wait", "-" + signal, String(pid) ];
    } else { // Darwin, Linux or FreeBSD
      runtime_path = "/bin/kill";
      args = [ "-" + signal, String(pid) ];
    }

    // create new localfile object.
    let runtime = Components
      .classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
    runtime.initWithPath(runtime_path);

    // create new process object.
    let process = Components
      .classes["@mozilla.org/process/util;1"]
      .createInstance(Components.interfaces.nsIProcess);
    process.init(runtime);

    try {
      process.run(/* blocking */ true, args, args.length);
    } catch (e) {
      coUtils.Debug.reportMessage(
        _("command '%s' failed."), 
        args.join(" "));
      return false;
    }
    return process.exitValue;
  },
};

/** 
 * @class SessionsCompleter
 */
let SessionsCompleter = new Class().extends(CompleterBase);
SessionsCompleter.definition = {

  get id()
    "sessions-completer",

  get type()
    "sessions",

  "[subscribe('@initialized/process-manager'), enabled]":
  function onProcessManagerInitialized(process_manager)
  {
    this._process_manager = process_manager;
  },

  _generateAvailableSession: function _generateAvailableSession()
  {
    coUtils.Sessions.load();
    let records = coUtils.Sessions.getRecords();
    for (let [request_id, record] in Iterator(records)) {
      try {
        if (this._process_manager.processIsAvailable(record.pid)) {
          yield {
            name: "&" + request_id,
            value: record,
          };
        } else {
          coUtils.Sessions.remove(request_id);
        }
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
    coUtils.Sessions.update();
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
    let candidates = [candidate for (candidate in this._generateAvailableSession())];
    let lower_source = source.toLowerCase();
    let data = candidates.filter(function(data) {
      return -1 != data.name.toLowerCase().indexOf(lower_source);
    });
    if (0 == data.length) {
      listener.doCompletion(null);
      return -1;
    }
    let autocomplete_result = {
      type: "sessions",
      query: source, 
      labels: data.map(function(data) data.name),
      comments: data.map(function(data) data.value),
      data: data,
    };
    listener.doCompletion(autocomplete_result);
    return 0;
  },

};

/**
 * @class TextCompletionDisplayDriver
 *
 */
let TextCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
TextCompletionDisplayDriver.definition = {

  get id()
    "text-completion-display-driver",

  get type()
    "text",

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let broker = this._broker;
    let rows = grid.appendChild(document.createElement("rows"))
    for (let i = 0; i < result.labels.length; ++i) {
      let search_string = result.query.toLowerCase();
      let completion_text = result.labels[i];
      if ("quoted" == result.option) {
        completion_text = completion_text.slice(1, -1);
      }
      if (completion_text.length > 20 && i != current_index) {
        completion_text = completion_text.substr(0, 20) + "...";
      }
      let match_position = completion_text
        .toLowerCase()
        .indexOf(search_string);
      broker.uniget(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: i == current_index ? <>
            background: #226;
            color: white;
          </>: "",
          childNodes: [
            {
              tagName: "box",
              style: <>
                font-size: 1.2em;
                width: 50%;
                margin: 0px;
                overflow: hidden;
                padding-left: 8px;
              </>,
              childNodes: -1 == match_position ? 
                { text: completion_text }:
                [
                  { text: completion_text.substr(0, match_position) },
                  {
                    tagName: "label",
                    innerText: completion_text.substr(match_position, search_string.length),
                    style: <>
                      margin: 0px; 
                      font-weight: bold; 
                      text-shadow: 1px 1px 2px black;
                      color: #f88; 
                    </>,
                  },
                  { text: completion_text.substr(match_position + search_string.length) },
                ],
            },
            {
              tagName: "label",
              style: "font-size: 1em; color: #555;",
              value: result.comments && result.comments[i],
              crop: "end",
            },
          ],
        });
    } // for i
  },
};

/**
 * @class SessionsCompletionDisplayDriver
 *
 */
let SessionsCompletionDisplayDriver = new Class().extends(CompletionDisplayDriverBase);
SessionsCompletionDisplayDriver.definition = {

  get id()
    "sessions-completion-display-driver",

  get type()
    "sessions",

  getImageSource: function(request_id)
  {
    try {
      let image_path = String(<>$Home/.tanasinn/persist/{request_id}.png</>);
      let image_file = coUtils.File.getFileLeafFromAbstractPath(image_path);
      let image_url = coUtils.File.getURLSpec(image_file);
      return image_url;
    } catch (e) {
      coUtils.Debug.reportError(e);
    }
    return ""; // TODO: return url for "no image".
  },

  drive: function drive(grid, result, current_index) 
  {
    let document = grid.ownerDocument;
    let broker = this._broker;
    let rows = grid.appendChild(document.createElement("rows"))
    for (let i = 0; i < result.labels.length; ++i) {
      let search_string = result.query.toLowerCase().substr(1);
      let completion_text = result.comments[i].command;
      if (completion_text.length > 20 && i != current_index) {
        completion_text = completion_text.substr(0, 20) + "...";
      }

      broker.uniget(
        "command/construct-chrome", 
        {
          parentNode: rows,
          tagName: "row",
          style: i == current_index ? <>
            background: #226;
            color: white;
          </>: "",
          childNodes: [
            {
              tagName: "box",
              style: <>
                font-size: 1.2em;
                width: 50%;
                margin: 0px;
                overflow: hidden;
                padding-left: 8px;
              </>,
              childNodes: { 
                tagName: "image",
                width: 120,
                height: 80,
                style: "border: 1px solid #66f; margin: 9px;",
                src: this.getImageSource(result.comments[i].request_id),
              },
            },
            {
              tagName: "vbox",
              style: <>
                font-size: 1.2em;
                width: 50%;
                margin: 0px;
                overflow: hidden;
                padding-left: 8px;
              </>,
              childNodes: [
                {
                  tagName: "box",
                  childNodes: { text: result.comments[i].command },
                },
                {
                  tagName: "box",
                  childNodes: { text: result.comments[i].ttyname + " $$" + result.comments[i].pid },
                },
                {
                  tagName: "box",
                  childNodes: { text: result.comments[i].request_id },
                },
              ],
            },
          ],
        });
    } // for i
  },
};


/** 
 * @class LauncherCompletionProvider
 */
let LauncherCompletionProvider = new Class().extends(Component);
LauncherCompletionProvider.definition = {

  get id()
    "launcher-completion-provider",

  "[subscribe('command/complete'), enabled]": 
  function complete(request)
  {
    let {source, listener} = request;
    let broker = this._broker;
    if (0 == source.length || 0 == source.indexOf("&")) {
      let program_completer = broker.uniget(<>get/completer/sessions</>);
      let position = program_completer.startSearch(source.substr(1), listener);
      if (0 != position) {
        let program_completer = broker.uniget(<>get/completer/program</>);
        let position = program_completer.startSearch(source, listener);
      }
    } else {
      let program_completer = broker.uniget(<>get/completer/program</>);
      let position = program_completer.startSearch(source, listener);
    }
  },
};


/** 
 * @class Launcher
 */
let Launcher = new Class().extends(Component);
Launcher.definition = {

  get id()
    "launcher",

  top: 200,
  left: 500,

  "[persistable] completion_delay": 180,

  _index: -1,
  _result: null,
  _stem_text: "",

  get rowCount() 
  {
    if (!this._result) {
      return 0;
    }
    return this._result.labels.length;
  },

  get currentIndex()
  {
    return this._index;
  },

  "[subscribe('event/broker-started'), enabled]":
  function onLoad(desktop)
  {
    let window = desktop.window;
    let broker = this._broker;
    let document = window.document;
    let {
      tanasinn_window_layer,
      tanasinn_launcher_layer,
      tanasinn_launcher_textbox,
      tanasinn_launcher_completion_popup,
      tanasinn_launcher_completion_root,
    } = desktop.uniget("command/construct-chrome", 
    [
      {
        parentNode: desktop.root_element,
        tagName: "box",
        id: "tanasinn_window_layer",
      },
      {
        parentNode: desktop.root_element,
        tagName: "box",
        id: "tanasinn_drag_cover",
      },
      {
        parentNode: desktop.root_element,
        tagName: "box",
        id: "tanasinn_launcher_layer",
        hidden: true,
        style: <>
          position: fixed;
          left: 60px;
          top: 80px;
        </>,
        childNodes: [
          {
            tagName: "vbox",
            style: <>
              padding: 20px;
              -moz-border-radius: 20px;
              border-radius: 20px;
              background: -moz-linear-gradient(top, #999, #444);
              -moz-box-shadow: 10px 10px 20px black;
              opacity: 0.85;
              cursor: move;
            </>,
            childNodes: {
              tagName: "textbox",
              id: "tanasinn_launcher_textbox",
              className: "plain",
              style: <>
                font-size: 40px;
                font-family: 'Lucida Calligraph','Apple Chancery','Times New Roman','Lucida Console';
                weight: bold;
                font-style: italic;
                text-shadow: 1px 1px 3px black;
                width: 80%;
                color: #ddd;
              </>,
            },
          },
          {
            tagName: "panel",
            style: <> 
              -moz-appearance: none;
              -moz-user-focus: ignore; 
//              -moz-box-shadow: 15px 14px 9px black;
              border: 1px solid #aaa;
              -moz-border-radius: 10px;
              border-radius: 10px;
              font: menu;
              opacity: 0.87;
              background: transparent;
              background: -moz-linear-gradient(top, #ccc, #aaa);
            </>,
            noautofocus: true,
            height: 400,
            id: "tanasinn_launcher_completion_popup",
            childNodes: {
              tagName: "stack",
              flex: 1,
              childNodes: [
                {
                  tagName: "box",
                  style: <> 
                    //border: 1px solid #aaa;
                    -moz-border-radius: 12px;
                    border-radius: 12px;
                    outline: none;
                    border: none;
                    //background: -moz-linear-gradient(top, #ccc, #aaa);
                  </>,
                },
                {
                  tagName: "scrollbox",
                  id: "tanasinn_launcher_completion_scroll",
                  flex: 1,
                  style: <> 
                    margin: 12px;
                    overflow-x: hidden;
                    overflow-y: auto;
                  </>,
                  orient: "vertical", // box-packing
                  childNodes: {
                    tagName: "grid",
                    flex: 1,
                    id: "tanasinn_launcher_completion_root",
                    style: <> 
                      //overflow-x: hidden;
                      //overflow-y: auto;
                      font-size: 20px;
                      font-family: 'Menlo','Lucida Console';
                      font-weight: bold;
                      color: #fff;
//                      -moz-box-shadow: 15px 14px 19px black;
                      text-shadow: 1px 1px 7px black;
                  //background: transparent;
                    </>,
                  }
                }, // scrollbox
              ],
            }, // stack
          },  // panel
        ],
      },
    ]);
    this._window_layer = tanasinn_window_layer;
    this._element = tanasinn_launcher_layer;
    this._textbox = tanasinn_launcher_textbox;
    this._popup = tanasinn_launcher_completion_popup;
    this._completion_root = tanasinn_launcher_completion_root;

    broker.notify(<>initialized/{this.id}</>, this);
    this.onEnabled();
  },

  "[subscribe('command/move-to'), enabled]":
  function moveTo(info)
  {
    let [left, top] = info;
    this._element.style.left = left + "px";
    this._element.style.top = top + "px";
    this._popup.hidePopup();
  },
  
  "[subscribe('event/shutdown'), enabled]":
  function shutdown()
  {
    this.onDisabled();
    this._element.removeChild(this._element);
  },
  
  "[subscribe('event/enabled'), enabled]":
  function onEnabled()
  {
    this.onkeypress.enabled = true;
    this.onfocus.enabled = true;
    this.onblur.enabled = true;
    this.oninput.enabled = true;
    this.startSession.enabled = true;
    let broker = this._broker;
    let keydown_handler = let (self = this) 
      function() self.onkeydown.apply(self, arguments);
    broker.window.addEventListener("keydown", keydown_handler, /* capture */ true);
    broker.subscribe(
      "event/disabled", 
      function() broker.window.removeEventListener("keydown", key_handler, true));
    let keyup_handler = let (self = this) 
      function() self.onkeyup.apply(self, arguments);
    broker.window.addEventListener("keyup", keyup_handler, /* capture */ true);
    broker.subscribe(
      "event/disabled", 
      function() broker.window.removeEventListener("keyup", keyup_handler, true));
  },

  "[subscribe('event/disabled'), enabled]":
  function onDisabled()
  {
    this._textbox.blur();
    this.onkeypress.enabled = false;
    this.onfocus.enabled = false;
    this.onblur.enabled = false;
    this.oninput.enabled = false;
    this.startSession.enabled = false;
  },


  select: function select(index)
  {
    if (index < -1)
      index = -1;
    if (index > this.rowCount)
      index = this.rowCount - 1;
    let completion_root = this._completion_root;
    let row;
    if (this._index > -1) {
      row = completion_root.querySelector("rows").childNodes[this._index];
      if (!row)
        return;
      row.style.background = "";
      row.style.color = "";
    }
    if (index > -1) {
      row = completion_root.querySelector("rows").childNodes[index];
      row.style.color = "black";
      row.style.cssText = <>
        background: -moz-linear-gradient(top, #ddd, #eee);
        -moz-border-radius: 4px;
        border-radius: 4px;
      </>;
      try {
        let scroll_box = completion_root.parentNode;
        let box_object = scroll_box.boxObject
          .QueryInterface(Components.interfaces.nsIScrollBoxObject)
        if (box_object) {
          let scrollY = {};
          box_object.getPosition({}, scrollY);
          let first_position = row.boxObject.y - completion_root.boxObject.y;
          let last_position = first_position - scroll_box.boxObject.height + row.boxObject.height;
          if (first_position < scrollY.value) {
            box_object.scrollTo(0, first_position);
          } else if (last_position > scrollY.value) {
            box_object.scrollTo(0, last_position);
          }
        }
      } catch (e) { 
       coUtils.Debug.reportError(e)
      }
    }
    this._index = index;

  },

  doCompletion: function doCompletion(result) 
  {
    this._result = result;
    delete this._timer;
    let completion_root = this._completion_root;
    while (completion_root.firstChild) {
      completion_root.removeChild(completion_root.firstChild);
    }
    if (result) {
      let type = result.type || "text";
      let broker = this._broker;
      let driver = broker.uniget(<>get/completion-display-driver/{type}</>); 
      if (driver) {
        driver.drive(completion_root, result, this.currentIndex);
        this.invalidate(result);
      } else {
        coUtils.Debug.reportError(
          _("Unknown completion display driver type: '%s'."), 
          type);
      }
    }
  },

  invalidate: function invalidate(result) 
  {
    let textbox = this._textbox;
    if (textbox.boxObject.scrollLeft > 0) {
//      this._completion.inputField.value = "";
    } else if (result.labels.length > 0) {
      let popup = this._popup;
      if ("closed" == popup.state || "hiding" == this._popup.state) {
        let focused_element = popup.ownerDocument.commandDispatcher.focusedElement;
        if (focused_element && focused_element.isEqualNode(textbox.inputField)) {
          let completion_root = this._completion_root;
          popup.width = textbox.boxObject.width;
          completion_root.height = 500;
          popup.openPopup(textbox, "after_start", 0, 0, true, true);
        }
      }
      let index = Math.max(0, this.currentIndex);
      let completion_text = result.labels[index];
      if (completion_text && 0 == completion_text.indexOf(result.query)) {
        let settled_length = this._stem_text.length - result.query.length;
        let settled_text = textbox.value.substr(0, settled_length);
//        this._completion.inputField.value 
//          = settled_text + completion_text;
      } else {
//        this._completion.inputField.value = "";
      }
    } else {
//      this._completion.inputField.value = "";
      this._popup.hidePopup();
    }
  },

  down: function down()
  {
    let index = Math.min(this.currentIndex + 1, this.rowCount - 1);
    if (index >= 0) {
      this.select(index);
    }
    //this.invalidate();
    this.fill();
  },

  up: function up()
  {
    let index = Math.max(this.currentIndex - 1, -1);
    if (index >= 0) {
      this.select(index);
    }
    //this.invalidate();
    this.fill();
  },

  fill: function fill()
  {
    let index = Math.max(0, this.currentIndex);
    let result = this._result;
    if (this._result) {
      let textbox = this._textbox;
      let completion_text = result.labels[index];
      let settled_length = 
        this._stem_text.length - result.query.length;
      let settled_text = textbox.value.substr(0, settled_length);
      textbox.inputField.value = settled_text + completion_text;
//      this._completion.inputField.value = "";
    }
  },

  setCompletionTrigger: function setCompletionTrigger() 
  {
    if (this._timer) {
      this._timer.cancel();
      delete this._timer;
    }
    this._timer = coUtils.Timer.setTimeout(function() {
      delete this._timer;
      let current_text = this._textbox.value;
      // if current text does not match completion text, hide it immediatly.
//      if (0 != this._completion.value.indexOf(current_text)) {
//        this._completion.inputField.value = "";
//      }
      this._stem_text = current_text;
      this.select(-1);
      let broker = this._broker;
      broker.notify(
        "command/complete", 
        {
          source: current_text, 
          listener: this,
        });
    }, this.completion_delay, this);
  },

  "[listen('input', '#tanasinn_launcher_textbox', true)]":
  function oninput(event) 
  {
    this.setCompletionTrigger();
  },

  "[listen('focus', '#tanasinn_launcher_textbox')]":
  function onfocus(event) 
  {
    this.setCompletionTrigger();
  },

  "[subscribe('event/hotkey-double-ctrl'), enabled]":
  function onDoubleCtrl() 
  {
    let box = this._element;
    if (box.hidden) {
      this.show();
    } else {
      this.hide();
    }
  },

  "[subscribe('command/show-launcher'), enabled]":
  function show()
  {
    let box = this._element;
    box.parentNode.appendChild(box);
    box.hidden = false;
    coUtils.Timer.setTimeout(function() {
      this._textbox.focus();
      this._textbox.focus();
    }, 0, this);
  },

  "[subscribe('command/hide-launcher'), enabled]":
  function hide()
  {
    let box = this._element;
    let textbox = this._textbox;
    let popup = this._popup;
    popup.hidePopup();
    textbox.blur();
    box.hidden = true;
  },

  enter: function enter() 
  {
    let command = this._textbox.value;
    this.startSession(command);
  },

  "[subscribe('command/start-session')]":
  function startSession(command) 
  {
    let desktop = this._broker; 
    let document = this._element.ownerDocument;
    this.hide();
    coUtils.Timer.setTimeout(function() {
      let terminal =  desktop.start(
        this._window_layer,
        command.replace(/^\s+|\s+$/g, ""));  // command
      terminal.style.left = <>{this.left = (this.left + Math.random() * 1000) % 140 + 20}px</>;
      terminal.style.top = <>{this.top = (this.top + Math.random() * 1000) % 140 + 20}px</>;
    }, 0, this);
  },

  "[listen('blur', '#tanasinn_launcher_textbox')]":
  function onblur(event) 
  {
    this.hide();
  },

  "[listen('keypress', '#tanasinn_launcher_textbox')]":
  function onkeypress(event) 
  { // nothrow
    let code = event.keyCode || event.which;
    /*
    this._broker.notify(
      "command/report-overlay-message", 
      [event.keyCode,event.which,event.isChar].join("/"));
      */
    let is_char = 0 == event.keyCode;

    if (event.ctrlKey) { // ^
      event.stopPropagation();
      event.preventDefault();
    }
    if ("a".charCodeAt(0) == code && event.ctrlKey) { // ^a
      let textbox = this._textbox;
      textbox.selectionStart = 0;
      textbox.selectionEnd = 0;
    }
    if ("e".charCodeAt(0) == code && event.ctrlKey) { // ^e
      let textbox = this._textbox;
      let length = this._textbox.value.length;
      textbox.selectionStart = length;
      textbox.selectionEnd = length;
    }
    if ("b".charCodeAt(0) == code && event.ctrlKey) { // ^b
      let textbox = this._textbox;
      let start = textbox.selectionStart;
      let end = textbox.selectionEnd;
      if (start == end) {
        textbox.selectionStart = start - 1;
        textbox.selectionEnd = start - 1;
      } else {
        textbox.selectionEnd = start;
      }
    }
    if ("f".charCodeAt(0) == code && event.ctrlKey) { // ^f
      let textbox = this._textbox;
      let start = textbox.selectionStart;
      let end = textbox.selectionEnd;
      if (start == end) {
        textbox.selectionStart = start + 1;
        textbox.selectionEnd = start + 1;
      } else {
        textbox.selectionStart = end;
      }
    }
    if ("k".charCodeAt(0) == code && event.ctrlKey) { // ^k
      let textbox = this._textbox;
      let value = textbox.value;
      let start = textbox.selectionStart;
      let end = textbox.selectionEnd;
      if (start == end) {
        this._textbox.inputField.value 
          = value.substr(0, textbox.selectionStart);
      } else {
        this._textbox.inputField.value 
          = value.substr(0, textbox.selectionStart) 
          + value.substr(textbox.selectionEnd);
        textbox.selectionStart = start;
        textbox.selectionEnd = start;
      }
      this.setCompletionTrigger();
    }
    if ("p".charCodeAt(0) == code && event.ctrlKey) { // ^p
      this.up();
    }
    if ("n".charCodeAt(0) == code && event.ctrlKey) { // ^n
      this.down();
    }
    if ("j".charCodeAt(0) == code && event.ctrlKey) { // ^j
      this.enter()
    }
    if ("h".charCodeAt(0) == code && event.ctrlKey) { // ^h
      let value = this._textbox.value;
      let position = this._textbox.selectionEnd;
      if (position > 0) {
        this._textbox.inputField.value 
          = value.substr(0, position - 1) + value.substr(position);
        this.setCompletionTrigger();
      }
    }
    if ("w".charCodeAt(0) == code && event.ctrlKey) { // ^w
      let value = this._textbox.value;
      let position = this._textbox.selectionEnd;
      this._textbox.inputField.value
        = value.substr(0, position).replace(/\w+$|\W+$/, "") 
        + value.substr(position);
      this.setCompletionTrigger();
    }
    if ("f".charCodeAt(0) == code && event.ctrlKey) { // ^h
      this._textbox.selectionStart += 1;
    }
    if ("b".charCodeAt(0) == code && event.ctrlKey) { // ^h
      this._textbox.selectionEnd -= 1;
    }
    if (0x09 == code) { // tab
      event.stopPropagation();
      event.preventDefault();
    }
    if (0x09 == code && event.shiftKey) // shift + tab
      code = 0x26;
    if (0x09 == code && !event.shiftKey) // tab
      code = 0x28;
    if (0x26 == code && !is_char) { // up 
      this.up();
    } else if (0x28 == code && !is_char) { // down
      this.down();
    } else if (0x0d == code && !is_char) {
      this.enter();
    } 
  },


  onkeyup: function onkeyup(event) 
  { // nothrow
    //alert([event.keyCode, event.keyCode, event.ctrlKey, event.shiftKey, event.altKey, event.isChar].join("/"))
    let broker = this._broker;
    let diff_min = 30;
    let diff_max = 400;
    if (16 == event.keyCode && 16 == event.which 
        && !event.ctrlKey && !event.altKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_shiftup_time;
      if (diff_min < diff && diff < diff_max) {
        broker.notify("introducer-pressed/double-shift");
        this._last_shiftup_time = 0;
      } else {
        this._last_shiftup_time = now;
      }
      broker.notify("event/shift-key-up");
    } else if (17 == event.keyCode && 17 == event.which 
        && !event.altKey && !event.shiftKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_ctrlup_time;
      if (diff_min < diff && diff < diff_max) {
        this._last_ctrlup_time = 0;
        broker.notify("event/hotkey-double-ctrl");
      } else {
        this._last_ctrlup_time = now;
      }
      broker.notify("event/ctrl-key-up");
    } else if (18 == event.keyCode && 18 == event.which 
        && !event.ctrlKey && !event.shiftKey && !event.isChar) {
      let now = parseInt(new Date().getTime());
      let diff = now - this._last_altup_time;
      if (diff_min < diff && diff < diff_max) {
        this._last_altup_time = 0;
      } else {
        this._last_altup_time = now;
      }
      broker.notify("event/alt-key-up");
    }
  },

  onkeydown: function onkeydown(event) 
  { // nothrow
    if (16 == event.keyCode && 16 == event.which 
        && !event.ctrlKey && !event.altKey 
        && event.shiftKey && !event.isChar) {
      let broker = this._broker;
      broker.notify("event/shift-key-down");
    } else if (18 == event.keyCode && 18 == event.which 
        && !event.ctrlKey && event.altKey 
        && !event.shiftKey && !event.isChar) {
      let broker = this._broker;
      broker.notify("event/alt-key-down");
    }
  },
};


/**
 * @class DragMove
 * @fn Enable Drag-and-Drop operation.
 */
let DragMove = new Class().extends(Component);
DragMove.definition = {

  get id()
    "launcher-dragmove",

  /** post-constructor */
  "[subscribe('@initialized/launcher'), enabled]":
  function onLoad(launcher) 
  {
    let broker = this._broker;
    this.install(broker);
  },

  /** Installs itself. */
  install: function install(broker) 
  {
    this.ondragstart.enabled = true;
    let {tanasinn_drag_cover}
      = broker.uniget(
        "command/construct-chrome",
        {
          parentNode: "#tanasinn_launcher_layer",
          tagName: "box",
          id: "tanasinn_drag_cover",
          hidden: true,
          style: <>
            position: fixed;
            left: 0px;
            top: 0px;
            padding: 100px;
//            border: 1px solid red;
          </>,
        });
    this._drag_cover = tanasinn_drag_cover;
  },

  /** Uninstalls itself. */
  uninstall: function uninstall(broker) 
  {
    this.ondragstart.enabled = false;
    this._drag_cover.parentNode.removeChild(this._drag_cover);
  },

  "[listen('dragstart', '#tanasinn_launcher_layer', true)]":
  function ondragstart(event) 
  {
    event.stopPropagation();
    let session = this._broker;
    // get relative coodinates on target element.
    let offsetX = event.clientX - event.target.boxObject.x; 
    let offsetY = event.clientY - event.target.boxObject.y;
    this._drag_cover.hidden = false;
    this._drag_cover.style.left = event.clientX - this._drag_cover.boxObject.width / 2 + "px";
    this._drag_cover.style.top = event.clientY - this._drag_cover.boxObject.height / 2 + "px";
    coUtils.Timer.setTimeout(function() {
      this._drag_cover.hidden = true;
    }, 1000, this);
    session.notify("command/set-opacity", 0.30);
    // define mousemove hanler.
    let document = event.target.ownerDocument; // managed by DOM
    session.notify("command/add-domlistener", {
      target: document, 
      type: "mousemove", 
      id: "_DRAGGING", 
      context: this,
      handler: function onmouseup(event) 
      {
        let left = event.clientX - offsetX;
        let top = event.clientY - offsetY;
        session.notify("command/move-to", [left, top]);
      }
    });
    session.notify("command/add-domlistener", {
      target: document, 
      type: "mouseup", 
      id: "_DRAGGING",
      context: this,
      handler: function onmouseup(event) 
      {
        // uninstall listeners.
        session.notify("command/remove-domlistener", "_DRAGGING");
        session.notify("command/set-opacity", 1.00);
        this._drag_cover.hidden = true;
      }, 
    });
    session.notify("command/add-domlistener", {
      target: document, 
      type: "keyup", 
      id: "_DRAGGING",
      context: this,
      handler: function onkeyup(event) 
      {
        if (!event.shiftKey) {
          // uninstall listeners.
          session.notify("command/remove-domlistener", "_DRAGGING");
          session.notify("command/set-opacity", 1.00);
        }
      }, 
    });

    event = null;
    document = null;
  },
};

/**
 * @fn main
 * @brief Module entry point
 * @param {Process} process The Process object.
 */
function main(process) 
{
  process.subscribe(
    "initialized/broker",
    function(desktop) 
    {
      new Launcher(desktop);
      new LauncherCompletionProvider(desktop);
      new ProgramCompleter(desktop);
      new SessionsCompleter(desktop);
      new ProcessManager(desktop);
      new TextCompletionDisplayDriver(desktop);
      new SessionsCompletionDisplayDriver(desktop);
      new DragMove(desktop);
    });
}


