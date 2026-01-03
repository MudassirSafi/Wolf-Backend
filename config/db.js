import mongoose from "mongoose";

const connectDB = async () => {
  // Determine which MongoDB to use
  const isProduction = process.env.NODE_ENV === 'production';
  
  let MONGO_URI;
  
  if (isProduction) {
    // Production: MUST use Atlas
    MONGO_URI = process.env.MONGO_URI;
    
    if (!MONGO_URI) {
      console.error('\n❌ CRITICAL ERROR: MONGO_URI not set in production!');
      console.error('Please add MONGO_URI to your environment variables on Render\n');
      process.exit(1);
    }
  } else {
    // Development: Use local MongoDB
    MONGO_URI = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/2Wolf';
  }

  const isLocal = MONGO_URI.includes('127.0.0.1') || MONGO_URI.includes('localhost');

  console.log('\n🔍 MongoDB Connection Info:');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Using:', isLocal ? '🏠 Local MongoDB (127.0.0.1:27017)' : '☁️ MongoDB Atlas');
  
  if (!isLocal) {
    console.log('Atlas Host:', MONGO_URI.split('@')[1]?.split('/')[0] || 'checking...');
  }
  console.log('');

  try {
    const options = isLocal 
      ? {
          serverSelectionTimeoutMS: 5000,
        }
      : {
          serverSelectionTimeoutMS: 60000,
          socketTimeoutMS: 60000,
          family: 4,
        };

    const conn = await mongoose.connect(MONGO_URI, options);

    console.log('✅ ================================');
    console.log('✅ MongoDB Connected Successfully!');
    console.log('✅ ================================');
    console.log('📁 Database:', conn.connection.name);
    console.log('🌐 Host:', conn.connection.host);
    console.log('🔗 Port:', conn.connection.port || 'N/A');
    console.log('✅ ================================\n');
    
  } catch (err) {
    console.error('\n❌ ================================');
    console.error('❌ MongoDB Connection FAILED!');
    console.error('❌ ================================');
    console.error('Error:', err.message);
    
    if (isLocal) {
      console.error('\n🚨 LOCAL MONGODB NOT RUNNING');
      console.error('\n💡 SOLUTION:');
      console.error('   1. Make sure MongoDB is installed on your computer');
      console.error('   2. Start MongoDB service:');
      console.error('      • Windows: Open Services → Find "MongoDB Server" → Start');
      console.error('      • Or run: net start MongoDB (as Administrator)');
      console.error('   3. Or install MongoDB from: https://www.mongodb.com/try/download/community\n');
    } else {
      console.error('\n🚨 ATLAS CONNECTION FAILED');
      console.error('\n💡 CHECK:');
      console.error('   1. Is MONGO_URI environment variable set correctly?');
      console.error('   2. Network Access in Atlas: 0.0.0.0/0 allowed?');
      console.error('   3. Database user exists with correct password?');
      console.error('   4. Check Render logs for more details\n');
    }
    
    console.error('❌ ================================\n');
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose: Connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose: Disconnected');
});

export default connectDB;