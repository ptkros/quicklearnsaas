#!/usr/bin/env python

import os, glob
from distutils.core import setup
from distutils.extension import Extension
from distutils.sysconfig import get_config_vars

os.environ["CC"] = "g++-4.9"
os.environ["CXX"] = "g++-4.9"

#-Wstrict-prototypes option is read by distutils from /usr/lib/pythonX.Y/config/Makefile as part of OPT variable. This part overrides it
(opt,) = get_config_vars("OPT")
os.environ["OPT"] = " ".join(
    flag for flag in opt.split() if flag != "-Wstrict-prototypes"
)
 
setup(name="quicklearnsaas",
    ext_modules=[
        Extension("quicklearn_module", glob.glob("quickrank/src/*.cc") + glob.glob("quickrank/src/*/*.cc") + glob.glob("quickrank/src/*/*/*.cc"),
        include_dirs=["quickrank/include", "/usr/include/mysql++/", "/usr/include/mysql/", "/usr/include/python2.7/"],
        libraries = ["zmq", "mysqlpp", "mysqlclient", "boost_serialization", "boost_python", "boost_program_options", "boost_system", "boost_filesystem", "boost_thread"],
        extra_link_args = ["-fopenmp"],
        extra_compile_args = ["-std=c++11", "-Wall", "-pedantic", "-march=native", "-Ofast", "-fopenmp"])
    ])
