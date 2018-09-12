### QuickRank core module

Existing files that are modified here:

    * custom/custom_ltr.cc
Added "unsigned int taskID" as input parameter of "learn" function, in such a way that it respects this new signature that is defined in learning/ltr_algorithm.h

    * forests/mart.cc, linear/coordinate_ascent.cc
Same as custom/custom_ltr.cc; plus, in the body of learn function, a writing of training and validation scores into a DB was added. This new integer parameter, taskID, is passed to DBConnector module in order to keep track of the task to update.