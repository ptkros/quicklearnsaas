import os, xmltodict

##########
# CONFIG #
##########

# get configuration directory (starting from the current one)
cwd = os.getcwd()
main_path = '/QuickLearnSaaS/'
cfg_filepath = cwd[0: cwd.rfind(main_path) + len(main_path)] + '/config/config.xml'

def get_config():
    # obtain global configuration
    config_file = open(cfg_filepath)
    config = xmltodict.parse(config_file.read())
    config_file.close()
    return config['QuickLearnConfig']