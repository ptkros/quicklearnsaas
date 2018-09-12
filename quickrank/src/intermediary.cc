#include "intermediary.h"

// WORKER CODE
static void *
worker_thread(void *arg) {

	zmq::context_t * context = (zmq::context_t *) arg;
	zmq::socket_t worker(*context, ZMQ_REQ);

	// a worker needs a unique ID: we use its memory address location (string)
	s_set_id(worker);
	worker.connect("ipc://routing.ipc");
	while (1) {
		// send the availability to the emitter
		s_send(worker, "ready");
		// get a message from the emitter
		std::string message = s_recv(worker);
		// this message can be a termination request, or a workload
		int finished = (message.compare("END") == 0);
		if (finished) {
			break;
		} else {
			std::istringstream ibuffer(message);
			boost::archive::binary_iarchive iarchive(ibuffer);
			inputs::InputContainer container;
			iarchive & container;
			std::string task_name = s_recv(worker);
			unsigned int sessionID = std::stoi(s_recv(worker));
			unsigned int taskID = 0;
			if(sessionID != 0) {
				taskID = dbconn::put_task(sessionID, task_name, container);
			}
			int outcome = learn(taskID, container);
			if (outcome != EXIT_SUCCESS) {
				//save the aborted status to DB (if connected)
				if(taskID != 0) {
					dbconn::set_aborted_task(taskID);
					std::cout << "Completion of " << task_name << " failed!" << std::endl;
				} else {
					std::cout << "Completion of " << task_name << " failed!" << std::endl;
				}
			} else {
				//save the completed status to DB (if connected)
				if(taskID != 0) {
					dbconn::set_completed_task(taskID);
					std::cout << task_name << " completed!" << std::endl;
				} else {
					std::cout << task_name << " completed!" << std::endl;
				}
			}
		}
	}
	return (NULL);
}

void print_logo() {
	if (isatty(fileno(stdout))) {
		std::string color_reset = "\033[0m";
		std::string color_logo = "\033[1m\033[32m";
		std::cout << color_logo << std::endl << "      _____  _____"
				<< std::endl << "     /    / /____/" << std::endl
				<< "    /____\\ /    \\          QuickRank has been developed by hpc.isti.cnr.it"
				<< std::endl
				<< "    ::Quick:Rank::                                   quickrank@isti.cnr.it"
				<< std::endl << color_reset << std::endl;
	} else {
		std::cout << std::endl << "      _____  _____" << std::endl
				<< "     /    / /____/" << std::endl
				<< "    /____\\ /    \\          QuickRank has been developed by hpc.isti.cnr.it"
				<< std::endl
				<< "    ::Quick:Rank::                                   quickrank@isti.cnr.it"
				<< std::endl << std::endl;
	}
}

// EMITTER CODE
int intermediary(std::vector<inputs::InputContainer> inputContainers, unsigned int sessionID) {
	print_logo();

	zmq::context_t context(1);
	zmq::socket_t client(context, ZMQ_ROUTER);
	client.bind("ipc://routing.ipc");

	// set the number of workers for this session
	unsigned int max_number_of_workers = dbconn::get_number_of_instances();
	unsigned int number_of_workers = inputContainers.size();
	if (number_of_workers > max_number_of_workers) {
		number_of_workers = max_number_of_workers;
	}

	// create worker threads
	unsigned int worker_nbr;
	for (worker_nbr = 0; worker_nbr < number_of_workers; worker_nbr++) {
		pthread_t worker;
		pthread_create(&worker, NULL, worker_thread, &context);
	}

	// assign tasks to available workers (on-demand strategy)
	unsigned int task_nbr;
	for (task_nbr = 0; task_nbr < inputContainers.size(); task_nbr++) {
		inputs::InputContainer container = inputContainers.at(task_nbr);
		std::string task_name = "Task" + std::to_string(task_nbr + 1);
		std::string address = s_recv(client);
		{
			// receiving and discarding'empty' message
			s_recv(client);
			// receiving and discarding 'ready' message
			s_recv(client);
		}
		s_sendmore(client, address);
		s_sendmore(client, "");
		std::ostringstream obuffer;
		boost::archive::binary_oarchive oarchive(obuffer);
		oarchive & container;
		std::string outStr(obuffer.str());
		s_sendmore(client, outStr);
		s_sendmore(client, task_name);
		s_send(client, std::to_string(sessionID));
		sleep(1);
	}

	// proceed with shutdown of worker threads, after finishing (wait for their availability)
	for (worker_nbr = 0; worker_nbr < number_of_workers; worker_nbr++) {
		std::string address = s_recv(client);
		{
			// receiving and discarding'empty' message
			s_recv(client);
			// receiving and discarding 'ready' message
			s_recv(client);
		}
		s_sendmore(client, address);
		s_sendmore(client, "");
		s_send(client, "END");
	}
	// give 0MQ/2.0.x time to flush output
	sleep(1);

	return EXIT_SUCCESS;
}

