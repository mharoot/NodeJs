#Connection Pooling

A Connection Pool is a cache of database connections maintained by the driver so that connections can be re-used when new connections to the database are required. To reduce the number of connection pools created by your application, we recommend calling MongoClient.connect once and reusing the database variable returned by the callback.