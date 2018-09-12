#include <mysql++.h>

#include "ConnectionPool.h"

#include "InputContainer.h"

namespace dbconn {

const int TASK_IN_PROGRESS = 0;
const int TASK_COMPLETED = 1;
const int TASK_ABORTED = 2;

SimpleConnectionPool build_connection_pool();
bool test_connection();
std::string generate_task_name();
unsigned int put_task(unsigned int sessionID, std::string task_name, inputs::InputContainer inputs);
void insert_training_score(unsigned int taskID, unsigned int number_of_unit, double training_score);
void insert_training_and_validation_scores(unsigned int taskID, unsigned int number_of_unit, double training_score, double validation_score, bool best);
void set_final_training_scores(unsigned int taskID, double training_score, double train_time, double best_validation_score);
void set_testing_score(unsigned int taskID, double testing_score);
void set_completed_task(unsigned int taskID);
void set_aborted_task(unsigned int taskID);
unsigned int get_number_of_instances();

}
