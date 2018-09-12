#ifndef INPUTCONTAINER_H
#define INPUTCONTAINER_H

#include <boost/archive/binary_iarchive.hpp>
#include <boost/archive/binary_oarchive.hpp>

namespace inputs {

class InputContainer {
public:
	std::string algorithm_string = "LAMBDAMART";
	std::string train_metric_string = "NDCG";
	unsigned int train_cutoff = 10;
	unsigned int partial_save = 0;
	std::string training_filename;
	std::string validation_filename;
	std::string features_filename;
	std::string model_filename;
	unsigned int ntrees = 1000;
	float shrinkage = 0.10f;
	unsigned int nthresholds = 0;
	unsigned int minleafsupport = 1;
	unsigned int esr = 100;
	unsigned int ntreeleaves = 10;
	unsigned int treedepth = 3;

	// ------------------------------------------
	// Coordinate ascent added by Chiara Pierucci
	unsigned int num_points = 21;
	unsigned int max_iterations = 100;
	float window_size = 10.0;
	float reduction_factor = 0.95;
	unsigned int max_failed_vali = 20;

	std::string test_metric_string = "NDCG";
	unsigned int test_cutoff = 10;
	std::string test_filename;
	std::string scores_filename;
	std::string xml_filename;
	std::string c_filename;
	std::string model_code_type;

	InputContainer(std::string algorithm_string, std::string train_metric_string, unsigned int train_cutoff,
			unsigned int partial_save, std::string training_filename, std::string validation_filename,
			std::string features_filename, std::string model_filename, unsigned int ntrees,
			float shrinkage, unsigned int nthresholds, unsigned int minleafsupport,
			unsigned int esr, unsigned int ntreeleaves, unsigned int treedepth,
			unsigned int num_points, unsigned int max_iterations, float window_size,
			float reduction_factor, unsigned int max_failed_vali, std::string test_metric_string,
			unsigned int test_cutoff, std::string test_filename, std::string scores_filename,
			std::string xml_filename, std::string c_filename, std::string model_code_type):
				algorithm_string(algorithm_string), train_metric_string(train_metric_string),
				train_cutoff(train_cutoff), partial_save(partial_save),
				training_filename(training_filename), validation_filename(validation_filename),
				features_filename(features_filename), model_filename(model_filename),
				ntrees(ntrees), shrinkage(shrinkage), nthresholds(nthresholds),
				minleafsupport(minleafsupport), esr(esr), ntreeleaves(ntreeleaves),
				treedepth(treedepth), num_points(num_points), max_iterations(max_iterations),
				window_size(window_size), reduction_factor(reduction_factor),
				max_failed_vali(max_failed_vali), test_metric_string(test_metric_string),
				test_cutoff(test_cutoff), test_filename(test_filename),
				scores_filename(scores_filename), xml_filename(xml_filename),
				c_filename(c_filename), model_code_type(model_code_type){}

	InputContainer(){}

private:

friend class boost::serialization::access;
template<typename Archive>
	void serialize(Archive& archive, const unsigned version){
		archive & algorithm_string & train_metric_string & train_cutoff & partial_save & training_filename &
				validation_filename & features_filename & model_filename & ntrees & shrinkage & nthresholds &
				minleafsupport & esr & ntreeleaves & treedepth & num_points & max_iterations & window_size &
				reduction_factor & max_failed_vali & test_metric_string & test_cutoff & test_filename &
				scores_filename & xml_filename & c_filename & model_code_type;
	}
};

}

#endif
