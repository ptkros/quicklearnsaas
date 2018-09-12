#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <time.h>
#include <iostream>
#include <iomanip>
#include <memory>
#include <stdio.h>
#include <unistd.h>

#include <boost/program_options.hpp>
#include <boost/algorithm/string/case_conv.hpp>

#include "InputContainer.h"

int learn(unsigned int taskID, inputs::InputContainer inputs);

/*A quick fix for some non-centralized exit points: controls in where the following statement:

exit(EXIT_FAILURE);

is present are anticipated by this function, in order to keep alive our workers.
Some exit points from:

data/dataset.cc
data/io/svml.cc
utils/strutils.cc

are not fixed because they check for dynamic conditions, not for static ones.
*/
int validate_inputs(inputs::InputContainer inputs);
