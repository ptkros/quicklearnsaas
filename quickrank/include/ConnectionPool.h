#include <mysql++.h>
#include <unistd.h>

// Define a concrete ConnectionPool derivative.
class SimpleConnectionPool : public mysqlpp::ConnectionPool
{
public:

    // The object's only constructor
    SimpleConnectionPool(std::string db, std::string address, std::string username, std::string password, int port) :
    conns_in_use_(0), db(db), address(address), username(username), password(password), port(port) {}

    // The object's destructor
    ~SimpleConnectionPool()
    {
        clear();
    }

    /* Test if the connection pool is properly connected. The following steps are performed here:
     * 1. a temporarily testing connection is defined;
     * 2A. if it is created successfully, a proper function of mysqlpp::Connection is performed: it checks if
     * connection was established successfully;
     * 2B. otherwise, the driver throws a fault, and this event is considered as a bad output;
     * 3. finally, the eventual testing connection is destroyed, to let its resources be free and available to
     * the other "functional" connections.
     * */
    bool test_connection() {
    	bool outcome = true;
    	mysqlpp::Connection* test;
    	try {
    		test = create();
        	if(!test->connected()) {
        		outcome = false;
        	}
        	destroy(test);
    	} catch(mysqlpp::ConnectionFailed &exception) {
    		std::cerr << "Connection to DB failed! The following exception was thrown:" << std::endl;
    		std::cerr << exception.what() << std::endl;
    		outcome = false;
    	}
    	return outcome;
    }

    // Do a simple form of in-use connection limiting: wait to return
    // a connection until there are a reasonably low number in use
    // already.  Can't do this in create() because we're interested in
    // connections actually in use, not those created.  Also note that
    // we keep our own count; ConnectionPool::size() isn't the same!
    mysqlpp::Connection* grab()
    {
    	while (conns_in_use_ > 3) {
            sleep(1);
        }
    	++conns_in_use_;
        return mysqlpp::ConnectionPool::grab();
    }

    // Other half of in-use conn count limit
    void release(const mysqlpp::Connection* conn)
    {
        mysqlpp::ConnectionPool::release(conn);
        --conns_in_use_;
    }

protected:
    // Superclass overrides
    mysqlpp::Connection* create()
    {
        // Create connection using the parameters we were passed upon
        // creation.
    	return new mysqlpp::Connection(db.data(), address.data(), username.data(), password.data(), port);
    }

    void destroy(mysqlpp::Connection* cp)
    {
        // Our superclass can't know how we created the Connection, so
        // it delegates destruction to us, to be safe.
    	delete cp;
    }

    unsigned int max_idle_time()
    {
        // Set our idle time at 15 seconds.
        return 15;
    }
private:
    // Number of connections currently in use
    unsigned int conns_in_use_;

    // Connection parameters
    std::string db;
    std::string address;
    std::string username;
    std::string password;
    unsigned int port;
};
