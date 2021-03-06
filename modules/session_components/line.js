/* -*- Mode: JAVASCRIPT; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
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
  "allocate :: Uint16 -> Uint16 -> Uint16 -> Array":
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
    _ATTR_STRIKE       = 24,   // 00000001 00000000 00000000 00000000

    _ATTR_FGCOLOR      = 25,   // 00000010 00000000 00000000 00000000
    _ATTR_BGCOLOR      = 26,   // 00000100 00000000 00000000 00000000

// tanasinn specific properties
    _ATTR_LINK         = 27,   // 00001000 00000000 00000000 00000000
    _ATTR_HIGHLIGHT    = 28,   // 00010000 00000000 00000000 00000000

    _ATTR_PROTECTED    = 29;   // 00100000 00000000 00000000 00000000

/**
 * @class Cell
 *
 */
var Cell = new Class();
Cell.definition = {

  c: 0x20,
  value: 0x0,

  /** getter of foreground color */
  getForeColor: function getForeColor()
  {
    return this.value >>> _ATTR_FORECOLOR & 0xff;
  },

  /** setter of foreground color */
  setForeColor: function setForeColor(value)
  {
    this.value = this.value
               & ~(0xff << _ATTR_FORECOLOR)
               | value << _ATTR_FORECOLOR
               | 0x1 << _ATTR_FGCOLOR;
  },

  /** getter of background color */
  getBackColor: function getBackColor()
  {
    //return this.value >>> _ATTR_BACKCOLOR & 0xff;
    return this.value & 0xff;
  },

  /** setter of background color */
  setBackColor: function setBackColor(value)
  {
    this.value = this.value
               & ~(0xff << _ATTR_BACKCOLOR)
               | value << _ATTR_BACKCOLOR
               | 0x1 << _ATTR_BGCOLOR;
  },

  /** getter of bold attribute */
  getBold: function getBold()
  {
    return 0x1 === (this.value >> _ATTR_BOLD & 0x1);
  },

  /** setter of bold attribute */
  setBold: function setBold(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_BOLD;
    } else {
      this.value &= ~(0x1 << _ATTR_BOLD);
    }
  },

  /** getter of blink attribute */
  getBlink: function getBlink()
  {
    return 0x1 === (this.value >>> _ATTR_BLINK & 0x1);
  },

  /** setter of blink attribute */
  setBlink: function setBlink(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_BLINK;
    } else {
      this.value &= ~(0x1 << _ATTR_BLINK);
    }
  },

  /** getter of rapid_blink attribute */
  getRapidBlink: function getRapidBlink()
  {
    return 0x1 === (this.value >>> _ATTR_RAPIDBLINK & 0x1);
  },

  /** setter of rapid_blink attribute */
  setRapidBlink: function setRapidBlink(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_RAPIDBLINK;
    } else {
      this.value &= ~(0x1 << _ATTR_RAPIDBLINK);
    }
  },

  /** getter of italic attribute */
  getItalic: function getItalic()
  {
    return 0x1 === (this.value >>> _ATTR_ITALIC & 0x1);
  },

  /** setter of italic attribute */
  setItalic: function setItalic(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_ITALIC;
    } else {
      this.value &= ~(0x1 << _ATTR_ITALIC);
    }
  },

  /** getter of strike attribute */
  getStrike: function getStrike()
  {
    return 0x1 === (this.value >>> _ATTR_STRIKE & 0x1);
  },

  /** setter of strike attribute */
  setStrike: function setStrike(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_STRIKE;
    } else {
      this.value &= ~(0x1 << _ATTR_STRIKE);
    }
  },

  /** get whether foreground color is enabled */
  hasForeColor: function hasForeColor()
  {
    return 0x1 << _ATTR_FGCOLOR  === (this.value & 0x1 << _ATTR_FGCOLOR);
  },

  /** reset foreground color attribute */
  resetForeColor: function resetForeColor()
  {
    this.value &= ~(0x1 << _ATTR_FGCOLOR);
  },


  /** get whether background color is enabled */
  hasBackColor: function hasBackColor()
  {
    //if (this.value & 0xff !== 0) {
    //  return 1;
    //}
    return 0x1 << _ATTR_BGCOLOR  === (this.value & 0x1 << _ATTR_BGCOLOR);
  },

  /** reset background color attribute */
  resetBackColor: function resetBackColor(value)
  {
    this.value &= ~(0x1 << _ATTR_BGCOLOR)
  },


  /** getter of inverse attribute */
  getInverse: function getInverse()
  {
    return 0x1 === (this.value >>> _ATTR_INVERSE & 0x1);
  },

  /** setter of inverse attribute */
  setInverse: function setInverse(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_INVERSE;
    } else {
      this.value &= ~(0x1 << _ATTR_INVERSE);
    }
  },

  /** getter of invisible attribute */
  getInvisible: function getInvisible()
  {
    return 0x1 === (this.value >>> _ATTR_INVISIBLE & 0x1);
  },

  /** setter of invisible attribute */
  setInvisible: function setInvisible(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_INVISIBLE;
    } else {
      this.value &= ~(0x1 << _ATTR_INVISIBLE);
    }
  },

  /** getter of halfbright attribute */
  getHalfbright: function getHalfbright()
  {
    return 0x1 === (this.value >>> _ATTR_HALFBRIGHT & 0x1);
  },

  /** setter of halfbright attribute */
  setHalfbright: function setHalfbright(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_HALFBRIGHT;
    } else {
      this.value &= ~(0x1 << _ATTR_HALFBRIGHT);
    }
  },

  /** getter of underline attribute */
  getUnderline: function getUnderline()
  {
    return 0x1 === (this.value >>> _ATTR_UNDERLINE & 0x1);
  },

  /** setter of underline attribute */
  setUnderline: function setUnderline(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_UNDERLINE;
    } else {
      this.value &= ~(0x1 << _ATTR_UNDERLINE);
    }
  },

  /** getter of protected attribute */
  getProtected: function getProtected()
  {
    return 0x1 === (this.value >>> _ATTR_PROTECTED & 0x1);
  },

  /** setter of protected attribute */
  setProtected: function setProtected(value)
  {
    if (value) {
      this.value |= 0x1 << _ATTR_PROTECTED;
    } else {
      this.value &= ~(0x1 << _ATTR_PROTECTED);
    }
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

  /** copy internal value from another instance */
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
    if (0x1 !== (this.value >>> _ATTR_PROTECTED & 0x1)) {
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

    if (code < 0x10000 /* BMP */) {
      yield code;
    } else if ("object" === typeof code) {
      for (i = 0; i < code.length; ++i) {
        yield code[i];
      }
    } else if (code >= 0xf0000 /* DRCS/iso-2022 */) {
      yield code;
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

  /** constructor */
  initialize: function initialize(length)
  {
    this.first = 0;
    this.last = length;
  },

  invalidate: function invalidate()
  {
    this.first = 0;
    this.last = this.cells.length;
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
}; // DirtyRange

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
  initialize: function initialize(length, attrvalue)
  {
    var cells = [],
        cell;

    while (length--) {
      cell = new Cell();
      cell.value = attrvalue;
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
        cell,
        length = cells.length;

    if (length > right) {
      length = right;
    }
    for (i = left; i < length; ++i) {
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

    this.setLength(context.shift());

    for (i = 0; i < cells.length; ++i) {
      cell = cells[i];
      cell.deserialize(context);
    }
    this.invalidate();
  },

  /** gets count of cells */
  getLength: function getLength()
  {
    return this.cells.length
  },

  /** sets count of cells. */
  setLength: function setLength(value)
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

  _getCodePointsFromCells:
  function _getCodePointsFromCells(cells)
  {
    var i,
        c,
        codes = [],
        cell;

    for (i = 0; i < cells.length; ++i) {
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
        is_ascii_prev,
        range,
        codes,
        c;

    if (this.first !== this.last) {
      cells = this.cells;
      max = coUtils.Constant.LINETYPE_NORMAL === this.type ?
        this.last:
        Math.min(this.last, (cells.length / 2 | 0));

      for (current = this.first; current < max; ++current) {
        cell = cells[current];
        if (undefined === cell) {
          break;
        }
	is_ascii_prev = is_ascii;
        is_ascii = cell.c > 0 && cell.c < 0x80;
        if (attr) {
          if (attr.equals(cell) && is_ascii && is_ascii_prev) {
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
        codes = cells.slice(start, current);
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
  write: function write(position, codes, attr, insert_mode, right_margin)
  {
    var cells = this.cells,
        i,
        cell,
        length = codes.length,
        range,
        code,
        end;

    if (insert_mode) {
      this.addRange(position, right_margin);
      range = cells.splice(right_margin - length, length);

      for (i = 0; i < range.length; ++i) {
        cell = range[i];
        cell.write(codes[i], attr);
      }

      range.unshift(position, 0);
      Array.prototype.splice.apply(cells, range);

    } else { // replace mode
      end = position + length;
      if (position > 0) {
        cell = cells[position - 1];
        if (undefined !== cell) {
          if (0 === cell.c) {
            cells[position - 1].erase();
          }
        }
      }
      if (end < right_margin) {
        cell = cells[end - 1];
        if (undefined !== cell) {
          if (0 === cell.c) {
            cells[end].erase();
          }
        }
      }
      for (i = 0; i < length; ++i) {
        code = codes[i];
        cell = cells[position + i];
        if (undefined !== cell) {
          cell.write(code, attr);
        }
      }
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
        i,
        cell;

    /** clear whole cells */
    for (i = 0; i < length; ++i) {
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
        cells = this.cells;

    this.addRange(start, end);
    if (end < cells.length && 0 === cells[end].c) {
      ++end;
    }

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
   * erace cells with specified pattern.
   *
   * [ a b c d e f g h ] -> [ E E E E E E E E ]
   */
  fill: function fill(start, end, c, attr)
  {
    var i,
        cell,
        cells;

    this.addRange(start, end);

    cells = this.cells;
    end = Math.min(end, cells.length);
    for (i = start; i < end; ++i) {
      cell = cells[i];
      cell.write(c, attr);
    }
  },

   /**
   *
   * ex. deleteCells(2, 3, attr)
   *
   * [ a b c d e f g h ] -> [ a b f g h       ]
   */
  deleteCells: function deleteCells(start, n, attrvalue, right_margin)
  {
    var cells = this.cells,
        length = cells.length,
        end = start + n,
        range,
        i,
        cell;

    this.addRange(start, right_margin);
    //if (end < length && 0 === cells[end - 1].c) {
    //  ++n;
    //}
    range = cells.splice(start, n);

    for (i = 0; i < range.length; ++i) {
      cell = range[i];
      cell.erase(attrvalue);
    }

    range.unshift(right_margin - range.length, 0) // make arguments.

    // cells.splice(this.getLength(), 0, ....)
    Array.prototype.splice.apply(cells, range);
  },

  /**
   *
   * ex. insertBlanks(2, 3)
   *
   * [ a b c d e f g h ] -> [ a b       c d e ]
   */
  insertBlanks: function insertBlanks(start, n, attrvalue, right_margin)
  {
    var cells = this.cells,
        length = cells.length,
        range,
        end = start + n,
        i,
        cell;

    this.addRange(start, right_margin);
    //if (end < length && 0 === cells[end - 1].c) {
    //  ++n;
    //}

    range = cells.splice(right_margin - n, n);

    for (i = 0; i < range.length; ++i) {
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

  /** provide plugin information */
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
  "[type('Uint16 -> Uint16 -> Uint16 -> Array')]":
  function allocate(/* cols */ width, /* rows */ n, attrvalue)
  {
    var line,
        buffer = [],
        i;

    for (i = 0; i < n; ++i) {
      line = new Line(width, attrvalue);
      buffer.push(line);
    }
    return buffer;
  },

  /** test */
  "[test]":
  function()
  {
    var enabled = this.enabled,
        lines;

    try {
      lines = this.allocate(10, 4, 0); 
      coUtils.Debug.assert(4 === lines.length);
    } finally {
      this.enabled = enabled;
    }
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
