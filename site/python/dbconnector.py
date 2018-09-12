from sqlalchemy import create_engine, exc, func, and_, or_, asc, desc
from sqlalchemy.sql import insert, select, update
from sqlalchemy.sql.schema import MetaData
import traceback, confreader

##########
# CONFIG #
##########

# obtain configuration parameters
config = confreader.get_config()['DB']

db_username = config['Username']
db_password = config['Password']
db_address = config['EndpointAddress']
db_port = config['EndpointPort']
db_name = config['Name']

# LEGGERE http://docs.sqlalchemy.org/en/latest/core/pooling.html
engine = create_engine('mysql://' + db_username + ':' + db_password + '@' + db_address + ':'
                       + db_port + '/' + db_name + '?charset=utf8&use_unicode=0',
                       pool_recycle=3600)

# useful for tables retrieval
metadata = MetaData()
metadata.reflect(engine)

# tables retrieval
# retrieve session table
session_table = metadata.tables.get('session')
# retrieve task table
task_table = metadata.tables.get('task')
# retrieve iteration table
iter_table = metadata.tables.get('iteration')
# retrieve preferences table
pref_table = metadata.tables.get('preferences')

############
#  GLOBAL  #
############

def count_all():
    try:
        connection = engine.connect()
        # count the total number of sessions
        sel = select([func.count()]).select_from(session_table)
        result = connection.execute(sel)
        number_of_sessions = result.fetchone()['count_1']
        result.close()
        # count the total number of tasks
        sel = select([func.count()]).select_from(task_table)
        result = connection.execute(sel)
        number_of_tasks = result.fetchone()['count_1']
        result.close()
        return [int(number_of_sessions), int(number_of_tasks)]
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return [0, 0]

############
# SESSIONS #
############

def create_session(session_type, session_name, session_datetime):
    try:
        connection = engine.connect()
        # insert a new session
        if session_type == 'training':
            ins = session_table.insert().values(name = session_name, training_session = True, status = 0, start_time = session_datetime)
        else:
            ins = session_table.insert().values(name = session_name, training_session = False, status = 0, start_time = session_datetime)
        connection.execute(ins)
        # retrieve ID assigned to the inserted session and return it
        return get_session_ID(session_name)
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return 0

def get_session_ID(session_name):
    try:
        connection = engine.connect()
        # retrieve ID assigned to the session and return it
        sel = select([session_table.c.ID]).where(session_table.c.name == session_name)
        result = connection.execute(sel)
        session_ID = result.fetchone()['ID']
        result.close()
        return session_ID
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return 0
    
def update_session(session_ID, end_time):
    # returns a boolean: True if the update is successful, False otherwise
    try:
        connection = engine.connect()
        # retrieve and update the session with the requested ID
        upd = session_table.update().where(session_table.c.ID == session_ID).values(status = 1, start_time = session_table.c.start_time, end_time = end_time)
        connection.execute(upd)
        return True
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return False
    
