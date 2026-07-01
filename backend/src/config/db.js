import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/neetband');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error("MongoDB Connection Failed! Please check your network or IP whitelisting in MongoDB Atlas.");
    // We remove process.exit(1) so the backend stays alive to show 500 errors instead of crashing the process
  }
};

export default connectDB;
