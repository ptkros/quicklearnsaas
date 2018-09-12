import dbconnector, s3speaker, notifier
import quicklearn_module, string, random, shutil, json, os, confreader
from datetime import datetime, timedelta

session_name_length = 8

##########
# CONFIG #
##########

# obtain configuration parameters
config = confreader.get_config()['RESTService']

endpoint_address = 'http://' + config['EndpointAddress'] + ':' + config['EndpointPort']

#####################
# UTILITY FUNCTIONS #
#####################

def generate_session_name():
	session_name = ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(session_name_length))
	return session_name

# call C++ framework via Boost.Python and manage its outputs
def call_quicklearn(session_type, session_name, session_path, containers):
	# we want to store session data into DB only if it is a training or testing session
	if session_type == 'training' or session_type == 'testing':
		# create a new session on DB
		session_start_date = datetime.now()
		session_ID = dbconnector.create_session(session_type, session_name, session_start_date)
	else:
		# otherwise (e.g.: fast-scoring), we don't want to store it
		session_ID = 0
	# call QuickLearn C++ module
	quicklearn_module.submit(containers, session_ID)
	# update session state on DB
	if session_ID > 0:
		dbconnector.update_session(session_ID, datetime.now())
	# upload output folder on S3
	s3speaker.upload_folder(session_name, session_path + 'outputs/')
	# notify to the user the end of learning (if this session is meant to be asynchronous)
	if session_type == 'training' or session_type == 'testing':
		mail_address = dbconnector.get_preferences()[1]
		notifier.notify_termination(mail_address, endpoint_address, session_name, session_start_date)
	# clean up session path
	shutil.rmtree(session_path)
	
################################
# FUNCTIONS FOR DASHBOARD PAGE #
################################
def get_dashboard_data():
	[sessions, tasks] = dbconnector.count_all()
	return json.dumps({'sessions': sessions, 'tasks': tasks})
	
###############################
# FUNCTIONS FOR SESSIONS PAGE #
###############################
	
# get a list of every sessions for data table
def get_sessions_dt(sType, draw, order_column_index, order_direction, length, start_index, filter):
	sessions = dbconnector.get_sessions(sType, order_column_index, order_direction, length, start_index, filter)
	[total_sessions, filtered_sessions] = dbconnector.count_filtered_sessions(sType, filter)
	return json.dumps({'draw':draw, 'recordsTotal':total_sessions, 'recordsFiltered':filtered_sessions, 'data':sessions})

# count "in progress" and "completed" sessions for pie chart
def get_sessions_pie(sType):
	[in_progress, completed] = dbconnector.count_sessions(sType)
	data = {'sessions_data': [{'label': 'completed', 'data': completed}, {'label': 'in progress', 'data': in_progress}]}
	return json.dumps(data)
	
# count "in progress" and "completed" sessions in a week for bars chart
def get_sessions_bars(sType):
	sessions_in_progress = []
	sessions_completed = []
	for i in range(7):
		current_day = datetime.now() - timedelta(days = i)
		current_day_start = current_day - timedelta(hours = current_day.hour, minutes = current_day.minute, seconds = current_day.second)
		current_day_end = current_day + timedelta(hours = 23 - current_day.hour, minutes = 59 - current_day.minute, seconds = 59 - current_day.second)
		[in_progress, completed] = dbconnector.count_sessions_in_range(sType, current_day_start, current_day_end)
		sessions_in_progress.append({'date': int(current_day_start.strftime('%s')) * 1000, 'sessions': in_progress})
		sessions_completed.append({'date': int(current_day_start.strftime('%s')) * 1000, 'sessions': completed})
	return json.dumps({'sessions_completed': sessions_completed, 'sessions_inprogress': sessions_in_progress})

######################################
# FUNCTIONS FOR SESSION DETAILS PAGE #
######################################

# get a list of every task of a session for data table
def get_tasks_dt(sType, session_name, draw, order_column_index, order_direction, length, start_index, filter):
	tasks = dbconnector.get_tasks(sType, session_name, order_column_index, order_direction, length, start_index, filter)
	[total_tasks, filtered_tasks] = dbconnector.count_filtered_tasks(session_name, filter)
	return json.dumps({'draw':draw, 'recordsTotal':total_tasks, 'recordsFiltered':filtered_tasks, 'data':tasks})

# count "in progress", "completed" and "aborted" tasks of a session for donut chart
def get_tasks_donut(session_name):
	[in_progress, completed, aborted] = dbconnector.count_session_tasks(session_name)
	return json.dumps({'tasks_status': [{'label': 'Completed', 'value': completed}, {'label': 'In progress', 'value': in_progress}, {'label': 'Aborted', 'value': aborted}]})

# get score values of a task for chart
def get_session_task(session_name, task_name):
	units_values = dbconnector.get_score_values(session_name, task_name)
	return json.dumps({'score_values': units_values})

