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
#define BOOST_TEST_OBVLMART_LINK
#include <boost/test/unit_test.hpp>

#include "metric/evaluator.h"
#include "learning/forests/obliviouslambdamart.h"
#include "metric/ir/ndcg.h"

#include "metric/ir/dcg.h"
#include "metric/ir/ndcg.h"
#include "data/dataset.h"
#include "data/queryresults.h"
#include "io/svml.h"
#include <cmath>
#include <iomanip>
#include <cstdio>

BOOST_AUTO_TEST_CASE( ObvLambdaMart_Test ) {

  std::string training_filename =
      "quickranktestdata/msn1/msn1.fold1.train.5k.txt";
  std::string validation_filename =
      "quickranktestdata/msn1/msn1.fold1.vali.5k.txt";
  std::string test_filename = "quickranktestdata/msn1/msn1.fold1.test.5k.txt";
  std::string features_filename;
  std::string model_filename = "test-obvlambdamart-model.xml";

  unsigned int ntrees = 100;
  float shrinkage = 0.1;
  unsigned int nthresholds = 0;
  unsigned int treedepth = 4;
  unsigned int minleafsupport = 1;
  unsigned int esr = 100;
  unsigned int partial_save = -1;
  unsigned int ndcg_cutoff = 10;

  auto ranking_algorithm = std::shared_ptr<quickrank::learning::LTR_Algorithm>(
      new quickrank::learning::forests::ObliviousLambdaMart(ntrees, shrinkage, nthresholds,
                                             treedepth, minleafsupport, esr));

  auto training_metric = std::shared_ptr<quickrank::metric::ir::Metric>(
      new quickrank::metric::ir::Ndcg(ndcg_cutoff));
  auto testing_metric = training_metric;

  //show ranker parameters
  std::cout << "#" << std::endl << *ranking_algorithm;
  std::cout << "#" << std::endl << "# training scorer: " << *training_metric
            << std::endl;

  quickrank::io::Svml reader;
  std::shared_ptr<quickrank::data::Dataset> training_dataset = reader
      .read_horizontal(training_filename);
  std::cout << reader << *training_dataset;

  std::shared_ptr<quickrank::data::Dataset> validation_dataset = reader
      .read_horizontal(validation_filename);
  std::cout << reader << *validation_dataset;

  std::shared_ptr<quickrank::data::Dataset> test_dataset = reader
      .read_horizontal(test_filename);
  std::cout << reader << *test_dataset;

  // run the learning process
  ranking_algorithm->learn(training_dataset, validation_dataset, training_metric, partial_save,
                           model_filename, 0);



  // check again performance on training set
  std::vector<quickrank::Score> train_scores( training_dataset->num_instances() );
  ranking_algorithm->score_dataset(training_dataset, &train_scores[0]);
  quickrank::MetricScore training_score = training_metric->evaluate_dataset(
      training_dataset, &train_scores[0]);

  std::cout << *training_metric << " on training data = " << std::setprecision(4)
            << training_score << std::endl;

  // check again performance on validation set
  std::vector<quickrank::Score> valid_scores( validation_dataset->num_instances() );
  ranking_algorithm->score_dataset(validation_dataset, &valid_scores[0]);
  quickrank::MetricScore validation_score = training_metric->evaluate_dataset(
      validation_dataset, &valid_scores[0]);

  std::cout << *training_metric << " on validation data = " << std::setprecision(4)
            << validation_score << std::endl;

  // check again performance on test set
  std::vector<quickrank::Score> test_scores( test_dataset->num_instances() );
  ranking_algorithm->score_dataset(test_dataset, &test_scores[0]);
  quickrank::MetricScore test_score = testing_metric->evaluate_dataset(
      test_dataset, &test_scores[0]);

  std::cout << *testing_metric << " on test data = " << std::setprecision(4)
            << test_score << std::endl;

  // write model on disk
  ranking_algorithm->save(model_filename);

  // reload model from disk
  auto model_reloaded = quickrank::learning::LTR_Algorithm::load_model_from_file(model_filename);
  model_reloaded->score_dataset(test_dataset, &test_scores[0]);
  quickrank::MetricScore test_score_reloaded = testing_metric->evaluate_dataset(
      test_dataset, &test_scores[0]);

  std::cout << *testing_metric << " on test data = " << std::setprecision(4)
            << test_score_reloaded << std::endl;

  std::remove(model_filename.c_str());

  BOOST_CHECK_EQUAL(test_score, test_score_reloaded);

  // ------- QuickRank L-Mart Performance ---------
  // NDCG@10 on training data: 0.7321
  // NDCG@10 on validation data: 0.4136
  // NDCG@10 on test data: 0.3230

  BOOST_CHECK (training_score >= 0.4368);
  BOOST_CHECK (validation_score >= 0.3468);
  BOOST_CHECK (test_score >= 0.2819);
}
