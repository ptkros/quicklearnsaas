import os, requests, xmltodict, confreader

##########
# CONFIG #
##########

# obtain configuration parameters
config = confreader.get_config()['S3']

endpoint = config['EndpointAddress'] + ':' + config['EndpointPort'] + '/'
S3_app_name = config['ApplicationName']
bucket_name = config['BucketName']
base_url = 'http://' + endpoint + S3_app_name + '/' + bucket_name + '/'

############
# DOWNLOAD #
############

def download_file(file_key, download_file_URI):
    stream = download_stream(file_key)
    out_file = open(download_file_URI, 'w')
    out_file.write(stream)
    out_file.close()

def download_stream(file_key):
    file_key = file_key.replace('#', '%23')
    url = base_url + file_key 
    stream = requests.get(url)
    return stream.text

##########
# UPLOAD #
##########

def upload_file(prefix_key, file):
    filename = file.rpartition('/')
    if filename[2] != '':
        filename = filename[2]
    else:
        filename = file
    with open(file) as fh:
        mydata = fh.read()
        response = requests.put(base_url + prefix_key + filename,
                data=mydata,                         
                params={'file': file}
        )
        if response.status_code == 200:
            print 'Done'
        else:
            print 'Undone'

def upload_folder(prefix, path):
    # TODO: remove the replacement of forward-slash with '#' when using Amazon S3
    for root, _, files in os.walk(path):
        for filename in files:
            if not prefix.endswith('outputs/'):
                prefix_key = (prefix + '/' + root.rpartition('outputs/')[2] + '/').replace('/', '%23')
            else:
                prefix_key = prefix.replace('/', '%23')
            upload_file(prefix_key, os.path.abspath(os.path.join(root, filename)))
            
############
# RETRIEVE #
############

def get_files_list():
    xml_list = requests.get(base_url).text
    dict = xmltodict.parse(xml_list)
    python_list = []
    parent_node = dict['ListBucketResult']
    # this boolean statement fails if there are 0 contents in S3
    if parent_node.has_key('Contents'):
        parent_node = parent_node['Contents']
        try:
            # this works when there are at least 2 contents in S3
            for content in parent_node:
                python_list.append({'file_name':content['Key'], 'file_length':long(content['Size'])})
        except (AttributeError, TypeError):
            # this happens when there is exactly 1 content in S3
            python_list.append({'file_name':parent_node['Key'], 'file_length':long(parent_node['Size'])})
    return python_list