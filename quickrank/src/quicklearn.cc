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

/**
 * \mainpage QuickRank: Efficient Learning-to-Rank Toolkit
 *
 * \section nutshell QuickRank in a nutshell
 *
 * QuickRank is an efficient Learning-to-Rank (L-t-R) Toolkit providing several
 * C++ implementation of L-t-R algorithms.
 *
 * The algorithms currently implemented are:
 *   - \b GBRT: J. H. Friedman. Greedy function approximation: a gradient boosting machine.
 *   Annals of Statistics, pages 1189–1232,
 2001.
 *   - \b LamdaMART: Q. Wu, C. Burges, K. Svore, and J. Gao.
 *   Adapting boosting for information retrieval measures.
 *   Information Retrieval, 2010.
 *   - \b Oblivious GBRT / LambdaMart: Inspired to I. Segalovich. Machine learning in search quality at yandex.
 *   Invited Talk, SIGIR, 2010.
 *   - \b CoordinateAscent: Metzler, D., Croft, W.B.: Linear feature-based models for information retrieval.
 *   Information Retrieval 10(3), 257–274 (2007)
 *
 * \subsection authors Authors and Contributors
 *
 * QuickRank has been developed by:
 *   - Claudio Lucchese (since Sept. 2014)
 *   - Franco Maria Nardini (since Sept. 2014)
 *   - Nicola Tonellotto (since Sept. 2014)
 *   - Gabriele Capannini (v0.0. June 2014 - Sept. 2014)
 *   - Andrea Battistini and Chiara Pierucci (Implementation of CoordinateAscent - March 2015)
 *
 *
 * \subsection download Get QuickRank
 * QuickRank is available here: <a href="http://quickrank.isti.cnr.it">http://quickrank.isti.cnr.it</a>.
 *
 * \section Usage
 *
 * \subsection cmd Command line options
 *
 * \todo command line description
 *
 * \subsection compile Compilation
 *
 *
 * \section log ChangeLog
 *
 * - xx/xx/2014: Version 1.1 released
 *
 *
 */

/// \todo TODO: (by cla) Decide on outpuformat, logging and similar.
#include "quicklearn.h"

#include "metric/evaluator.h"
#include "learning/forests/mart.h"
#include "learning/forests/lambdamart.h"
#include "learning/forests/obliviousmart.h"
#include "learning/forests/obliviouslambdamart.h"
#include "learning/linear/coordinate_ascent.h"
#include "learning/custom/custom_ltr.h"
#include "metric/metricfactory.h"
#include "io/xml.h"
#include "scoring/opt/converter.h"

// includes for workaround for non-centralized exit points
#include <boost/property_tree/xml_parser.hpp>
#include <boost/foreach.hpp>

namespace po = boost::program_options;

