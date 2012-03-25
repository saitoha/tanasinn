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

const CO_TRACE_INPUT = 1;
const CO_TRACE_OUTPUT = 2;
const CO_TRACE_CONTROL = 3;

/**
 *
 * @class Tracer
 *
 */
let Tracer = new Class().extends(Component);
Tracer.definition = {

  get id()
    "tracer",

  hook: function() 
  {
    let hook_target = "emurator.write";
  },

  "[subscribe('@initialized/emurator'), enabled]":
  function construct(emurator) 
  { 
    this._emurator = emurator; 
    let broker = this._broker;
    broker.notify("initialized/tracer", this);
  },

  "[subscribe('command/debugger-trace-on'), enabled]":
  function enable() 
  {
    this.onBeforeInput.enabled = true;
    let emurator = this._emurator;
    let broker = this._broker;
    let sequences = this._backup_sequences = broker.notify("get/sequences");

    for (let i = 0; i < sequences.length; ++i) {
      let information = sequences[i];
      try {
        let {expression, handler, context} = information;
        let delegate = function()
        {
          handler.apply(this, arguments);
          let info = {
            type: CO_TRACE_CONTROL,
            name: handler.name, 
            value: Array.slice(arguments),
          };
          return info;
        };
        broker.notify("command/add-sequence", {
          expression: expression, 
          handler: delegate, 
          context: context,
        });
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }

    emurator.write = function(data) 
    {
      emurator.__proto__.write.call(emurator, data);    
      let text = String.fromCharCode.apply(String, data);
      let info = {
        type: CO_TRACE_OUTPUT, 
        name: undefined,
        value: [text]
      };
      broker.notify("command/debugger-trace-sequence", [info, undefined]); 
    }
  },

  "[subscribe('command/debugger-trace-off'), enabled]":
  function disable() 
  {
    this.onBeforeInput.enabled = false;
    let emurator = this._emurator;
    let broker = this._broker;
    let sequences = broker.notify("get/sequences");
    sequences.forEach(function(information) 
    {
      broker.notify("command/add-sequence", information);
    }, this);
    delete emurator.write; // uninstall hook
  },

//  "[subscribe('event/before-input')]":
  "[subscribe('command/send-to-tty')]":
  function onBeforeInput(message) 
  {
    let info = {
      type: CO_TRACE_INPUT, 
      name: undefined,
      value: [message],
    };
    let broker = this._broker;
//    broker.notify("command/report-status-message", message); 
    broker.notify("command/debugger-trace-sequence", [info, undefined]); 
  },

};

/**
 *
 * @class Hooker
 *
 */
let Hooker = new Class().extends(Component).depends("parser");
Hooker.definition = {

  get id()
    "hooker",

  _buffer: null, 
  _hooked: false,
  _step_mode: false,

  /** Constructor */
  initialize: function initialize(broker) 
  {
    this._buffer = [];
  },

  /** Suspend TTY and enter debug session. */
  "[subscribe('command/debugger-pause'), enabled]":
  function pause() 
  {
    this._step_mode = true;
  },

  /** Resume TTY and close debug session */
  "[subscribe('command/debugger-resume'), enabled]":
  function resume()  
  {
    this._step_mode = false;
    let buffer = this._buffer;
    // drain queued actions.
    let broker = this._broker;
    while (buffer.length) {
      let action = buffer.shift();
      let result = action();
      broker.notify("command/debugger-trace-sequence", result);
    }
    broker.notify("command/flow-control", true);
    broker.notify("command/draw"); // redraw
  },

  /** Execute 1 command. */
  "[subscribe('command/debugger-step'), enabled]":
  function step()
  {
    if (this._hooked) {
      let broker = this._broker;
      let buffer = this._buffer;
      let action = buffer.shift();
      if (action) {
        let result = action();
        broker.notify("command/debugger-trace-sequence", result);
        broker.notify("command/draw"); // redraw
      } else {
        broker.notify("command/flow-control", true);
      }
    }
  },

  "[subscribe('command/debugger-trace-on'), enabled]":
  function set() 
  {
    if (!this._hooked) {
      let parser = this.dependency["parser"];
      let buffer = this._buffer;
      let self = this;
      let broker = this._broker;
      this._hooked = true;
      parser.parse = function(data) 
      {
        if (self._step_mode) {
          broker.notify("command/flow-control", false);
        }
        for (let action in parser.__proto__.parse.call(parser, data)) {
          let sequence = parser._scanner.getCurrentToken();
          buffer.push(let (action = action) function() [action(), sequence]);
        }
        if (!self._step_mode) {
          while (buffer.length) {
            let action = buffer.shift();
            let result = action();
            broker.notify("command/debugger-trace-sequence", result);
          }
        }
      };
    };
  },

  "[subscribe('command/debugger-trace-off'), enabled]":
  function unset() 
  {
    if (this._hooked) {
      let parser = this.dependency["parser"];
      delete parser.parse; // uninstall hook
      this._hooked = false;
    }
  },
}

/**
 * @class Debugger
 */
let Debugger = new Class().extends(Plugin);
Debugger.definition = {

  get id()
    "debugger",

  get info()
    <plugin>
        <name>{_("Debugger")}</name>
        <version>0.1</version>
        <description>{
          _("Enables you to run terminal emurator step-by-step and ", 
            "observe input/output character sequence.")
        }</description>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  "[persistable] auto_scroll": true,
  "[persistable] update_interval": 100,

  _timer_id: null,

  get template()
  {
    return {
      tagName: "hbox",
      flex: 1,
      childNodes: [
        {
          tagName: "vbox",
          childNodes: [
            {
              tagName: "checkbox",
              id: "tanasinn_debugger_attach",
              label: _("attach"),
              listener: {
                type: "command",
                context: this,
                handler: this.doAttach,
              }
            },
            {
              tagName: "button",
              id: "tanasinn_debugger_break",
              label: _("break"),
              disabled: true,
              listener: {
                type: "command",
                context: this,
                handler: this.doBreak,
              }
            },
            {
              tagName: "button",
              id: "tanasinn_debugger_resume",
              label: _("resume"),
              disabled: true,
              listener: {
                type: "command",
                context: this,
                handler: this.doResume,
              }
            },
            {
              tagName: "button",
              id: "tanasinn_debugger_step",
              label: _("step"),
              disabled: true,
              listener: {
                type: "command",
                context: this,
                handler: this.doStep,
              }
            },
          ],
        },
        {
          tagName: "vbox",
          flex: 1,
          style: <> 
            width: 100%;
            height: 100%;
          </>,
          childNodes: {
            tagName: "vbox",
            flex: 1,
            id: "tanasinn_trace",
            style: <>
              padding: 5px;
              overflow-y: auto;
            </>
          },
        },
      ]
    };
  },

  /** Installs itself. 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('install/debugger'), enabled]": 
  function install(broker) 
  {
    this._queue = [];
    this.select.enabled = true;
    this.breakpoint.enabled = true;
    this.onPanelItemRequested.enabled = true;
  },

  /** Uninstalls itself 
   *  @param {Broker} broker A Broker object.
   */
  "[subscribe('uninstall/debugger'), enabled]": 
  function uninstall(broker)
  {
    this.select.enabled = false;
    this.breakpoint.enabled = false;
    this.trace.enabled = false;
    this.onPanelItemRequested.enabled = false;
    if (this._timer) {
      this._timer.cancel();
    }
    this._timer = null;
    this._queue = null;
    broker.notify("command/remove-panel", this.id);
  },

  "[subscribe('@get/panel-items')]": 
  function onPanelItemRequested(panel) 
  {
    let template = this.template;
    let item = panel.alloc(this.id, _("Debugger"));
    template.parentNode = item;
    let broker = this._broker;
    let {
      tanasinn_trace,
      tanasinn_debugger_attach,
      tanasinn_debugger_break,
      tanasinn_debugger_resume,
      tanasinn_debugger_step,
    } = broker.uniget("command/construct-chrome", template);
    this._trace_box = tanasinn_trace;
    this._checkbox_attach = tanasinn_debugger_attach;
    this._checkbox_break = tanasinn_debugger_break;
    this._checkbox_resume = tanasinn_debugger_resume;
    this._checkbox_step = tanasinn_debugger_step;
    this.trace.enabled = true;
    return item;
  },

  doAttach: function doAttach() 
  {
    try {
      if (this._checkbox_attach.checked) {
        this._enableDebugger();
      } else {
        this._disableDebugger();
      }
    } catch (e) {
      coUtils.Debug.reportError(e);
    }
  },

  _enableDebugger: function _enableDebugger()
  {
    let broker = this._broker;
    this._checkbox_break.setAttribute("disabled", !this._checkbox_attach.checked);
    broker.notify("command/debugger-trace-on");
    if (this._timer) {
      this._timer.cancel();
    }
    this._timer = coUtils.Timer.setInterval(function() {
      let updated;
      if (!this._queue && this._timer) {
        this._timer.cancel();
        this._timer = null;
        return;
      }
      while (this._queue.length) {
        this.update(this._queue.shift());
        updated = true;
      }
      if (updated && this.auto_scroll) {
        let trace_box = this._trace_box;
        trace_box.scrollTop = trace_box.scrollHeight;
      }
    }, this.update_interval, this);
  },
 
  _disableDebugger: function _disableDebugger()
  {
    let broker = this._broker;
    this._checkbox_break.setAttribute("disabled", !this._checkbox_attach.checked);
    this._checkbox_break.setAttribute("disabled", true);
    this._checkbox_resume.setAttribute("disabled", true);
    this._checkbox_step.setAttribute("disabled", true);
    if (this._timer) {
      this._timer.cancel();
    }
    this._timer = null;
    broker.notify("command/debugger-trace-off");
    broker.notify("command/debugger-resume");
  },

  doBreak: function doBreak() 
  {
    let broker = this._broker;
    this._checkbox_break.setAttribute("disabled", true);
    this._checkbox_resume.setAttribute("disabled", false);
    this._checkbox_step.setAttribute("disabled", false);
    broker.notify("command/debugger-pause");
  },

  doResume: function doResume() 
  {
    let broker = this._broker;
    this._checkbox_resume.setAttribute("disabled", true);
    this._checkbox_step.setAttribute("disabled", true);
    this._checkbox_break.setAttribute("disabled", false);
    broker.notify("command/debugger-resume");
  },

  doStep: function doStep() 
  {
    let broker = this._broker;
    broker.notify("command/debugger-step");
  },

  "[command('breakpoint/bp')]": 
  function breakpoint(arguments_string) 
  {
    this._pattern = new RegExp(arguments_string);
    this.watchSequence.enabled = true;
  },

  _pattern: null,

  "[subscribe('command/debugger-trace-sequence')] watchSequence": 
  function watchSequence(trace_info) 
  {
    let [info, sequence] = trace_info;
    if (this._pattern.test(sequence)) {
      this.watchSequence.enabled = false;
      this.doBreak();
    }
  },

  "[subscribe('command/debugger-trace-sequence')]": 
  function trace(trace_info) 
  {
    if (this._queue) {
      this._queue.push(trace_info);
    }
  },

  _escape: function _escape(str) 
  {
    return str.replace(/[\u0000-\u001f]/g, function(c) 
    {
      return "<" + (0x100 + c.charCodeAt(0)).toString(16).substr(1, 2) + ">";
    });
  },

  "[subscribe('command/debugger-update-pane')]": 
  function update(trace_info) 
  {
    let [info, sequence] = trace_info;
    let {type, name, value} = info;
    let broker = this._broker;
    broker.uniget("command/construct-chrome", {
      parentNode: "#tanasinn_trace",
      tagName: "hbox",
      style: <> 
        width: 400px; 
        max-width: 400px; 
        font-weight: bold;
        text-shadow: 0px 0px 2px black;
        font-size: 20px;
      </>,
      childNodes: CO_TRACE_CONTROL == type ? [
        {
          tagName: "label",
          value: ">",
          style: <>
            padding: 3px;
            color: darkred;
          </>,
        },
        {
          tagName: "box",
          width: 120,
          childNodes:
          {
            tagName: "label",
            value: this._escape(sequence),
            style: <>
              color: red;
              background: lightblue; 
              border-radius: 6px;
              padding: 3px;
            </>,
          },
        },
        {
          tagName: "label",
          value: "-",
          style: <>
            color: black;
            padding: 3px;
          </>,
        },
        {
          tagName: "box",
          style: <> 
            background: lightyellow;
            border-radius: 6px;
            margin: 2px;
            padding: 0px;
          </>,
          childNodes: [
            {
              tagName: "label",
              value: name,
              style: <>
                color: blue;
                padding: 1px;
              </>,
            },
            {
              tagName: "label",
              value: this._escape(value.toString()),
              style: <>
                color: green;
                padding: 1px;
              </>,
            }
          ],
        },
      ]: CO_TRACE_OUTPUT == type ? [
        {
          tagName: "label",
          value: ">",
          style: <>
            padding: 3px;
            color: darkred;
          </>,
        },
        {
          tagName: "label",
          value: escape(value.shift()),
          style: <>
            color: darkcyan;
            background: lightgray;
            border-radius: 6px;
            padding: 3px;
          </>,
        },
      ]: [
        {
          tagName: "label",
          value: "<",
          style: <> 
            padding: 3px; 
            color: darkblue;
          </>,
        },
        {
          tagName: "label",
          value: escape(value.shift()),
          style: <>
            color: darkcyan;
            background: lightpink;
            border-radius: 6px;
            padding: 3px;
          </>,
        },
      ],
    });
  },


  /** select this panel */
  "[command('debugger'), nmap('<M-d>', '<C-S-d>'), _('Open debugger.')]":
  function select() 
  {
    let broker = this._broker;
    broker.notify("command/select-panel", this.id);
    return true;
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Debugger(broker);
  new Hooker(broker);
  new Tracer(broker);
}

