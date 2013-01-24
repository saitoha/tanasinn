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

//////////////////////////////////////////////////////////////////////////////
//
// Concepts
//

/**
 * @concept GrammarConcept
 */
var LineGeneratorConcept = new Concept();
LineGeneratorConcept.definition = {

  id: "LineGenerator",

  // signature concept
  "allocate :: Uint16 -> Uint16 -> Array":
  _("Allocates n cells at once."),

}; // GrammarConcept

//////////////////////////////////////////////////////////////////////////////
//
// Implementation
//
var _ATTR_BACKCOLOR    = 0,    // 00000000 00000000 00000000 11111111
    _ATTR_FORECOLOR    = 8,    // 00000000 00000000 11111111 00000000

    _ATTR_BOLD         = 16,   // 00000000 00000001 00000000 00000000

    _ATTR_UNDERLINE    = 17,   // 00000000 00000010 00000000 00000000
    _ATTR_INVERSE      = 18,   // 00000000 00000100 00000000 00000000

    _ATTR_INVISIBLE    = 19,   // 00000000 00001000 00000000 00000000
    _ATTR_HALFBRIGHT   = 20,   // 00000000 00010000 00000000 00000000
    _ATTR_BLINK        = 21,   // 00000000 00100000 00000000 00000000
    _ATTR_RAPIDBLINK   = 22,   // 00000000 01000000 00000000 00000000
    _ATTR_ITALIC       = 23,   // 00000000 10000000 00000000 00000000

    _ATTR_FGCOLOR      = 24,   // 00000001 00000000 00000000 00000000
    _ATTR_BGCOLOR      = 25,   // 00000010 00000000 00000000 00000000

// tanasinn specific properties
    _ATTR_LINK         = 26,   // 00000100 00000000 00000000 00000000
    _ATTR_HIGHLIGHT    = 27,   // 00001000 00000000 00000000 00000000

    _ATTR_WIDE         = 28,   // 00010000 00000000 00000000 00000000
    _ATTR_PROTECTED    = 29,   // 00100000 00000000 00000000 00000000
    _ATTR_DRCS         = 30;   // 01000000 01111111 01111111 01111111

/**
 * @class Cell
 *
 */
