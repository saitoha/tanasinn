#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is tanasinn
#
# The Initial Developer of the Original Code is
# Hayaki Saito.
# Portions created by the Initial Developer are Copyright (C) 2010 - 2011
# the Initial Developer. All Rights Reserved.
#
# ***** END LICENSE BLOCK *****

## @package ttydriver
#
# @brief Create and handle a pair of TTY device, and run a program on them.
#
# [ Module Overview ]
#
# This module is assumed to be called by tanasinn's "tty.js".
# First, tanasinn opens TCP channel and listen on 2 ports, [I/O channel] and
# [Control channel].
# Next, tanasinn should call this script, with 2 arguments that is represent
# above-mentioned 2 channel's port numbers.
# Then, A TeletypeDriver object is instanciate. it connect these channels and
# establish TCP connection, and finally forks new 4 processes as follows:
#
# 1. Application Process
#    This is user-specified application process, launched by command such as
#    the following.
# <pre>
#       /bin/sh -c 'exec <startcommand>'
# </pre>
#    <startcommand> is asked for tanasinn through the <Control channel>.
#
# 2. Writing Process
#    This process waits to receive data from tanasinn through <I/O channel>,
#    which is user's input key sequence in many cases.
#    As receiving data, the Process passes it to TTY master device as it is.
#
# 3. Reading Process
#    This process waits to receive data from TTY master device, which is output
#    sequence from application program in many cases.
#    As receiving data, the Process passes it to tanasinn through
#    [I/O channel].
#
# 4. Controlling Process
#    This process communicates with tanasinn through [Control channel] in
#    simple, lightweight, 7bit ascii-based protocol.
#
# <pre>
#    TTY Device pair            Python script                   tanasinn
#    Master / Slave          class TeletypeDriver                 tty.js
#  +-----------------+       +------------------+           +-----------------+
#  |                 |       |                  |           |                 |
#  | +-------------+ |       | +--------------+ |           | +-------------+ |
#  | |             |---------->| Writing Proc |<--- recv -----|             | |
#  | |             | | read  | +--------------+ |           | |             | |
#  | |             | |       |                  <I/O channel> | I/O Manager | |
#  | |             | |       | +--------------+ |           | |             | |
#  | |   Master    |<----------| Reading Proc |---- send ---->|             | |
#  | |             | | write | +--------------+ |           | +-------------+ |
#  | |             | |       |                  |           |                 |
#  | |             | |       | +--------------+ |           | +-------------+ |
#  | |             |<--------->| Control Proc |<- send/recv ->| Controller  | |
#  | +-------------+ | ioctl | +--------------+ |           | +-------------+ |
#  |        |        |       |                <Control channel>               |
#  | +-------------+ |       | +--------------+ |           +-----------------+
#  | |    Slave    |<--------->|   App Proc   | |
#  | +-------------+ | stdio | +--------------+ |
#  |                 |       |                  |
#  +-----------------+       +------------------+
#
#    figure-1. Communication among TTY device pair, TeletypeDrive, tanasinn.
# </pre>
#
# -*- About [Control channel]'s protocol -*-
#
#   [ Protocol Overview ]
#
#     1. This protocol is line-oriented. line terminator is '\n' (0x0a).
#
#     2. This protocol is command-based. 1 line should be interpreted as 1
#        command.
#        A command is composed of 1 or multiple tokens. delimiter character is
#        ' ' (0x20).
#
#     3. First token is <b>opecode</b>, represent a operation.
#        An opecode consists of lower-case alphabetic sets ([a-z]+).
#
#     4. Tokens after <b>opecode</b> represent arguments.
#        An arguments consists of multiple printable characters, that is
#        encoded in base64 Data Encodings, defined in RFC-3548.
# <pre>
#        example 1:
#          xoff\n
# </pre>
#          Opecode of this command is "xoff". "\n" is line terminator.
# <pre>
#        example 2:
#          resize ODA= MjQ=\n
# </pre>
#          In this case, opecode is "resize".
#          Arguments are "ODA=" and "MjQ=", these strings mean "80" and "24"
#          when decoded.
#
#   [ Protocol Details ]
#
#     Comming soon...
#

import os
import socket
import errno
import sys
import signal
import fcntl
import struct
import termios
import base64
import select
import pty

debug_flag = False

BUFFER_SIZE = 2048

if not hasattr(os, "uname"):
    sys.exit("If you are running Windows OS, use cygwin's python. ;-)")

