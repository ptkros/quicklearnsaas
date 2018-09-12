/*  =========================================================================
    zhelpers.h - ZeroMQ helpers for example applications
    Copyright (c) 1991-2010 iMatix Corporation and contributors
    This is free software; you can redistribute it and/or modify it under
    the terms of the Lesser GNU General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.
    This software is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    Lesser GNU General Public License for more details.
    You should have received a copy of the Lesser GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
    =========================================================================
*/

// Olivier Chamoux <olivier.chamoux@fr.thalesgroup.com>


#ifndef __ZHELPERS_HPP_INCLUDED__
#define __ZHELPERS_HPP_INCLUDED__

//  Include a bunch of headers that we will need in the examples

#include "zmq.hpp" // https://github.com/zeromq/cppzmq

#include <iostream>
#include <iomanip>
#include <string>
#include <sstream>

#include <time.h>
#include <assert.h>
#include <stdlib.h>        // random()  RAND_MAX
#include <stdio.h>
#include <stdarg.h>
#include <signal.h>

#include <sys/time.h>
#include <unistd.h>

//  Provide random number from 0..(num-1)
#define within(num) (int) ((float) (num) * random () / (RAND_MAX + 1.0))

//  Receive 0MQ string from socket and convert into string
static std::string s_recv (zmq::socket_t & socket) {
    zmq::message_t message;
    socket.recv(&message);

    return std::string(static_cast<char*>(message.data()), message.size());
}

//  Convert string to 0MQ string and send to socket
static bool s_send (zmq::socket_t & socket, const std::string & string) {
    zmq::message_t message(string.size());
    memcpy (message.data(), string.data(), string.size());

    bool rc = socket.send (message);
    return (rc);
}

//  Sends string as 0MQ string, as multipart non-terminal
static bool s_sendmore (zmq::socket_t & socket, const std::string & string) {
    zmq::message_t message(string.size());
    memcpy (message.data(), string.data(), string.size());

    bool rc = socket.send (message, ZMQ_SNDMORE);
    return (rc);
}

inline std::string s_set_id (zmq::socket_t & socket)
{
    std::stringstream ss;
    ss << std::hex << std::uppercase
       << std::setw(4) << std::setfill('0') << within (0x10000) << "-"
       << std::setw(4) << std::setfill('0') << within (0x10000);
    socket.setsockopt(ZMQ_IDENTITY, ss.str().c_str(), ss.str().length());
    return ss.str();
}

#endif
