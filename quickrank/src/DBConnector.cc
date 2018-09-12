#include "DBConnector.h"

#include <iostream>
#include <fstream>
#include <boost/filesystem/operations.hpp>
#include <boost/filesystem/path.hpp>
#include <boost/property_tree/xml_parser.hpp>
#include <boost/property_tree/ptree.hpp>

#define TASK_NAME_LENGTH 8

namespace dbconn {

SimpleConnectionPool connection_pool = build_connection_pool();

SimpleConnectionPool build_connection_pool() {
	// get XML configuration directory (starting from the current one)
	std::string main_path = "/QuickLearnSaaS/";
	boost::filesystem::path full_path(boost::filesystem::current_path());
	std::string xml_path = full_path.string();
	auto pos = xml_path.rfind(main_path);
	if (pos != std::string::npos) {
		xml_path.erase(pos + main_path.length());
	}
	xml_path.append("config/config.xml");

	// read XML configuration file
	boost::property_tree::ptree conf_tree;
	std::ifstream is;
	is.open(xml_path, std::ifstream::in);
	boost::property_tree::read_xml(is, conf_tree);
	is.close();

	// get configuration parameters
	std::string db = conf_tree.get_child("QuickLearnConfig.DB").get<std::string>("Name");
	std::string address = conf_tree.get_child("QuickLearnConfig.DB").get<std::string>("EndpointAddress");
	unsigned int port = conf_tree.get_child("QuickLearnConfig.DB").get<unsigned int>("EndpointPort");
	std::string username = conf_tree.get_child("QuickLearnConfig.DB").get<std::string>("Username");
	std::string password = conf_tree.get_child("QuickLearnConfig.DB").get<std::string>("Password");

	// set the above parameters for the connection pool and return it
	SimpleConnectionPool connection_pool(db, address, username, password, port);
	return connection_pool;
}

bool test_connection() {
	return connection_pool.test_connection();
}

// returns task ID in MySQL
unsigned int put_task(unsigned int sessionID, std::string task_name, inputs::InputContainer inputs) {
	int taskID = 0;
	if(test_connection()) {
		//check by inputs the nature of this task
		bool training_task = !inputs.training_filename.empty();
		bool validation_task = !inputs.validation_filename.empty();
		bool testing_task = !inputs.test_filename.empty();
		//get Connection and Query objects
		mysqlpp::Connection* conn = connection_pool.grab();
		mysqlpp::Query query = conn->query();
		//insert mandatory values in task
		query << "insert into task(session_ID, name, status,"
				" training_task, validation_task, testing_task)"
				" values " << "(%0q, %1q, %2q, %3q, %4q, %5q)";
		query.parse();
		query.execute(sessionID, task_name, TASK_IN_PROGRESS, training_task,
				validation_task, testing_task);
		query.reset();
		//get ID of the inserted task
		query << "select ID from task where name = " << mysqlpp::quote_only << task_name <<
				" and session_ID = " << sessionID;
		mysqlpp::StoreQueryResult result = query.store();
		query.reset();
		if(!result.empty()) {
			taskID = result[0]["ID"];
			//insert training parameters
			if(training_task) {
				query << "update task set algorithm_string = %1q,"
						" train_metric_string = %2q,"
						" train_cutoff = %3q,"
						" partial_save = %4q,"
						" training_filename = %5q,"
						" ntrees = %6q,"
						" shrinkage = %7,"
						" nthresholds = %8q,"
						" minleafsupport = %9,"
						" esr = %10q,"
						" ntreeleaves = %11q,"
						" treedepth = %12q,"
						" num_points = %13q,"
						" max_iterations = %14q,"
						" window_size = %15,"
						" reduction_factor = %16,"
						" max_failed_vali = %17q"
						" where ID = %0q";
				query.parse();
				query.execute(taskID, inputs.algorithm_string, inputs.train_metric_string,
						inputs.train_cutoff, inputs.partial_save, inputs.training_filename,
						inputs.ntrees, inputs.shrinkage, inputs.nthresholds, inputs.minleafsupport,
						inputs.esr, inputs.ntreeleaves, inputs.treedepth, inputs.num_points,
						inputs.max_iterations, inputs.window_size, inputs.reduction_factor,
						inputs.max_failed_vali);
				query.reset();
			}
			//insert validation parameters
			if(validation_task) {
				query << "update task set validation_filename = %1q"
						" where ID = %0q";
				query.parse();
				query.execute(taskID, inputs.validation_filename);
				query.reset();
			}
			//insert testing parameters
			if(testing_task) {
				query << "update task set test_metric_string = %1q,"
						" test_cutoff = %2q,"
						" test_filename = %3q"
						" where ID = %0q";
				query.parse();
				query.execute(taskID, inputs.test_metric_string, inputs.test_cutoff, inputs.test_filename);
				query.reset();
				if(!training_task) {
					query << "update task set model_filename = %1q"
							" where ID = %0q";
					query.parse();
					query.execute(taskID, inputs.model_filename);
					query.reset();
				}
			}
		}
		connection_pool.release(conn);
	}
	return taskID;
}

void insert_training_score(unsigned int taskID, unsigned int number_of_iter, double training_score) {
	mysqlpp::Connection* conn = connection_pool.grab();
	mysqlpp::Query query = conn->query();
	query << "insert into iteration(task_ID, number, training_score) values " << "(%0q, %1q, %2)";
	query.parse();
	query.execute(taskID, number_of_iter, training_score);
	connection_pool.release(conn);
}

void insert_training_and_validation_scores(unsigned int taskID, unsigned int number_of_iter, double training_score, double validation_score, bool best) {
	mysqlpp::Connection* conn = connection_pool.grab();
	mysqlpp::Query query = conn->query();
	query << "insert into iteration(task_ID, number, training_score, validation_score, best_score) values " << "(%0q, %1q, %2, %3, %4q)";
	query.parse();
	query.execute(taskID, number_of_iter, training_score, validation_score, best);
	connection_pool.release(conn);
}

void set_final_training_scores(unsigned int taskID, double training_score, double train_time, double best_validation_score) {
	mysqlpp::Connection* conn = connection_pool.grab();
	mysqlpp::Query query = conn->query();
	if(best_validation_score == 0) {
		query << "update task set training_score = %1, training_time = %2 where ID = %0q";
		query.parse();
		query.execute(taskID, training_score, train_time);
	} else {
		query << "update task set training_score = %1, validation_score = %2, training_time = %3 where ID = %0q";
		query.parse();
		query.execute(taskID, training_score, best_validation_score, train_time);
	}
	connection_pool.release(conn);
}

void set_testing_score(unsigned int taskID, double testing_score) {
	mysqlpp::Connection* conn = connection_pool.grab();
	mysqlpp::Query query = conn->query();
	query << "update task set testing_score = %1 where ID = %0q";
	query.parse();
	query.execute(taskID, testing_score);
}

void set_completed_task(unsigned int taskID) {
	mysqlpp::Connection* conn = connection_pool.grab();
	mysqlpp::Query query = conn->query();
	query << "update task set status = %1q where ID = %0q";
	query.parse();
	query.execute(taskID, TASK_COMPLETED);
	connection_pool.release(conn);
}

void set_aborted_task(unsigned int taskID) {
	mysqlpp::Connection* conn = connection_pool.grab();
	mysqlpp::Query query = conn->query();
	query << "update task set status = %1q where ID = %0q";
	query.parse();
	query.execute(taskID, TASK_ABORTED);
	connection_pool.release(conn);
}

unsigned int get_number_of_instances() {
	mysqlpp::Connection* conn = connection_pool.grab();
	mysqlpp::Query query = conn->query();
	query << "select num_instances from preferences where ID = 1";
	mysqlpp::StoreQueryResult result = query.store();
	query.reset();
	if(!result.empty()) {
		return result[0]["num_instances"];
	} else {
		return 0;
	}
}

}
