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

var Vector3D = new Class();
Vector3D.definitian = {

  x: 0,
  y: 0,
  z: 0,

  initialize: function initialize(x, y, z)
  {
    this.x = x;
    this.y = y;
    this.z = z;
  },

};

var Quatanion = new Class();
Quatanion.definition = {

  x: 0,
  y: 0,
  z: 0,
  w: 0,

  initialize: function initialize(x, y, z, w)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  },

};

var TransformMatrix = new Class()
TransformMatrix.definition = {

  scaling_center: null,   // Vector3
  scaling_rotation: null, // Quotanion
  scaling: null,          // Vector3
  rotation_center: null,  // Vector3
  rotation: null,         // Quotanion
  translation: null,      // Vector3

  _m00: 1.8,
  _m01: -1,
  _m02: 1,
  _m03: 0,

  _m10: 1,
  _m11: 1,
  _m12: 1,
  _m13: -0.0016,

  _m20: 1,
  _m21: 0,
  _m22: 1,
  _m23: 0,

  _m30: 0,
  _m31: 0,
  _m32: 0,
  _m33: 2.5,

  reset: function reset()
  {
    this._m00 = 1;
    this._m01 = 0;
    this._m02 = 0;
    this._m03 = 0;
    this._m10 = 0;
    this._m11 = 1;
    this._m12 = 0;
    this._m13 = 0;
    this._m20 = 0;
    this._m21 = 0;
    this._m22 = 1;
    this._m23 = 0;
    this._m30 = 0;
    this._m31 = 0;
    this._m32 = 0;
    this._m33 = 1;
  },

  set: function set(m00, m01, m02, m03, 
                    m10, m11, m12, m13, 
                    m20, m21, m22, m23, 
                    m30, m31, m32, m33)
  {
    this._m00 = m00;
    this._m01 = m01;
    this._m02 = m02;
    this._m03 = m03;
    this._m10 = m10;
    this._m11 = m11;
    this._m12 = m12;
    this._m13 = m13;
    this._m20 = m20;
    this._m21 = m21;
    this._m22 = m22;
    this._m23 = m23;
    this._m30 = m30;
    this._m31 = m31;
    this._m32 = m32;
    this._m33 = m33;
  },

  normalize: function reset()
  {
  },

  toString: function toString()
  {
    return "matrix3d(" 
      + [
        this._m00, this._m01, this._m02, this._m03,
        this._m10, this._m11, this._m12, this._m13,
        this._m20, this._m21, this._m22, this._m23,
        this._m30, this._m31, this._m32, this._m33
      ].join(",")
      + ")"
  },

};

var matrix = <>
  -moz-transform: matrix3d(
 +1.8000, -1.0000, +1.0000, -0.0003, 
 +1.0000, +1.0000, +1.0000, -0.0016, 
 -1.0000, +0.0000, +1.0000, -0.0000, 
 +0.0000, +0.0000, +0.0000, +2.5000);
</>;

/**
 * @trait DragTransform
 */
