### QuickRank core module

Existing files that are modified here:

    * opt/converter.cc
Added functions to convert an input XML model to Java, C++, Python2 and Python3 source codes. These functions are the following:

For C++:

1. void print_header_cpp(std::ofstream &os)
2. void print_tree_eval_cpp(std::ofstream &os, const boost::property_tree::ptree& node)
3. void print_tree_function_cpp(const boost::property_tree::ptree& node, uint32_t fun_id, std::ofstream &os)
4. void print_main_cpp(std::ofstream &os, uint32_t num_trees, float learning_rate)

For Java:

1. void print_imports_java(std::ofstream &os)
2. void print_tree_eval_java(std::ofstream &os, const boost::property_tree::ptree& node)
3. void print_tree_function_java(const boost::property_tree::ptree& node, uint32_t fun_id, std::ofstream &os)
4. void print_main_java(std::ofstream &os, uint32_t num_trees, float learning_rate)

For Python:

1. void print_imports_python(std::ofstream &os)
2. void print_tree_eval_python(std::ofstream &os, const boost::property_tree::ptree& node, int indentations)
3. void print_tree_function_python(const boost::property_tree::ptree& node, uint32_t fun_id, std::ofstream &os)
4. void print_main_python2(std::ofstream &os, uint32_t num_trees, float learning_rate)
5. void print_main_python3(std::ofstream &os, uint32_t num_trees, float learning_rate)

General:

1. void generate_if_then_else_code_forest(const std::string& language, const std::string& ensemble_file, const std::string& ensemble_path)
2. void generate_if_then_else_code_linear(const std::string& language, const std::string& ensemble_file, const std::string& ensemble_path)
3. void translate_model(const std::string &language, const std::string &ensemble_file)