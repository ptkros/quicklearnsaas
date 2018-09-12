/*
 * QuickRank - A C++ suite of Learning to Rank algorithms
 * Webpage: http://quickrank.isti.cnr.it/
 * Contact: quickrank@isti.cnr.it
 *
 * Unless explicitly acquired and licensed from Licensor under another
 * license, the contents of this file are subject to the Reciprocal Public
 * License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
 * and You may not copy or use this file in either source code or executable
 * form, except in compliance with the terms and conditions of the RPL.
 *
 * All software distributed under the RPL is provided strictly on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
 * LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
 * LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
 * language governing rights and limitations under the RPL.
 *
 * Contributor:
 *   HPC. Laboratory - ISTI - CNR - http://hpc.isti.cnr.it/
 */
#include <string.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <queue>

#include <boost/algorithm/string.hpp>
#include <boost/tokenizer.hpp>
#include <boost/program_options.hpp>
#include <boost/property_tree/xml_parser.hpp>
#include <boost/property_tree/detail/ptree_utils.hpp>

#include "learning/linear/coordinate_ascent.h"

#include "scoring/opt/converter.h"

namespace quickrank {
namespace scoring {

std::string trim(const boost::property_tree::ptree& node, const std::string& label)
{
	std::string res = node.get_child(label).data();
	boost::algorithm::trim(res);
	return res;
}

bool is_leaf(const boost::property_tree::ptree& node)
{
	return node.find("output") != node.not_found();
}

uint32_t find_depth(const boost::property_tree::ptree& split)
{
	uint32_t ld = 0, rd = 0;
	for (auto node: split) {
		if (node.first == "output")
			return 1;
		else if (node.first == "split") {
			std::string pos = node.second.get<std::string>("<xmlattr>.pos");
			if (pos == "left") {
				ld = 1 + find_depth(node.second);
			} else {
				rd = 1 + find_depth(node.second);
			}
		}
	}
	return std::max(ld,rd);
}

struct tree_node {
	boost::property_tree::ptree pnode;
    uint32_t id, pid;
    bool left;

    std::string feature, theta, leaf;

