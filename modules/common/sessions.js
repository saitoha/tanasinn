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
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2013
 * the Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

var coUtils = coUtils || { };


coUtils.Sessions = {

  _records: null,
  _dirty: true,

  session_data_path: "$Home/.tanasinn/sessions.txt",

  remove: function remove(broker, request_id)
  {
    delete this._records[request_id];
    this._dirty = true;

    coUtils.Timer.setTimeout(
      function timerProc()
      {
        var runtimepath = coUtils.Runtime.getRuntimePath(),
            backup_data_path = runtimepath + "/persist/" + request_id + ".txt",
            file = coUtils.File.getFileLeafFromVirtualPath(backup_data_path);

        if (file.exists()) {
          file.remove(true);
        }

        backup_data_path = runtimepath + "/persist/" + request_id + ".png";
        file = coUtils.File.getFileLeafFromVirtualPath(backup_data_path);

        if (file.exists()) {
          file.remove(true);
        }
      }, 1000, this);
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
    var sessions,
        lines,
        request_id,
        command,
        control_port,
        pid,
        ttyname,
        line,
        sequence,
        i = 0;

    this._records = {};

    if (coUtils.File.exists(this.session_data_path)) {
      sessions = coUtils.IO.readFromFile(this.session_data_path);
      lines = sessions.split(/[\r\n]+/);

      for (; i < lines.length; ++i)
      {
        line = lines[i],
        sequence = line.split(",");

        if (sequence.length > 4) {

          request_id = sequence[0];
          command = sequence[1];
          control_port = Number(sequence[2]);
          pid = Number(sequence[3]);
          ttyname = sequence[4];

          this._records[request_id] = {
            request_id: request_id,
            command: command && coUtils.Text.base64decode(command),
            control_port: control_port,
            pid: pid,
            ttyname: ttyname,
          }
        };
      }
    }
    this._dirty = false;
  },

  update: function update()
  {
    var lines = [""],
        request_id,
        record,
        line,
        records = this._records,
        keys = Object.keys(records),
        i = 0;

    for (; i < keys.length; ++i) {
      request_id = keys[i];
      record = records[request_id]

      line = [
        request_id,
        coUtils.Text.base64encode(record.command),
        record.control_port,
        record.pid,
        record.ttyname
      ].join(",");

      lines.unshift(line);
    }

    coUtils.IO.writeToFile(this.session_data_path, lines.join("\n"));

    this._dirty = false;
  },

  getRecords: function getRecords()
  {
    if (!this._records) {
      this.load();
    }
    return this._records;
  },

}; // coUtils.Sessions

// EOF
