### QuickRank core module

Existing files that are modified here:

    * quicklearn.cc
Since in this work this framework is used as an internal module rather than an independent subprocess, "main" function was replaced with "learn" function. This does not take many arguments as input parameters anymore; rather, this accepts an "InputContainer" arguments container and unpacks it for correctly assigning each requested parameter.
There is also a quick fix for some non-centralized exit points in the framework. They must be fixed in order to keep our workers alive. All the involved source files are listed in a comment in this source file.