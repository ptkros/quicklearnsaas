import os, errno, thread
from flask import Flask, render_template, request, make_response
from celery import Celery

# import modules under "python" folder
import sys
sys.path.insert(0, 'python')
import manager, s3speaker, confreader

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'

app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

@app.route('/', methods=['GET'])
def invoke():
    return render_template('index.html')

@app.route('/dashboard', methods=['GET'])
def compile_dashboard():
    return manager.get_dashboard_data()

@app.route('/s3/<operation>', methods=['GET'])
def queryS3(operation):
    return manager.get_S3_files_list()

@app.route('/preferences', methods=['GET', 'POST'])
def preferences():
    if request.method == 'GET':
        return manager.get_preferences()
    else:
        num_instances = int(request.form['ninst'])
        mail_address = request.form['mail']
        manager.put_preferences(num_instances, mail_address)
        return render_template('index.html')
    
@app.route('/dv/<sType>/sessions/<dvRes>', methods=['GET'])
def get_sessions(sType, dvRes):
    if dvRes == 'datatables':
        draw = request.args.get('draw')
        order_column_index = int(request.args.get('order[0][column]'))
        order_direction = request.args.get('order[0][dir]')
        requested_length = int(request.args.get('length'))
        requested_start = request.args.get('start')
        requested_filter = request.args.get('search[value]')
        return manager.get_sessions_dt(sType, draw, order_column_index, order_direction, requested_length, requested_start, requested_filter)
    elif dvRes == 'pie':
        return manager.get_sessions_pie(sType)
    elif dvRes == 'bars':
        return manager.get_sessions_bars(sType)
    
@app.route('/dv/<sType>/sessions/<session_name>/<dvRes>', methods=['GET'])
def query_session_tasks(sType, session_name, dvRes):
    if dvRes == 'datatables':
        draw = request.args.get('draw')
        order_column_index = int(request.args.get('order[0][column]'))
        order_direction = request.args.get('order[0][dir]')
        requested_length = int(request.args.get('length'))
        requested_start = request.args.get('start')
        requested_filter = request.args.get('search[value]')
        return manager.get_tasks_dt(sType, session_name, draw, order_column_index, order_direction, requested_length, requested_start, requested_filter)
    elif dvRes == 'donut':
        return manager.get_tasks_donut(session_name)    
    
@app.route('/dv/training/sessions/<session_name>/tasks/<task_name>/line', methods=['GET'])
def query_session_task(session_name, task_name):
    return manager.get_session_task(session_name, task_name)

@app.route('/dv/<sType>/sessions/<session_name>/tasks/<task_name>/detailstable', methods=['GET'])
def query_task_details(sType, session_name, task_name):
    return manager.get_task_details(sType, session_name, task_name)

