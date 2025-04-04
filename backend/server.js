import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import workoutRoutes from "./routes/workoutRoutes.js"; 
import authRoutes from "./routes/authenticate.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import { connectDB } from "./lib/db.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meal-plans", mealPlanRoutes);

const PORT = 8080; // Temporarily set to 8080 for local development

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });
