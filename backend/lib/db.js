import mongoose from "mongoose";

// Logic for connecting to the database using mongoose
export const connectDB = async () => {
  try {
    // attempt a connection using mongoose client and secret mongo_uri
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Handle any connection errors
  } catch (error) {
    process.exit(1);
  }
};