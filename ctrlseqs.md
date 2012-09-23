This document is based on the format of TeraTerm.

http://ttssh2.sourceforge.jp/manual/en/about/ctrlseq.html

# C0 Control Character (7bit)

 Hexadecimal  |  Mnemonic    |  Description
--------------|--------------|-----------------
0x00          | NUL          |
0x01          | SOH          |
0x02          | STX          |
0x03          | ETX          |
0x04          | EOT          |
0x05          | ENQ          |  Sends the answerback message (Default: empty).
0x06          | ACK          |
0x07          | BEL          |  Visual bell / Sound bell.
0x08          | BS           |  Moves the cursor one character position to the left.
0x09          | HT           |  Moves the cursor to the next tab stop.
0x0a          | LF           |  Cause a line feed or a new line operation, depending on the setting of line feed/new line mode.
0x0b          | VT           |  Same as LF.
0x0c          | FF           |  Same as LF.
0x0d          | CR           |  Moves the cursor to the left margin on the current line.
0x0e          | SO           |  Maps G1 character set into GL.
0x0f          | SI           |  Maps G0 character set into GL.
0x10          | DLE          |
0x11          | DC1          |
0x12          | DC2          |
0x13          | DC3          |
0x14          | DC4          |
0x15          | NAK          |
0x16          | SYN          |
0x17          | ETB          |
0x18          | CAN          |
0x19          | EM           |
0x1a          | SUB          |
0x1b          | ESC          |  Introduces an escape sequence.
0x1c          | FS           |
0x1d          | GS           |
0x1e          | RS           |
0x1f          | US           |


# C1 Control Character

Hexadecimal   | Equivalent 7-bit control  | Mnemonic  | Description
--------------|---------------------------|-----------|------------
0x80          |                           | PAD       |
0x81          |                           | HOP       |
0x82          |                           | BPH       |
0x83          |                           | NBH       |
0x84          | ESC D                     | IND       | Moves the cursor down one line in the same column.
0x85          | ESC E                     | NEL       | Moves the cursor to the first position on the next line.
0x86          |                           | SSA       |
0x87          |                           | ESA       |
0x88          | ESC H                     | HTS       | Sets a horizontal tab stop at the column where the cursor is.
0x89          |                           | HTJ       |
0x8a          |                           | VTS       |
0x8b          |                           | PLD       |
0x8c          |                           | PLU       |
0x8d          | ESC M                     | RI        | Moves the cursor up one line in the same column.
0x8e          | ESC N                     | SS2       | Temporarily maps the G2 character set into GL or GR, for the next graphic character.
0x8f          | ESC O                     | SS3       | Temporarily maps the G3 character set into GL or GR, for the next graphic character.
0x90          | ESC P                     | DCS       | Device Control String. Introduces a DCS Sequence.
0x91          |                           | PU1       |
0x92          |                           | PU2       |
0x93          |                           | STS       |
0x94          |                           | CCH       |
0x95          |                           | MW        |
0x96          |                           | SPA       |
0x97          |                           | EPA       |
0x98          | ESC X                     | SOS       | Start of string. Introduces a SOS Sequence.
0x99          |                           | SGCI      |
0x9a          |                           | SCI       |
0x9b          | ESC [                     | CSI       | Contros Sequence Introducer. Intruduces a CSI Sequence.
0x9c          | ESC \                     | ST        | String terminator. Ends a DCS, SOS, OSC, PM and APC sequence.
0x9d          | ESC ]                     | OSC       | Operating System Command. Introduces a OSC Sequence.
0x9e          | ESC ^                     | PM        | Privacy Message. Introduces a PM Sequence.
0x9f          | ESC _                     | APC       | Application Program Command. Introduces a APC Sequence.

# Escape Sequence

Sequence      |                        |
--------------|------------------------|-------------------------
ESC 6         | DECBI                  | TODO:
ESC 7         | DECSC                  | Save the following items.
              |                        |   - Cursor position
              |                        |   - Character attributes (SGR)
              |                        |   - GL and GR state
              |                        |   - Wrap flag
              |                        |   - Origin mode state
              |                        |   - Selective erase attribute (DECSCA)
              |                        |   - Any single SS2 or SS3 functions sent