system = os.uname()

if "CYGWIN" in system[0]:
    rcdir = os.path.join(os.getenv("USERPROFILE"), ".tanasinn")
else:
    rcdir = os.path.join(os.getenv("HOME"), ".tanasinn")
logdir = os.path.join(rcdir, "log")
if not os.path.exists(logdir):
    os.makedirs(logdir)
logfile = os.path.join(logdir, "tty.log")
log = open(logfile, "aw")
log.write("------\n")


def trace(message):
    if debug_flag:
        if system[0] == 'Darwin':
            os.system("say -v vict '%s'" % message)
        if system[0] == 'Linux':
            os.system("espeak '%s'" % message)
        if system[0] == 'CYGWIN_NT-6.0':
            os.system("SofTalk.exe /T:0 /W:%s" % message)
    try:
        log.write(message + "\n")
        log.flush()
    except:
        pass

trace("start.")


class TeletypeDriver:

    __ttyname = "unknown"
    __app_process_pid = 0

    master = None
    resume = False
    killed = False

    def __init__(self, pid, ttyname, master, io_socket, control_socket):
        self.__app_process_pid = pid
        self.__ttyname = ttyname
        self.master = master
        self.io_socket = io_socket
        self.control_socket = control_socket

    def call_sync(self, name):
        sock = self.control_socket
        sock.send("request %s\n" % base64.b64encode(name))
        reply = sock.recv(BUFFER_SIZE)
        result = base64.b64decode(reply.split("\n").pop(0).split(" ").pop())
        return result

    def fork_writing_process(self):
        pid = os.fork()
        if pid == 0:
            io_fd = self.io_socket.fileno()
            control_fd = self.control_socket.fileno()
            rfds = [io_fd]
            wfds = []
            xfds = [self.master, io_fd, control_fd]
            while True:
                rfd, wfd, xfd = select.select(rfds, wfds, xfds)
                if xfd:  # checking error.
                    break
                data = self.io_socket.recv(BUFFER_SIZE)
                if not data:
                    break
                os.write(self.master, data)
            os.close(self.master)
            self.io_socket.close()
            self.control_socket.close()
            trace("exit from writing process.")
            sys.exit(0)
        return pid

    def fork_reading_process(self):
        pid = os.fork()
        if pid == 0:
            io_socket = self.io_socket
            io_fd = io_socket.fileno()
            control_fd = self.control_socket.fileno()
            rfds = [self.master]
            wfds = []
            xfds = [self.master, io_fd, control_fd]
            while True:
                rfd, wfd, xfd = select.select(rfds, wfds, xfds)
                if xfd:  # checking error.
                    break
                data = os.read(self.master, BUFFER_SIZE)
                if not data:
                    break
                io_socket.send(data)
                #if len(data) < 1200:
                #time.sleep(0.01)
            os.close(self.master)
            io_socket.close()
            self.control_socket.close()
            trace("exit from reading process.")
            sys.exit(0)
        return pid

    def fork_control_process(self):

        # set initial size.
        self.resize([int(self.call_sync(key)) for key in ["column", "rows"]])

        pid = os.fork()
        if pid == 0:
            # receive control command and reply.
            io_fd = self.io_socket.fileno()
            control_fd = self.control_socket.fileno()
            rfds = [control_fd]
            wfds = []
            xfds = [self.master, io_fd, control_fd]
            while True:  # TTY -> mozilla
                rfd, wfd, xfd = select.select(rfds, wfds, xfds, 20)
                if xfd:  # checking error.
                    break
                if not rfd:  # checking error.
                    break
                data = self.control_socket.recv(BUFFER_SIZE)
                if data == "beacon\n":
                    continue
                if data == "detach\n":
                    break
                if not data:
                    break
                self.dispatch(data)
            os.close(self.master)
            self.io_socket.close()
            self.control_socket.close()
            trace("exit from control process.")
            sys.exit(0)
        return pid

    def request(self, argv):
        arg = argv.pop(0)  # shift
        if arg == "name":
            reply = base64.b64encode(self.__ttyname)
            message = "answer %s\n" % reply
            self.control_socket.send(message)
        elif arg == "pid":
            reply = base64.b64encode(str(self.__app_process_pid))
            message = "answer %s\n" % reply
            self.control_socket.send(message)

    def disconnect(self, argv):
        os.close(self.master)
        self.io_socket.close()
        self.control_socket.close()
        trace("exit from control process.")
        sys.exit(0)

    def kill(self, argv):
        os.kill(self.__app_process_pid, signal.SIGKILL)
        self.killed = True
        trace("exit from control process.")
        sys.exit(0)

    def isalive(self):
        """Check whether pid exists in the current process table."""
        if self.killed:
            return False
        #if not os.isatty(self.master):
        #    return False
        try:
            trace(self.__app_process_pid)
            os.kill(self.__app_process_pid, 0)
        except OSError, e:
            return e.errno != errno.ESRCH
        else:
            return True

    def resize(self, argv):

        width, height = [int(arg) for arg in argv]

        # NOW, we send TIOCSWINSZ IOCTL for
        # the TTY master device with winsize structure,
        # which is defined in "sys/ioctl.h" as follows:
        #
        # struct winsize {
        #     unsigned short ws_row;
        #     unsigned short ws_col;
        #     unsigned short ws_xpixel; // don't use
        #     unsigned short ws_ypixel; // don't use
        # };
        winsize = struct.pack('HHHH', height, width, 0, 0)
        fcntl.ioctl(self.master, termios.TIOCSWINSZ, winsize)
        # notify Application process that terminal size has been changed.
        os.kill(self.__app_process_pid, signal.SIGWINCH)
        #trace("Resized: " + str(width) + " " + str(height))
        width, height = [int(arg) for arg in argv]

    def xoff(self, argv):
        #fcntl.ioctl(self.master, termios.TIOCSTOP, 0)
        termios.tcflow(self.master, termios.TCOOFF)

    def xon(self, argv):
        #fcntl.ioctl(self.master, termios.TIOCSTART, 0)
        termios.tcflow(self.master, termios.TCOON)

    def dispatch(self, data):
        lines = data.split("\n")
        lines.pop()
        for line in lines:
            argv = line.split(" ")
            operation = argv.pop(0)  # shift
            # dispatch commands.
            if hasattr(self, operation):
                action = getattr(self, operation)
                action([base64.b64decode(arg) for arg in argv])
            else:
                self.control_socket.send("? %s\n" % operation)

    def drive_tty(self):

        # Fork reading process.
        reading_process_pid = self.fork_reading_process()

        # Fork writing process.
        writing_process_pid = self.fork_writing_process()

        # listen control commands, and dispatch them.
        control_process_pid = self.fork_control_process()

        # close fds in main process.
        #os.close(self.master)
        self.io_socket.close()
        self.control_socket.close()

        while True:
            pid, status = os.wait()
            if pid == control_process_pid:
                break
            if pid == self.__app_process_pid:
                try:
                    os.kill(control_process_pid, signal.SIGKILL)
                except:
                    pass
                break

        #os.waitpid(control_process_pid, 0)
        #try:
        #    os.kill(control_process_pid, signal.SIGKILL)
        #except:
        #    pass
        try:
            os.kill(writing_process_pid, signal.SIGKILL)
        except:
            pass
        try:
            os.kill(reading_process_pid, signal.SIGKILL)
        except:
            pass