int learn(unsigned int taskID, inputs::InputContainer inputs) {
	std::cout << std::fixed;
	srand(time(NULL));

	// getting parameters from input container
	std::string algorithm_string = inputs.algorithm_string;
	unsigned int ntrees = inputs.ntrees;
	float shrinkage = inputs.shrinkage;
	unsigned int nthresholds = inputs.nthresholds;
	unsigned int minleafsupport = inputs.minleafsupport;
	unsigned int esr = inputs.esr;
	unsigned int ntreeleaves = inputs.ntreeleaves;
	unsigned int treedepth = inputs.treedepth;
	unsigned int num_points = inputs.num_points;
	unsigned int max_iterations = inputs.max_iterations;
	float window_size = inputs.window_size;
	float reduction_factor = inputs.reduction_factor;
	unsigned int max_failed_vali = inputs.max_failed_vali;
	std::string train_metric_string = inputs.train_metric_string;
	unsigned int train_cutoff = inputs.train_cutoff;
	std::string test_metric_string = inputs.test_metric_string;
	unsigned int test_cutoff = inputs.test_cutoff;
	unsigned int partial_save = inputs.partial_save;
	std::string training_filename = inputs.training_filename;
	std::string validation_filename = inputs.validation_filename;
	std::string test_filename = inputs.test_filename;
	std::string features_filename = inputs.features_filename;
	std::string model_filename = inputs.model_filename;
	std::string scores_filename = inputs.scores_filename;
	std::string xml_filename = inputs.xml_filename;
	std::string c_filename = inputs.c_filename;
	std::string model_code_type = inputs.model_code_type;

	// workaround for non-centralized exit points
	if (validate_inputs(inputs) == EXIT_FAILURE) {
		return EXIT_FAILURE;
	}

	// data structures
	std::shared_ptr<quickrank::learning::LTR_Algorithm> ranking_algorithm;

	// Run Training
	if (!training_filename.empty()) {

		// Create model
		boost::to_upper(algorithm_string);
		if (algorithm_string == quickrank::learning::forests::LambdaMart::NAME_)
			ranking_algorithm = std::shared_ptr<
					quickrank::learning::LTR_Algorithm>(
					new quickrank::learning::forests::LambdaMart(ntrees,
							shrinkage, nthresholds, ntreeleaves, minleafsupport,
							esr));
		else if (algorithm_string == quickrank::learning::forests::Mart::NAME_)
			ranking_algorithm = std::shared_ptr<
					quickrank::learning::LTR_Algorithm>(
					new quickrank::learning::forests::Mart(ntrees, shrinkage,
							nthresholds, ntreeleaves, minleafsupport, esr));
		else if (algorithm_string
				== quickrank::learning::forests::ObliviousMart::NAME_)
			ranking_algorithm = std::shared_ptr<
					quickrank::learning::LTR_Algorithm>(
					new quickrank::learning::forests::ObliviousMart(ntrees,
							shrinkage, nthresholds, treedepth, minleafsupport,
							esr));
		else if (algorithm_string
				== quickrank::learning::forests::ObliviousLambdaMart::NAME_)
			ranking_algorithm = std::shared_ptr<
					quickrank::learning::LTR_Algorithm>(
					new quickrank::learning::forests::ObliviousLambdaMart(
							ntrees, shrinkage, nthresholds, treedepth,
							minleafsupport, esr));
		else if (algorithm_string
				== quickrank::learning::linear::CoordinateAscent::NAME_)
			ranking_algorithm = std::shared_ptr<
					quickrank::learning::LTR_Algorithm>(
					new quickrank::learning::linear::CoordinateAscent(
							num_points, window_size, reduction_factor,
							max_iterations, max_failed_vali));
		else if (algorithm_string == quickrank::learning::CustomLTR::NAME_)
			ranking_algorithm = std::shared_ptr<
					quickrank::learning::LTR_Algorithm>(
					new quickrank::learning::CustomLTR());
		else {
			std::cout << " !! Train Algorithm was not set properly"
					<< std::endl;
			return EXIT_FAILURE;
		}

		// METRIC STUFF
		std::shared_ptr<quickrank::metric::ir::Metric> training_metric =
				quickrank::metric::ir::ir_metric_factory(train_metric_string,
						train_cutoff);
		if (!training_metric) {
			std::cout << " !! Train Metric was not set properly" << std::endl;
			return EXIT_FAILURE;
		}

		//show ranker parameters
		std::cout << "#" << std::endl << *ranking_algorithm;
		std::cout << "#" << std::endl << "# training scorer: "
				<< *training_metric << std::endl;

		quickrank::metric::Evaluator::training_phase(ranking_algorithm,
				training_metric, training_filename, validation_filename,
				features_filename, model_filename, partial_save, taskID);

		//convert xml model to C++/Java/Python source code
		quickrank::scoring::translate_model("cpp", model_filename);
		quickrank::scoring::translate_model("java", model_filename);
		quickrank::scoring::translate_model("python2", model_filename);
		quickrank::scoring::translate_model("python3", model_filename);
	}

	if (!test_filename.empty()) {
		if (!ranking_algorithm) {
			std::cout << "# Loading model from file " << model_filename
					<< std::endl;
			ranking_algorithm =
					quickrank::learning::LTR_Algorithm::load_model_from_file(
							model_filename);
			std::cout << "#" << std::endl << *ranking_algorithm;
			if (!ranking_algorithm) {
				std::cout << " !! Unable to load model from file." << std::endl;
				return EXIT_FAILURE;
			}
		}

		std::shared_ptr<quickrank::metric::ir::Metric> testing_metric =
				quickrank::metric::ir::ir_metric_factory(test_metric_string,
						test_cutoff);
		if (!testing_metric) {
			std::cout << " !! Test Metric was not set properly" << std::endl;
			return EXIT_FAILURE;
		}

		std::cout << "# test scorer: " << *testing_metric << std::endl << "#"
				<< std::endl;
		quickrank::metric::Evaluator::testing_phase(ranking_algorithm,
				testing_metric, test_filename, scores_filename, taskID);
	}

	// Fast Scoring

	// if the dump files are set, it proceeds to dump the model by following a given strategy.
	if (xml_filename != "" && c_filename != "") {
		quickrank::io::Xml xml;
		if (model_code_type == "baseline") {
			std::cout << "applying baseline strategy for C code generation to: "
					<< xml_filename << std::endl;
			xml.generate_c_code_baseline(xml_filename, c_filename);
		} else if (model_code_type == "oblivious") {
			std::cout
					<< "applying oblivious strategy for C code generation to: "
					<< xml_filename << std::endl;
			xml.generate_c_code_oblivious_trees(xml_filename, c_filename);
		} else if (model_code_type == "opt") {
			std::cout << "generating opt_trees input file to: " << "stdout."
					<< std::endl;
			quickrank::scoring::generate_opt_trees_input(xml_filename,
					c_filename);
		}
	} else if(xml_filename != "") {
		// otherwise, convert it to the language that is reported in model_code_type var
		if (model_code_type == "cpp" || model_code_type == "java" ||
				model_code_type == "python2" || model_code_type == "python3") {
			quickrank::scoring::translate_model(model_code_type, xml_filename);
		}
	}

	return EXIT_SUCCESS;

}

/*A quick fix for some non-centralized exit points: controls in where the following statement:

exit(EXIT_FAILURE);

is present are anticipated by this function, in order to keep alive our workers.
Some exit points from:

data/dataset.cc
data/io/svml.cc
utils/strutils.cc

are not fixed because they check for dynamic conditions, not for static ones.
*/
int validate_inputs(inputs::InputContainer inputs) {
	// workaround for exit point in learning/ltr_algorithm.cc
	if(inputs.algorithm_string.empty() &&
			!inputs.test_filename.empty() &&
			inputs.model_filename.empty()) {
		std::cerr << "!!! Model filename is empty." << std::endl;
		return EXIT_FAILURE;
	}
	// workaround for exit point in ir/evaluator.cc
	if(!inputs.algorithm_string.empty() &&
			inputs.training_filename.empty()) {
		std::cerr << "!!! Error while loading training dataset" << std::endl;
		return EXIT_FAILURE;
	}
	// workaround for exit point in learning/forests/mart.cc
	if(!inputs.algorithm_string.empty()) {
		std::string algorithm_string = inputs.algorithm_string;
		boost::to_upper(algorithm_string);
		if(algorithm_string != quickrank::learning::linear::CoordinateAscent::NAME_) {

		}
	}
	return EXIT_SUCCESS;
}
