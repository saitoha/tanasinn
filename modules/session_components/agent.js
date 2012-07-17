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
 *  @class Agent
 */
var Agent = new Class().extends(Plugin)
                       .depends("cursorstate");
Agent.definition = {

  get id()
    "agent",

  get info()
    <module>
        <name>{_("Agent (BETA)")}</name>
        <description>{
          _("Display agent.")
        }</description>
        <version>0.1b</version>
    </module>,

  get template()
    ({
      parentNode: "#tanasinn_outer_chrome",
      tagName: "box",
      id: "tanasinn_agent_layer",
      //hidden: true,
      style: "position: absolute;",
      childNodes: [
        {
          tagName: "image",
          src: this.getAgentImagePath(), 
          style: <>
            position: absolute;
            margin-top: -130px;
            margin-right: -120px;
            margin-left: 600px;
          </>,
        },
        {
          tagName: "box",
          style: <>
            position: absolute;
            margin-top: -350px;
            margin-right: -0px;
            margin-left: 0px;
            font-family: Arial Black,Cooper Black;
          </>,
          childNodes: {
            tagName: "stack",
            childNodes: [
              {
                tagName: "image",
                src: this.getBalloonImagePath(),
                style: <>
                  opacity: 0.85;
                </>,
              },
              {
                tagName: "vbox",
                style: <> 
                  color: lightblue;     
                  text-shadow: 1px 1px 5px black;
                </>,
                childNodes: [
                  {
                    tagName: "label",
                    style: <>
                      margin-top: 100px;
                      margin-left: 160px;
                      font-size: 40px;
                    </>,
                    value: "Take it easy !!!!!!"
                  },
                  {
                    tagName: "box",
                    style: <>
                      margin-top: -5px;
                      margin-left: 130px;
                      font-size: 28px;
                    </>,
                    childNodes: [
                      {
                        tagName: "label",
                        id: "tanasinn_agent_message",
                        style: <>
                          color: #faa;
                        </>,
                        value: "",
                      },
                      {
                        tagName: "label",
                        style: <>
                          color: lightblue;
                        </>,
                        value: " is correct?",
                      },
                      {
                        tagName: "label",
                        style: <>
                          color: white;
                        </>,
                        value: "[",
                      },
                      {
                        tagName: "label",
                        style: <>
                          color: lightpink;
                        </>,
                        value: "n,y,a,e",
                      },
                      {
                        tagName: "label",
                        style: <>
                          color: white;
                        </>,
                        value: "]",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    }),

  "[persistable] enabled_when_startup": false,

  "[persistable] balloon_image_file": "images/balloon.svg",
  "[persistable] agent_image_file": "images/agent.svg",

  _element: null,

  /** installs itself. 
   *  @param {Session} session A session object.
   */
  "[install]":
  function install(session) 
  {
    var {tanasinn_agent_layer, tanasinn_agent_message}
      = session.uniget("command/construct-chrome", this.template);
    this._element = tanasinn_agent_layer;
    this._message = tanasinn_agent_message;
    this.onBeforeInput.enabled = true;
    this.onCorrect.enabled = true;
  },

  /** Uninstalls itself.
   *  @param {Session} session A session object.
   */
  "[uninstall]":
  function uninstall(session) 
  {
    if (this._element) {
      this._element.parentNode.removeChild(this._element);
    }
    this.onBeforeInput.enabled = false;
    this.onCorrect.enabled = false;
  },

  "[subscribe('event/before-input')]":
  function onBeforeInput(data) 
  {
    this._element.hidden = true;
  },

  "[subscribe('sequence/osc/206')]":
  function onCorrect(data) 
  {
    this._element.hidden = false;
    this._message.setAttribute("value", data);
  },

  getAgentImagePath: function getAgentImagePath()
  {
    var broker, path, file;

    broker = this._broker;
    path = broker.runtime_path + "/" + this.agent_image_file;
    file = coUtils.File.getFileLeafFromVirtualPath(path);

    return coUtils.File.getURLSpec(file);
  },

  getBalloonImagePath: function getBalloonImagePath()
  {
    var broker, path, file;

    broker = this._broker;
    path = broker.runtime_path + "/" + this.balloon_image_file;
    file = coUtils.File.getFileLeafFromVirtualPath(path);

    return coUtils.File.getURLSpec(file);
  },

} // class Agent


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new Agent(broker);
}

// EOF
