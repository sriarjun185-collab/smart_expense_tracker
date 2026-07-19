const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set a short connection timeout (2 seconds) so server doesn't hang if MongoDB is offline
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-expense-tracker', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log('--------------------------------------------------');
    console.log('WARNING: RUNNING IN MOCK DATABASE MODE (JSON FILES)');
    console.log('All data will be saved locally to server/data/*.json');
    console.log('--------------------------------------------------');
    global.useMockDb = true;
  }
};

module.exports = connectDB;
