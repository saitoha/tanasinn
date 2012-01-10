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

////                                    vvvv                     v    
//const ATTR_CHARACTER   = 0     // 00000000 00011111 11111111 11111111
//const ATTR_FORECOLOR   = 24    // 00001111 00000000 00000000 00000000
//const ATTR_BOLD        = 21    // 00000000 00100000 00000000 00000000
//const ATTR_BACKCOLOR   = 28    // 11110000 00000000 00000000 00000000
//
//const ATTR_UNDERLINE   = 22    // 00000000 01000000 00000000 00000000
//const ATTR_INVERSE     = 23    // 00000000 10000000 00000000 00000000
//
///**
// * @class Cell
// * @brief Bit-packed structure for terminal cell's attribute.
// */
//let Cell = new Class();
//Cell.definition = {
//
//  /** default value */
//  value: 0x0,
//
//  get c()
//  {
//    this.value ^ 0x20;
//    //this.value & 0x1fffff ^ 0x20;
//  },
//
////  set c(value)
////    this.value = (this.value & ~0x1fffff | value) ^ 0x20,
////    //this.value = (this.value | 0x1fffff) & (value ^ 0x20),
//
//  /** getter of foreground color */
//  get fg()
//  {
//    return this.inverse ?
//      this.value >>> ATTR_BACKCOLOR & 0xf
//    : (this.value >>> ATTR_FORECOLOR & 0xf) ^ 0xf;
//  },
//
//  /** setter of foreground color */
//  set fg(value)
//  {
//    this.value = this.value & ~(0xf << ATTR_FORECOLOR) 
//               | ((value ^ 0xf & 0xf) << ATTR_FORECOLOR);
//  },
//
//  /** getter of background color */
//  get bg()
//  {
//    return this.inverse ?
//      (this.value >>> ATTR_FORECOLOR & 0xf) ^ 0xf
//    : this.value >>> ATTR_BACKCOLOR & 0xf;
//  },
//
//  /** setter of background color */
//  set bg(value)
//  {
//    this.value = this.value & ~(0xf << ATTR_BACKCOLOR) 
//                            | value << ATTR_BACKCOLOR;
//  },
//
//  /** getter of bold attribute */
//  get bold()
//  {
//    return this.value >> ATTR_BOLD & 0x1;
//  },
//
//  /** setter of bold attribute */
//  set bold(value)
//  {
//    this.value = this.value & ~(0x1 << ATTR_BOLD) 
//                            | value << ATTR_BOLD;
//  },
//  
//  /** getter of blink attribute */
//  get blink()
//  {
//    return this.value >>> ATTR_BLINK & 0x1;
//  },
//
//  /** setter of blink attribute */
//  set blink(value)
//  {
//    this.value = this.value & ~(0x1 << ATTR_BLINK) 
//                            | value << ATTR_BLINK;
//  },
//  
//  /** getter of inverse attribute */
//  get inverse()
//  {
//    return this.value >>> ATTR_INVERSE & 0x1;
//  },
//
//  /** setter of inverse attribute */
//  set inverse(value)
//  {
//    this.value = this.value & ~(0x1 << ATTR_INVERSE) 
//                            | value << ATTR_INVERSE;
//  },
//  
//  /** getter of underline attribute */
//  get underline()
//  {
//    return this.value >>> ATTR_UNDERLINE & 0x1;
//  },
//
//  /** setter of underline attribute */
//  set underline(value)
//  {
//    this.value = this.value & ~(0x1 << ATTR_UNDERLINE) 
//                            | value << ATTR_UNDERLINE;
//  },
//
//  /** Compare every bit and detect equality of both objects. */
//  equals: function equals(other)
//  {
//    return this.value >>> 21 == other.value >>> 21;
//  },
//
//  /** Clear all properties and make it default state. */
//  clear: function clear()
//  {
//    this.value &= 0x1fffff;
//  },
//  
//  copyFrom: function copyFrom(rhs) 
//  { 
//    this.value = rhs.value;
//  },
//      
//  /** Write a character with attribute structure. */
//  write: function write(c, attr) 
//  {
//    this.value = attr.value & 0xffe00000 | c ^ 0x20;
//  },
//
//  /** Erase the pair of character and attribute structure */
//  erase: function erase() 
//  {
//    this.value = 0;
//  },
//
//}

