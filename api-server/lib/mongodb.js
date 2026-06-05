const { MongoClient } = require('mongodb');

let client;

module.exports = async function clientPromise() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (client && client.topology && client.topology.isConnected()) return client;
  client = new MongoClient(process.env.MONGODB_URI, {});
  await client.connect();
  return client;
};
