import mongoose from "mongoose";

// Logic for connecting to the database using mongoose
export const connectDB = async () => {
  try {
    // attempt a connection using mongoose client and secret mongo_uri
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Log if connected - NEEDS TO BE REMOVED IN PRODUCTION
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Handle any connection errors
  } catch (error) {
    console.error("Error connecting to MongoDB", error.message);
    process.exit(1);
  }
};