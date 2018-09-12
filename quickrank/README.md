### QuickRank core module

In the following sections we describe our changes to the original source code, where and whether we did them, in order to adapt this framework to our new features.

Firstly, we removed the original Makefile. Since we want to deploy this framework as a Python module with setuptools utility, we replaced it with a "setup.py" file.
In addition to the original dependencies, new others were added:

Includes:
* I/usr/include/mysql++/
* I/usr/include/python2.7/

Libraries:
* lzmq = for ZeroMQ queuing support;
* lmysqlpp, lmysqlclient = for interacting with MySQL DB by using MySQL++ wrapper;
* lboost_python = for realizing a wrapping between Python code and C++ code;
* lboost_serialization = for serializing and deserializing the complex data stucture to send to a worker of 0MQ.

Detailed changes of modified source files w.r.t the original repository can be found in the relative sub-directories.
Here, we report just a list of added and modified files:

ADDED FILES:

1. include
    * ConnectionPool.h = useful for pooling DB connections;
    * DBConnector.h = see DBConnector.cc;
    * InputContainer.h = defines a container of inputs that we expect to receive by the RESTful service's request for a single task;
    * intermediary.h = see intermediary.cc;
    * zhelpers.hpp = defines our protocol for communications between master and workers nodes in ZMQ;
    * zmq.hpp = provides low level functions for ZMQ.
    * quicklearn.h = exposes our edited functions from quicklearn.cc
2. src
    * DBConnector.cc = it is specialized in communications between our application components and MySQL DB;
    * intermediary.cc = this provides an intermediary module between Python modules and QuickRank. It wraps requests from Python, organizes it in tasks, and launches multiple instances of QuickRank framework.

EDITED FILES:

1. include
    * learning/ltr_algorithm.h
    * learning/custom/custom_ltr.h
    * learning/forests/mart.h
    * learning/linear/coordinate_ascent.h
    * metric/evaluator.h
    * scoring/opt/converter.h
2. src
    * quicklearn.cc
    * learning/custom/custom_ltr.cc
    * learning/forests/mart.cc
    * learning/linear/coordinate_ascent.cc
    * metric/evaluator.cc
    * scoring/opt/converter.cc