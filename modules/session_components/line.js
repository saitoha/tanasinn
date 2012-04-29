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


//////////////////////////////////////////////////////////////////////////////
//
// Concepts
//

/**
 * @concept GrammarConcept
 */
let LineGeneratorConcept = new Concept();
LineGeneratorConcept.definition = {

  get id()
    "LineGenerator",

  // signature concept
  "allocate :: Uint16 -> Uint16 -> Array":
  _("Allocates n cells at once."),

}; // GrammarConcept

//////////////////////////////////////////////////////////////////////////////
//
// Implementation
//

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

const ATTR2_FORECOLOR    = 0     // 00000000 00000000 00000000 11111111
const ATTR2_BACKCOLOR    = 8     // 00000000 00000000 11111111 00000000

const ATTR2_BOLD         = 17    // 00000000 00000001 00000000 00000000

const ATTR2_UNDERLINE    = 18    // 00000000 00000010 00000000 00000000
const ATTR2_INVERSE      = 19    // 00000000 00000100 00000000 00000000

const ATTR2_HALFBRIGHT   = 20    // 00000000 00001000 00000000 00000000
const ATTR2_BLINK        = 21    // 00000000 00010000 00000000 00000000
const ATTR2_RAPIDBLINK   = 22    // 00000000 00100000 00000000 00000000
const ATTR2_ITALIC       = 23    // 00000000 01000000 00000000 00000000

const ATTR2_FGCOLOR      = 24    // 00000001 00000000 00000000 00000000
const ATTR2_BGCOLOR      = 25    // 00000010 00000000 00000000 00000000

// tanasinn specific properties
const ATTR2_LINK         = 27    // 00000100 00000000 00000000 00000000
const ATTR2_HIGHLIGHT    = 28    // 00001000 00000000 00000000 00000000

const ATTR2_WIDE         = 29    // 00010000 00000000 00000000 00000000
const ATTR2_DRCS         = 30    // 00100000 00000000 00000000 00000000
const ATTR2_COMBINING    = 31    // 01000000 00000000 00000000 00000000

/**
 * @class Cell
 *
 */