# binding for "training" page
@app.route('/training/quicklearn', methods=['POST'])
def submit_training():
    # a call to the manager for naming this new session, useful for persistence
    session_name = manager.generate_session_name()
    # set a new physical path for this session
    session_path = app.config['UPLOAD_FOLDER'] + session_name + '/'
    # hidden parameter for knowing the number of requested tasks
    num_tasks = int(request.form['ntasks'])
    containers = [None] * (num_tasks)
    # create a container for each task
    for i in range(num_tasks):
        # set a physical input file path for this task
        input_path = session_path + 'inputs/Task' + str(i + 1) + '/'
        # set a physical output file path for this task
        output_path = session_path + 'outputs/Task' + str(i + 1) + '/'
        # process request details
        training_task = True
        validation_task = request.form['vali_chkboxVal' + str(i + 1)]
        if validation_task != '':
            validation_task = True
        else:
            validation_task = False
        testing_task = request.form['test_chkboxVal' + str(i + 1)]
        if testing_task != '':
            testing_task = True
        else:
            testing_task = False
        # process request parameters
        # --algo
        algorithm_string = request.form['algorithm_string' + str(i + 1)]
        # --train-metric
        train_metric_string = request.form['train_metric_string' + str(i + 1)]
        # --train-cutoff
        train_cutoff = request.form['train_cutoff' + str(i + 1)]
        if train_cutoff != '':
            train_cutoff = int(train_cutoff)
        else:
            train_cutoff = 10
        # --partial
        partial_save = request.form['partial_save' + str(i + 1)]
        if partial_save != '':
            partial_save = int(partial_save)
        else:
            partial_save = 100
        # --train -> INPUT FILE
        #/------
        train_path = input_path + 'train/'
        create_path(train_path)
        training_file_remote = request.form['training_file_remote' + str(i + 1)]
        if training_file_remote != '':
            file_name = training_file_remote.replace('#', '/').rpartition('/')
            if file_name[2] != '':
                file_name = file_name[2]
            else:
                file_name = training_file_remote
            s3speaker.download_file(training_file_remote, train_path + file_name)
            training_filename = train_path + file_name
        else:
            training_filename = request.files['training_filename' + str(i + 1)].filename
            training_file = request.files['training_filename' + str(i + 1)]
            training_file.save(os.path.join(train_path, training_filename))
            training_filename = train_path + training_filename
            store_training_file = request.form['load_trainfile' + str(i + 1)]
            if store_training_file != '':
                upload_on_S3.delay(session_name + '%23' + train_path.rpartition('inputs/')[2].replace('/', '%23'), training_filename)
        #------/
        # --vali -> INPUT FILE
        #/------
        validation_filename = ''
        if validation_task:
            vali_path = input_path + 'vali/'
            create_path(vali_path)
            validation_file_remote = request.form['validation_file_remote' + str(i + 1)]
            if validation_file_remote != '':
                file_name = validation_file_remote.replace('#', '/').rpartition('/')
                if file_name[2] != '':
                    file_name = file_name[2]
                else:
                    file_name = validation_file_remote
                s3speaker.download_file(validation_file_remote, vali_path + file_name)
                validation_filename = vali_path + file_name
            else:
                validation_filename = request.files['validation_filename' + str(i + 1)].filename
                validation_file = request.files['validation_filename' + str(i + 1)]
                validation_file.save(os.path.join(vali_path, validation_filename))
                validation_filename = vali_path + validation_filename
                store_validation_file = request.form['load_valifile' + str(i + 1)]
                if store_validation_file != '':
                    upload_on_S3.delay(session_name + '%23' + vali_path.rpartition('inputs/')[2].replace('/', '%23'), validation_filename)
        #------/
        # --features -> INPUT FILE
        #/------
        features_path = input_path + 'features/'
        create_path(features_path)
        features_file_remote = request.form['features_file_remote' + str(i + 1)]
        if features_file_remote != '':
            file_name = features_file_remote.replace('#', '/').rpartition('/')
            if file_name[2] != '':
                file_name = file_name[2]
            else:
                file_name = features_file_remote
            s3speaker.download_file(features_file_remote, features_path + file_name)
            features_filename = features_path + file_name
        else:
            features_filename = request.files['features_filename' + str(i + 1)].filename
            features_file = request.files['features_filename' + str(i + 1)]
            features_file.save(os.path.join(features_path, features_filename))
            features_filename = features_path + features_filename
            store_features_file = request.form['load_featfile' + str(i + 1)]
            print(store_features_file)
            if store_features_file != '':
                upload_on_S3.delay(session_name + '%23' + features_path.rpartition('inputs/')[2].replace('/', '%23'), features_filename)
        #------/
        # --model -> OUTPUT FILE
        model_path = output_path + 'model/'
        create_path(model_path)
        model_filename = model_path + 'model.xml'
        # --num-trees
        ntrees = request.form['ntrees' + str(i + 1)]
        if ntrees != '':
            ntrees = int(ntrees)
        else:
            ntrees = 1000
        # --shrinkage
        shrinkage = request.form['shrinkage' + str(i + 1)]
        if shrinkage != '':
            shrinkage = float(shrinkage)
        else:
            shrinkage = 0.100000001
        # --num-thresholds
        nthresholds = request.form['nthresholds' + str(i + 1)]
        if nthresholds != '':
            nthresholds = int(nthresholds)
        else:
            nthresholds = 0
        # --min-leaf-support
        minleafsupport = request.form['minleafsupport' + str(i + 1)]
        if minleafsupport != '':
            minleafsupport = int(minleafsupport)
        else:
            minleafsupport = 1
        # --end-after-rounds
        esr = request.form['esr' + str(i + 1)]
        if esr != '':
            esr = int(esr)
        else:
            esr = 100
        # --num-leaves
        ntreeleaves = request.form['ntreeleaves' + str(i + 1)]
        if ntreeleaves != '':
            ntreeleaves = int(ntreeleaves)
        else:
            ntreeleaves = 10
        # --tree-depth
        treedepth = request.form['treedepth' + str(i + 1)]
        if treedepth != '':
            treedepth = int(treedepth)
        else:
            treedepth = 3
        # --num-samples
        num_points = request.form['num_points' + str(i + 1)]
        if num_points != '':
            num_points = int(num_points)
        else:
            num_points = 21
        # --max-iterations
        max_iterations = request.form['max_iterations' + str(i + 1)]
        if max_iterations != '':
            max_iterations = int(max_iterations)
        else:
            max_iterations = 100
        # --window-size
        window_size = request.form['window_size' + str(i + 1)]
        if window_size != '':
            window_size = float(window_size)
        else:
            window_size = 10
        # --reduction-factor
        reduction_factor = request.form['reduction_factor' + str(i + 1)]
        if reduction_factor != '':
            reduction_factor = float(reduction_factor)
        else:
            reduction_factor = 0.949999988
        # --max-failed-vali
        max_failed_vali = request.form['max_failed_vali' + str(i + 1)]
        if max_failed_vali != '':
            max_failed_vali = int(max_failed_vali)
        else:
            max_failed_vali = 20
        # --test-metric
        test_metric_string = request.form['test_metric_string' + str(i + 1)]
        # --test-cutoff
        test_cutoff = request.form['test_cutoff' + str(i + 1)]
        if test_cutoff != '':
            test_cutoff = int(test_cutoff)
        else:
            test_cutoff = 10
        # --test -> INPUT FILE
        #/------
        test_filename = ''
        if testing_task:
            test_path = input_path + 'test/'
            create_path(test_path)
            testing_file_remote = request.form['testing_file_remote' + str(i + 1)]
            if testing_file_remote != '':
                file_name = testing_file_remote.replace('#', '/').rpartition('/')
                if file_name[2] != '':
                    file_name = file_name[2]
                else:
                    file_name = testing_file_remote
                s3speaker.download_file(testing_file_remote, test_path + file_name)
                test_filename = test_path + file_name
            else:
                test_filename = request.files['test_filename' + str(i + 1)].filename
                test_file = request.files['test_filename' + str(i + 1)]
                test_file.save(os.path.join(test_path, test_filename))
                test_filename = test_path + test_filename
                store_testing_file = request.form['load_testfile' + str(i + 1)]
                if store_testing_file != '':
                    upload_on_S3.delay(session_name + '%23' + test_path.rpartition('inputs/')[2].replace('/', '%23'), test_filename)
        #------/
        # --scores -> OUTPUT FILE
        scores_filename = ''
        if testing_task:
            scores_path = output_path + 'test/'
            create_path(scores_path)
            scores_filename = scores_path + 'scores.txt'
        # --dump-model
        xml_filename = ''
        # --dump-type
        model_code_type = ''
        # --dump-code
        c_filename = ''
        container = {'algorithm_string':algorithm_string, 'train_metric_string':train_metric_string,
                     'train_cutoff':train_cutoff, 'partial_save':partial_save,
                     'training_filename':training_filename, 'validation_filename':validation_filename,
                     'features_filename':features_filename, 'model_filename':model_filename,
                     'ntrees':ntrees, 'shrinkage':shrinkage, 'nthresholds':nthresholds,
                     'minleafsupport':minleafsupport, 'esr':esr, 'ntreeleaves':ntreeleaves,
                     'treedepth':treedepth, 'num_points':num_points, 'max_iterations':max_iterations,
                     'window_size':window_size, 'reduction_factor':reduction_factor, 'max_failed_vali':max_failed_vali,
                     'test_metric_string':test_metric_string, 'test_cutoff':test_cutoff, 'test_filename':test_filename,
                     'scores_filename':scores_filename, 'xml_filename':xml_filename, 'c_filename':c_filename,
                     'model_code_type':model_code_type}
        containers[i] = container
    call_manager.delay('training', session_name, session_path, containers)
    #call_manager('training', session_name, session_path, containers)
    return render_template('index.html')