const ATTR2_FORECOLOR   = 0     // 00000000 00000000 00000000 11111111
const ATTR2_BACKCOLOR   = 8     // 00000000 00000000 11111111 00000000

const ATTR2_BOLD        = 17    // 00000000 00000001 00000000 00000000

const ATTR2_UNDERLINE   = 18    // 00000000 00000010 00000000 00000000
const ATTR2_INVERSE     = 19    // 00000000 00000100 00000000 00000000

const ATTR2_HALFBLIGHT  = 20    // 00000000 00001000 00000000 00000000
const ATTR2_BLINK       = 21    // 00000000 00010000 00000000 00000000


let Cell = new Class();
Cell.definition = {

  c: 0x20,
  value: 0x7,

  /** getter of foreground color */
  get fg()
  {
    return this.inverse ?
      this.value >>> ATTR2_BACKCOLOR & 0xff
    : this.value >>> ATTR2_FORECOLOR & 0xff;
  },

  /** setter of foreground color */
  set fg(value)
  {
    this.value = this.value & ~(0xff << ATTR2_FORECOLOR) 
                            | value << ATTR2_FORECOLOR;
  },

  /** getter of background color */
  get bg()
  {
    return this.inverse ?
      this.value >>> ATTR2_FORECOLOR & 0xff
    : this.value >>> ATTR2_BACKCOLOR & 0xff;
  },

  /** setter of background color */
  set bg(value)
  {
    this.value = this.value & ~(0xff << ATTR2_BACKCOLOR) 
                            | value << ATTR2_BACKCOLOR;
  },

  /** getter of bold attribute */
  get bold()
  {
    return this.value >> ATTR2_BOLD & 0x1;
  },

  /** setter of bold attribute */
  set bold(value)
  {
    this.value = this.value & ~(0x1 << ATTR2_BOLD) 
                            | value << ATTR2_BOLD;
  },
  
  /** getter of blink attribute */
  get blink()
  {
    return this.value >>> ATTR2_BLINK & 0x1;
  },

  /** setter of blink attribute */
  set blink(value)
  {
    this.value = this.value & ~(0x1 << ATTR2_BLINK) 
                            | value << ATTR2_BLINK;
  },

  /** getter of inverse attribute */
  get inverse()
  {
    return this.value >>> ATTR2_INVERSE & 0x1;
  },

  /** setter of inverse attribute */
  set inverse(value)
  {
    this.value = this.value & ~(0x1 << ATTR2_INVERSE) 
                            | value << ATTR2_INVERSE;
  },
  
  /** getter of underline attribute */
  get underline()
  {
    return this.value >>> ATTR2_UNDERLINE & 0x1;
  },

  /** setter of underline attribute */
  set underline(value) 
  {
    this.value = this.value & ~(0x1 << ATTR2_UNDERLINE) 
                            | value << ATTR2_UNDERLINE;
  },

  /** Compare every bit and detect equality of both objects. */
  equals: function equals(other)
  {
    return this.value == other.value;
  },

  /** Clear all properties and make it default state. */
  clear: function clear() 
  {
    this.value = 0x7;
  },
  
  copyFrom: function copyFrom(rhs) 
  { 
    this.value = rhs.value;
  },
      
  /** Write a character with attribute structure. */
  write: function write(c, attr) 
  {
    this.c = c;
    this.value = attr.value;
  },

  /** Erase the pair of character and attribute structure */
  erase: function erase() 
  {
    this.c = 0x20;
    this.value = 0x7;
  },

  serialize: function serialize(context)
  {
    context.push(this.c, this.value);
  },

  deserialize: function deserialize(context)
  {
    this.c = context.shift();
    this.value = context.shift();
  },

};

/**
 * @class DirtyRange
 * @brief Simple range class for Tracking dirty cells' information.
 */
