# Getting Started with CouchDB
### Install on linux Debian/Ubuntu:
1. curl -L https://couchdb.apache.org/repo/bintray-pubkey.asc \ | sudo apt-key add -
2. sudo apt-get update && sudo apt-get install couchdb
3. sudo apt-get install software-properties-common -y
4. sudo add-apt-repository ppa:couchdb/stable -y
5. sudo apt-get update
6. sudo apt-get install curl -y
7. curl localhost:5984
8. curl -X PUT localhost:5984/new_database
9. stop couchdb
  * Note: it fails so the next lines will take care of that.
10. sudo dpkg-divert --local --rename --add /sbin/initctl
11. sudo ln -s /bin/true /sbin/initctl
12. stop couchdb
13. sudo chown -R couchdb:couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
14. sudo chmod -R 0770 /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
15. start couchdb
16. open your browser and navigate too:
* localhost:5984/_utils/
17. On bottom right you should see Everyone is admin.  Click fix this to set up an admin.

--------------------------------------------------------------------------------