def get_sessions(sType, order_column_index, order_direction, limit, offset, filter):
    try:
        connection = engine.connect()
        # retrieve column to order
        if order_column_index == 1:
            column_to_order = session_table.c.start_time
        elif order_column_index == 2:
            column_to_order = session_table.c.end_time
        else:
            column_to_order = session_table.c.name
        # retrieve and return (filtered) sessions
        if filter.strip() != '':
            if order_direction == 'asc':
                if sType == 'training':
                    sel = select([session_table]).where(and_(session_table.c.training_session == True, or_(session_table.c.name.like('%' + filter + '%'), session_table.c.start_time.like('%' + filter + '%'), session_table.c.end_time.like('%' + filter + '%')))).limit(limit).offset(offset).order_by(column_to_order.asc())
                else:
                    sel = select([session_table]).where(and_(session_table.c.training_session == False, or_(session_table.c.name.like('%' + filter + '%'), session_table.c.start_time.like('%' + filter + '%'), session_table.c.end_time.like('%' + filter + '%')))).limit(limit).offset(offset).order_by(column_to_order.asc())
            else:
                if sType == 'training':
                    sel = select([session_table]).where(and_(session_table.c.training_session == True, or_(session_table.c.name.like('%' + filter + '%'), session_table.c.start_time.like('%' + filter + '%'), session_table.c.end_time.like('%' + filter + '%')))).limit(limit).offset(offset).order_by(column_to_order.desc())
                else:
                    sel = select([session_table]).where(and_(session_table.c.training_session == False, or_(session_table.c.name.like('%' + filter + '%'), session_table.c.start_time.like('%' + filter + '%'), session_table.c.end_time.like('%' + filter + '%')))).limit(limit).offset(offset).order_by(column_to_order.desc()) 
        else:
            if order_direction == 'asc':
                if sType == 'training':
                    sel = select([session_table]).where(session_table.c.training_session == True).limit(limit).offset(offset).order_by(column_to_order.asc())
                else:
                    sel = select([session_table]).where(session_table.c.training_session == False).limit(limit).offset(offset).order_by(column_to_order.asc())
            else:
                if sType == 'training':
                    sel = select([session_table]).where(session_table.c.training_session == True).limit(limit).offset(offset).order_by(column_to_order.desc())
                else:
                    sel = select([session_table]).where(session_table.c.training_session == False).limit(limit).offset(offset).order_by(column_to_order.desc())
        result = connection.execute(sel)
        sessions = []
        for row in result:
            status = row['status']
            if status:
                status = 'Completed'
            else:
                status = 'In progress'
            #start_time = row['start_time'].strftime('%A, %d %B %Y @ %H:%M:%S')
            start_time = row['start_time'].strftime('%c')
            end_time = row['end_time']
            if end_time != None:
                end_time = end_time.strftime('%c')
            sessions.append({'name': row['name'], 'start_time': start_time, 'end_time': end_time, 'status': status})
        result.close()
        return sessions
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return []

def count_filtered_sessions(sType, filter):
    try:
        connection = engine.connect()
        # count all sessions
        if sType == 'training':
            sel = select([func.count()]).where(session_table.c.training_session == True).select_from(session_table)
        else:
            sel = select([func.count()]).where(session_table.c.training_session == False).select_from(session_table)
        result = connection.execute(sel)
        total_sessions = result.fetchone()['count_1']
        result.close()
        # if a filter is given, count all filtered sessions
        if filter.strip() != '':
            if sType == 'training':
                sel = select([func.count()]).where(and_(session_table.c.training_session == True, or_(session_table.c.name.like('%' + filter + '%'), session_table.c.start_time.like('%' + filter + '%'), session_table.c.end_time.like('%' + filter + '%')))).select_from(session_table)
            else:
                sel = select([func.count()]).where(and_(session_table.c.training_session == False, or_(session_table.c.name.like('%' + filter + '%'), session_table.c.start_time.like('%' + filter + '%'), session_table.c.end_time.like('%' + filter + '%')))).select_from(session_table)
            result = connection.execute(sel)
            filtered_sessions = result.fetchone()['count_1']
            result.close()
        else:
            filtered_sessions = total_sessions
        return [total_sessions, filtered_sessions]
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return [0, 0]
    
def count_sessions(sType):
    try:
        connection = engine.connect()
        # retrieve sessions with status "in progress"
        if sType == 'training':
            sel = select([func.count()]).where(and_(session_table.c.status == 0, session_table.c.training_session == True)).select_from(session_table)
        else:
            sel = select([func.count()]).where(and_(session_table.c.status == 0, session_table.c.training_session == False)).select_from(session_table)
        result = connection.execute(sel)
        sessions_in_progress = result.fetchone()['count_1']
        result.close()
        # retrieve sessions with status "completed"
        if sType == 'training':
            sel = select([func.count()]).where(and_(session_table.c.status == 1, session_table.c.training_session == True)).select_from(session_table)
        else:
            sel = select([func.count()]).where(and_(session_table.c.status == 1, session_table.c.training_session == False)).select_from(session_table)
        result = connection.execute(sel)
        sessions_completed = result.fetchone()['count_1']
        result.close()
        return [int(sessions_in_progress), int(sessions_completed)]
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return [0, 0]

