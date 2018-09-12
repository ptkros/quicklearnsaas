The aim of this project is to study, to design and to develop a Software as a Service (SaaS) for a cloud environment that is able to serve, concurrently and efficiently, requests over the web for the generation and testing of ranking models for information retrieval systems. The project is based on [Quickrank](https://github.com/hpclab/quickrank) and [SB Admin 2](https://github.com/BlackrockDigital/startbootstrap-sb-admin-2). Detailed information can be found [here](https://drive.google.com/file/d/1oWt94Xi_4i0oIiUAy3pmiBkf-9CnuuDy/view).

# Source code guide

The main implementation code can be found in the following files/folders:
   * [site/main.py](https://github.com/ptkros/quicklearnsaas/blob/master/site/main.py)
   * [site/python](https://github.com/ptkros/quicklearnsaas/tree/master/site/python)
   * [site/static/pages](https://github.com/ptkros/quicklearnsaas/tree/master/site/static/pages)
   * [site/static/js_custom](https://github.com/ptkros/quicklearnsaas/tree/master/site/static/js_custom)
   * [quickrank/src/intermediary.cc](https://github.com/ptkros/quicklearnsaas/blob/master/quickrank/src/intermediary.cc)
   * [quickrank/src/quicklearn.cc](https://github.com/ptkros/quicklearnsaas/blob/master/quickrank/src/quicklearn.cc)
   * [quickrank/src/DBConnector.cc](https://github.com/ptkros/quicklearnsaas/blob/master/quickrank/src/DBConnector.cc)
    
# Deployment guide

All of these commands are intended to be executed from this directory.
On Ubuntu Linux:

1. install dependencies:
    * sudo apt-get install software-properties-common python-software-properties build-essential

2. install and configure Tomcat:
    * sudo apt-get install tomcat7 tomcat7-admin
    * customize setup/tomcat/tomcat-users.xml if needed
    * sudo cp setup/tomcat/tomcat-users.xml /etc/tomcat7/tomcat-users.xml
    * sudo chmod 0644 /etc/tomcat7/tomcat-users.xml
    * sudo service tomcat7 restart

3. download and deploy LittleS3:
    * wget https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/littles3/littleS3-2.3.0.war
    * curl -T littleS3-2.3.0.war "http://tomcat_managername:tomcat_managerpwd@localhost:8080/manager/text/deploy?path=/littleS3&update=true"
    (where tomcat_managername and tomcat_managerpwd are the ones defined in toncat-users.xml)

4. configure LittleS3:
    * customize configuration files in setup/littleS3/ if needed
    * sudo chmod 0644 setup/littleS3/StorageEngine-servlet.xml && sudo cp setup/littleS3/StorageEngine-servlet.xml /var/lib/tomcat7/webapps/littleS3/WEB-INF/classes/StorageEngine-servlet.xml
    * sudo chmod 0644 setup/littleS3/StorageEngine.properties && sudo cp setup/littleS3/StorageEngine.properties /var/lib/tomcat7/webapps/littleS3/WEB-INF/classes/StorageEngine.properties
    * sudo chmod 0644 setup/littleS3/users.config && sudo cp setup/littleS3/users.config /var/lib/tomcat7/webapps/littleS3/WEB-INF/classes/users.config
    * create the folder that is specified in StorageEngine.properties as storageLocation parameter, and assign permissions of reading and writing on it to tomcat7 group with chown

5. create the bucket for QuickLearn SaaS:
    * curl --request PUT "http://localhost:8080/littleS3/quicklearnsaas"

6. install g++ 4.9:
    * sudo apt-get install g++-4.9

7. install Boost libraries
    * sudo apt-get install libboost-all-dev

8. install ZeroMQ library
    * wget http://download.zeromq.org/zeromq-4.0.5.tar.gz
    * tar -zxf zeromq-4.0.5.tar.gz
    * cd zeromq-4.0.5 && ./configure && make
    * sudo make install
    * sudo ldconfig

9. install Python tools
    * sudo apt-get install python-pip python-setuptools python-pycurl

10. install Python modules (using Pip and requirements.txt)
    * pip install -r setup/python/requirements.txt

11. install Celery and Redis broker
    * sudo apt-get install redis-server
    * pip install -U celery

12. install MySQL database and tools
    * sudo apt-get install mysql-common mysql-server mysql-client libmysqlclient-dev libmysql++-dev python-mysqldb

13. create quickrank database in MySQL
    * mysql < mysql/quicklearnDatabase.sql -u mysql_username -pmysql_password
    (where mysql_username and mysql_password are the parameters of the step above)

14. compile and install the back-end part as a Python module
    * python setup.py build
    * sudo python setup.py install

15. set proper configurations in config/config.xml

16. run a Celery instance
    * cd site
    * celery -A main.celery worker
        * If you want, you can manually set the number of workers as x with: celery -A main.celery worker --concurrency=x

17. run Python application
    * cd site
    * python main.py

# Annotations:

The notification service has been tested with Gmail only. Anyway, it should work for any mail provider that makes use of TLS.

# Contributors:

"Luigi Caiazza" <lcaiazza88@gmail.com>

