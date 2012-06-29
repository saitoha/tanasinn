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
var Tracer = new Class().extends(Component);
Tracer.definition = {

  get id()
    "tracer",

  _mode: "vt100",

  "[subscribe('command/change-mode'), enabled]":
  function onChangeMode(mode) 
  { 
    if (this.onBeforeInput.enabled) {
      this.disable();
      this._mode = mode;
      this.enable();
    } else {
      this._mode = mode;
    }
  },

  "[subscribe('command/debugger-trace-on'), enabled]":
  function enable() 
  {
    var sequences, i;

    this.onBeforeInput.enabled = true;

    sequences = this.sendMessage("get/sequences/" + this._mode);
    this._backup_sequences = sequences;

    for (i = 0; i < sequences.length; ++i) {

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
        this.sendMessage("command/add-sequence", {
          expression: expression, 
          handler: delegate, 
          context: context,
        });
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }
  },

  "[subscribe('command/debugger-trace-off'), enabled]":
  function disable() 
  {
    var i, sequences, information;

    this.onBeforeInput.enabled = false;

    sequences = this.sendMessage("get/sequences/" + this._mode);
    for (i = 0; i < sequences.length; ++i) {
      information = sequences[i];
      this.sendMessage("command/add-sequence", information);
    }
  },

  "[subscribe('command/send-to-tty')]":
  function onBeforeInput(message) 
  {
    var info;

    info = {
      type: CO_TRACE_INPUT, 
      name: undefined,
      value: [message],
    };
    this.sendMessage(
      "command/debugger-trace-sequence", 
      [info, undefined]); 
  },

}; // class Tracer

/**
 *
 * @class Hooker
 *
 */
var Hooker = new Class().extends(Component).depends("parser");
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
    var buffer, action, result;

    this._step_mode = false;
    buffer = this._buffer;

    // drain queued actions.
    while (buffer.length) {
      action = buffer.shift();
      result = action();
      this.sendMessage("command/debugger-trace-sequence", result);
    }
    this.sendMessage("command/flow-control", true);
    this.sendMessage("command/draw"); // redraw
  },

  /** Execute 1 command. */
  "[subscribe('command/debugger-step'), enabled]":
  function step()
  {
    var buffer, action, result;

    if (this._hooked) {
      buffer = this._buffer;
      action = buffer.shift();
      if (action) {
        result = action();
        this.sendMessage("command/debugger-trace-sequence", result);
        this.sendMessage("command/draw"); // redraw
      } else {
        this.sendMessage("command/flow-control", true);
      }
    }
  },

  "[subscribe('command/debugger-trace-on'), enabled]":
  function set() 
  {
    var parser, buffer, self, action, result;

    if (!this._hooked) {
      parser = this.dependency["parser"];
      buffer = this._buffer;
      self = this;
      this._hooked = true;
      parser.parse = function(data) 
      {
        if (self._step_mode) {
          this.sendMessage("command/flow-control", false);
        }
        for (action in parser.__proto__.parse.call(parser, data)) {
          let sequence = parser._scanner.getCurrentToken();
          buffer.push(let (action = action) function() [action(), sequence]);
        }
        if (!self._step_mode) {
          while (buffer.length) {
            action = buffer.shift();
            result = action();
            this.sendMessage("command/debugger-trace-sequence", result);
          }
        }
      };
    };
  },

  "[subscribe('command/debugger-trace-off'), enabled]":
  function unset() 
  {
    var parser;

    if (this._hooked) {
      parser = this.dependency["parser"];
      delete parser.parse; // uninstall hook
      this._hooked = false;
    }
  },
}

/**
 * @class Debugger
 */