# get details of a task for the details table
def get_task_details(sType, session_name, task_name):
	task = dbconnector.get_task_row(session_name, task_name)
	if sType == 'training':
		algorithm = task['algorithm_string']
		train_metric = task['train_metric_string']
		train_cutoff = int(task['train_cutoff'])
		partial_save = int(task['partial_save'])
		training_filename = task['training_filename']
		if '/' in training_filename:
			training_filename = training_filename.rpartition('/')[2]
		validation_filename = task['validation_filename']
		if validation_filename == None:
			validation_filename = ''
		elif '/' in validation_filename:
			validation_filename = validation_filename.rpartition('/')[2]
		features_filename = task['features_filename']
		if features_filename == None:
			features_filename = ''
		elif '/' in features_filename:
			features_filename = features_filename.rpartition('/')[2]
		num_trees = int(task['ntrees'])
		shrinkage = float(task['shrinkage'])
		nthresholds = int(task['nthresholds'])
		min_leaf_support = int(task['minleafsupport'])
		esr = int(task['esr'])
		num_tree_leaves = int(task['ntreeleaves'])
		tree_depth = int(task['treedepth'])
		num_points = int(task['num_points'])
		max_iterations = int(task['max_iterations'])
		window_size = float(task['window_size'])
		reduction_factor = float(task['reduction_factor'])
		max_failed_vali = int(task['max_failed_vali'])
		test_metric = task['test_metric_string']
		if test_metric == None:
			test_metric = ''
		test_cutoff = task['test_cutoff']
		if test_cutoff == None:
			test_cutoff = ''
		else:
			test_cutoff = int(test_cutoff)
		test_filename = task['test_filename']
		if test_filename == None:
			test_filename = ''
		elif '/' in test_filename:
			test_filename = test_filename.rpartition('/')[2]
		return json.dumps({'algorithm_string': algorithm,
						'train_metric': train_metric, 'train_cutoff': train_cutoff,
						'partial_save': partial_save, 'training_filename': training_filename,
						'validation_filename': validation_filename, 'features_filename': features_filename,
						'ntrees': num_trees, 'shrinkage': shrinkage,
						'nthresholds': nthresholds, 'minleafsupport': min_leaf_support, 'esr': esr,
						'ntreeleaves': num_tree_leaves, 'treedepth': tree_depth, 'num_points': num_points,
						'max_iterations': max_iterations, 'window_size': window_size,
						'reduction_factor': reduction_factor, 'max_failed_vali': max_failed_vali,
						'test_metric': test_metric, 'test_cutoff': test_cutoff,
						'test_filename': test_filename})
	else:
		test_metric = task['test_metric_string']
		test_cutoff = int(task['test_cutoff'])
        test_filename = task['test_filename']
        if '/' in test_filename:
			test_filename = test_filename.rpartition('/')[2]
        model_filename = task['model_filename']
        if '/' in model_filename:
			model_filename = model_filename.rpartition('/')[2]
        return json.dumps({'test_metric':test_metric, 'test_cutoff':test_cutoff,
						'test_filename':test_filename, 'model_filename':model_filename})
	
# get stream of a file to download
def get_filestream(session_name, task_name, file_type, file_subtype):
	stream = ''
	file_name = ''
	if file_type == 'train':
		if file_subtype == 'xml':
			file_name = 'model.xml'
		elif file_subtype == 'cpp':
			file_name = 'model.cpp'
		elif file_subtype == 'java':
			file_name = 'Model.java'
		elif file_subtype == 'python2':
			file_name = 'model.py'
		elif file_subtype == 'python3':
			file_name = 'model_py3.py'
		stream = s3speaker.download_stream((session_name + '/' + task_name + '/model/' + file_name).replace('/', '#'))
	elif file_type == 'test':
		file_name = 'scores.txt'
		stream = s3speaker.download_stream((session_name + '/' + task_name + '/test/' + file_name).replace('/', '#'))
	elif file_type == 'fast_scoring':
		if file_subtype == 'cpp':
			file_name = 'model.cpp'
		elif file_subtype == 'java':
			file_name = 'Model.java'
		elif file_subtype == 'python2':
			file_name = 'model.py'
		elif file_subtype == 'python3':
			file_name = 'model_py3.py'
		stream = s3speaker.download_stream((session_name + '/model/' + file_name).replace('/', '#'))
	else:
		file_name = 'code.c'
		stream = s3speaker.download_stream((session_name + '/' + task_name + '/fast_scoring/' + file_name).replace('/', '#'))
	return [stream, file_name]

##################################
# FUNCTIONS FOR PREFERENCES PAGE #
##################################

def get_preferences():
	[num_instances, mail_address] = dbconnector.get_preferences()
	return json.dumps({'ninst':num_instances, 'mail':mail_address})

def put_preferences(num_instances, mail_address):
	outcome = dbconnector.update_preferences(num_instances, mail_address)
	return json.dumps({'outcome':outcome})	

########################################
# FUNCTIONS FOR CHOOSING FILES FROM S3 #
########################################

def get_S3_files_list():
	list = s3speaker.get_files_list()
	return json.dumps({'total':len(list), 'files_list':list}, sort_keys = False, indent = 4)