ESC 8         | DECRC                  | Restores the terminal to the state saved by the save cursor (DECSC) function. 
ESC 9         | DECFI                  | TODO:
ESC >         | DECKPAM/DECPAM         | Using Application Keypad Mode.
ESC =         | DECKPNM/DECPNM         | Using Normal Keypad Mode.
ESC D         | IND                    | Moves the cursor down one line in the same column.
ESC E         | NEL                    | Moves the cursor to the first position on the next line. 
ESC H         | HTS                    | Sets a horizontal tab stop at the column where the cursor is.
ESC M         | RI                     | Moves the cursor up one line in the same column.
ESC N         | SS2                    | Temporarily maps the G2 character set into GL or GR, for the next graphic character.
ESC O         | SS3                    | Temporarily maps the G3 character set into GL or GR, for the next graphic character.
ESC P         | DCS                    | Device Control String. Introduces a DCS Sequence.
ESC X         | SOS                    | Start of string. Introduces a SOS Sequence.
ESC Z         | DECID                  | Reports a Terminal ID.
ESC [         | CSI                    | Control Sequence Introducer. Introduces a CSI Sequence.
ESC \         | ST                     | String terminator. Ends a DCS, SOS, OSC, PM and APC sequence.
ESC ]         | OSC                    | Operating System Command. Introduces a OSC Sequence.
ESC ^         | PM                     | Privacy Message. Introduces a PM Sequence.
ESC _         | APC                    | Application Program Command. Introduces a APC Sequence.
ESC c         | RIS                    | Terminal Full Reset.
ESC g         | -                      | Visible Bell.
ESC n         | LS2                    | Maps G2 character set into GL.
ESC o         | LS3                    | Maps G3 character set into GL.
ESC |         | LS3R                   | Maps G3 character set into GR.
ESC }         | LS2R                   | Maps G2 character set into GR.
ESC ~         | LS1R                   | Maps G1 character set into GR.
ESC SP F      | S7C1T                  | 7-bit control mode.
ESC SP G      | S8C1T                  | 8-bit control mode.
ESC #3        | DECDHL                 |
ESC #4        | DECDHL                 |
ESC #5        | DECSWL                 |
ESC #6        | DECDWL                 |
ESC # 8       | DECALN                 | Fills the complete screen area with 'E'. 
ESC $         |                        | TODO:
ESC (         |                        | Select Character Set G0
ESC )         |                        | Select Character Set G1
ESC *         |                        | Select Character Set G2
ESC +         |                        | Select Character Set G3
ESC %@        |                        |
ESC %G        |                        |
ESC SP F      |                        |
ESC SP G      |                        |


# CSI Sequence

Sequence                          | Mnemonic          | Description
----------------------------------|-------------------|----------------------------------------------------------------------------------------------------------------------
CSI Ps @                          | ICH               | Insert Ps space (SP) characters starting at the cursor position. The default value of Ps is 1.
CSI Ps A                          | CUU               | Moves cursor up Ps lines in the same column. The default value of Ps is 1.
CSI Ps B                          | CUD               | Moves cursor down Ps lines in the same column. The default value of Ps is 1.
CSI Ps C                          | CUF               | Moves cursor to the right Ps columns. The default value of Ps is 1.
CSI Ps D                          | CUB               | Moves cursor to the left Ps columns. The default value of Ps is 1.
CSI Ps E                          | CNL               | Moves cursor to the first column of Ps-th following line. The default value of Ps is 1.
CSI Ps F                          | CPL               | Moves cursor to the first column of Ps-th preceding line. The default value of Ps is 1.
CSI Ps G                          | CHA               | Moves cursor to the Ps-th column of the active line. The default value of Ps is 1.
CSI Ps1 ; Ps2 H                   | CUP               | Moves cursor to the Ps1-th line and to the Ps2-th column. The default value of Ps1 and Ps2 is 1.
CSI Ps I                          | CHT               | Moves cursor to the Ps tabs forward. The default value of Ps is 1.
CSI Ps J                          | ED                | Erase in display. The default value of Ps is 0.
                                  |                   | Ps = 0      Erase from cursor through the end of the display.
                                  |                   |    = 1      Erase from the beginning of the display through the cursor.
                                  |                   |    = 2      Erase the complete of display.
