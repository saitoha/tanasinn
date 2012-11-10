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

var coUtils = coUtils || { };

coUtils.Timer = {

  _thread_manager: coUtils.Services.getThreadManager(),

  wait: function wait(wait) 
  {
    var end_time = Date.now() + wait,
        current_thread = this._thread_manager.currentThread;

    do {
      current_thread.processNextEvent(true);
    } while ((current_thread.hasPendingEvents()) || Date.now() < end_time);
  },

  /**
   * @fn setTimeout
   * @brief Set timer callback.
   */
  setTimeout: function setTimeout(timer_proc, interval, context) 
  {
    var timer = coUtils.Components.createTimer(),
        type = coUtils.Constant.TYPE_ONE_SHOT,
        observer,
        timer_callback_func;

    timer_callback_func = context ? 
      function invoke() 
      {
        timer_proc.apply(context, arguments)
        timer = null;
      }
    : timer_proc;

    observer = { notify: timer_callback_func };
    timer.initWithCallback(observer, interval, type);

    return {
      cancel: function cancel() {
        timer.cancel();
        timer = null;
      },
    };
  },

  /**
   * @fn setInterval
   * @brief Set timer callback.
   */
  setInterval: function setInterval(timer_proc, interval, context) 
  {
    var timer = coUtils.Components.createTimer(),
        type = coUtils.Constant.TYPE_REPEATING_SLACK,
        timer_callback_func;

    timer_callback_func = context ? 
      function invoke() 
      {
        timer_proc.apply(context, arguments);
      }
    : timer_proc;

    timer.initWithCallback({ notify: timer_callback_func }, interval, type);

    return {
      cancel: function cancel() {
        if (null !== timer) {
          timer.cancel();
          timer = null;
        }
      },
    };
  },

}; // coUtils.Timer

// EOF