# binding for "testing" page
@app.route('/testing/quicklearn', methods=['POST'])
def submit_testing():
    # a call to the manager for naming this new session, useful for persistence
    session_name = manager.generate_session_name()
    # set a new physical path for this session
    session_path = app.config['UPLOAD_FOLDER'] + session_name + '/'
    # hidden parameter for knowing the number of requested tasks
    num_tasks = int(request.form['ntasks'])
    containers = [None] * (num_tasks)
    # create a container for each task
    for i in range(num_tasks):
        # set a physical input file path for this task
        input_path = session_path + 'inputs/Task' + str(i + 1) + '/'
        # set a physical output file path for this task
        output_path = session_path + 'outputs/Task' + str(i + 1) + '/'
        # process request details
        training_task = False
        validation_task = False
        testing_task = True
        # --model -> INPUT FILE
        model_filename = request.files['model_filename' + str(i + 1)].filename
        model_file_remote = request.form['model_file_remote' + str(i + 1)]
        #/------
        model_path = input_path + 'model/'
        create_path(model_path)
        if model_file_remote != '':
            file_name = model_file_remote.replace('#', '/').rpartition('/')
            if file_name[2] != '':
                file_name = file_name[2]
            else:
                file_name = model_file_remote
            s3speaker.download_file(model_file_remote, model_path + file_name)
            model_filename = model_path + file_name
        else:
            model_file = request.files['model_filename' + str(i + 1)]
            model_file.save(os.path.join(model_path, model_filename))
            model_filename = model_path + model_filename
            store_model_file = request.form['load_modelfile' + str(i + 1)]
            if store_model_file != '':
                upload_on_S3.delay(session_name + '%23' + model_path.rpartition('inputs/')[2].replace('/', '%23'), model_filename)
        #------/
        # --test-metric
        test_metric_string = request.form['test_metric_string' + str(i + 1)]
        # --test-cutoff
        test_cutoff = request.form['test_cutoff' + str(i + 1)]
        if test_cutoff != '':
            test_cutoff = int(test_cutoff)
        else:
            test_cutoff = 10
        # --test -> INPUT FILE
        #/------
        test_path = input_path + 'test/'
        create_path(test_path)
        testing_file_remote = request.form['testing_file_remote' + str(i + 1)]
        if testing_file_remote != '':
            file_name = testing_file_remote.replace('#', '/').rpartition('/')
            if file_name[2] != '':
                file_name = file_name[2]
            else:
                file_name = testing_file_remote
            s3speaker.download_file(testing_file_remote, test_path + file_name)
            test_filename = test_path + file_name
        else:
            test_filename = request.files['test_filename' + str(i + 1)].filename
            test_file = request.files['test_filename' + str(i + 1)]
            test_file.save(os.path.join(test_path, test_filename))
            test_filename = test_path + test_filename
            store_testing_file = request.form['load_testfile' + str(i + 1)]
            if store_testing_file != '':
                upload_on_S3.delay(session_name + '%23' + test_path.rpartition('inputs/')[2].replace('/', '%23'), test_filename)
        #------/
        # --scores -> OUTPUT FILE
        scores_path = output_path + 'test/'
        create_path(scores_path)
        scores_filename = scores_path + 'scores.txt'
        container = {'algorithm_string':'', 'train_metric_string':'',
                     'train_cutoff':0, 'partial_save':0,
                     'training_filename':'', 'validation_filename':'',
                     'features_filename':'', 'model_filename':model_filename,
                     'ntrees':0, 'shrinkage':0, 'nthresholds':0,
                     'minleafsupport':0, 'esr':0, 'ntreeleaves':0,
                     'treedepth':0, 'num_points':0, 'max_iterations':0,
                     'window_size':0, 'reduction_factor':0, 'max_failed_vali':0,
                     'test_metric_string':test_metric_string, 'test_cutoff':test_cutoff, 'test_filename':test_filename,
                     'scores_filename':scores_filename, 'xml_filename':'', 'c_filename':'',
                     'model_code_type':''}
        containers[i] = container
    call_manager.delay('testing', session_name, session_path, containers)
    #call_manager('testing', session_name, session_path, containers)
    return render_template('index.html')

