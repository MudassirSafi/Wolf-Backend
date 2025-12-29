import mongoose from "mongoose";

const connectDB = async () => {
  // Determine which MongoDB to use
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use local MongoDB by default for development
  const MONGO_URI = isProduction 
    ? process.env.MONGO_URI  // Atlas for Render/Production
    : (process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/2Wolf');  // Local for development

  const isLocal = MONGO_URI.includes('127.0.0.1') || MONGO_URI.includes('localhost');

  console.log('\n🔍 MongoDB Connection Info:');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Using:', isLocal ? '🏠 Local MongoDB (127.0.0.1:27017)' : '☁️ MongoDB Atlas');
  console.log('Connection URI:', isLocal ? MONGO_URI : MONGO_URI.substring(0, 50) + '...');
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
      console.error('\n🚨 ATLAS CONNECTION FAILED (This is normal in Pakistan!)');
      console.error('\n💡 YOU SHOULD NOT BE USING ATLAS LOCALLY!');
      console.error('   1. For local development: Use local MongoDB');
      console.error('   2. Set NODE_ENV to "development" (or remove it)');
      console.error('   3. Make sure MONGO_URI_LOCAL is set in .env');
      console.error('   4. Atlas will work automatically when you deploy to Render\n');
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