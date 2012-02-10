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

  "[subscribe('@initialized/emurator'), enabled]":
  function construct(emurator) 
  { 
    this._emurator = emurator; 
    let session = this._broker;
    session.notify("initialized/tracer", this);
  },

  "[subscribe('command/trace-on'), enabled]":
  function enable() 
  {
    this.onBeforeInput.enabled = true;
    let emurator = this._emurator;
    let session = this._broker;
    let sequences = this._backup_sequences = session.notify("get/sequences");

    sequences.forEach(function(information)
    {
      try {
        let {expression, handler, context} = information;
        let delegate = function()
        {
          handler.apply(this, arguments);
          let info = {
            type: CO_TRACE_CONTROL,
            name: handler.name, 
            value: [].slice.apply(arguments),
          };
          return info;
        };
        session.notify("command/add-sequence", {
          expression: expression, 
          handler: delegate, 
          context: context,
        });
      } catch (e) {
        coUtils.Debug.reportError(e);
      }
    }, this);

    emurator.write = function(data) 
    {
      emurator.__proto__.write.call(emurator, data);    
      let text = String.fromCharCode.apply(String, data);
      return {
        type: CO_TRACE_OUTPUT, 
        name: undefined,
        value: [text]
      };
    }
  },

  "[subscribe('command/trace-off'), enabled]":
  function disable() 
  {
    this.onBeforeInput.enabled = false;
    let emurator = this._emurator;
    let session = this._broker;
    let sequences = session.notify("get/sequences");
    sequences.forEach(function(information) 
    {
      session.notify("command/add-sequence", information);
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
    let session = this._broker;
//    session.notify("command/report-status-message", message); 
    session.notify("command/trace-sequence", [info, undefined]); 
  },

};

/**
 *
 * @class Hooker
 *
 */
let Hooker = new Class().extends(Component);
Hooker.definition = {

  get id()
    "hooker",

  _parser: null, 
  _buffer: null, 
  _hooked: false,
  _step_mode: false,

  /** Constructor */
  initialize: function initialize(session) 
  {
    this._buffer = [];
  },

  "[subscribe('@initialized/parser'), enabled]":
  function onLoad(parser) 
  { 
    this._parser = parser; 

    let session = this._broker;
    session.notify("initialized/hooker", this);
  },

  /** Suspend TTY and enter debug session. */
  "[subscribe('command/pause'), enabled]":
  function pause() 
  {
    this._step_mode = true;
  },

  /** Resume TTY and close debug session */
  "[subscribe('command/resume'), enabled]":
  function resume()  
  {
    this._step_mode = false;
    let buffer = this._buffer;
    // drain queued actions.
    let session = this._broker;
    while (buffer.length) {
      let action = buffer.shift();
      let result = action();
      session.notify("command/trace-sequence", result);
    }
    session.notify("command/flow-control", true);
  },

  /** Execute 1 command. */
  "[subscribe('command/step'), enabled]":
  function step()
  {
    if (this._hooked) {
      let session = this._broker;
      let buffer = this._buffer;
      let action = buffer.shift();
      if (action) {
        let result = action();
        let session = this._broker;
        session.notify("command/trace-sequence", result);
        session.notify("command/draw"); // redraw
      } else {
        session.notify("command/flow-control", true);
      }
    }
  },

  "[subscribe('command/trace-on'), enabled]":
  function set() 
  {
    if (!this._hooked) {
      let parser = this._parser;
      let buffer = this._buffer;
      let self = this;
      let session = this._broker;
      this._hooked = true;
      parser.parse = function(data) 
      {
        if (self._step_mode) {
          session.notify("command/flow-control", false);
        }
        for (let action in parser.__proto__.parse.call(parser, data)) {
          let sequence = parser._scanner.getCurrentToken();
          buffer.push(let (action = action) function() [action(), sequence]);
        }
        if (!self._step_mode) {
          while (buffer.length) {
            let action = buffer.shift();
            let result = action();
            session.notify("command/trace-sequence", result);
          }
        }
      };
    };
  },

  "[subscribe('command/trace-off'), enabled]":
  function unset() 
  {
    if (this._hooked) {
      let parser = this._parser;
      delete parser.parse; // uninstall hook
      this._hooked = false;
    }
  },
}

/**
 * @class Debugger
 */
let Debugger = new Class().extends(Plugin).depends("bottompanel");
Debugger.definition = {

  get id()
    "debugger",

  get info()
    <plugin>
        <name>{_("Debugger")}</name>
        <description>{
          _("Enables you to run terminal emurator step-by-step and ", 
            "observe input/output character sequence.")
        }</description>
        <version>0.1</version>
    </plugin>,

  get template()
    let (session = this._broker)
    {
      parentNode: this.dependency["bottompanel"].alloc(this.id, _("Debugger")),
      tagName: "hbox",
      flex: 1,
      style: <>
        //font-size: 13px;
      </>,
      childNodes: [
        {
          tagName: "vbox",
          style: <>
            </>,
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
            /*MozAppearance: "tabpanels",*/
//            background: -moz-linear-gradient(top, #999, #666);
           // background-attachment: fixed;
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
    },

  /** Installs itself. 
   *  @param {Session} session A session object.
   */
  "[subscribe('install/debugger'), enabled]": 
  function install(session) 
  {
    let {
      tanasinn_trace,
      tanasinn_debugger_attach,
      tanasinn_debugger_break,
      tanasinn_debugger_resume,
      tanasinn_debugger_step,
    } = session.uniget("command/construct-chrome", this.template);
    this._trace_box = tanasinn_trace;
    this._checkbox_attach = tanasinn_debugger_attach;
    this._checkbox_break = tanasinn_debugger_break;
    this._checkbox_resume = tanasinn_debugger_resume;
    this._checkbox_step = tanasinn_debugger_step;
    this.select.enabled = true;
    this.trace.enabled = true;
  },

  /** Uninstalls itself 
   *  @param {Session} session A session object.
   */
  "[subscribe('uninstall/debugger'), enabled]": 
  function uninstall(session)
  {
    let bottom_panel = this.dependency["bottompanel"];
    bottom_panel.remove(this.id);
    this.select.enabled = false;
    this.trace.enabled = false;
  },

  doAttach: function doAttach() 
  {
    let session = this._broker;
    try {
      if (this._checkbox_attach.checked) {
        this._checkbox_break.setAttribute("disabled", !this._checkbox_attach.checked);
        session.notify("command/trace-on");
      } else {
        this._checkbox_break.setAttribute("disabled", true);
        this._checkbox_resume.setAttribute("disabled", true);
        this._checkbox_step.setAttribute("disabled", true);
        session.notify("command/trace-off");
        session.notify("command/resume");
      }
    } catch (e) {
      coUtils.Debug.reportError(e);
    }
  },
 
  doBreak: function doBreak() 
  {
    let session = this._broker;
    this._checkbox_break.setAttribute("disabled", true);
    this._checkbox_resume.setAttribute("disabled", false);
    this._checkbox_step.setAttribute("disabled", false);
    session.notify("command/pause");
  },

  doResume: function doResume() 
  {
    let session = this._broker;
    this._checkbox_resume.setAttribute("disabled", true);
    this._checkbox_step.setAttribute("disabled", true);
    this._checkbox_break.setAttribute("disabled", false);
    session.notify("command/resume");
  },

  doStep: function doStep() 
  {
    let session = this._broker;
    session.notify("command/step");
  },

  "[subscribe('command/trace-sequence')]": 
  function trace(trace_info) 
  {
    let [info, sequence] = trace_info;
    let {type, name, value} = info;
    let trace_box = this._trace_box;
    function escape(str) 
    {
      return str.replace(/[\u0000-\u000f]/g, function(c) 
      {
        return "<" + (0x100 + c.charCodeAt(0)).toString(16).substr(1, 2) + ">";
      });
    }
    let session = this._broker;
    session.uniget("command/construct-chrome", {
      parentNode: trace_box,
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
            value: escape(sequence),
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
              value: escape(value.toString()),
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
    let current_scroll_position = trace_box.scrollTop + trace_box.boxObject.height;
    if (current_scroll_position + 50 > trace_box.scrollHeight) {
      coUtils.Timer.setTimeout(function() {
        trace_box.scrollTop = trace_box.scrollHeight;
      }, 10);
    }
  },

  "[command('debugger'), nmap('<M-d>', '<C-S-d>'), _('Open debugger.')]":
  function select() 
  {
    this.dependency["bottompanel"].select(this.id);
    return true;
  },
};

/**
 * @fn main
 * @brief Module entry point.
 * @param {Desktop} desktop The Desktop object.
 */
function main(desktop) 
{
  desktop.subscribe(
    "@initialized/broker", 
    function(session) 
    {
      new Debugger(session);
      new Hooker(session);
      new Tracer(session);
    });
}

