### QuickRank core module

Existing files that are modified here:

    * evaluator.cc
A new parameter has been added for "training_phase" and "testing_phase" functions: unsigned int taskID. This is useful for storing final scores into DB, by calling the DBConnector component. This call is implemented into the second function, at the end of the whole computation, while in the first function the new received value is passed as parameter to learn function.