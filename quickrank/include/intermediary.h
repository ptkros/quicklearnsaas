#include <boost/python/module.hpp>
#include <boost/python/def.hpp>
#include <boost/python/extract.hpp>
#include <boost/python/dict.hpp>
#include <boost/python/str.hpp>
#include <iostream>

#include "quicklearn.h"
#include "DBConnector.h"
#include "zhelpers.hpp"

int intermediary(std::vector<inputs::InputContainer> inputTaskContainer);
