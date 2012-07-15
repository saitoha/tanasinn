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
 * @class Vector3d
 */
function Vector3d() 
{ 
  return this.initialize.apply(this, arguments);
};
Vector3d.prototype = {

  x: 0,
  y: 0,
  z: 0,

  /** constructor */
  initialize: function initialize(x, y, z)
  {
    this.x = x;
    this.y = y;
    this.z = z;
  },

  /** get absolute value */
  abs: function abs()
  {
    // (x^2 + y^2 + z^2) ^ (1/2)
    return Math.sqrt(this.x * this.x 
                   + this.y * this.y 
                   + this.z * this.z);
  },

  /** get normalized vector */
  norm: function nrom()
  {
    var abs = this.abs();

    return new Vector3d(this.x / abs, 
                        this.y / abs,
                        this.z / abs);
  },

  /** get dot product for this and other */
  dot: function dot(/* Vector3d */ other)
  {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  },

  /** get cross product for this and other */
  cross: function cross(/* Vector3d */ other)
  {
    return new Vector3d(
      this.y * other.z - this.z * other.y, 
      this.z * other.x - this.x * other.z, 
      this.x * other.y - this.y * other.x);
  },

};


/**
 *
 * @class TransformMatrix
 *
 */
function TransformMatrix() 
{ 
  return this.initialize.apply(this, arguments);
};
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

  /** constructor */
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

function getMatrixFrom2Vectors(a, b)
{
  var cross = b.cross(a),
      cos_angle = b.dot(a),
      sin_angle = cross.abs(),
      normalized_axis = cross.norm(),
      x = normalized_axis.x,
      y = normalized_axis.y,
      z = normalized_axis.z,

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

  return matrix;
};

/**
 * @trait DragTransform
 */
var DragTransform = new Trait();
DragTransform.definition = {

  _last_matrix: null,

  /** Dragstart handler. It starts a session of dragging selection. */
  "[listen('dragstart', '#tanasinn_capture_cover'), pnp]":
  function ondragstart(event) 
  {
    var root_element;

    if (!event.altKey) {
      return;
    }

    if (!event.shiftKey) {
      return;
    }

    if (event.ctrlKey) {
      return;
    }

    this._begin_point = this.get2DCoordinate(event);

    root_element = this.request("get/root-element");
    root_element.firstChild.style.MozPerspective 
      = Math.floor(this._begin_point.abs() * 1.5) + "px";


    this.onMouseMove.enabled = true;
    this.onMouseUp.enabled = true;

  },

  /** Dragmove handler */
  "[listen('mousemove')]":
  function onMouseMove(event) 
  {
    //event.stopPropagation();
    //event.preventDefault();
    var a = this._begin_point.norm(),
        b = this.get2DCoordinate(event).norm(),
        matrix = getMatrixFrom2Vectors(a, b);

    this._last_matrix = this._matrix.apply(matrix);
    this._element.style.MozTransform = this._last_matrix.toString();
  },

  /** alt/shift keydown event handler, enables the dragging helper object */
  "[subscribe('event/{alt & shift}-key-down'), pnp]":
  function onModifierKeysDown() 
  {
    this.sendMessage("command/enable-drag-cover");
  },

  /** alt/shift keyup event handler, detects the timing for drag end */
  "[subscribe('event/{alt | shift}-key-up'), pnp]":
  function onModifierKeyUp() 
  {
    this.sendMessage("command/disable-drag-cover");
    this.onDragEnd();
  },

  /** "mouseup" event handler, detects the timing for dragend */
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

    //this.onAltKeyUp.enabled = false;

    if (null !== this._last_matrix) {
      this._matrix = this._last_matrix;
    }

//    this.sendMessage("command/focus");
  },

  get2DCoordinate: function get2DCoordinate(event) 
  {
    var target_element = this.request(
          "command/query-selector", 
          "#tanasinn_background_frame"),
        root_element = this.request("get/root-element").ownerDocument.documentElement,
        offsetX = target_element.boxObject.screenX - root_element.boxObject.screenX,
        offsetY = target_element.boxObject.screenY - root_element.boxObject.screenY,
        x = (event.layerX - offsetX - target_element.boxObject.width / 2) * 1,
        y = (event.layerY - offsetY - target_element.boxObject.height / 2) * 1,
        w = this._width / 2.0,
        h = this._height / 2.0,
        r2 = w * w + h * h * 1,
        d2 = r2 - x * x - y * y,
        z = d2 > 0 ? Math.sqrt(d2): -Math.sqrt(-d2);
//        this.sendMessage("command/report-overlay-message", [x, y]);

    return new Vector3d(x, y, z);
  },


}; // DragSelect

/**
 * @class Transform
 *
 */
var Transform = new Class().extends(Plugin)
                           .mix(DragTransform)
                           .depends("dragcover")
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

  "[persistable] enabled_when_startup": false,

  _matrix: null,
  _element: null,

  _width: 0,
  _height: 0,

  /** Installs itself.
   *  @param broker {Broker} A broker object.
   */
  "[install]":
  function install(broker)
  {
    var root_element = this.request("get/root-element"),
        document_element = root_element.ownerDocument.documentElement;

    this._matrix = new TransformMatrix(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1);
    this._element = root_element.querySelector("#tanasinn_outer_chrome");
    this._element.style.MozTransformStyle = "preserve-3d";
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
}; // Transform


/**
 * @class DragCover
 *
 */
var DragCover = new Class().extends(Plugin)
DragCover.definition = {

  get id()
    "dragcover",

  get info()
    <plugin>
        <name>{_("DragCover")}</name>
        <description>{
          _("A Helper Object for gathering mouse dragging event's coordinate data.")
        }</description>
        <version>0.1.0</version>
    </plugin>,

  "[persistable] enabled_when_startup": true,

  _cover: null,

  /** Installs itself.
   *  @param broker {Broker} A broker object.
   */
  "[install]":
  function install(broker)
  {
    var root_element = this.request("get/root-element"),
        document_element = root_element.ownerDocument.documentElement;

    this._cover = this.request(
      "command/construct-chrome",
      {
        tagName: "box",
        id: "tanasinn_capture_cover",
        style: "position: fixed; top: 0px; left: 0px;",
        hidden: true,
      })["tanasinn_capture_cover"];

    document_element.appendChild(this._cover);

    this._cover.style.width = document_element.boxObject.width + "px";
    this._cover.style.height = document_element.boxObject.height + "px"; 

  },

  /** Uninstalls itself.
   *  @param broker {Broker} A Broker object.
   */
  "[uninstall]":
  function uninstall(broker)
  {
    if (null !== this._cover) {
      this._cover.parentNode.removeChild(this._cover);
      this._cover = null;
    }
  },

  "[subscribe('command/enable-drag-cover'), pnp]":
  function enableDragCover() 
  {
    this._cover.hidden = false;
  },

  "[subscribe('command/disable-drag-cover'), pnp]":
  function disableDragCover() 
  {
    var cover = this._cover;

    cover.parentNode.appendChild(cover);
    cover.hidden = true;
  },

}; // DragCover


/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} Broker The Broker object.
 */
function main(broker) 
{
  new Transform(broker);
  new DragCover(broker);
}

// EOF
