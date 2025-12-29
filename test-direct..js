import mongoose from 'mongoose';

// Direct IP connection (bypasses DNS)
const hosts = [
  'cluster0-shard-00-00.9ed3zt8.mongodb.net:27017',
  'cluster0-shard-00-01.9ed3zt8.mongodb.net:27017',
  'cluster0-shard-00-02.9ed3zt8.mongodb.net:27017'
];

const username = 'muhammedmudassir40_db_user';
const password = 'Safi111';
const database = '2Wolf';

const uri = `mongodb://${username}:${password}@${hosts.join(',')}/${database}?ssl=true&authSource=admin&retryWrites=true&w=majority`;

console.log('Testing direct connection...');
console.log('Connecting to:', uri.replace(password, '****'));

mongoose.connect(uri, { 
  serverSelectionTimeoutMS: 60000,
  family: 4
})
.then(() => {
  console.log('✅ SUCCESS! Connected to MongoDB');
  console.log('Database:', mongoose.connection.name);
  process.exit(0);
})
.catch((err) => {
  console.error('❌ FAILED:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});