CSI Ps K                          | EL                | Erase in line. The default value of Ps is 0.
                                  |                   | Ps = 0      Erase from the cursor through the end of the line.
                                  |                   |    = 1      Erase from the beginning of the line through the cursor.
                                  |                   |    = 2      Erase the complete of line.
CSI Ps L                          | IL                | Inserts Ps lines, stgarting at the cursor. The default value of Ps is 1.
CSI Ps M                          | DL                | Deletes Ps lines in the scrolling region, starting with the line that has the cursor. The default value of Ps is 1.
CSI Ps P                          | DCH               | Deletes Ps characters from the cursor position to the right. The default value of Ps is 1.
CSI Ps S                          | SU                | Scroll up Ps lines. The default value of Ps is 1.
CSI Ps T                          | SD                | Scroll down Ps lines. The default value of Ps is 1.
CSI Ps X                          | ECH               | Erase Ps characters, from the cursor position to the right. The default value of Ps is 1.
CSI Ps Z                          | CBT               | Moves cursor to the Ps tabs backward. The default value of Ps is 1.
CSI Ps `                          | HPA               | Moves cursor to the Ps-th column of the active line. The default value of Ps is 1.
CSI Ps a                          | HPR               | Moves cursor to the right Ps columns. The default value of Ps is 1.
CSI Ps c                          | DA                | Primary Device Attribute. The default value of Ps is 0.
                                  |                   | Ps = 0    Asks for the terminal`s architectural class and basic attributes.
                                  |                   | Response: Depends the Terminal ID setting.
                                  |                   |   VT100     ESC [ 1 ; 2 c
                                  |                   |   VT100J    ESC [ 5 ; 2 c
                                  |                   |   VT101     ESC [ 1 ; 0 c
                                  |                   |   VT102     ESC [ 6 c
                                  |                   |   VT102J    ESC [ 15 c
                                  |                   |   VT220J    ESC [ 62 ; 1 ; 2 ; 5 ; 6 ; 7 ; 8 c
                                  |                   |   VT282     ESC [ 62 ; 1 ; 2 ; 4 ; 5 ; 6 ; 7 ; 8 ; 10 ; 11 c
                                  |                   |   VT320     CSI 63 ; 1 ; 2 ; 6 ; 7 ; 8 c
                                  |                   |   VT382     CSI 63 ; 1 ; 2 ; 4 ; 5 ; 6 ; 7 ; 8 ; 10 ; 15 c
                                  |                   |   VT420     CSI 64 ; 1 ; 2 ; 7 ; 8 ; 9 ; 15 ; 18 ; 21 c
                                  |                   |   VT520     CSI 65 ; 1 ; 2 ; 7 ; 8 ; 9 ; 12 ; 18 ; 19 ; 21 ; 23 ; 24 ; 42 ; 44 ; 45 ; 46 c
                                  |                   |   VT525     CSI 65 ; 1 ; 2 ; 7 ; 9 ; 12 ; 18 ; 19 ; 21 ; 22 ; 23 ; 24 ; 42 ; 44 ; 45 ; 46 c
CSI Ps d                          | VPA               | Move to the corresponding vertical position (line Ps) of the current column. The default value of Ps is 1.
CSI Ps e                          | VPR               | Moves cursor down Ps lines in the same column. The default value of Ps is 1.
CSI Ps1 ; Ps2 f                   | HVP               | Moves cursor to the Ps1-th line and to the Ps2-th column. The default value of Ps1 and Ps2 is 1.
CSI Ps g                          | TBC               | Clears the tab stop. The default value of Ps is 0.
                                  |                   | Ps = 0      Clears the tab stop at the cursor.
                                  |                   |    = 3      Clears all tab stops.
CSI Pm h                          | SM                | Sets mode. (See Modes (Standard))
CSI Ps j                          | HPB               | Moves cursor to the left Ps columns. The default value of Ps is 1.
CSI Ps k                          | VPB               | Moves cursor up Ps lines in the same column. The default value of Ps is 1.
CSI Pm l                          | RM                | Resets mode. (See Modes (Standard))
CSI Pm m                          | SGR               | Select character attributes. The default value of Pm is 0. (See Character Attributes.)
CSI Ps n                          | DSR               | Reports device status.
                                  |                   | Ps = 5      Requests the terminal`s operation status report. Always returns "CSI 0 n" (Terminal ready).
                                  |                   |             Response: CSI s n
                                  |                   |             s = 0    Terminal ready.
                                  |                   |    = 6      Requests cursor position report.
                                  |                   |             Response: CSI r ; c R
                                  |                   |               r    Line number.
                                  |                   |               c    Column number.
CSI Ps1 ; Ps2 r                   | DECSTBM           | Sets top and bottom margin.
             (>)                  |                   | Ps1    Line number for the top margin.
                                  |                   |        The default value is 1.
                                  |                   | Ps2    Line number for the bottom margin.
                                  |                   |        The default value is current number of lines per screen.
CSI s                             | SCP               | Save cursor position. Same as DECSC.
CSI Ps1 ; Ps2 ; Ps3 t             | (DECSLPP)         | Window manipulation.
                                  |                   | Ps1 =  1    De-iconify window.
                                  |                   |     =  2    Minimize window.
                                  |                   |     =  3    Move window to [Ps2, Ps3].
                                  |                   |     =  4    Resize window to height Ps2 pixels and width Ps3 pixels.
                                  |                   |     =  5    Raise the window to the top of the stacking order.
                                  |                   |     =  6    Lower the window to the bottom of the stacking order.
                                  |                   |     =  7    Refresh window.
                                  |                   |     =  8    Resize window to Ps2 lines and Ps3 columns.
                                  |                   |     =  9    Change maximize state of window.
                                  |                   |             Ps2 = 0    Restore maximized window.
                                  |                   |                 = 1    Maximize window.
                                  |                   |     = 11    Reports window state.
                                  |                   |             Response: CSI s t
                                  |                   |               s = 1    Normal. (non-iconified)
                                  |                   |                 = 2    Iconified.
                                  |                   |     = 13    Reports window position.
                                  |                   |             Response: CSI 3 ; x ; y t
                                  |                   |               x    X position of window.
                                  |                   |               y    Y position of window.
                                  |                   |     = 14    Reports window size in pixels.
                                  |                   |             Response: CSI 4 ; y ; x t
                                  |                   |               y    Window height in pixels.
                                  |                   |               x    Window width in pixels.
                                  |                   |     = 18    Reports terminal size in characters.
                                  |                   |             Response: CSI 8 ; y ; x t
                                  |                   |               y    Terminal height in characters. (Lines)
                                  |                   |               x    Terminal width in characters. (Columns)
                                  |                   |     = 19    Reports root window size in characters.
                                  |                   |             Response: CSI 9 ; y ; x t
                                  |                   |               y    Root window height in characters.
                                  |                   |               x    Root window width in characters.
                                  |                   |     = 20    Reports icon label.
                                  |                   |             Response: OSC L title ST
                                  |                   |               title    icon label. (window title)
                                  |                   |     = 21    Reports window title.
                                  |                   |             Response: OSC l title ST
                                  |                   |               title    Window title.
CSI u                             | RCP               | Restore cursor position. Same as DECRC.
CSI = Ps c                        | DA3 (Tertiary DA) | Tertiary Device Attribute. The default value of Ps is 0.
                                  |                   | Ps = 0      Tertiary Device Attribute request.
                                  |                   |             Response: DCS ! | dddddddd ST
                                  |                   |               dddddddd  Terminal Unique ID
CSI > Ps c                        | DA2 (Secondary DA)| Secondary Device Attribute. The default value of Ps is 0.
                                  |                   | Ps = 0      Secondary Device Attribute request.
                                  |                   |         Response: CSI > 32 ; 100 ; 2 c
CSI ? Ps J                        | DECSED            | Selective erase in display. DECSED only erase characters defined as erasable by the DECSCA control function. The default value of Ps is 0.
                                  |                   | Ps = 0      Erase from cursor through the end of the display.
                                  |                   |    = 1      Erase from the beginning of the display through the cursor.
                                  |                   |    = 2      Erase the complete of display.
CSI ? Ps K                        | DECSEL            | Selective erase in line. DECSEL only erase characters defined as erasable by the DECSCA control function. The default value of Ps is 0.
                                  |                   | Ps = 0      Erase from the cursor through the end of the line.
                                  |                   |    = 1      Erase from the beginning of the line through the cursor.
                                  |                   |    = 2      Erase the complete of line.
CSI ? Pm h                        | DECSET            | Sets DEC/xterm specific mode. (See Modes (DEC/xterm specific).)
CSI ? Pm l                        | DECRST            | Resets DEC/xterm specific modes. (See Modes (DEC/xterm specific).)
CSI ? Ps n                        | DECDSR            | Reports device status.
                                  |                   | Ps = 55     Reports locator device status. Always returns "CSI ? 50 n" (Locator ready).
                                  |                   |             Response: CSI ? s n
                                  |                   |               s = 50    Locator ready.
CSI Ps SP q                       | DECSCUSR          | Sets cursor style. The default value of Ps is 0.
                                  |                   | Ps = 0,1    Block cursor / Blink
                                  |                   |    = 2      Block cursor / Steady
                                  |                   |    = 3      Underline cursor / Blink
                                  |                   |    = 4      Underline cursor / Steady
                                  |                   |    = 5      Vertical line cursor / Blink
                                  |                   |    = 6      Vertical line cursor / Steady
CSI ! p                           | DECSTR            | Soft reset
CSI Ps1 ; Ps2 " p                 | DECSCL            | Select terminal's conformance level.
                                  |                   | Ps1 = 61    VT-Level 1 (VT100 mode)
                                  |                   |     = 62    VT-Level 2 (VT200 mode)
                                  |                   |     = 63    VT-Level 3 (VT300 mode)
                                  |                   |     = 64    VT-Level 4 (VT400 mode)
                                  |                   |     = 65    VT-Level 5 (VT500 mode)
                                  |                   | 
                                  |                   | Ps2 = 0     8 bit mode (S8C1T)
                                  |                   |     = 1     7 bit mode (S7C1T)
                                  |                   |     = 2     8 bit mode (S8C1T)
CSI Ps " q                        | DECSCA            | Select character protection attribute. Selective erase control functions (DECSED, DECSEL and DECSERA) can only erase characters defined as erasable.
                                  |                   | Ps = 0      Not protected. DECSED, DECSEL and DECSERA can erase characters.
                                  |                   |    = 1      Protected. DECSED, DECSEL and DECSERA cannot erase characters.
                                  |                   |    = 2      Same as 0.
CSI Ps1 ; Ps2 ; Ps3 ; Ps4 $ z     | DECERA            | Erase rectangular area. The default value of Ps1 - Ps4 is current cursor position.
                                  |                   | Ps1   Top-line border.
                                  |                   | Ps2   Left-column border.
                                  |                   | Ps3   Bottom-line border.
                                  |                   | Ps4   Right-column border.
CSI Ps1 ; Ps2 ; Ps3 ; Ps4 $ {     | DECSERA           | Selective erase rectangular area. DECSERA only erase characters defined as erasable by the DECSCA control function. The default value of Ps1 - Ps4 is current cursor position.
                                  |                   | Ps1   Top-line border.
                                  |                   | Ps2   Left-column border.
                                  |                   | Ps3   Bottom-line border.
                                  |                   | Ps4   Right-column border.
CSI Ps1 ; Ps2 ' z                 | DECELR            | DEC locator reporting mode.
                                  |                   | Ps1 = 0     Disable locator report.
                                  |                   |     = 1     Enable locator report.
                                  |                   |     = 2     One shot (allow one report, then disable).
                                  |                   | Ps2 = 0     Character mode. Same as 2.
                                  |                   |     = 1     Pixel mode. Reporting unit is device physical pixels.
                                  |                   |     = 2     Character mode. Reporting unit is character cells.
CSI Pm ' {                        | DECSLE            | Select the locator event.
                                  |                   | Pm = 0      Disable button up/down events, Disable filter rectangle.
                                  |                   |    = 1      Enable button down event.
                                  |                   |    = 2      Disable button down event.
                                  |                   |    = 3      Enable button up event.
                                  |                   |    = 4      Disable button up event.
CSI ' |                           | DECRQLP           | Requests locator report.
                                  |                   | Response: CSI Pe ; Pb ; Pr ; Pc ; Pp & w
                                  |                   | Pe: Event code.
                                  |                   | Pe =  0    Received a locator report request (DECRQLP), but the locator is unavailable.
                                  |                   |    =  1    Received a locator report request (DECRQLP).
                                  |                   |    =  2    Left button down.
                                  |                   |    =  3    Left button up.
                                  |                   |    =  4    Middle button down.
                                  |                   |    =  5    Middle button up.
                                  |                   |    =  6    Right button down.
                                  |                   |    =  7    Right button up.
                                  |                   |    =  8    Button 4 down. (not supported)
                                  |                   |    =  9    Button 4 up. (not supported)
                                  |                   |    = 10    Locator outside filter rectangle.
                                  |                   | 
                                  |                   | Pb: Button code, ASCII decimal 0-15 indicating which buttons are down if any.
                                  |                   |     The state of the four buttons on the locator correspond to the low four
                                  |                   |     bits of the decimal value, "1" means button depressed.
                                  |                   |   1    Right button.
                                  |                   |   2    Middle button.
                                  |                   |   4    Left button.
                                  |                   |   8    Button 4. (not supported)
                                  |                   | 
                                  |                   | Pr: Row coordinate.
                                  |                   | 
                                  |                   | Pc: Column coordinate.
                                  |                   | 
                                  |                   | Pp: Page. Always 1.
CSI ? Ps r                        | XT_REST           | Restore DEC modes.
CSI ? Ps s                        | XT_SAVE           | Save DEC modes.
CSI Ps $ p                        | DECRQM            | Request ANSI mode state.
CSI ? Ps $ p                      | DECRQM            | Request DEC mode state.
CSI Ps SP ~                       | DECTME            | Select a terminal emulation mode.
CSI Ps * y                        | DECRQCRA          | Request Checksum of Rectangular Area.
CSI Ps y                          | DECTST            | Invoke Confidence Test.
CSI Ps $ w                        | DECRQPSR          | Request Presentation State Report.
CSI Ps x                          | DECREQTPARM       | Request Terminal Parameters.
CSI Ps SP @                       | SL                | Scroll Left.
CSI Ps SP A                       | SR                | Scroll Right.
CSI Ps b                          | REP               | Repeat the preceding graphic character.
CSI ? Ps W                        | DECST8C           | Set a tab stop at every eight columns starting with column 9.
CSI > Ps T                        | XT_TITLEMODE      | Select a title mode.


# Modes (Standard)

Mode No.  | Mnemonic  | Set (SM)                                                              | Reset (RM)
----------|-----------|-----------------------------------------------------------------------|-------------------------------------------------------------------------
2         | KAM       | Locks the keyboard.                                                   | Unlocks the keyboard.
4         | IRM       | Insert mode.                                                          | Replace mode.
12        | SRM       | Local echo off.                                                       | Local echo on.
20        | LNM       | New line mode.                                                        | Line feed mode.
          |           | - Cursor moves to the first column of the next line when the terminal | - Cursor moves to the current column on the next line when the terminal
          |           |   receives an LF, FF or VT character.                                 |   receives an LF, FF or VT character.
          |           | - New-line (Transmit) setting is changed to "CR+LF".                  | - New-line (Transmit) setting is changed to "CR".
33        | WYSTCURM  | Steady cursor.                                                        | Blinking cursor.
34        | WYULCURM  | Underline cursor.                                                     | Block cursor.


# Modes (DEC/xterm specific)

Mode No.  | Mnemonic  | Set (DECSET)                                                          | Reset (DECRST)
----------|-----------|-----------------------------------------------------------------------|-------------------------------------------------------------------------
1         | DECCKM    | Application cursor keys.                                              | Normal cursor keys.
2         | DECANM    | (ignored)                                                             | Enter VT52 mode.
3         | DECCOLM   | 132 column mode.                                                      | 80 column mode.
4         | DECSCLM   | Smooth scrolling mode.                                                | Jump scrolling mode.
5         | DECSCNM   | Reverse video mode.                                                   | Normal video mode.
6         | DECOM     | Enable origin mode.                                                   | Disable origin mode.
          |           | - The home cursor position is at the upper-left corner of ther        | - The home cursor position is at the upper-left corner of ther
          |           |   screen, with in the margins.                                        |   screen.
          |           | - The starting point for line numbers depends on the current top      | - The starting point for line numbers independent of the margins.
          |           |   margin setting.                                                     |
          |           | - The cursor cannot move outside of the margins.                      | - The cursor can move outside of the margins.
7         | DECAWM    | Enable autowrap mode.                                                 | Disable autowrap mode.
8         | DECARM    | Auto-repeat keys.                                                     | No auto-repeat keys.
9         | -         | Enable X10 mouse tracking. Send mouse X & Y on button press.          | Disable mouse tracking.
12        | -         | Blinking cursor.                                                      | Steady cursor.
25        | DECTCEM   | Show cursor.                                                          | Hide cursor.
30        | -         | Show scroll bar.                                                      | Hide scroll bar.
38        | DECTEK    | Switch to TEK window.                                                 | Do nothing.
47        | -         | Switch to alternate screen buffer.                                    | Switch to normal screen buffer.
66        | DECNKM    | Application keypad mode.                                              | Numeric keypad mode.
67        | DECBKM    | Backspace key sends BS.                                               | Backspace key sends DEL.
80        | DECSDM    | Sixel non-scrolling mode.                                             | Sixel scrolling mode.
100       | DECAAM    | Enable auto answer back mode.                                         | Disable auto answer back mode.
1000      | -         | Enable normal mouse tracking. Send mouse X & Y on button press and    | Disable mouse tracking.
          |           | release.                                                              |
1001      | -         | Enable highlight mouse tracking.                                      | Disable highlight mosue tracking.
1002      | -         | Enable button-event mouse tracking. Essentially same as normal mouse  | Disable mouse tracking.
          |           | tracking mode, but also reports button-motion event.                  |
1003      | -         | Enable any-event mouse tracking. Same as button-event mode, except    | Disable mouse tracking.
          |           | that all motion events are reported, even if no mouse button is down. |
1004      | -         | Enable focus reporting mode.                                          | Disable focus reporting mode.
1005      | -         | Enable xterm (UTF-8) style extended mouse reporting format.           | Disable extended mouse reporting format.
1006      | -         | Enable xterm (SGR) style extended mouse reporting format.             | Disable extended mouse reporting format.
1015      | -         | Enable rxvt-unicode style extended mouse reporting format.            | Disable extended mouse reporting format.
1047      | -         | Switch to alternate screen buffer.                                    | Clear screen, and switch to normal screen buffer.
1048      | -         | Save cursor position.                                                 | Restore cursor position.
1049      | -         | Save cursor position, switch to alternate screen buffer, and clear    | Clear screen, switch to normal screen buffer, and restore cursor
          |           | screen.                                                               | position.
2004      | -         | Enable Bracketed paste mode.                                          | Disable Bracketed paste mode.
7700      | -         | Enable ambiguous width reporting.                                     | Disable ambiguous mouse reporting.
8840      | TNAMB     | Treat ambiguous width characters as double-width.                     | Treat ambiguous width characters as double-width.


# Character Attributes. (SGR)

No.           | Attribute
--------------|---------------------------------------------------------
0             | Normal
1             | Bold
2             | Half bright
3             | Italic
4             | Underlined
5             | Slow blink
6             | Rapid blink
7             | Inverse
8             | Invisible
10            | Shift in
11            | Shift out
21            | Not bold
22            | Not halfblight 
23            | Not italic
24            | Not underlined
25            | Steady (not blinking)
27            | Positive (not inverse)
30            | Set foreground color to Black. (Color No. 0)
31            | Set foreground color to Red. (Color No. 1)
32            | Set foreground color to Green. (Color No. 2)
33            | Set foreground color to Yellow. (Color No. 3)
34            | Set foreground color to Blue. (Color No. 4)
35            | Set foreground color to Magenta. (Color No. 5)
36            | Set foreground color to Cyan. (Color No. 6)
37            | Set foreground color to White. (Color No. 7)
38 ; 5 ; Ps   | Set foreground color to color number Ps.
39            | Set foreground color to default.
40            | Set background color to Black. (Color No. 0)
41            | Set background color to Red. (Color No. 1)
42            | Set background color to Green. (Color No. 2)
43            | Set background color to Yellow. (Color No. 3)
44            | Set background color to Blue. (Color No. 4)
45            | Set background color to Magenta. (Color No. 5)
46            | Set background color to Cyan. (Color No. 6)
47            | Set background color to White. (Color No. 7)
48 ; 5 ; Ps   | Set background color to color number Ps.
49            | Set background color to Black.
90            | Set foreground color to Gray. (Color No. 8)
91            | Set foreground color to Bright Red. (Color No. 9)
92            | Set foreground color to Bright Green. (Color No. 10)
93            | Set foreground color to Bright Yellow. (Color No. 11)
94            | Set foreground color to Bright Blue. (Color No. 12)
95            | Set foreground color to Bright Magenta. (Color No. 13)
96            | Set foreground color to Bright Cyan. (Color No. 14)
97            | Set foreground color to Bright White. (Color No. 15)
100           | Set background color to Gray. (Color No. 8)
101           | Set background color to Bright Red. (Color No. 9)
102           | Set background color to Bright Green. (Color No. 10)
103           | Set background color to Bright Yellow. (Color No. 11)
104           | Set background color to Bright Blue. (Color No. 12)
105           | Set background color to Bright Magenta. (Color No. 13)
106           | Set background color to Bright Cyan. (Color No. 14)
107           | Set background color to Bright White. (Color No. 15)


# DCS Sequence

Sequence                                          | Mnemonic         | Description
--------------------------------------------------|------------------|------------------------------------------------------------------------------------------
DCS $ q Pt ST                                     | DECRQSS          | Request selection or setting.
                                                  |                  | Pt: the setting that the host asks about.
                                                  |                  | Pt = m    SGR
                                                  |                  |    = r    DECSTBM
                                                  |                  |    = "p   DECSCL
                                                  |                  |    = "q   DECSCA
                                                  |                  |    = SP q DECSCUSR
                                                  |                  | 
                                                  |                  | Response: DCS Ps $ r Pt ST
                                                  |                  | Ps = 0    Valid request.
                                                  |                  |           Pt indicates the current setting of a valid control function
                                                  |                  |           that the host asked about. 
                                                  |                  |           Pt consists of all the characters in the control function,
                                                  |                  |           except the CSI or ESC [ introducer characters.
                                                  |                  |    = 1    Invalid request. Does not send Pt.
DCS Pfn;Pcn;Pe;Pcmw;Pw;Pt;Pcmh;Pcss;Dscs{ ... ST  | DECDLD           | 
DCS Pm q ... ST                                   | Sixel            |
DCS + q ... ST                                    | Termcap Request  |
# OSC Sequence

Format

OSC Ps ; Pt ST
OSC Ps ; Pt BEL

Ps        | Description
------------------------------------------------------------------------------------------------------
0, 2      | Change window title to Pt.
4         | Change color.
          | Pt = c ; spec
          | Change color number c to the color specified by spec.
          | spec accepts following formats.
          | rgb:r/g/b
          | rgb:rr/gg/bb
          | rgb:rrr/ggg/bbb
          | rgb:rrrr/gggg/bbbb
          | #rgb
          | #rrggbb
          | #rrrgggbbb
          | #rrrrggggbbbb
9         | Display notification message (Growl is required in Mac OSX).
10        | Change VT Window's text foreground color to Pt. Format of Pt is same as OSC 4's spec.
11        | Change VT Window's text background color to Pt. Format of Pt is same as OSC 4's spec.
12        | Change cursor color to Pt. Format of Pt is same as OSC 4's spec.
52        | Clipboard access.
          | Pt = Pc ; Pd
          | Change the contents of clipboard Pc to Pd.
          | Pc: ignored.
          | Pd: new clipboard contents. encoded in base64.
          | If Pd is "?", terminal returns OSC 52
104       | Reset text color.
110       | Reset foreground color.
111       | Reset background color.
112       | Reset cursor color.


# SOS Sequence

Format

SOS Pt ST

tanasinn implements no SOS functions; Pt is ignored.


# PM Sequence

Format

PM Pt ST

tanasinn implements no PM functions; Pt is ignored.


# APC Sequence

Format

APC Pt ST

tanasinn implements no APC functions; Pt is ignored.