var DragTransform = new Trait();
DragTransform.definition = {

  _initial_position: null,

  /** Dragstart handler. It starts a session of dragging selection. */
  "[listen('dragstart', '#tanasinn_outer_chrome'), pnp]":
  function ondragstart(event) 
  {
    var coordinate, x, y, z, w, h, r2,
        initial_position;

    if (!event.altKey) {
      return;
    }

    if (!event.shiftKey) {
      return;
    }

    coordinate = this.get2DCoordinate(event);

    x = coordinate[0];
    y = coordinate[1];
    w = this._width / 2.0;
    h = this._height / 2.0;
    r2 = w * w + h * h * 1;
    z = Math.sqrt(r2 - (x * x + y * y));

    this._v0 = [x, y, z];
    this.sendMessage("command/report-overlay-message",  " [" + [x, y, z] + "]")

    this.ondragmove.enabled = true;
    this.ondragend.enabled = true;
  },

  /** Dragmove handler */
  "[listen('mousemove', '#tanasinn_outer_chrome')]":
  function ondragmove(event) 
  {
    var coordinate, x, y, z, w, h, r2;

    coordinate = this.get2DCoordinate(event);
    x = coordinate[0];
    y = coordinate[1];
    w = this._width / 2.0;
    h = this._height / 2.0;
    r2 = w * w + h * h * 1;
    z = Math.sqrt(r2 - (x * x + y * y));

    if (isNaN(z)) {
      return;
    }

    var a = this._v0;
    var b = [x, y, z];

    var rot = this._getRotation(a, b);
    //rot = Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])) / 20;

    if (isNaN(rot)) {
      return;
    }

    if (45 < rot ||rot < -45) {
      return;
    }
    if (z * z < 500) {
      return;
    }

    var cross = this._getCross(a, b);

    this.sendMessage("command/report-overlay-message",  " [" + [x, y, z] + "]")
    //this.sendMessage("command/report-overlay-message",  " [" + cross.map(function(r) Math.round(r)) + "," +Math.round(rot) + "]")
//    this._eleemnt.style.MozTransform = "traslateX(100px) translateZ(10px)";
    this._element.style.MozTransform 
      = "translate3d(100px, 100px, 20px) rotate3d(" 
      + cross[0] + ","
      + cross[1] + ","
      + cross[2] + ","
      + rot + "deg"
      + ")"
      ;
  },

  _getCross: function _getCross(a, b)
  {
    var cross;

    cross = [
      a[1] * b[2] - a[2] * b[1], 
      a[2] * b[0] - a[0] * b[2], 
      a[0] * b[1] - a[1] * b[0]
    ];
    
    return cross;
  },

  _getRotation: function _getRotation(a, b)
  {
    var dot_ab, abs_a, abs_b, rot;

    dot_ab = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    abs_a = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    abs_b = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);
    rot = Math.acos(dot_ab / (abs_a * abs_b)) * 180.0 / Math.PI;
    
    return rot;
  },

  /** Dragend handler */
  "[listen('mouseup')]":
  function ondragend(event) 
  {
    this.ondragmove.enabled = false;
    this.ondragend.enabled = false;

    this._initial_position = null;

    if (this._range) {
      this._setClearAction();
      this._reportRange();
    }
  },

  get2DCoordinate: function get2DCoordinate(event) 
  {
    var target_element, root_element,
        offsetX, offsetY,
        left, top;

    target_element = this.request("command/query-selector", "#tanasinn_outer_chrome");
    root_element = this.request("get/root-element");

    offsetX = target_element.boxObject.screenX - root_element.boxObject.screenX;
    offsetY = target_element.boxObject.screenY - root_element.boxObject.screenY;

    left = event.layerX - target_element.boxObject.width / 2; 
    top = event.layerY - target_element.boxObject.height / 2;

    return [left, top];
  },


}; // DragSelect


var Transform = new Class().extends(Plugin)
                           .mix(DragTransform)
                           .depends("outerchrome");
Transform.definition = {

  get id()
    "transform",

  get info()
    <plugin>
        <name>{_("Transforms")}</name>
        <description>{
          _("Convert the world coordinates with mouse operation")
        }</description>
        <version>0.1.0</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,
  "[persistable, watchable] use_matrix": true,
  "[persistable, watchable] matrix": null,

  _element: null,
  _width: 0,
  _height: 0,

  /** Installs itself.
   *  @param broker {Broker} A broker object.
   */
  "[install]":
  function install(broker)
  {
    var root_element;

    this.matrix = new TransformMatrix();
    this.matrix.reset();

    root_element = this.request("get/root-element");
    root_element.firstChild.style.MozPerspective = "300px";

    this._element = root_element.querySelector("#tanasinn_outer_chrome");
    this._element.style.MozTransformStyle = "preserve-3d";
//    this._eleemnt.style.MozTransform = "translateZ(10px)";
//    this._element.style.MozTransform = "rotate3d(0, 0, 1, -45deg) rotate3d(0, 1, 0, -45deg)";
    //this.updateTransform();
  },

  /** Uninstalls itself.
   *  @param broker {Broker} A Broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    this._element = null;
  },

  "[subscribe('event/screen-width-changed'), pnp]": 
  function onWidthChanged(width) 
  {
    this._width = width;
  },

  "[subscribe('event/screen-height-changed'), pnp]": 
  function onHeightChanged(height) 
  {
    this._height = height;
  },

  "[subscribe('variable-changed/outerchrome.{use_matrix | matrix}'), pnp]": 
  function updateTransform() 
  {
    if (this.use_matrix) {
      this._element.style.MozTransform = this.matrix;
    } else {
      this._element.style.MozTransform = "";
    }
  },
};


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} Broker The Broker object.
 */
function main(broker) 
{
  new Transform(broker);
}