let Cell = new Class();
Cell.definition = {

  c: 0x20,
  value: 0x7,

  initialize: function initialize(attr) 
  {
    if (undefined !== attr) {
      this.value = attr.value;
    }
  },

  /** getter of foreground color */
  get fg()
  {
    return this.value >>> ATTR2_FORECOLOR & 0xff;
  },

  /** setter of foreground color */
  set fg(value)
  {
    this.fgcolor = true;
    this.value = this.value 
               & ~(0xff << ATTR2_FORECOLOR) 
               | value << ATTR2_FORECOLOR;
  },

  /** getter of background color */
  get bg()
  {
    return this.value >>> ATTR2_BACKCOLOR & 0xff;
  },

  /** setter of background color */
  set bg(value)
  {
    this.bgcolor = true;
    this.value = this.value 
               & ~(0xff << ATTR2_BACKCOLOR) 
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
    this.value = this.value 
               & ~(0x1 << ATTR2_BOLD) 
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
    this.value = this.value
               & ~(0x1 << ATTR2_BLINK) 
               | value << ATTR2_BLINK;
  },
  
  /** getter of rapid_blink attribute */
  get rapid_blink()
  {
    return this.value >>> ATTR2_RAPIDBLINK & 0x1;
  },

  /** setter of rapid_blink attribute */
  set rapid_blink(value)
  {
    this.value = this.value
               & ~(0x1 << ATTR2_RAPIDBLINK) 
               | value << ATTR2_RAPIDBLINK;
  },
   
  /** getter of italic attribute */
  get italic()
  {
    return this.value >>> ATTR2_ITALIC & 0x1;
  },

  /** setter of italic attribute */
  set italic(value)
  {
    this.value = this.value
               & ~(0x1 << ATTR2_ITALIC) 
               | value << ATTR2_ITALIC;
  },
 
  /** getter of fgcolor attribute */
  get fgcolor()
  {
    return this.value >>> ATTR2_FGCOLOR & 0x1;
  },

  /** setter of fgcolor attribute */
  set fgcolor(value)
  {
    this.value = this.value
               & ~(0x1 << ATTR2_FGCOLOR) 
               | value << ATTR2_FGCOLOR;
  },

  
  /** getter of bgcolor attribute */
  get bgcolor()
  {
    return this.value >>> ATTR2_BGCOLOR & 0x1;
  },

  /** setter of bgcolor attribute */
  set bgcolor(value)
  {
    this.value = this.value
               & ~(0x1 << ATTR2_BGCOLOR) 
               | value << ATTR2_BGCOLOR;
  },


  /** getter of inverse attribute */
  get inverse()
  {
    return this.value >>> ATTR2_INVERSE & 0x1;
  },

  /** setter of inverse attribute */
  set inverse(value)
  {
    this.value = this.value
               & ~(0x1 << ATTR2_INVERSE) 
               | value << ATTR2_INVERSE;
  },

  /** getter of halfbright attribute */
  get halfbright()
  {
    return this.value >>> ATTR2_HALFBRIGHT & 0x1;
  },

  /** setter of halfbright attribute */
  set halfbright(value)
  {
    this.value = this.value
               & ~(0x1 << ATTR2_HALFBRIGHT) 
               | value << ATTR2_HALFBRIGHT;
  },
  
  /** getter of underline attribute */
  get underline()
  {
    return this.value >>> ATTR2_UNDERLINE & 0x1;
  },

  /** setter of underline attribute */
  set underline(value) 
  {
    this.value = this.value
               & ~(0x1 << ATTR2_UNDERLINE) 
               | value << ATTR2_UNDERLINE;
  },
     
  /** getter of wide attribute */
  get wide()
  {
    return this.value >>> ATTR2_WIDE & 0x1;
  },

  /** setter of wide attribute */
  set wide(value) 
  {
    this.value = this.value
               & ~(0x1 << ATTR2_WIDE) 
               | value << ATTR2_WIDE;
  },
  
  /** getter of combining attribute */
  get combining()
  {
    return this.value >>> ATTR2_COMBINING & 0x1;
  },

  /** setter of combining attribute */
  set combining(value) 
  {
    this.value = this.value
               & ~(0x1 << ATTR2_COMBINING) 
               | value << ATTR2_COMBINING;
  },
 
  /** getter of drcs attribute */
  get drcs()
  {
    return this.value >>> ATTR2_DRCS & 0x1;
  },

  /** setter of drcs attribute */
  set drcs(value) 
  {
    this.value = this.value
               & ~(0x1 << ATTR2_DRCS) 
               | value << ATTR2_DRCS;
  },

  /** Compare every bit and detect equality of both objects. */
  equals: function equals(other)
  {
    //return this.value << 7 == other.value << 7;
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
//    if (c >= 0x300) {
//      let match = coUtils.Unicode
//        .detectCategory(String.fromCharCode(c));
//      if (match) {
//        let [is_non_spacing_mark, is_spacing_combining_mark] = match;  
//        if (is_non_spacing_mark || is_spacing_combining_mark) {
//          this.combining = true;
//        }
//      }
//    }
  }, // write

  /** Erase the pair of character and attribute structure */
  erase: function erase(attr) 
  {
    this.c = 0x20;
    if (attr) {
      this.value = attr.value;
    } else {
      this.value = 0x7;
    }

  }, // erase

// Serialize or deserialize into/from "context" stream.

  serialize: function serialize(context)
  {
    context.push(this.c, this.value);
  },

  deserialize: function deserialize(context)
  {
    this.c = context.shift();
    this.value = context.shift();
  },

}; // Cell

/**
 * @class DirtyRange
 * @brief Simple range class for Tracking dirty cells' information.
 */
let DirtyRange = new Trait();
DirtyRange.definition = {

  first: 0,
  last: 0,

  initialize: function initialize(length) 
  {
    this.last = length;
  },
  
  /** Detect whether it has some range. */
  get dirty()
  {
    return this.first != this.last;
  },

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
 * @trait Resizable
 *
 */
let Resizable = new Trait();
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
    let new_cells = [
      new Cell for (i in function(n) { 
        while (n--) { 
          yield;
        } 
      } (n))
    ];
    let cells = this.cells;
    cells.push.apply(cells, new_cells);
  },

}; // trait Resizable