# binding for "fast scoring" page
@app.route('/fastscoring/quicklearn', methods=['POST'])
def submit_fast_scoring():
    # a call to the manager for naming this new session
    session_name = manager.generate_session_name()
    # set a new physical path for this session
    session_path = app.config['UPLOAD_FOLDER'] + session_name + '/'
    # set a physical input file path for this task
    input_path = session_path + 'inputs/'
    create_path(input_path)
    # set a physical output file path for this task
    output_path = session_path + 'outputs/model/'
    create_path(output_path)
    # process request details
    containers = [None] * (1)
    # --dump-model
    xml_model_filename = request.files['xml_model_filename'].filename
    xml_model_file = request.files['xml_model_filename']
    xml_model_file.save(os.path.join(input_path, xml_model_filename))
    xml_model_filename = input_path + xml_model_filename
    # --dump-type
    language = request.form['pr_language']
    container = {'algorithm_string':'', 'train_metric_string':'',
                'train_cutoff':0, 'partial_save':0,
                'training_filename':'', 'validation_filename':'',
                'features_filename':'', 'model_filename':'',
                'ntrees':0, 'shrinkage':0, 'nthresholds':0,
                'minleafsupport':0, 'esr':0, 'ntreeleaves':0,
                'treedepth':0, 'num_points':0, 'max_iterations':0,
                'window_size':0, 'reduction_factor':0, 'max_failed_vali':0,
                'test_metric_string':'', 'test_cutoff':0, 'test_filename':'',
                'scores_filename':'', 'xml_filename':xml_model_filename, 'c_filename':'',
                'model_code_type':language}
    containers[0] = container
    manager.call_quicklearn('fast_scoring', session_name, session_path, containers)
    return download_file(session_name, '', 'fast_scoring', language)

def create_path(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise
        
# this binding is called for every download requested by the user
@app.route('/dv/sessions/<nameSession>/tasks/<nameTask>/download/<type>/<subtype>', methods=['GET'])
def download_file(nameSession, nameTask, type, subtype):
    [stream, file_name] = manager.get_filestream(nameSession, nameTask, type, subtype)
    response = make_response(stream)
    response.headers['Content-Disposition'] = 'attachment; filename=' + file_name
    return response
    
# celery -A main.celery worker --concurrency=3
@celery.task
def call_manager(session_type, session_name, session_path, containers):
    manager.call_quicklearn(session_type, session_name, session_path, containers)

@celery.task
def upload_on_S3(folder, filename):
    s3speaker.upload_file(folder, filename)

if __name__ == '__main__':
    # obtain configuration parameters
    config = confreader.get_config()['RESTService']
    port = int(config['EndpointPort'])
    app.run(host='0.0.0.0', port=port)