def count_sessions_in_range(sType, start_range, end_range):
    try:
        connection = engine.connect()
        # count sessions in progress in this time range
        if sType == 'training':
            sel = select([func.count()]).where(and_(session_table.c.training_session == True, session_table.c.status == 0, session_table.c.start_time >= start_range, session_table.c.start_time <= end_range)).select_from(session_table)
        else:
            sel = select([func.count()]).where(and_(session_table.c.training_session == False, session_table.c.status == 0, session_table.c.start_time >= start_range, session_table.c.start_time <= end_range)).select_from(session_table)
        result = connection.execute(sel)
        sessions_in_progress = result.fetchone()['count_1']
        result.close()
        # count sessions completed in this time range
        if sType == 'training':
            sel = select([func.count()]).where(and_(session_table.c.training_session == True, session_table.c.status == 1, session_table.c.end_time >= start_range, session_table.c.end_time <= end_range)).select_from(session_table)
        else:
            sel = select([func.count()]).where(and_(session_table.c.training_session == False, session_table.c.status == 1, session_table.c.end_time >= start_range, session_table.c.end_time <= end_range)).select_from(session_table)
        result = connection.execute(sel)
        sessions_completed = result.fetchone()['count_1']
        result.close()
        return [sessions_in_progress, sessions_completed]
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return [0, 0]

def count_session_tasks(session_name):
    try:
        connection = engine.connect()
        # get session ID
        session_ID = get_session_ID(session_name)
        # count tasks in progress
        sel = select([func.count()]).where(and_(task_table.c.session_ID == session_ID, task_table.c.status == 0)).select_from(task_table)
        result = connection.execute(sel)
        tasks_in_progress = result.fetchone()['count_1']
        result.close()
        # count completed tasks
        sel = select([func.count()]).where(and_(task_table.c.session_ID == session_ID, task_table.c.status == 1)).select_from(task_table)
        result = connection.execute(sel)
        tasks_completed = result.fetchone()['count_1']
        result.close()
        # count aborted tasks
        sel = select([func.count()]).where(and_(task_table.c.session_ID == session_ID, task_table.c.status == 2)).select_from(task_table)
        result = connection.execute(sel)
        tasks_aborted = result.fetchone()['count_1']
        result.close()
        return [tasks_in_progress, tasks_completed, tasks_aborted]
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return [0, 0, 0]

#########
# TASKS #
#########

def get_task_ID(session_ID, task_name):
    try:
        connection = engine.connect()
        sel = select([task_table.c.ID]).where(and_(task_table.c.session_ID == session_ID, task_table.c.name == task_name))
        result = connection.execute(sel)
        task_ID = result.fetchone()['ID']
        result.close()
        return task_ID
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return 0

def get_tasks(sType, session_name, order_column_index, order_direction, limit, offset, filter):
    try:
        connection = engine.connect()
        # retrieve column to order
        if sType == 'training':
            if order_column_index == 1:
                column_to_order = task_table.c.status
            elif order_column_index == 2:
                column_to_order = task_table.c.training_score
            elif order_column_index == 3:
                column_to_order = task_table.c.training_time
            elif order_column_index == 4:
                column_to_order = task_table.c.validation_score
            elif order_column_index == 5:
                column_to_order = task_table.c.validation_task
            elif order_column_index == 6:
                column_to_order = task_table.c.testing_task
            else:
                column_to_order = task_table.c.name
        elif sType == 'testing':
            if order_column_index == 1:
                column_to_order = task_table.c.status
            elif order_column_index == 2:
                column_to_order = task_table.c.testing_score
            else:
                column_to_order = task_table.c.name
        # get session ID
        session_ID = get_session_ID(session_name)
        # retrieve and return (filtered) tasks
        if filter.strip() != '':
            if order_direction == 'asc':
                sel = select([task_table]).where(and_(task_table.c.session_ID == session_ID, task_table.c.name.like('%' + filter + '%'))).limit(limit).offset(offset).order_by(column_to_order.asc())
            else:
                sel = select([task_table]).where(and_(task_table.c.session_ID == session_ID, task_table.c.name.like('%' + filter + '%'))).limit(limit).offset(offset).order_by(column_to_order.desc())
        else:
            if order_direction == 'asc':
                sel = select([task_table]).where(task_table.c.session_ID == session_ID).limit(limit).offset(offset).order_by(column_to_order.asc())
            else:
                sel = select([task_table]).where(task_table.c.session_ID == session_ID).limit(limit).offset(offset).order_by(column_to_order.desc())
        result = connection.execute(sel)
        sessions = []
        for row in result:
            name = row['name']
            status = int(row['status'])
            if status == 0:
                status = 'In progress'
            elif status == 1:
                status = 'Completed'
            else:
                status = 'Aborted'
            if sType == 'training':
                training_score = row['training_score']
                if training_score != None and training_score != '':
                    training_score = float(training_score)
                else:
                    training_score = ''
                training_time = row['training_time']
                if training_time != None and training_time != '':
                    training_time = float(training_time)
                else:
                    training_time = ''
                validation_score = row['validation_score']
                if validation_score != None and validation_score != '':
                    validation_score = float(validation_score)
                else:
                    validation_score = ''
                validation_task = bool(row['validation_task'])
                if validation_task:
                    validation_task = 'yes'
                else:
                    validation_task = 'no'
                testing_task = bool(row['testing_task'])
                if testing_task:
                    testing_task = 'yes'
                else:
                    testing_task = 'no'
                sessions.append({'name': name, 'status': status, 'training_score': training_score,
                        'training_time': training_time, 'validation_score': validation_score,
                        'validation_task': validation_task, 'testing_task': testing_task})
            else:
                testing_score = row['testing_score']
                if testing_score != None and testing_score != '':
                    testing_score = float(testing_score)
                else:
                    testing_score = ''
                sessions.append({'name': name, 'status': status, 'testing_score': testing_score})
        result.close()
        return sessions
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return []