let DirtyRange = new Aspect();
DirtyRange.definition = {

  first: 0,
  last: 0,

  initialize: function initialize(length) 
  {
    this.last = length;
  },
  
  /** Detect whether it has some range. */
  get dirty()
    this.first != this.last,

  invalidate: function invalidate() 
  {
    this.first = 0;
    this.last = this.length;
  },

  /** Marks it "dirty" or "clear". */
  set dirty(value) 
  {
    if (value) {
      this.first = 0;
      this.last = this.length;
    } else {
      this.clearRange();
    }
  },

  /** clears the range. */
  clearRange: function clearRange() 
  {
    this.last = this.first;
  },

  /** makes a union of ranges and store it. */
  addRange: function addRange(first, last) 
  {
    if (this.first == this.last) {
      this.first = first;
      this.last = last;
    } else {
      if (first < this.first)
        this.first = first
      if (last > this.last)
        this.last = last
    }
  },

  /** makes intersection range and set it. */
  trimRange: function trimRange(first, last) 
  {
    if (this.first != this.last) {
      if (first > this.first)
        this.first = first
      if (last < this.last)
        this.last = last
    }
  },
}
 
/**
 * @aspect Resizable
 *
 */
let Resizable = new Aspect();
Resizable.definition = {

  /** pop last n cells from the line. 
   * @param {Number} n count of cell to pop.
   */ 
  collapse: function collapse(n) 
  {
    this.cells.splice(-n);
    this.trimRange(0, this.length);
  },

  /** push n cells to end of line. 
   * @param {Number} n count of cell to push.
   */
  expand: function expand(n) 
  {
    let new_cells = [new Cell for (i in function(n) { 
      while (n--) { yield; } 
    } (n))];
    let cells = this.cells;
    cells.push.apply(cells, new_cells);
  },

};

/** 
 * @brief The Line class, has a set of Cells,
 *        and Provides few functions for low-level input operation.
 */
let Line = new Class().mix(DirtyRange)
                      .mix(Resizable);