/** 
 * @brief The Line class, has a set of Cells,
 *        and Provides few functions for low-level input operation.
 */
let Line = new Class().mix(DirtyRange)
                      .mix(Resizable);
Line.definition = {

  cells: null,
  type: coUtils.Constant.LINETYPE_NORMAL,

  /** constructor */
  initialize: function initialize(length, attr) 
  {
    let cells = [];
    while (length--) {
      let cell = new Cell(attr);
      cells.push(cell);
    }
    this.cells = cells;
  },

  serialize: function serialize(context)
  {
    context.push(this.length);
    // this.cells.forEach(function(cell) cell.serialize(context));
    let cells = this.cells;
    let i, cell;
    for (i = 0; i < cells.length; ++i) {
      cell = cells[i];
      cell.serialize(context);
    }
  },

  deserialize: function deserialize(context)
  {
    this.length = context.shift();
    // this.cells.forEach(function(cell) cell.deserialize(context));
    let cells = this.cells;
    let i, cell;
    for (i = 0; i < cells.length; ++i) {
      cell = cells[i];
      cell.deserialize(context);
    }
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
    if (diff > 0) {
      this.expand(diff);
    } else if (diff < 0) {
      this.collapse(-diff);
    }
  },
      
  /** 
   * Detects whether the cell located at specified position is wide. 
   * @param {Number} position.
   */ 
  isWide: function isWide(position) 
  {
    let cells = this.cells;
    let cell = cells[position];
    if (!cell) {
      return false;
    }
    if (0 == cell.c) {
      return true;
    }
    cell = cells[position - 1];
    if (!cell) {
      return false;
    }
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
  getWordRangeFromPoint: 
  function getWordRangeFromPoint(column, row) 
  {
    let cells = this.cells;
    let current_char;
    if (0 == current_char) {
      current_char = cells[column + 1].c;
    } else {
      current_char = cells[column].c;
    }
    let backward_chars = cells.slice(0, column);
    let forward_chars = cells.slice(column + 1);

    function getCharacterCategory(code) {
      let c = String.fromCharCode(code);
      if (/^\s$/.test(c)) {
        return 0;
      } else if (/^[0-9a-zA-Z]$/.test(c)) {
        return 1;
      } else if (/^\w$/.test(c)) {
        return 2;
      } else {
        return 3;
      }
    }

    function getForwardBreakPoint(forward_chars, column, category) 
    {
      let result = column + 1;
      for (let [index, cell] in Iterator(forward_chars)) {
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
    
    function getBackwardBreakPoint(backward_chars, column, category) 
    {
      let result = column;
      for (let [index, cell] in Iterator(backward_chars.reverse())) {
        if (0 == cell.c) {
          result = backward_chars.length - index - 1;
          continue;
        } else if (category == getCharacterCategory(cell.c)) {
          result = backward_chars.length - index - 1;
          continue;
        }
        break;
      }
      return result;
    }

    let category = getCharacterCategory(current_char);
    let forward_break_point 
      = getForwardBreakPoint(forward_chars, column, category);
    let backward_break_point 
      = getBackwardBreakPoint(backward_chars, column, category);
    return [backward_break_point, forward_break_point];
  },

  /** returns a generator which iterates dirty words. */
  getDirtyWords: function getDirtyWords() 
  {
    if (this.dirty) {
      let attr, start, current, cell;
      let cells = this.cells;
      let max = coUtils.Constant.LINETYPE_NORMAL == this.type ? 
        this.last: 
        Math.min(this.last, Math.floor(this.length / 2));
      for (current = this.first; current < max; ++current) {
        let cell = cells[current];
        if (attr) {
          if (attr.equals(cell) && cell.c) {
            continue;
          } else {
            let codes = cells.slice(start, current);
            yield { 
              codes: codes, 
              column: start, 
              end: current, 
              attr: attr,
            };
          } 
        }
        if (0 == cell.c) {
          let cell = cells[current + 1];
          if (cell) {
            yield { 
              codes: [ cell ], 
              column: current, 
              end: current + 2, 
              attr: cell,
            };
            ++current;
            start = current + 1;
            attr = cell;
          }
          continue;
        }
        start = current;
        attr = cell;
      }
      if (start < current && attr) {
        let codes = cells.slice(start, current)
        yield { 
          codes: codes, 
          column: start, 
          end: current, 
          attr: attr,
        };
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
    let i, cell;
    let cells = this.cells
    if (insert_mode) {
      this.addRange(position, this.length);
      let length = codes.length;
      let range = cells.splice(-length);

      // range.forEach(function(cell) cell.write(codes.shift(), attr));
      for (i = 0; i < range.length; ++i) {
        cell = range[i];
        cell.write(codes[i], attr);
      }

      range.unshift(position, 0);
      Array.prototype.splice.apply(cells, range);

    } else { // replace mode

      this.addRange(position, position + codes.length);
      // codes.forEach(function(code) cells[position++].write(code, attr));
      for (i = 0; i < codes.length; ++i) {
        cell = cells[position + i];
        cell.write(codes[i], attr);
      }
    }
  },

  /** 
   * clear all cells.
   */
  clear: function clear() 
  {
    let cells = this.cells;
    let length = cells.length;
    let i, cell;
    for (i = 0; i < length; ++i) {
      cell = cells[i];
      cell.erase();
    }
    this.type = coUtils.Constant.LINETYPE_NORMAL;
  },

  /** 
   * erace cells at specified range. 
   *
   * ex. erase(2, 5)
   * 
   * [ a b c d e f g h ] -> [ a b       f g h ]
   */
  erase: function erase(start, end, attr) 
  {
    this.addRange(start, end);
//    this.cells
//      .slice(start, end)
//      .forEach(function(cell) cell.erase(attr));
    let i, cell;
    let cells = this.cells;
    end = Math.min(end, cells.length);
    for (i = start; i < end; ++i) {
      cell = cells[i];
      cell.erase(attr);
    }
  },

  /** 
   * erace cells with test pattern. 
   *
   * [ a b c d e f g h ] -> [ E E E E E E E E ]
   */
  eraseWithTestPattern: function eraseWithTestPattern(start, end, attr)
  {
    this.addRange(start, end);
//    this.cells
//      .slice(start, end)
//      .forEach(function(cell) cell.write(0x45 /* "E" */, attr));
    let i, cell;
    let cells = this.cells;
    end = Math.min(end, cells.length);
    for (i = start; i < end; ++i) {
      cell = cells[i];
      cell.write(0x45 /* "E" */, attr);
    }
  },

   /**
   *
   * ex. deleteCells(2, 3, attr)
   * 
   * [ a b c d e f g h ] -> [ a b f g h       ]
   */
  deleteCells: function deleteCells(start, n, attr) 
  {
    let cells = this.cells;
    let length = this.length;
    this.addRange(start, length);
    let range = cells.splice(start, n);

    // range.forEach(function(cell) cell.erase(attr));
    let i, cell;
    for (i = 0; i < range.length; ++i) {
      cell = range[i];
      cell.erase(attr);
    }

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
  insertBlanks: function insertBlanks(start, n, attr) 
  {
    let cells = this.cells;
    this.addRange(start, this.length);
    let length = cells.length;
    let range = cells.splice(-n);

    // range.forEach(function(cell) cell.erase(attr));
    let i, cell;
    for (i = 0; i < range.length; ++i) {
      let cell = range[i];
      cell.erase(attr);
    }

    range.unshift(start, 0) // make arguments.
    // cells.splice(start, 0, ....)
    Array.prototype.splice.apply(cells, range);

  },

} // class Line
  

/**
 * @class LineGenerator
 *
 */
let LineGenerator = new Class().extends(Component)
                               .requires("LineGenerator");
LineGenerator.definition = {

  get id()
    "linegenerator",

  "[subscribe('@event/broker-started'), enabled]":
  function onLoad(broker) 
  {
    broker.notify("initialized/" + this.id, this);
  },

  /** Allocates n cells at once. */
  "[type('Uint16 -> Uint16 -> Array')]":
  function allocate(width, n, attr) 
  {
    let line;
    let buffer = [];
    while (n--) {
      line = new Line(width, attr);
      buffer.push(line);
    }
    return buffer;
  },

}; // LineGenerator

/**
 * @fn main
 * @brief Module entry point.
 * @param {Broker} broker The Broker object.
 */
function main(broker) 
{
  new LineGenerator(broker);
}


