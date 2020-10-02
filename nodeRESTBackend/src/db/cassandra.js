const cassandra = require('cassandra-driver');
const config = require('../config.json');

const client = new cassandra.Client({
  contactPoints: [config.cassandraContactPoint],
  localDataCenter: config.cassandraLocalDataCenter,
  keyspace: config.cassandraKeyspace,
});

module.exports = client;