def count_filtered_tasks(session_name, filter):
    try:
        connection = engine.connect()
        # get session ID
        session_ID = get_session_ID(session_name)
        # count all tasks
        sel = select([func.count()]).where(task_table.c.session_ID == session_ID).select_from(task_table)
        result = connection.execute(sel)
        total_tasks = result.fetchone()['count_1']
        result.close()
        # if a filter is given, count all filtered tasks
        if filter.strip() != '':
            sel = select([func.count()]).where(and_(task_table.c.session_ID == session_ID, or_(task_table.c.algorithm_string.like('%' + filter + '%'), task_table.c.train_metric_string.like('%' + filter + '%'), task_table.c.test_metric_string.like('%' + filter + '%'), task_table.c.training_filename.like('%' + filter + '%'), task_table.c.validation_filename.like('%' + filter + '%'), task_table.c.features_filename.like('%' + filter + '%'), task_table.c.model_filename.like('%' + filter + '%'), task_table.c.test_filename.like('%' + filter + '%')))).select_from(task_table)
            result = connection.execute(sel)
            filtered_tasks = result.fetchone()['count_1']
            result.close()
        else:
            filtered_tasks = total_tasks
        return [total_tasks, filtered_tasks]
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return [0, 0]
    
def get_score_values(session_name, task_name):
    try:
        connection = engine.connect()
        # get session ID
        session_ID = get_session_ID(session_name)
        # get task ID
        task_ID = get_task_ID(session_ID, task_name)
        # get values of iterations for task
        iters_values = []
        sel = select([iter_table]).where(iter_table.c.task_ID == task_ID).order_by(iter_table.c.number)
        result = connection.execute(sel)
        for row in result:
            validation_score = row['validation_score']
            if validation_score == None:
                validation_score = 0
            else:
                validation_score = float(validation_score)
            iters_values.append({'iter': int(row['number']), 'training_score': float(row['training_score']), 'validation_score': validation_score})
        result.close()
        return iters_values
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return []
    
# returns the entire row of the task
def get_task_row(session_name, task_name):
    try:
        connection = engine.connect()
        # get session ID
        session_ID = get_session_ID(session_name)
        # get task ID
        task_ID = get_task_ID(session_ID, task_name)
        sel = select([task_table]).where(task_table.c.ID == task_ID)
        result = connection.execute(sel)
        return result.fetchone()
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return []

def get_preferences():
    try:
        connection = engine.connect()
        # retrieve and return preferences
        sel = select([pref_table])
        result = connection.execute(sel)
        row = result.fetchone()
        result.close()
        return [int(row['num_instances']), row['mail_address']]
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return [0, '']
    
def update_preferences(num_instances_new, mail_address_new):
    # returns a boolean: True if the update is successful, False otherwise
    try:
        connection = engine.connect()
        # retrieve preferences
        sel = select([pref_table])
        result = connection.execute(sel)
        pref_row = result.fetchone()
        result.close()
        # update preferences
        upd = pref_table.update().where(pref_table.c.ID == pref_row['ID']).values(num_instances = num_instances_new, mail_address = mail_address_new)
        connection.execute(upd)
        return True
    except exc.SQLAlchemyError:
        print(traceback.format_exc())
        return False