def add_record(sessiondb_path, request_id, command,
               control_port, pid, ttyname):
    lockfile = open(sys.argv[0], "r")
    try:
        fcntl.flock(lockfile.fileno(), fcntl.LOCK_EX)
        f = open(sessiondb_path, "a")
        try:
            command = base64.b64encode(command)
            row = request_id, command, control_port, pid, ttyname
            f.write("%s,%s,%s,%s,%s\n" % row)
            f.flush()
        finally:
            f.close()
    finally:
        lockfile.close()


def del_record(sessiondb_path, request_id):
    lockfile = open(sys.argv[0], "r")
    try:
        fcntl.flock(lockfile.fileno(), fcntl.LOCK_EX)

        f = open(sessiondb_path, "r")
        lines = []
        try:
            for line in f:
                if line.split(",")[0] != request_id:
                    lines.append(line)
        finally:
            f.close()

        f = open(sessiondb_path, "w")
        try:
            for line in lines:
                f.write(line)

            f.flush()
        finally:
            f.close()

    finally:
        lockfile.close()

if __name__ == "__main__":
    if len(sys.argv) < 1:
        sys.exit("usage %s [connection_channel_port]" % sys.argv[0])

    connection_port = int(sys.argv[1])

    #socket.setdefaulttimeout(1)
    control_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    control_socket.bind(("127.0.0.1", 0))
    control_socket.listen(1)
    addr, control_port = control_socket.getsockname()

    connection_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    connection_socket.connect(("127.0.0.1", connection_port))

    startup_info = connection_socket.recv(BUFFER_SIZE).split(" ")
    command, term, lang = [base64.b64decode(value) for value in startup_info]

    ## fork slave's process, and get tty name.
    ttyname_max_length = 20  # 1024
    pid, master = pty.fork()
    if not pid:
        os.environ["TERM"] = term
        os.environ["LANG"] = lang
        paths = os.environ["PATH"].split(":")
        if not "/usr/local/bin" in paths:
            os.environ["PATH"] = "/usr/local/bin:" + os.environ["PATH"]
        os.environ[""] = lang
        os.environ["__TANASINN"] = term
        os.execlp("/bin/sh", "/bin/sh", "-c", "cd $HOME && exec %s" % command)
    ttyname = "unknown ttyname"  # os.read(master, ttyname_max_length).rstrip()
    ttyname = ""
    try:
        ttyname = os.ttyname(pid)
    except:
        pass

    iflag, oflag, cflag, lflag, ispeed, ospeed, cc = termios.tcgetattr(master)

    # get par
    if not cflag & termios.PARENB:
        par = 1
    elif cflag & termios.PARODD:
        par = 4
    else:
        par = 5

    # get nbits
    if not cflag & termios.ISTRIP:
        nbits = 1
    else:
        nbits = 2

    # get xspeed, rspeed
    speed_map = {50: 0,
                 75: 8,
                 110: 16,
                 134.5: 24,
                 150: 32,
                 200: 40,
                 300: 48,
                 600: 56,
                 1200: 64,
                 1800: 72,
                 2000: 80,
                 2400: 88,
                 3600: 96,
                 4800: 104,
                 9600: 112,
                 19200: 120}

    try:
        xspeed = speed_map[ospeed]
    except:
        xspeed = 112

    try:
        rspeed = speed_map[ispeed]
    except:
        rspeed = 112

    # make termattr string
    termattr = "%d;%d;%d;%d;1;0x" % (par, nbits, xspeed, rspeed)

    # send control channel's port, pid, ttyname
    message = "%s:%s:%s:%s" % (control_port, pid, ttyname, termattr)
    connection_socket.send(message)
    connection_socket.close()

    # establish <Control channel> socket connection.
    control_connection, addr = control_socket.accept()
    reply = control_connection.recv(BUFFER_SIZE)
    io_port_str, request_id, sessiondb_path = reply.split(" ")
    io_port = int(io_port_str)
    sessiondb_path = base64.b64decode(sessiondb_path)

    persist_file = None
    try:
        while True:
            # establish <I/O channel> socket connection.
            io_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            io_socket.connect(("127.0.0.1", io_port))
            driver = TeletypeDriver(pid,
                                    ttyname,
                                    master,
                                    io_socket,
                                    control_connection)
            if persist_file:
                size = os.stat(persist_file).st_size
                pos = size - BUFFER_SIZE * 2
                persist = open(persist_file)
                if pos > 0:
                    os.seek(pos)
                buf = persist.read()
                try:
                    while True:
                        buf = persist.read()
                        if not buf:
                            break
                        io_socket.send(buf)
                finally:
                    persist.close()
                    os.remove(persist_file)
                    persist_file = None

            driver.drive_tty()

            if not driver.isalive():
                trace("closed.")
                break
            else:
                add_record(sessiondb_path, request_id, command,
                           control_port, pid, ttyname)
                trace("suspended.")

                # re-establish <Control channel> socket connection.

                wait_pid = os.fork()
                persist_file = os.path.join(logdir, request_id)
                if wait_pid == 0:
                    persist = open(persist_file, "w")
                    try:
                        while True:
                            buf = os.read(master, BUFFER_SIZE)
                            persist.write(buf)
                    finally:
                        persist.flush()
                        persist.close()
                try:
                    control_connection, addr = control_socket.accept()
                    #trace("resume.")
                    reply = control_connection.recv(BUFFER_SIZE)
                    io_port_str, request_id, sessiondb_path = reply.split(" ")
                    io_port = int(io_port_str)
                    sessiondb_path = base64.b64decode(sessiondb_path)
                finally:
                    os.kill(wait_pid, signal.SIGKILL)

                del_record(sessiondb_path, request_id)

    except socket.error:
        trace("A socket error occured.")
    except:
        trace("An error occured")
    finally:
        os.close(master)
