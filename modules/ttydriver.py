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
#    This process wait to receive data from tanasinn through <I/O channel>,
#    which is user's input key sequence in many cases. 
#    As receiving data, the Process passes it to TTY master device as it is.
#
# 3. Reading Process
#    This process wait to receive data from TTY master device, which is output 
#    sequence from application program in many cases.
#    As receiving data, the Process passes it to tanasinn through [I/O channel].
#
# 4. Controlling Process
#    This process comminucate with tanasinn through [Control channel] in 
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
import re
import fcntl
import struct
import termios
import time
import base64
import select
import pty

BUFFER_SIZE = 1024

if not hasattr(os, "uname"):
    sys.exit("If you are running Windows OS, use cygwin's python. ;-)")

system = os.uname()

def trace(message):
    #if system[0] == 'Darwin':
    #    os.system("say -v vict '%s'" % message)
    #if system[0] == 'Linux':
    #    os.system("espeak '%s'" % message)
    os.system("echo '%s' >> ~/.tanasinn/log/tty.log &" % message);

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
                #rfd, wfd, xfd = select.select(rfds, wfds, xfds)
                #if xfd: # checking error.
                #    break
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
            io_fd = self.io_socket.fileno()
            control_fd = self.control_socket.fileno()
            rfds = [self.master]
            wfds = []
            xfds = [self.master, io_fd, control_fd]
            while True:
                #rfd, wfd, xfd = select.select(rfds, wfds, xfds)
                #if xfd: # checking error.
                #    break    
                data = os.read(self.master, BUFFER_SIZE)
                if not data:
                    break
                self.io_socket.send(data)
                #if len(data) < 1200:
                #time.sleep(0.001)
            os.close(self.master)
            self.io_socket.close()
            self.control_socket.close()
            trace("exit from reading process.")
            sys.exit(0)
        return pid
   
    def fork_control_process(self):

        # set initial size.
        self.resize([ int(self.call_sync(key)) for key in ["column", "rows"] ])

        pid = os.fork()
        if pid == 0:
            # receive control command and reply.
            io_fd = self.io_socket.fileno()
            control_fd = self.control_socket.fileno()
            rfds = [control_fd]
            wfds = []
            xfds = [self.master, io_fd, control_fd]
            while True: # TTY -> mozilla
                #rfd, wfd, xfd = select.select(rfds, wfds, xfds, 10)
                #if xfd: # checking error.
                #    break    
                #if not rfd: # checking error.
                #    break    
                data = self.control_socket.recv(BUFFER_SIZE)
                if data == "beacon\n":
                    continue
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
        arg = argv.pop(0) # shift
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
            os.kill(self.__app_process_pid, 0)
        except:# OSError, e:
            return False #e.errno == errno.EPERM
        else:
            return True

    def resize(self, argv):

        width, height = [ int(arg) for arg in argv ]

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
        width, height = [ int(arg) for arg in argv ]

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
            operation = argv.pop(0) # shift
            # dispatch commands.
            if hasattr(self, operation):
                action = getattr(self, operation)
                action([ base64.b64decode(arg) for arg in argv ])
            else:
                self.control_socket.send("? " + operation + "\n")
    
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
                break;
            if pid == self.__app_process_pid:
                try:
                    os.kill(control_process_pid, signal.SIGKILL)
                except:
                    pass
                break;

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
        #trace("complete.")