var Cell = new Class();
Cell.definition = {

  c: 0x20,
  value: 0x0,

  /** getter of foreground color */
  get fg()
  {
    return this.value >>> _ATTR_FORECOLOR & 0xff;
  },

  /** setter of foreground color */
  set fg(value)
  {
    this.fgcolor = 1;
    this.value = this.value 
               & ~(0xff << _ATTR_FORECOLOR) 
               | value << _ATTR_FORECOLOR;
  },

  /** getter of background color */
  get bg()
  {
    return this.value >>> _ATTR_BACKCOLOR & 0xff;
  },

  /** setter of background color */
  set bg(value)
  {
    this.bgcolor = 1;
    this.value = this.value 
               & ~(0xff << _ATTR_BACKCOLOR) 
               | value << _ATTR_BACKCOLOR;
  },

  /** getter of bold attribute */
  get bold()
  {
    return this.value >> _ATTR_BOLD & 0x1;
  },

  /** setter of bold attribute */
  set bold(value)
  {
    this.value = this.value 
               & ~(0x1 << _ATTR_BOLD) 
               | value << _ATTR_BOLD;
  },
  
  /** getter of blink attribute */
  get blink()
  {
    return this.value >>> _ATTR_BLINK & 0x1;
  },

  /** setter of blink attribute */
  set blink(value)
  {
    this.value = this.value
               & ~(0x1 << _ATTR_BLINK) 
               | value << _ATTR_BLINK;
  },
  
  /** getter of rapid_blink attribute */
  get rapid_blink()
  {
    return this.value >>> _ATTR_RAPIDBLINK & 0x1;
  },

  /** setter of rapid_blink attribute */
  set rapid_blink(value)
  {
    this.value = this.value
               & ~(0x1 << _ATTR_RAPIDBLINK) 
               | value << _ATTR_RAPIDBLINK;
  },
   
  /** getter of italic attribute */
  get italic()
  {
    return this.value >>> _ATTR_ITALIC & 0x1;
  },

  /** setter of italic attribute */
  set italic(value)
  {
    this.value = this.value
               & ~(0x1 << _ATTR_ITALIC) 
               | value << _ATTR_ITALIC;
  },
 
  /** getter of fgcolor attribute */
  get fgcolor()
  {
    return this.value >>> _ATTR_FGCOLOR & 0x1;
  },

  /** setter of fgcolor attribute */
  set fgcolor(value)
  {
    this.value = this.value
               & ~(0x1 << _ATTR_FGCOLOR) 
               | value << _ATTR_FGCOLOR;
  },

  
  /** getter of bgcolor attribute */
  get bgcolor()
  {
    return this.value >>> _ATTR_BGCOLOR & 0x1;
  },

  /** setter of bgcolor attribute */
  set bgcolor(value)
  {
    this.value = this.value
               & ~(0x1 << _ATTR_BGCOLOR) 
               | value << _ATTR_BGCOLOR;
  },


  /** getter of inverse attribute */
  get inverse()
  {
    return this.value >>> _ATTR_INVERSE & 0x1;
  },

  /** setter of inverse attribute */
  set inverse(value)
  {
    this.value = this.value
               & ~(0x1 << _ATTR_INVERSE) 
               | value << _ATTR_INVERSE;
  },

  /** getter of invisible attribute */
  get invisible()
  {
    return this.value >>> _ATTR_INVISIBLE & 0x1;
  },

  /** setter of invisible attribute */
  set invisible(value)
  {
    this.value = this.value
               & ~(0x1 << _ATTR_INVISIBLE) 
               | value << _ATTR_INVISIBLE;
  },

  /** getter of halfbright attribute */
  get halfbright()
  {
    return this.value >>> _ATTR_HALFBRIGHT & 0x1;
  },

  /** setter of halfbright attribute */
  set halfbright(value)
  {
    this.value = this.value
               & ~(0x1 << _ATTR_HALFBRIGHT) 
               | value << _ATTR_HALFBRIGHT;
  },
  
  /** getter of underline attribute */
  get underline()
  {
    return this.value >>> _ATTR_UNDERLINE & 0x1;
  },

  /** setter of underline attribute */
  set underline(value) 
  {
    this.value = this.value
               & ~(0x1 << _ATTR_UNDERLINE) 
               | value << _ATTR_UNDERLINE;
  },
     
  /** getter of wide attribute */
  get wide()
  {
    return this.value >>> _ATTR_WIDE & 0x1;
  },

  /** setter of wide attribute */
  set wide(value) 
  {
    this.value = this.value
               & ~(0x1 << _ATTR_WIDE) 
               | value << _ATTR_WIDE;
  },
  
  /** getter of protected attribute */
  get protected()
  {
    return this.value >>> _ATTR_PROTECTED & 0x1;
  },

  /** setter of protected attribute */
  set protected(value) 
  {
    this.value = this.value
               & ~(0x1 << _ATTR_PROTECTED) 
               | value << _ATTR_PROTECTED;
  },
 
  /** Compare every bit and detect equality of both objects. */
  equals: function equals(other)
  {
    //return this.value << 7 === other.value << 7;
    return this.value === other.value;
  },

  /** Clear all properties and make it default state. */
  clear: function clear() 
  {
    this.c = 0x20;
    this.value = 0x0;
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
  }, // write

  /** Erase the pair of character and attribute structure */
  erase: function erase(attrvalue) 
  {
    this.c = 0x20;
    this.value = attrvalue;
  }, // erase

  /** Erase if the cell id marked as "erasable". */
  selectiveErase: function selectiveErase(attrvalue) 
  {
    if (!this.protected) {
      this.c = 0x20;
      this.value = attrvalue;
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

  getCodes: function getCodes()
  {
    var code = this.c,
        i;

    if (code < 0x10000 || 0x100000 <= code) {
      yield code;
    } else if ("object" === typeof code) {
      for (i = 0; i < code.length; ++i) {
        yield code[i];
      }
    } else {
      // emit 16bit + 16bit surrogate pair.
      code -= 0x10000;
      yield (code >> 10) | 0xD800;
      yield (code & 0x3FF) | 0xDC00;
    }
  },

}; // Cell

/**
 * @class DirtyRange
 * @brief Simple range class for Tracking dirty cells' information.
 */
var DirtyRange = new Trait();
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
    return this.first !== this.last;
  },

  invalidate: function invalidate() 
  {
    this.first = 0;
    this.last = this.cells.length;
  },

  /** Marks it "dirty" or "clear". */
  set dirty(value) 
  {
    if (value) {
      this.first = 0;
      this.last = this.cells.length;
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
    if (this.first === this.last) {
      this.first = first;
      this.last = last;
    } else {
      if (first < this.first) {
        this.first = first;
      }
      if (last > this.last) {
        this.last = last;
      }
    }
  },

  /** makes intersection range and set it. */
  trimRange: function trimRange(first, last) 
  {
    if (this.first !== this.last) {
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
var Resizable = new Trait();
Resizable.definition = {

  /** pop last n cells from the line. 
   * @param {Number} n count of cell to pop.
   */ 
  collapse: function collapse(n) 
  {
    var cells = this.cells;

    cells.splice(-n);
    this.trimRange(0, cells.length);
  },

  /** push n cells to end of line. 
   * @param {Number} n count of cell to push.
   */
  expand: function expand(n) 
  {
    function count(n)
    {
      while (n--) {
        yield;
      }
    };

    var new_cells = [ new Cell for (i in count(n)) ],
        cells = this.cells;

    cells.push.apply(cells, new_cells);
  },

}; // trait Resizable

/** 
 * @brief The Line class, has a set of Cells,
 *        and Provides few functions for low-level input operation.
 */
var Line = new Class().mix(DirtyRange)
                      .mix(Resizable);
Line.definition = {

  cells: null,
  type: coUtils.Constant.LINETYPE_NORMAL,

  /** constructor */
  initialize: function initialize(length) 
  {
    var cells = [],
        cell;

    while (length--) {
      cell = new Cell();
      cells.push(cell);
    }
    this.cells = cells;
  },

  /** back up to context */
  serialize: function serialize(context)
  {
    var cells = this.cells,
        i,
        cell;

    context.push(cells.length);
    // this.cells.forEach(function(cell) cell.serialize(context));

    for (i = 0; i < cells.length; ++i) {
      cell = cells[i];
      cell.serialize(context);
    }
  },

  /** back up cells in specified range to given context */
  serializeRange: function serializeRange(context, left, right)
  {
    var cells = this.cells,
        i,
        cell;

    for (i = left; i < Math.min(cells.length, right); ++i) {
      cell = cells[i];
      cell.serialize(context);
    }
  },

  /** restore from to context */
  deserialize: function deserialize(context)
  {
    var cells = this.cells,
        i,
        cell;

    this.length = context.shift();
    // this.cells.forEach(function(cell) cell.deserialize(context));

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
    var diff = value - this.cells.length,
        last_cell;

    if (diff > 0) {
      this.expand(diff);
    } else if (diff < 0) {
      this.collapse(-diff);
      last_cell = this.cells[value - 1];
      if (0 === last_cell.c) {
        last_cell.clear();
      }
    }
  },
      
  /** 
   * Detects whether the cell located at specified position is wide. 
   * @param {Number} position.
   */ 
  isWide: function isWide(position) 
  {
    var cells = this.cells,
        cell = cells[position];

    if (!cell) {
      return false;
    }
    if (0 === cell.c) {
      return true;
    }
    cell = cells[position - 1];
    if (!cell) {
      return false;
    }
    return 0 === cell.c;
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
    var cells = this.cells,
        current_char,
        backward_chars,
        forward_chars,
        character_category, 
        forward_break_point,
        backward_break_point;

    if (0 === current_char) {
      current_char = cells[column + 1].c;
    } else {
      current_char = cells[column].c;
    }

    backward_chars = cells.slice(0, column);
    forward_chars = cells.slice(column + 1);

    character_category = this._getCharacterCategory(current_char);

    forward_break_point 
      = this._getForwardBreakPoint(forward_chars, column, character_category);
    backward_break_point 
      = this._getBackwardBreakPoint(backward_chars, column, character_category);

    return [backward_break_point, forward_break_point];
  },
 
  _getCharacterCategory: 
  function _getCharacterCategory(code)
  {
    var c = String.fromCharCode(code);

    if (/^\s$/.test(c)) {
      return 0;
    } else if (/^[0-9a-zA-Z]$/.test(c)) {
      return 1;
    } else if (/^\w$/.test(c)) {
      return 2;
    } else {
      return 3;
    }
  },

  _getForwardBreakPoint:
  function _getForwardBreakPoint(forward_chars, column, category) 
  {
    var result = column + 1,
        index,
        cell;

    for ([index, cell] in Iterator(forward_chars)) {
      if (0 === cell.c) {
        continue;
      } if (category === this._getCharacterCategory(cell.c)) {
        result = column + 1 + index + 1;
        continue;
      }
      break;
    }

    return result;
  },
   
  _getBackwardBreakPoint:
  function _getBackwardBreakPoint(backward_chars, column, category) 
  {
    var result = column,
        index,
        cell;

    for ([index, cell] in Iterator(backward_chars.reverse())) {
      if (0 === cell.c) {
        result = backward_chars.length - index - 1;
        continue;
      } else if (category === this._getCharacterCategory(cell.c)) {
        result = backward_chars.length - index - 1;
        continue;
      }
      break;
    }
    return result;
  },

  _getCodePointsFromCells: function _getCodePointsFromCells(cells)
  {
    var i = 0,
        c,
        codes = [],
        cell;

    for (; i < cells.length; ++i) {
      cell = cells[i];
      for (c in cell.getCodes()) {
        codes.push(c);
      }
    }

    return codes;
  },

  /** returns a generator which iterates dirty words. */
  getDirtyWords: function getDirtyWords() 
  {
    var attr,
        start,
        current,
        cell,
        cells,
        max,
        cell,
        is_ascii,
        range,
        codes,
        c;

    if (this.dirty) {
      cells = this.cells;
      max = coUtils.Constant.LINETYPE_NORMAL === this.type ? 
        this.last: 
        Math.min(this.last, Math.floor(cells.length / 2));

      for (current = this.first; current < max; ++current) {
        cell = cells[current];
        is_ascii = cell.c > 0 && cell.c < 0x80;
        if (attr) {
          if (attr.equals(cell) && is_ascii /*&& 0 === attr.drcs*/) {
            continue;
          } else {
            range = cells.slice(start, current);
            codes = this._getCodePointsFromCells(range);
            yield { 
              codes: codes, 
              column: start, 
              end: current, 
              attr: attr,
            };
          } 
        }
        if (!is_ascii) {
          if (0 === cell.c) {
            cell = cells[current + 1]; // MUST not null
            if (undefined !== cell) {
              yield { 
                codes: [c for (c in cell.getCodes())],
                column: current, 
                end: current + 2, 
                attr: cell,
              };
              ++current;
              start = current + 1;
              attr = cells[start];
            }
            continue;
          } else { // combined
            yield { 
              codes: [c for (c in cell.getCodes())], 
              column: current, 
              end: current + 1, 
              attr: cell,
            };
          }
        }
        start = current;
        attr = cells[current];
      }
      if (start < current && attr) {
        codes = cells.slice(start, current)
        yield { 
          codes: this._getCodePointsFromCells(codes), 
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
  getTextInRange: function getTextInRange(start, end, raw)
  {
    var codes,
        cells = this.cells.slice(start, end),
        cell,
        i,
        j,
        c;

    if (raw) {
      codes = [];
      for (i = 0; i < cells.length; ++i) {
        cell = cells[i];
        codes.push(cell.c);
      }
    } else {
      codes = [];
      for (i = 0; i < cells.length; ++i) {
        cell = cells[i];
        c = cell.c;
        if (c < 0x10000) {
          codes.push(c);
        } else if ("object" === typeof c) {
          Array.prototype.push.apply(codes, c);
        } else {
          // emit 16bit + 16bit surrogate pair.
          c -= 0x10000;
          codes.push((c >> 10) | 0xD800);
          codes.push((c & 0x3FF) | 0xDC00);
        }
      }
    }
    return String.fromCharCode.apply(String, codes);
  },

  /** write to cells at specified position 
   *  with given character and an attribute. 
   */
  write: function write(position, codes, attr, insert_mode) 
  {
    var cells = this.cells,
        i,
        cell,
        length,
        range,
        code,
	end;

    if (insert_mode) {
      this.addRange(position, cells.length);
      length = codes.length;
      range = cells.splice(-length);

      // range.forEach(function(cell) cell.write(codes.shift(), attr));
      for (i = 0; i < range.length; ++i) {
        cell = range[i];
        cell.write(codes[i], attr);
      }

      range.unshift(position, 0);
      Array.prototype.splice.apply(cells, range);

    } else { // replace mode

      for (i = 0; i < codes.length; ++i) {
        code = codes[i];
        cell = cells[position + i];
        //if (cell.c !== code || !attr.equals(cell)) {
        //  if (first > position + i) {
        //    first = position + i;
        //  }
        //  last = position + i + 1;
        cell.write(code, attr);
        //}
      }
      end = position + codes.length;
      //if (position > 0) {
      //  --position;
      //}
      //if (end < cells.length) {
      //  ++end;
      //}
      this.addRange(position, end);
    }
  },

  /** 
   * clear all cells.
   */
  clear: function clear() 
  {
    var cells = this.cells,
        length = cells.length,
        i = 0,
        cell;

    for (; i < length; ++i) {
      cell = cells[i];
      cell.clear();
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
  erase: function erase(start, end, attrvalue) 
  {
    var i,
        cell,
        cells;
    
    this.addRange(start, end);

    cells = this.cells;
    end = Math.min(end, cells.length);
    for (i = start; i < end; ++i) {
      cell = cells[i];
      cell.erase(attrvalue);
    }
  },

  /** 
   * erace cells marked as "erasable" at specified range. 
   *
   */
  selectiveErase: function selectiveErase(start, end, attrvalue) 
  {
    var i,
        cell,
        cells;
    
    this.addRange(start, end);

    cells = this.cells;
    end = Math.min(end, cells.length);
    for (i = start; i < end; ++i) {
      cell = cells[i];
      cell.selectiveErase(attrvalue);
    }
  },

  /** 
   * erace cells with test pattern. 
   *
   * [ a b c d e f g h ] -> [ E E E E E E E E ]
   */
  eraseWithTestPattern: 
  function eraseWithTestPattern(start, end, attr)
  {
    var i,
        cell,
        cells;

    this.addRange(start, end);
//    this.cells
//      .slice(start, end)
//      .forEach(function(cell) cell.write(0x45 /* "E" */, attr));

    cells = this.cells;
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
  deleteCells: function deleteCells(start, n, attrvalue) 
  {
    var cells = this.cells,
        length = cells.length,
        range,
        i,
        cell;

    this.addRange(start, length);
    range = cells.splice(start, n);

    for (i = 0; i < range.length; ++i) {
      cell = range[i];
      cell.erase(attrvalue);
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
  insertBlanks: function insertBlanks(start, n, attrvalue) 
  {
    var cells = this.cells,
        length = cells.length,
        range = cells.splice(-n),
        i = 0,
        cell;

    this.addRange(start, cells.length);

    for (; i < range.length; ++i) {
      cell = range[i];
      cell.erase(attrvalue);
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
var LineGenerator = new Class().extends(Plugin)
                               .requires("LineGenerator");
LineGenerator.definition = {

  id: "linegenerator",

  getInfo: function getInfo()
  {
    return {
      name: _("Line Generator"),
      version: "0.1",
      description: _("Provides line objects for screen object.")
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

  /** Uninstalls itself. 
   */
  "[uninstall]":
  function uninstall() 
  {
  },

  /** Allocates n cells at once. */
  "[type('Uint16 -> Uint16 -> Array')]":
  function allocate(width, n) 
  {
    var line,
        buffer = [];

    while (n--) {
      line = new Line(width);
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

// EOF