void intermediary_wrapper(boost::python::list mapping, unsigned int sessionID) {
	int mapping_length = boost::python::extract<int>(mapping.attr("__len__")());
	std::vector<inputs::InputContainer> inputContainers;

	//since the exact length of this vector is known, this optimizes its allocation in memory
	inputContainers.reserve(mapping_length);

	for (int i = 0; i < mapping_length; i++) {
		boost::python::dict dictionary = boost::python::extract<boost::python::dict>(mapping[i]);
		std::string algorithm_string = boost::python::extract<std::string>(boost::python::str(dictionary["algorithm_string"]));
		std::string train_metric_string = boost::python::extract<std::string>(boost::python::str(dictionary["train_metric_string"]));
		unsigned int train_cutoff = boost::python::extract<unsigned int>(dictionary["train_cutoff"]);
		unsigned int partial_save = boost::python::extract<unsigned int>(dictionary["partial_save"]);
		std::string training_filename = boost::python::extract<std::string>(boost::python::str(dictionary["training_filename"]));
		std::string validation_filename = boost::python::extract<std::string>(boost::python::str(dictionary["validation_filename"]));
		std::string features_filename = boost::python::extract<std::string>(boost::python::str(dictionary["features_filename"]));
		std::string model_filename = boost::python::extract<std::string>(boost::python::str(dictionary["model_filename"]));
		unsigned int ntrees = boost::python::extract<unsigned int>(dictionary["ntrees"]);
		float shrinkage = boost::python::extract<float>(dictionary["shrinkage"]);
		unsigned int nthresholds = boost::python::extract<unsigned int>(dictionary["nthresholds"]);
		unsigned int minleafsupport = boost::python::extract<unsigned int>(dictionary["minleafsupport"]);
		unsigned int esr = boost::python::extract<unsigned int>(dictionary["esr"]);
		unsigned int ntreeleaves = boost::python::extract<unsigned int>(dictionary["ntreeleaves"]);
		unsigned int treedepth = boost::python::extract<unsigned int>(dictionary["treedepth"]);
		unsigned int num_points = boost::python::extract<unsigned int>(dictionary["num_points"]);
		unsigned int max_iterations = boost::python::extract<unsigned int>(dictionary["max_iterations"]);
		float window_size = boost::python::extract<float>(dictionary["window_size"]);
		float reduction_factor = boost::python::extract<float>(dictionary["reduction_factor"]);
		unsigned int max_failed_vali = boost::python::extract<unsigned int>(dictionary["max_failed_vali"]);
		std::string test_metric_string = boost::python::extract<std::string>(boost::python::str(dictionary["test_metric_string"]));
		unsigned int test_cutoff = boost::python::extract<unsigned int>(dictionary["test_cutoff"]);
		std::string test_filename = boost::python::extract<std::string>(boost::python::str(dictionary["test_filename"]));
		std::string scores_filename = boost::python::extract<std::string>(boost::python::str(dictionary["scores_filename"]));
		std::string xml_filename = boost::python::extract<std::string>(boost::python::str(dictionary["xml_filename"]));
		std::string c_filename = boost::python::extract<std::string>(boost::python::str(dictionary["c_filename"]));
		std::string model_code_type = boost::python::extract<std::string>(boost::python::str(dictionary["model_code_type"]));

		inputs::InputContainer container(algorithm_string, train_metric_string, train_cutoff, partial_save, training_filename, validation_filename, features_filename, model_filename, ntrees,
			shrinkage, nthresholds, minleafsupport, esr, ntreeleaves, treedepth, num_points, max_iterations, window_size, reduction_factor, max_failed_vali,
			test_metric_string, test_cutoff, test_filename, scores_filename, xml_filename , c_filename, model_code_type);

		inputContainers.push_back(container);

	}
	intermediary(inputContainers, sessionID);

}

BOOST_PYTHON_MODULE(quicklearn_module)
{
	boost::python::def("submit", intermediary_wrapper);
}
