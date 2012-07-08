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

var Vector3d = new Class();
Vector3d.prototype = {

  x: 0,
  y: 0,
  z: 0,

  abs2: function abs2()
  {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },

  abs: function abs2()
  {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },

  norm: function nrom()
  {
    var abs;

    abs = this.abs();

    return new Vector3d(this.x / abs, 
                        this.y / abs,
                        this.z / abs);
  },

  dot: function dot(/* Vector3d */ other)
  {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  },

  cross: function cross(/* Vector3d */ other)
  {
    return new Vector3d(
      this.y * other.z - this.z * other.y, 
      this.z * other.x - this.x * other.z, 
      this.x * other.y - this.y * other.x);
  },

  initialize: function initialize(x, y, z)
  {
    this.x = x;
    this.y = y;
    this.z = z;
  },

};

var Quatanion = new Class();
Quatanion.prototype = {

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
TransformMatrix.prototype = {

  _m00: 1,
  _m01: 0,
  _m02: 0,
  _m03: 0,

  _m10: 0,
  _m11: 1,
  _m12: 0,
  _m13: 0,

  _m20: 0,
  _m21: 0,
  _m22: 1,
  _m23: 0,

  _m30: 0,
  _m31: 0,
  _m32: 0,
  _m33: 1,

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

  initialize: function initialize(m00, m01, m02, m03, 
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

  apply: function apply(other)
  {
    var a = this,
        b = other;

    return new TransformMatrix(
      a._m00 * b._m00 + a._m01 * b._m10 + a._m02 * b._m20 + a._m03 * b._m30,
      a._m00 * b._m01 + a._m01 * b._m11 + a._m02 * b._m21 + a._m03 * b._m31,
      a._m00 * b._m02 + a._m01 * b._m12 + a._m02 * b._m22 + a._m03 * b._m32,
      a._m00 * b._m03 + a._m01 * b._m13 + a._m02 * b._m23 + a._m03 * b._m33,
      a._m10 * b._m00 + a._m11 * b._m10 + a._m12 * b._m20 + a._m13 * b._m30,
      a._m10 * b._m01 + a._m11 * b._m11 + a._m12 * b._m21 + a._m13 * b._m31,
      a._m10 * b._m02 + a._m11 * b._m12 + a._m12 * b._m22 + a._m13 * b._m32,
      a._m10 * b._m03 + a._m11 * b._m13 + a._m12 * b._m23 + a._m13 * b._m33,
      a._m20 * b._m00 + a._m21 * b._m10 + a._m22 * b._m20 + a._m23 * b._m30,
      a._m20 * b._m01 + a._m21 * b._m11 + a._m22 * b._m21 + a._m23 * b._m31,
      a._m20 * b._m02 + a._m21 * b._m12 + a._m22 * b._m22 + a._m23 * b._m32,
      a._m20 * b._m03 + a._m21 * b._m13 + a._m22 * b._m23 + a._m23 * b._m33,
      a._m30 * b._m00 + a._m31 * b._m10 + a._m32 * b._m20 + a._m33 * b._m30,
      a._m30 * b._m01 + a._m31 * b._m11 + a._m32 * b._m21 + a._m33 * b._m31,
      a._m30 * b._m02 + a._m31 * b._m12 + a._m32 * b._m22 + a._m33 * b._m32,
      a._m30 * b._m03 + a._m31 * b._m13 + a._m32 * b._m23 + a._m33 * b._m33);
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

/**
 * @trait DragTransform
 */
var DragTransform = new Trait();
DragTransform.definition = {

  _last_matrix: null,

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
    //event.stopPropagation();
    //event.preventDefault();

//    this._last_matrix = this.matrix.apply(matrix);
//    this._element.style.MozTransform = this._last_matrix.toString();

    coordinate = this.get2DCoordinate(event);

    x = coordinate[0];
    y = coordinate[1];
    w = this._width / 2.0;
    h = this._height / 2.0;
    r2 = w * w + h * h * 1;
    z = Math.sqrt(r2 - (x * x + y * y));

    this._begin_point = new Vector3d(x, y, z);

    this.onMouseMove.enabled = true;
    this.onMouseUp.enabled = true;
    this.onModifierKeyUp.enabled = true;

  },

  /** Dragmove handler */
  "[listen('mousemove')]":
  function onMouseMove(event) 
  {
    //event.stopPropagation();
    //event.preventDefault();

    var coordinate = this.get2DCoordinate(event),
        x = coordinate[0],
        y = coordinate[1],
        w = this._width / 2.0,
        h = this._height / 2.0,
        r2 = w * w + h * h * 1,
        z = Math.sqrt(r2 - (x * x + y * y));

    //if (x * x > (this._width / 2 - 100) * (this._width / 2 - 100)) {
    //  return;
    //}

    //if (y * y > (this._height / 2 - 100) * (this._height / 2 - 100)) {
    //  return;
    //}

    if (isNaN(z)) {
      return;
    }

    //this.sendMessage("command/report-overlay-message",  " [" + [x * x, y * y] + "] " + [(this._width - 100) * (this._width - 100) / 4, this.height * this._height / 4])

    var a = this._begin_point,
        b = new Vector3d(x, y, z),
        cos_angle = b.norm().dot(a.norm()),
        sin_angle = Math.sqrt(1.0 - cos_angle * cos_angle),
        cross = b.cross(a).norm();
        x = cross.x,
        y = cross.y,
        z = cross.z,
        matrix = new TransformMatrix(
          1 + (1 - cos_angle) * (x * x - 1),
          -z * sin_angle + (1 - cos_angle) * x * y,
           y * sin_angle + (1 - cos_angle) * x * z,
           0,
          z * sin_angle + (1 - cos_angle) * x * y,
          1 + (1 - cos_angle) * (y * y - 1),
          -x * sin_angle + (1 - cos_angle) * y * z,
          0,
          -y * sin_angle + (1- cos_angle) * x * z,
          x * sin_angle + (1 - cos_angle) * y * z,
          1 + (1 - cos_angle) * (z * z - 1),
          0,
          0, 0, 0, 1);

    this._last_matrix = this.matrix.apply(matrix);
    this._element.style.MozTransform = this._last_matrix.toString();
  },

  "[subscribe('event/{alt & shift}-key-down'), pnp]":
  function onModifierKeysDown() 
  {
    this._cover = this.request(
      "command/construct-chrome",
      {
        parentNode: "#tanasinn_window_layer",
        tagName: "box",
        id: "capture_cover",
        style: "position: fixed; border: 20px solid blue",
      })["capture_cover"];

    this._cover.style.width = this._element.ownerDocument.documentElement.boxObject.width + "px"; 
    this._cover.style.height = this._element.ownerDocument.documentElement.boxObject.height + "px"; 

  },

  "[subscribe('event/{alt | shift}-key-up')]":
  function onModifierKeyUp() 
  {
    this.onDragEnd();
  },

  "[listen('mouseup')]":
  function onMouseUp(event) 
  {
    //event.stopPropagation();
    //event.preventDefault();
    this.onDragEnd();
  },

  /** Dragend handler */
  onDragEnd: function onDragEnd(event) 
  {
    this.onMouseMove.enabled = false;
    this.onMouseUp.enabled = false;
    this.onModifierKeyUp.enabled = false;

//    if (this._element) {
//      this._element.parentNode(this._element);
//      this._element = null;
//    }

    //this.onAltKeyUp.enabled = false;

    if (null !== this._last_matrix) {
      this.matrix = this._last_matrix;
    }

    this.sendMessage("command/focus");
  },

  get2DCoordinate: function get2DCoordinate(event) 
  {
    var target_element = this.request("command/query-selector", "#tanasinn_outer_chrome"),
        root_element = this.request("get/root-element"),
        offsetX = target_element.boxObject.screenX - root_element.boxObject.screenX,
        offsetY = target_element.boxObject.screenY - root_element.boxObject.screenY,
        left = event.layerX - target_element.boxObject.width / 2,
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
    root_element.firstChild.style.MozPerspective = "2000px";

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