#
#    
#def create_a_pair_of_tty_device():
#    """ Creates a tty device and modify its termios properties. """
#    master, slave = os.openpty()
#
#    backup_termios = termios.tcgetattr(master)
#    new_termios = termios.tcgetattr(master)
#
#    # clear size bits, parity checking off.
#    new_termios[3] &= ~(termios.CSIZE|termios.PARENB)
#
#    # receive 8bit size sequence.
#    new_termios[3] |= termios.CS8
#
#    # enable XON/XOFF flow control on output.
#    new_termios[0] |= termios.IXON
#    # enable XON/XOFF flow control on input.
#    new_termios[0] |= termios.IXOFF
#
#    new_termios[6][termios.VINTR] = 0x03
#    #new_termios[6][termios.VEOF] = 2
#
#    try:
#        termios.tcsetattr(master, termios.TCSANOW, new_termios)
#    except:
#        termios.tcsetattr(master, termios.TCSANOW, old_termios)
#
#    return master, slave
#
#    
#def fork_app_process(master, slave, command, term):
#
#    # get TTY name from slave file descripter.
#    ttyname = os.ttyname(slave)
#
#    pid = os.fork()
#    if not pid:
#        # slave side operations.
#        # make this process session leader.
#        sid = os.setsid()
#
#        #fcntl.ioctl(master, termios.TIOCSCTTY, 1)
#        # master handle is to be closed in slave's process branch.
#        #os.close(master)
#        os.chdir("/")
#        os.umask(0)
#        # replace standard I/O with slave file descripter.
#        os.dup2(slave, sys.stdin.fileno())
#        os.dup2(slave, sys.stdout.fileno())
#        os.dup2(slave, sys.stderr.fileno())
#        os.close(slave)
#        # set TERM environment.
#        os.environ["TERM"] = "xterm"
#        #os.environ["CYGWIN"] = "tty"
#        shell = os.environ["SHELL"] 
#        # execute specified command.
#        #command = "showkey -a"
#        #if sid == None:
#        #    os.system("echo 'tanasinn: os.setsid failed.'")
#        #fcntl.ioctl(master, termios.TIOCSCTTY, 1)
#        os.execlp("/bin/bash", "/bin/bash", "-c", "cd $HOME && exec %s" % command)
#
#    # slave handle is to be closed in master's process.
#    #os.close(slave)
#    return pid, ttyname

def add_record(request_id, command, control_port, pid, ttyname):
    lockfile = open(sys.argv[0], "r")
    try:
        fcntl.flock(lockfile.fileno(), fcntl.LOCK_EX)
        f = open(sessiondb_path, "a")
        try:
            f.write("%s,%s,%s,%s,%s\n" 
                    % (request_id, base64.b64encode(command), control_port, pid, ttyname));
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

    startup_info = connection_socket.recv(BUFFER_SIZE).split(" ");
    command, term = [ base64.b64decode(value) for value in startup_info]
    
    ## modify termios properties, and enables master's output flow control ON. 
    #master, slave = create_a_pair_of_tty_device();

    ## fork slave's process, and get tty name.
    #pid, ttyname = fork_app_process(master, slave, command, term)    
    ttyname_max_length = 20 #1024
    pid, master = pty.fork()
    if not pid:
        sys.stdout.write("%%-%ds" % ttyname_max_length % os.ttyname(0))
        sys.stdout.flush()
        sys.stdout.write("\x1bc")
        sys.stdout.flush()
        os.environ["TERM"] = term 
        os.environ["__TANASINN"] = term 
        os.execlp("/bin/sh", "/bin/sh", "-c", "cd $HOME && exec %s" % command)
    ttyname = os.read(master, ttyname_max_length).rstrip()

    # send control channel's port, pid, ttyname
    connection_socket.send("%s:%s:%s" % (control_port, pid, ttyname))
    connection_socket.close();

    # establish <Control channel> socket connection. 
    control_connection, addr = control_socket.accept()
    io_port_str, request_id, sessiondb_path = control_connection.recv(BUFFER_SIZE).split(" ")
    io_port = int(io_port_str)
    sessiondb_path = base64.b64decode(sessiondb_path)

    try:
        while True:
            # establish <I/O channel> socket connection. 
            io_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            #io_socket.setsockopt(socket.SOL_TCP, socket.TCP_NODELAY, 1)
            io_socket.connect(("127.0.0.1", io_port))

            driver = TeletypeDriver(
                pid, 
                ttyname, 
                master, 
                io_socket, 
                control_connection)
            driver.drive_tty()
            #os.kill(pid, signal.SIGWINCH)
            
            #if not os.isatty(slave):
            #    trace("closed.")
            #    break
            time.sleep(1)
            if not driver.isalive():
                trace("closed.")
                break
            else:
                #os.write(master, "\x1a")

                add_record(request_id, command, control_port, pid, ttyname)
#                os.system("echo '%s,%s,%s,%s,%s' >> ~/.tanasinn/sessions.txt" 
#                    % (request_id, base64.b64encode(command), control_port, pid, ttyname));
                trace("suspended.")

                # re-establish <Control channel> socket connection. 
                control_connection, addr = control_socket.accept()
                trace("resume.")
                io_port_str, request_id, sessiondb_path = control_connection.recv(BUFFER_SIZE).split(" ")
                io_port = int(io_port_str)
                sessiondb_path = base64.b64decode(sessiondb_path)

                os.system("test -e ~/.tanasinn/sessions.txt && sed -i -e '/^%s,/d' ~/.tanasinn/sessions.txt" % request_id)

    except socket.error, e:
        trace("A socket error occured.")
    except e:
        trace(str(e))
    finally:
        os.close(master)
        #os.close(slave)