var Debugger = new Class().extends(Plugin);
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
  "[install]": 
  function install(broker) 
  {
    this._queue = [];
    this.select.enabled = true;
    this.breakpoint.enabled = true;
    this.enableDebugger.enabled = true;
    this.disableDebugger.enabled = true;
    this.doBreak.enabled = true;
    this.onPanelItemRequested.enabled = true;
  },

  /** Uninstalls itself 
   *  @param {Broker} broker A Broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    this.select.enabled = false;
    this.breakpoint.enabled = false;
    this.enableDebugger.enabled = false;
    this.trace.enabled = false;
    this.onPanelItemRequested.enabled = false;
    if (this._timer) {
      this._timer.cancel();
    }
    this._timer = null;
    this._queue = null;
    this.sendMessage("command/remove-panel", this.id);
  },

  "[subscribe('@get/panel-items')]": 
  function onPanelItemRequested(panel) 
  {
    var template, item;

    template = this.template;
    item = panel.alloc(this.id, _("Debugger"));

    template.parentNode = item;

    let {
      tanasinn_trace,
      tanasinn_debugger_attach,
      tanasinn_debugger_break,
      tanasinn_debugger_resume,
      tanasinn_debugger_step,
    } = this.request("command/construct-chrome", template);

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
        this.enableDebugger();
      } else {
        this.disableDebugger();
      }
    } catch (e) {
      coUtils.Debug.reportError(e);
    }
  },

  "[command('enabledebugger/eg'), _('Attach the debugger and trace incoming sequences.')]": 
  function enableDebugger()
  {
    if (!this._trace_box) {
      this.select();
    }
    this.enableDebugger.enabled = false;
    this.disableDebugger.enabled = true;
    this.doBreak.enabled = true;
    this._checkbox_attach.checked = true;
    this._checkbox_break.setAttribute("disabled", !this._checkbox_attach.checked);
    this.sendMessage("command/debugger-trace-on");
    if (this._timer) {
      this._timer.cancel();
    }
    this._timer = coUtils.Timer.setInterval(function() 
    {
      var updated, queue, trace_box;

      updated = false;
      queue = this._queue;

      if (!queue && this._timer) {
        this._timer.cancel();
        this._timer = null;
        return;
      }
      update = 0 !== queue.length;
      while (0 !== queue.length) {
        this.update(queue.shift());
      }
      if (updated && this.auto_scroll) {
        trace_box = this._trace_box;
        trace_box.scrollTop = trace_box.scrollHeight;
      }
    }, this.update_interval, this);
  },
 
  "[command('disabledebugger'), _('Detach the debugger.')]": 
  function disableDebugger()
  {
    if (!this._trace_box) {
      this.select();
    }
    this.doBreak.enabled = false;
    this.doResume.enabled = false;
    this.doStep.enabled = false;
    this._checkbox_attach.checked = false;
    this._checkbox_break.setAttribute("disabled", !this._checkbox_attach.checked);
    this._checkbox_break.setAttribute("disabled", true);
    this._checkbox_resume.setAttribute("disabled", true);
    this._checkbox_step.setAttribute("disabled", true);
    if (this._timer) {
      this._timer.cancel();
    }
    this._timer = null;
    this.sendMessage("command/debugger-trace-off");
    this.sendMessage("command/debugger-resume");
  },

  "[command('breakdebugger'), _('Break debugger.')]": 
  function doBreak() 
  {
    if (!this._trace_box) {
      this.select();
    }
    if (!this._checkbox_attach.checked) {
      this.enableDebugger();
    }
    this.doBreak.enabled = false;
    this.doResume.enabled = true;
    this.doStep.enabled = true;
    this._checkbox_break.setAttribute("disabled", true);
    this._checkbox_resume.setAttribute("disabled", false);
    this._checkbox_step.setAttribute("disabled", false);
    this.sendMessage("command/debugger-pause");
  },

  "[command('resumedebugger'), _('Resume terminal.')]": 
  function doResume() 
  {
    if (!this._trace_box) {
      this.select();
    }
    this.doBreak.enabled = true;
    this.doResume.enabled = false;
    this.doStep.enabled = false;
    this._checkbox_resume.setAttribute("disabled", true);
    this._checkbox_step.setAttribute("disabled", true);
    this._checkbox_break.setAttribute("disabled", false);
    this.sendMessage("command/debugger-resume");
  },

  "[command('step'), _('Do step over.')]":
  function doStep() 
  {
    if (!this._trace_box) {
      this.select();
    }
    this.sendMessage("command/debugger-step");
  },

  "[command('breakpoint/bp')]": 
  function breakpoint(arguments_string) 
  {
    if (!this._trace_box) {
      this.select();
    }
    this._pattern = new RegExp(arguments_string);
    this.watchSequence.enabled = true;
  },

  _pattern: null,

  "[subscribe('command/debugger-trace-sequence')] watchSequence": 
  function watchSequence(trace_info) 
  {
    if (this._pattern.test(trace_info.sequence)) {
      this.watchSequence.eniabled = false;
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

  update: function update(trace_info) 
  {
    var [info, sequence] = trace_info;
    var {type, name, value} = info || {
      type: CO_TRACE_OUTPUT,
      name: undefined,
      value: [sequence],
    };
    var child;
    switch (type) {
      case CO_TRACE_CONTROL: 
        child = [
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
        ]
        break;

      case CO_TRACE_OUTPUT: 
        child = [
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
            value: this._escape(value.shift()),
            style: <>
              color: darkcyan;
              background: lightgray;
              border-radius: 6px;
              padding: 3px;
            </>,
          },
        ]
        break;

      default:
        child = [
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
            value: this._escape(value.shift()),
            style: <>
              color: darkcyan;
              background: lightpink;
              border-radius: 6px;
              padding: 3px;
            </>,
          },
        ]
    }
    this.request("command/construct-chrome", {
      parentNode: "#tanasinn_trace",
      tagName: "hbox",
      style: "width: 400px; max-width: 400px; font-weight: bold; text-shadow: 0px 0px 2px black; font-size: 20px; ",
      childNodes: child,
    });
  },


  /** select this panel */
  "[command('debugger'), nmap('<M-d>', '<C-S-d>'), _('Open debugger.')]":
  function select() 
  {
    this.sendMessage("command/select-panel", this.id);
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

// EOF
