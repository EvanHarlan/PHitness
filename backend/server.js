import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import workoutRoutes from "./routes/workoutRoutes.js"; 
import authRoutes from "./routes/authenticate.js";
import { connectDB } from "./lib/db.js";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000; // Change to 5000 for consistency

// Middleware
app.use(cors({ 
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  credentials: true 
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); 
app.use("/api/workouts", workoutRoutes);

// Start server only after successful DB connection
const startServer = async () => {
  try {
    await connectDB(); // Ensure DB is connected before listening
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process on DB failure
  }
};

startServer();