    tree_node(const boost::property_tree::ptree& pnode, uint32_t id, uint32_t pid, bool left, const std::string& parent_f = "")
    	: pnode(pnode)
    	, id(id)
    	, pid (pid)
    	, left(left)
    {
    	if (is_leaf(pnode)) {
    		this->feature = parent_f;
    		this->theta = "";
    		this->leaf = trim(pnode, "output");
    	} else {
    		this->feature = trim(pnode, "feature");
    		this->theta = trim(pnode, "threshold");
    		this->leaf = "";
    	}
    }
};

void generate_opt_trees_input(const std::string& ensemble_file, const std::string& /*output_file*/)
{
	// parse XML
	boost::property_tree::ptree xml_tree;
	std::ifstream is;
	is.open(ensemble_file, std::ifstream::in);
	boost::property_tree::read_xml(is, xml_tree);
	is.close();

	double learning_rate = xml_tree.get_child("ranker.info").get<double>("shrinkage");
	uint32_t num_trees = xml_tree.get_child("ranker.ensemble").count("tree");

	std::cout << num_trees << std::endl; // print number of trees in the ensemble

    // for each tree
	for (const auto& tree_it: xml_tree.get_child("ranker.ensemble")) {

		uint32_t depth = find_depth(tree_it.second.get_child("split")) - 1;
		std::cout << (depth) << std::endl; // print the tree depth

		uint32_t tree_size = std::pow(2, depth) - 1;
		auto split_node = tree_it.second.get_child("split");

		uint32_t local_id = 0;

		std::queue<tree_node> node_queue;

		// breadth first visit
		// TODO: Remove object copies with references
		for (node_queue.push(tree_node(split_node, local_id++, -1, false)); !node_queue.empty(); node_queue.pop()) {
			auto node = node_queue.front();
			if (is_leaf(node.pnode)) {
				if (node.id >= tree_size) {
					std::cout << "leaf"
						  << " " << node.id
						  << " " << node.pid
						  << " " << node.left
						  << " " << (learning_rate * std::stod(node.leaf)) << std::endl;
				} else {
					std::cout << "node"
					    	  << " " << node.id
						  << " " << node.pid
						  << " " << (std::stoi(node.feature) - 1)
						  << " " << node.left
						  << " " << (learning_rate * std::stod(node.leaf)) << std::endl;
				}
			} else {
				if (node.id == 0) {
					std::cout << "root"
							  << " " << node.id
							  << " " << (std::stoi(node.feature) - 1)
							  << " " << node.theta << std::endl; // print the root info
				} else {
					std::cout << "node"
					    	  << " " << node.id
							  << " " << node.pid
							  << " " << (std::stoi(node.feature) - 1)
							  << " " << node.left
							  << " " << node.theta << std::endl;
				}
				for (const auto& split_it: node.pnode) {
					if (split_it.first == "split") {
						std::string pos = split_it.second.get<std::string>("<xmlattr>.pos");
						node_queue.push(tree_node(split_it.second, local_id++, node.id, (pos == "left"), node.feature));
					}
				}
			}
		}

		std:: cout << "end" << std::endl;
	}
}

//generate source files

/*+---------------------+
* |    C++ functions    |
* +---------------------+*/
void print_header_cpp(std::ofstream &os)
{
	os << "#include <stdio.h>" << std::endl;
	os << "#include <stdlib.h>" << std::endl;
	os << "#include <sys/time.h>" << std::endl;
	os << "#include <time.h>" << std::endl;
	os << std::endl;
	os << "#include <iostream>" << std::endl;
	os << "#include <iomanip>" << std::endl;
	os << "#include <limits>" << std::endl;
	os << "#include <chrono>" << std::endl;
}

void print_tree_eval_cpp(std::ofstream &os, const boost::property_tree::ptree& node)
{
	if (is_leaf(node)) {
			os << "return " << trim(node, "output") << ";" << std::endl;
		} else {
			std::string feature = trim(node, "feature");
			std::string threshold = trim(node, "threshold");

			boost::property_tree::ptree left_node, right_node;

			for (const auto& split_it: node) {
				if (split_it.first == "split") {
					std::string pos = split_it.second.get<std::string>("<xmlattr>.pos");
					if (pos == "left")
						left_node = split_it.second;
					if (pos == "right")
						right_node = split_it.second;
				}
			}

			os << "if (features[" <<  (std::stoi(feature) - 1) << "] <= " << threshold << "f) {" << std::endl;
			print_tree_eval_cpp(os, left_node);
			os << "} else {" << std::endl;
			print_tree_eval_cpp(os, right_node);
			os << "}" << std::endl;
		}
}

void print_tree_function_cpp(const boost::property_tree::ptree& node, uint32_t fun_id, std::ofstream &os)
{
	os << "double tree_eval_" << fun_id << "(float *features) {" << std::endl;
	print_tree_eval_cpp(os, node);
	os << "}" << std::endl;
}

/*+---------------------+
* |     Main for C++    |
* +---------------------+*/
void print_main_cpp(std::ofstream &os, uint32_t num_trees, float learning_rate)
{
    os << "int main(int argc, const char *args[]) {" << std::endl;
    os << "  if(argc < 2) {" << std::endl;
    os << "    return -1;" << std::endl;
    os << "  }" << std::endl;
    os << "  char* featureFile = args[1];" << std::endl;
    os << "  FILE *fp = fopen(featureFile, \"r\");" << std::endl;
    os << "  int numberOfInstances;" << std::endl;
    os << "  int numberOfFeatures;" << std::endl;
    os << "  fscanf(fp, \"%d %d\", &numberOfInstances, &numberOfFeatures);" << std::endl;
    os << "  float** features = (float**) malloc(numberOfInstances * sizeof(float*));" << std::endl;
    os << "  int i = 0;" << std::endl;
    os << "  for (i = 0; i < numberOfInstances; i++) {" << std::endl;
    os << "    features[i] = (float*) malloc(numberOfFeatures * sizeof(float));" << std::endl;
    os << "  }" << std::endl;
    os << "  float fvalue;" << std::endl;
    os << "  int fIndex = 0, iIndex = 0;" << std::endl;
    os << "  char text[20];" << std::endl;
    os << "  int ignore;" << std::endl;
    os << "  for (iIndex = 0; iIndex < numberOfInstances; iIndex++) {" << std::endl;
    os << "    fscanf(fp, \"%d %[^:]:%d\", &ignore, text, &ignore);" << std::endl;
    os << "    for (fIndex = 0; fIndex < numberOfFeatures; fIndex++) {" << std::endl;
    os << "      fscanf(fp, \"%[^:]:%f\", text, &fvalue);" << std::endl;
    os << "      features[iIndex][fIndex] = fvalue;" << std::endl;
    os << "    }" << std::endl;
    os << "  }" << std::endl;
    os << "  int sum = 0;" << std::endl;
    os << "  double score = 0;" << std::endl;
    os << "  struct timeval start, end;" << std::endl;
    os << "  gettimeofday(&start, NULL);" << std::endl;
    os << "  for (iIndex = 0; iIndex < numberOfInstances; iIndex++) {" << std::endl;
    os << "    score = 0;" << std::endl;
    for (uint32_t i = 0; i < num_trees; i++) {
      os << "    score += " << learning_rate << " * tree_eval_" << i << "(features[iIndex]);" << std::endl;
    }
    os << "    printf(\"%.16f\\n\", score);" << std::endl;
    os << "    sum += score;" << std::endl;
    os << "  }" << std::endl;
    os << "  gettimeofday(&end, NULL);" << std::endl;
    os << "  printf(\"Time per instance (ns): %5.2f\\n\", (((end.tv_sec * 1000000 + end.tv_usec)" <<
                     " - (start.tv_sec * 1000000 + start.tv_usec)) * 1000/((float) numberOfInstances)));" << std::endl;
    os << "  printf(\"Ignore this number: %d\\n\", sum);" << std::endl;
    os << "  fclose(fp);" << std::endl;
    os << "  for (i = 0; i < numberOfInstances; i++) { free(features[i]); }" << std::endl;
    os << "  free(features);" << std::endl;
    os << "  return 0;" << std::endl;
    os << "}" << std::endl;
}

/*+---------------------+
* |        Java         |
* +---------------------+*/
void print_imports_java(std::ofstream &os)
{
	os << "import java.io.BufferedReader;" << std::endl;
	os << "import java.io.FileReader;" << std::endl;
	os << "import java.util.ArrayList;" << std::endl;
	os << "import java.util.List;" << std::endl;
	os << "import java.util.StringTokenizer;" << std::endl;
	os << "import java.util.Vector;" << std::endl;
	os << std::endl;
}

void print_tree_eval_java(std::ofstream &os, const boost::property_tree::ptree& node)
{
	if (is_leaf(node)) {
			os << "return " << trim(node, "output") << ";" << std::endl;
		} else {
			std::string feature = trim(node, "feature");
			std::string threshold = trim(node, "threshold");

			boost::property_tree::ptree left_node, right_node;

			for (const auto& split_it: node) {
				if (split_it.first == "split") {
					std::string pos = split_it.second.get<std::string>("<xmlattr>.pos");
					if (pos == "left")
						left_node = split_it.second;
					if (pos == "right")
						right_node = split_it.second;
				}
			}

			os << "if (features.get(" <<  (std::stoi(feature) - 1) << ") <= " << threshold << "f) {" << std::endl;
			print_tree_eval_java(os, left_node);
			os << "} else {" << std::endl;
			print_tree_eval_java(os, right_node);
			os << "}" << std::endl;
		}
}

void print_tree_function_java(const boost::property_tree::ptree& node, uint32_t fun_id, std::ofstream &os)
{
	os << "  private static double tree_eval_" << fun_id << "(Vector<Float> features) {" << std::endl;
	print_tree_eval_java(os, node);
	os << "  }" << std::endl;
}

void print_main_java(std::ofstream &os, uint32_t num_trees, float learning_rate)
{
    os << "  public static void main(String[] args) {" << std::endl;
    os << "    if(args.length < 1) {" << std::endl;
    os << "      System.exit(-1);" << std::endl;
    os << "    }" << std::endl;
    os << "    String featureFile = args[0];" << std::endl;
    os << "    BufferedReader flux = null;" << std::endl;
    os << "    try {" << std::endl;
    os << "      FileReader fr = new FileReader(featureFile);" << std::endl;
    os << "      flux = new BufferedReader(fr);" << std::endl;
    os << "      StringTokenizer tokenizer = new StringTokenizer(flux.readLine(), \" \");" << std::endl;
    os << "      int numberOfInstances = Integer.parseInt(tokenizer.nextToken().trim());" << std::endl;
    os << "      int numberOfFeatures = Integer.parseInt(tokenizer.nextToken().trim());" << std::endl;
    os << "      List<Vector<Float>> featureVectors = new ArrayList<Vector<Float>>(numberOfInstances);" << std::endl;
    os << "      for(int i = 0; i < numberOfInstances; i++) {" << std::endl;
    os << "        featureVectors.add(new Vector<Float>(numberOfFeatures));" << std::endl;
    os << "      }" << std::endl;
    os << "      for(Vector<Float> features : featureVectors) {" << std::endl;
    os << "        tokenizer = new StringTokenizer(flux.readLine(), \" \");" << std::endl;
    os << "        tokenizer.nextToken();" << std::endl;
    os << "        tokenizer.nextToken();" << std::endl;
    os << "        for(int i = 0; i < numberOfFeatures; i++) {" << std::endl;
    os << "          String text = tokenizer.nextToken().trim().split(\":\")[1];" << std::endl;
    os << "          features.add(Float.parseFloat(text));" << std::endl;
    os << "        }" << std::endl;
    os << "      }" << std::endl;
    //os << "  std::cout << std::setprecision(std::numeric_limits<double>::digits10);" << std::endl;
    os << "      int sum = 0;" << std::endl;
    os << "      double score;" << std::endl;
    os << "      for(Vector<Float> features : featureVectors) {" << std::endl;
    os << "        score = 0.0;" << std::endl;
    for (uint32_t i = 0; i < num_trees; i++) {
    	os << "        score += " << learning_rate << " * tree_eval_" << i << "(features);" << std::endl;
    }
    os << "        //System.out.println(score);" << std::endl;
    os << "        sum += score;" << std::endl;
    os << "      }" << std::endl;
    os << "      System.out.println(\"Ignore this number: \\n\" + sum);" << std::endl;
    os << "    } catch(Exception e) {" << std::endl;
    os << "      e.printStackTrace();" << std::endl;
    os << "    } finally {" << std::endl;
    os << "      if(flux != null) {" << std::endl;
    os << "        try {" << std::endl;
    os << "          flux.close();" << std::endl;
    os << "        } catch(Exception e) {" << std::endl;
    os << "          e.printStackTrace();" << std::endl;
    os << "        }" << std::endl;
    os << "      }" << std::endl;
    os << "    }" << std::endl;
    os << "    System.exit(0);" << std::endl;
    os << "  }" << std::endl;
}

/*+---------------------+
* |  Python functions   |
* +---------------------+*/
void print_imports_python(std::ofstream &os) {
	os << "import sys" << std::endl;
}

void print_tree_eval_python(std::ofstream &os, const boost::property_tree::ptree& node, int indentations)
{
	std::string tabulations = "";
	for(int i = 0; i < indentations; i++) {
		tabulations += "\t";
	}
	if (is_leaf(node)) {
			os << tabulations << "return " << trim(node, "output") << std::endl;
		} else {
			std::string feature = trim(node, "feature");
			std::string threshold = trim(node, "threshold");

			boost::property_tree::ptree left_node, right_node;

			for (const auto& split_it: node) {
				if (split_it.first == "split") {
					std::string pos = split_it.second.get<std::string>("<xmlattr>.pos");
					if (pos == "left")
						left_node = split_it.second;
					if (pos == "right")
						right_node = split_it.second;
				}
			}

			os << tabulations << "if features[" <<  (std::stoi(feature) - 1) << "] <= " << threshold << ":" << std::endl;
			print_tree_eval_python(os, left_node, indentations + 1);
			os << tabulations << "else:" << std::endl;
			print_tree_eval_python(os, right_node, indentations + 1);
			if(indentations == 1) {
				os << std::endl;
			}
		}
}

void print_tree_function_python(const boost::property_tree::ptree& node, uint32_t fun_id, std::ofstream &os)
{
	os << "def tree_eval_" << fun_id << "(features):" << std::endl;
	print_tree_eval_python(os, node, 1);
	os << std::endl;
}

/*+---------------------+
* | Main for Python 2.x |
* +---------------------+*/
void print_main_python2(std::ofstream &os, uint32_t num_trees, float learning_rate)
{
    os << "def main(argv):" << std::endl;
    os << "\tif len(argv) < 2:" << std::endl;
    os << "\t\tsys.exit(-1)" << std::endl;
    os << "\tfeatureFile = argv[1]" << std::endl;
    os << "\twith open(featureFile, 'r') as fp:" << std::endl;
    os << "\t\tline = fp.readline()" << std::endl;
    os << "\t\tnumber_of_instances = int(line.split(' ')[0])" << std::endl;
    os << "\t\tnumber_of_features = int(line.split(' ')[1])" << std::endl;
    os << "\t\tfeatures = [[0 for x in xrange(number_of_features)] for x in xrange(number_of_instances)]" << std::endl;
    os << "\t\tfor iIndex in xrange(0, number_of_instances):" << std::endl;
    os << "\t\t\tline = fp.readline()" << std::endl;
    os << "\t\t\ttokenizer = iter(line.strip().split(' '))" << std::endl;
    os << "\t\t\tnext(tokenizer)" << std::endl;
    os << "\t\t\tnext(tokenizer)" << std::endl;
    os << "\t\t\tfor fIndex in xrange(0, number_of_features):" << std::endl;
    os << "\t\t\t\tfvalue = float(next(tokenizer).split(':')[1])" << std::endl;
    os << "\t\t\t\tfeatures[iIndex][fIndex] = fvalue" << std::endl;
    os << "\t\t\tsum = 0" << std::endl;
    os << "\t\t\tfor iIndex in xrange(0, number_of_instances):" << std::endl;
    os << "\t\t\t\tscore = 0.0" << std::endl;
    for (uint32_t i = 0; i < num_trees; i++) {
    	os << "\t\t\t\tscore += " << learning_rate << " * tree_eval_" << i << "(features[iIndex])" << std::endl;
    }
    os << "\t\t\t\t#print score" << std::endl;
    os << "\t\t\t\tsum += score" << std::endl;
    os << "\t\tprint 'Ignore this number:' , sum" << std::endl;
    os << "\tfp.closed" << std::endl;
    os << "\tsys.exit(0)" << std::endl;
    os << std::endl;
    os << "if __name__ == '__main__':" << std::endl;
    os << "\tmain(sys.argv)" << std::endl;
}

/*+---------------------+
* | Main for Python 3.x |
* +---------------------+*/
void print_main_python3(std::ofstream &os, uint32_t num_trees, float learning_rate)
{
    os << "def main(argv):" << std::endl;
    os << "\tif len(argv) < 2:" << std::endl;
    os << "\t\tsys.exit(-1)" << std::endl;
    os << "\tfeatureFile = argv[1]" << std::endl;
    os << "\twith open(featureFile, 'r') as fp:" << std::endl;
    os << "\t\tline = fp.readline()" << std::endl;
    os << "\t\tnumber_of_instances = int(line.split(' ')[0])" << std::endl;
    os << "\t\tnumber_of_features = int(line.split(' ')[1])" << std::endl;
    os << "\t\tfeatures = [[0 for x in range(number_of_features)] for x in range(number_of_instances)]" << std::endl;
    os << "\t\tfor iIndex in range(0, number_of_instances):" << std::endl;
    os << "\t\t\tline = fp.readline()" << std::endl;
    os << "\t\t\ttokenizer = iter(line.strip().split(' '))" << std::endl;
    os << "\t\t\tnext(tokenizer)" << std::endl;
    os << "\t\t\tnext(tokenizer)" << std::endl;
    os << "\t\t\tfor fIndex in range(0, number_of_features):" << std::endl;
    os << "\t\t\t\tfvalue = float(next(tokenizer).split(':')[1])" << std::endl;
    os << "\t\t\t\tfeatures[iIndex][fIndex] = fvalue" << std::endl;
    os << "\t\t\tsum = 0" << std::endl;
    os << "\t\t\tfor iIndex in range(0, number_of_instances):" << std::endl;
    os << "\t\t\t\tscore = 0.0" << std::endl;
    for (uint32_t i = 0; i < num_trees; i++) {
    	os << "\t\t\t\tscore += " << learning_rate << " * tree_eval_" << i << "(features[iIndex])" << std::endl;
    }
    os << "\t\t\t\t#print(score)" << std::endl;
    os << "\t\t\t\tsum += score" << std::endl;
    os << "\t\tprint('Ignore this number:' , sum)" << std::endl;
    os << "\tfp.closed" << std::endl;
    os << "\tsys.exit(0)" << std::endl;
    os << std::endl;
    os << "if __name__ == '__main__':" << std::endl;
    os << "\tmain(sys.argv)" << std::endl;
}

/*+---------------------+
* |FOREST CODE GENERATOR|
* +---------------------+*/
void generate_if_then_else_code_forest(const std::string& language, const std::string& ensemble_file, const std::string& ensemble_path)
{
	// parse XML
	boost::property_tree::ptree xml_tree;
	std::ifstream is;
	is.open(ensemble_file, std::ifstream::in);
	boost::property_tree::read_xml(is, xml_tree);
	is.close();

	double learning_rate = xml_tree.get_child("ranker.info").get<double>("shrinkage");
	uint32_t num_trees = xml_tree.get_child("ranker.ensemble").count("tree");
	uint32_t tree_id = 0;

	std::ofstream os;

	if(language == "cpp"){
		os.open(ensemble_path + "model.cpp");
		print_header_cpp(os);
		os << std::endl;
		for (const auto& tree_it: xml_tree.get_child("ranker.ensemble")) {
			print_tree_function_cpp(tree_it.second.get_child("split"), tree_id++, os);
			os << std::endl;
		}
		print_main_cpp(os, num_trees, learning_rate);
		os.close();
	} else if(language == "java") {
		os.open(ensemble_path + "Model.java");
		print_imports_java(os);
		os << "public class Model {" << std::endl;
		os << std::endl;
		for (const auto& tree_it: xml_tree.get_child("ranker.ensemble")) {
			print_tree_function_java(tree_it.second.get_child("split"), tree_id++, os);
			os << std::endl;
		}
		print_main_java(os, num_trees, learning_rate);
		os << "}" << std::endl;
		os.close();
	} else if(language == "python2") {
		os.open(ensemble_path + "model.py");
		print_imports_python(os);
		os << std::endl;
		for (const auto& tree_it: xml_tree.get_child("ranker.ensemble")) {
			print_tree_function_python(tree_it.second.get_child("split"), tree_id++, os);
			os << std::endl;
		}
		print_main_python2(os, num_trees, learning_rate);
		os.close();
	} else if(language == "python3") {
		os.open(ensemble_path + "model_py3.py");
		print_imports_python(os);
		os << std::endl;
		for (const auto& tree_it: xml_tree.get_child("ranker.ensemble")) {
			print_tree_function_python(tree_it.second.get_child("split"), tree_id++, os);
			os << std::endl;
		}
		print_main_python3(os, num_trees, learning_rate);
		os.close();
	}
}

/*+---------------------+
* |LINEAR CODE GENERATOR|
* +---------------------+*/
void generate_if_then_else_code_linear(const std::string& language, const std::string& ensemble_file, const std::string& ensemble_path)
{
	// TODO
}

void translate_model(const std::string &language, const std::string &ensemble_file)
{
	// set output path
	typedef boost::tokenizer<boost::char_separator<char>> tokenizer;
	boost::char_separator<char> separator("/");
	tokenizer tokens(ensemble_file, separator);
	std::string ensemble_path = "";
	for(tokenizer::iterator iterator = tokens.begin(); iterator != tokens.end(); iterator++) {
		if(!boost::algorithm::ends_with(*iterator, ".xml")) {
			ensemble_path = ensemble_path + *iterator + "/";
		}
	}
	// set output folder in /outputs/model/ if this function is called as a stand-alone translator
	if(boost::algorithm::ends_with(ensemble_path, "/inputs/")) {
		boost::algorithm::replace_last(ensemble_path, "/inputs/", "/outputs/model/");
	}
	// get algorithm in 2 steps:
	// 1. parse XML
	boost::property_tree::ptree xml_tree;
	std::ifstream is;
	is.open(ensemble_file, std::ifstream::in);
	boost::property_tree::read_xml(is, xml_tree);
	is.close();
	// 2. read algorithm
	std::string algorithm = xml_tree.get_child("ranker.info").get<std::string>("type");
	// generate code
	if (algorithm == quickrank::learning::linear::CoordinateAscent::NAME_) {
		quickrank::scoring::generate_if_then_else_code_linear(language, ensemble_file, ensemble_path);
	} else {
		quickrank::scoring::generate_if_then_else_code_forest(language, ensemble_file, ensemble_path);
	}
}

} // namespace scoring
} // namespace quickrank
