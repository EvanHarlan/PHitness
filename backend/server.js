import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import workoutRoutes from "./routes/workoutRoutes.js"; 
import authRoutes from "./routes/authenticate.js";
import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;

app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(express.json()); 

app.use("/api/auth", authRoutes); 
app.use("/api/workouts", workoutRoutes);

app.listen(port, async () => {
  try {
    console.log(` Server running at http://localhost:${port}`);
    await connectDB();
  } catch (error) {
    console.error(" Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
});
