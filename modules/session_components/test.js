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

/**
 * @class Test
 */
var Test = new Class().extends(Plugin);
Test.definition = {

  id: "test",

  /** provide plugin information */
  getInfo: function getInfo()
  {
    return {
      name: _("Test"),
      version: "0.1",
      description: _("Run test.")
    };
  },

  "[persistable] enabled_when_startup": true,

  /** Installs itself.
   *  @param {InstallContext} context A InstallContext object.
   */
  "[install]":
  function install(context)
  {
  },

  /** Uninstall itself. */
  "[uninstall]":
  function uninstall()
  {
  },

  /** do tests for session plugins */
  "[subscribe('command/test'), command('test'), _('Run test'), pnp]":
  function doTest()
  {
    var test_data = [],
        test,
        summary,
        func,
        i,
        length,
        message,
        result;

    // initialization for test
    this.sendMessage("command/before-test");

    // get test data
    test_data = this.sendMessage("get/tests");

    length = test_data.length;

    for (i = 0; i < length; ++i) {
      test = test_data[i];

      // evaluate test function
      try {
        test.func();
        result = "Succeeded";
      } catch(e) {
        result = "Failed: " + String(e);
      }

      // build a result message
      message = coUtils.Text.format(_("[%d/%d] %s - %s."),
                                    i + 1,
                                    length,
                                    test.summary,
                                    result);

      // display result message
      this.sendMessage("command/report-overlay-message",
                       message);
    }

    // finalize test phase
    this.sendMessage("command/after-test");
  },

}; // Test


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker)
{
  new Test(broker);
}


// EOF