Line.definition = {

  cells: null,

  /** constructor */
  initialize: function initialize(length) 
  {
    let generator = function() { while (length--) yield }.call();
    this.cells = [new Cell for (_ in generator)];
  },

  serialize: function serialize(context)
  {
    context.push(this.length);
    this.cells.forEach(function(cell) cell.serialize(context));
  },

  deserialize: function deserialize(context)
  {
    this.length = context.shift();
    this.cells.forEach(function(cell) cell.deserialize(context));
    this.dirty = true;
  },

  /** gets count of cells */
  get length() 
  {
    return this.cells.length
  },

  /** sets count of cells. */
  set length(value) 
  {
    let diff = value - this.cells.length;
    if (diff > 0)
      this.expand(diff);
    else if (diff < 0)
      this.collapse(-diff);
  },
      
  /** 
   * Detects whether the cell located at specified position is wide. 
   * @param {Number} position.
   */ 
  isWide: function isWide(position) 
  {
    let cells = this.cells;
    let cell = cells[position];
    if (!cell)
      return false;
    if (0 == cell.c)
      return true;
    cell = cells[position - 1];
    if (!cell)
      return false;
    return 0 == cell.c;
  },

  /** Gets the range of surround characters. 
   *
   * ex.
   *
   *         point 
   *           v
   * 123 abcdefghijk lmnop 
   *     ^          ^
   *   start       end
   *
   */  
  getWordRangeFromPoint: function getWordRangeFromPoint(column, row) 
  {
    let cells = this.cells;
    let currentChar;
    if (0 == currentChar) {
      currentChar = cells[column + 1].c;
    } else {
      currentChar = cells[column].c;
    }
    let backwardChars = cells.slice(0, column);
    let forwardChars = cells.slice(column + 1);

    function getCharacterCategory(code) {
      let c = String.fromCharCode(code);
      if (/^\s$/.test(c))
        return 0;
      else if (/^[0-9a-zA-Z]$/.test(c))
        return 1;
      else if (/^\w$/.test(c))
        return 2;
      else 
        return 3;
    }

    function getForwardBreakPoint(forwardChars, column, category) {
      let result = column + 1;
      for ([index, cell] in Iterator(forwardChars)) {
        if (0 == cell.c) {
          continue;
        } if (category == getCharacterCategory(cell.c)) {
          result = column + 1 + index + 1;
          continue;
        }
        break;
      }
      return result;
    }
    
    function getBackwardBreakPoint(backwardChars, column, category) {
      let result = column;
      for ([index, cell] in Iterator(backwardChars.reverse())) {
        if (0 == cell.c) {
          result = backwardChars.length - index - 1;
          continue;
        } else if (category == getCharacterCategory(cell.c)) {
          result = backwardChars.length - index - 1;
          continue;
        }
        break;
      }
      return result;
    }

    let category = getCharacterCategory(currentChar);
    let forwardBreakPoint = getForwardBreakPoint(forwardChars, column, category);
    let backwardBreakPoint = getBackwardBreakPoint(backwardChars, column, category);
    return [backwardBreakPoint, forwardBreakPoint];
  },

  /** returns a generator which iterates dirty words. */
  getDirtyWords: function getDirtyWords() 
  {
    if (this.dirty) {
      let attr, start, current, cell;
      let cells = this.cells;
      for (current = this.first; current < this.last; ++current) {
        let cell = cells[current];
        if (attr) {
          if (attr.equals(cell)) {
            continue;
          } else {
            let codes = cells
              .slice(start, current)
              .filter(function(cell) cell.c)
              .map(function(cell) cell.c)
              ;

            let word = String.fromCharCode.apply(String, codes);
            yield { text: word, column: start, end: current, attr: attr };
          } 
        }
        start = current;
        attr = cell;
      }
      if (start < current) {
        let codes = cells
          .slice(start, current)
          .filter(function(cell) cell.c)
          .map(function(cell) cell.c);
        let word = String.fromCharCode.apply(String, codes);
        yield { text: word, column: start, end: current, attr: attr };
      }
      this.clearRange();
    }
  },

  /** returns plain text in specified range. 
   * @return {String} selected string.
   */
  getTextInRange: function getTextInRange(start, end) 
  {
    let codes = this.cells
      .slice(start, end)
      .map(function(cell) cell.c)
      .filter(function(code) code)
    return String.fromCharCode.apply(String, codes);
  },

  /** write to cells at specified position 
   *  with given character and an attribute. 
   */
  write: function write(position, codes, attr, insert_mode) 
  {
    let cells = this.cells
    if (insert_mode) {
      this.addRange(position, this.length);
      let length = codes.length;
      let range = cells.splice(-length);
      range.forEach(function(cell) cell.write(codes.shift(), attr));
      range.unshift(position, 0);
      Array.prototype.splice.apply(cells, range);
    } else {
      this.addRange(position, position + codes.length);
      codes.forEach(function(code) cells[position++].write(code, attr));
    }
  },

  /** 
   * clear all cells.
   */
  clear: function clear() 
  {
    this.cells.forEach(function(cell) cell.erase());
  },

  /** 
   * erace cells at specified range. 
   *
   * ex. erase(2, 5)
   * 
   * [ a b c d e f g h ] -> [ a b       f g h ]
   */
  erase: function erase(start, end) 
  {
    this.addRange(start, end);
    this.cells
      .slice(start, end)
      .forEach(function(cell) cell.erase());
  },

   /**
   *
   * ex. deleteCells(2, 3)
   * 
   * [ a b c d e f g h ] -> [ a b f g h       ]
   */
  deleteCells: function deleteCells(start, n) 
  {
    let cells = this.cells;
    let length = this.length;
    this.addRange(start, length);
    let range = cells.splice(start, n);
    range.forEach(function(cell) cell.erase());
    range.unshift(length, 0) // make arguments.
    // cells.splice(this.length, 0, ....)
    Array.prototype.splice.apply(cells, range);
  },
 
  /**
   *
   * ex. insertBlanks(2, 3)
   * 
   * [ a b c d e f g h ] -> [ a b       c d e ]
   */
  insertBlanks: function insertBlanks(start, n) 
  {
    let cells = this.cells;
    this.addRange(start, this.length);
    let length = cells.length;
    let range = cells.splice(-n);
    range.forEach(function(cell) cell.erase());
    range.unshift(start, 0) // make arguments.
    // cells.splice(start, 0, ....)
    Array.prototype.splice.apply(cells, range);

  },

} // class Line
  

/**
 * @class LineGenerator
 *
 */
let LineGenerator = new Class().extends(Component);
LineGenerator.definition = {

  get id()
    "linegenerator",

  "[subscribe('@event/session-started'), enabled]":
  function onLoad(session) 
  {
    session.notify("initialized/" + this.id, this);
  },

  /** Allocates n cells at once. */
  allocate: function allocate(width, n) 
  {
    let buffer = [];
    while (n--)
      buffer.push(new Line(width));
    return buffer;
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
    "initialized/session", 
    function(session) new LineGenerator(session));
}


