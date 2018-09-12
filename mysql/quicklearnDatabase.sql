SET sql_mode = '';

CREATE DATABASE IF NOT EXISTS quicklearn;

USE quicklearn;

CREATE TABLE IF NOT EXISTS session(
	ID INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(20) NOT NULL,
	training_session BOOLEAN NOT NULL,
	status BOOLEAN NOT NULL,
	start_time TIMESTAMP NOT NULL,
	end_time TIMESTAMP,
	PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS task(
	ID INT NOT NULL AUTO_INCREMENT,
	session_ID INT NOT NULL REFERENCES session(ID),
	name VARCHAR(20) NOT NULL,
	status INT NOT NULL,
	CONSTRAINT status CHECK (status BETWEEN 0 AND 2),
	training_task BOOLEAN NOT NULL,
	validation_task BOOLEAN NOT NULL,
	testing_task BOOLEAN NOT NULL,
	algorithm_string VARCHAR(30),
	train_metric_string VARCHAR(5),
	train_cutoff INT,
	partial_save INT,
	training_filename TEXT,
	validation_filename TEXT,
	features_filename TEXT,
	model_filename TEXT,
	ntrees INT,
	shrinkage FLOAT,
	nthresholds INT,
	minleafsupport INT,
	esr INT,
	ntreeleaves INT,
	treedepth INT,
	num_points INT,
	max_iterations INT,
	window_size FLOAT,
	reduction_factor FLOAT,
	max_failed_vali INT,
	test_metric_string VARCHAR(5),
	test_cutoff INT,
	test_filename TEXT,
	scores_filename TEXT,
	xml_filename TEXT,
	c_filename TEXT,
	model_code_type VARCHAR(8),
	training_score NUMERIC(7,4),
	training_time NUMERIC(8,2),
	validation_score NUMERIC(7,4),
	testing_score NUMERIC(7,4),
	PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS iteration(
	ID INT NOT NULL AUTO_INCREMENT,
	task_ID INT NOT NULL REFERENCES task(ID),
	number INT NOT NULL,
	training_score NUMERIC(7,4) NOT NULL,
	validation_score NUMERIC(7,4),
	best_score BOOLEAN,
	PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS preferences(
	ID INT NOT NULL AUTO_INCREMENT,
	num_instances INT NOT NULL,
	mail_address TEXT,
	PRIMARY KEY(ID)
);

INSERT INTO preferences(num_instances, mail_address) VALUES (2, "notification.quicklearn@gmail.com");
