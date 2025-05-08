import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import questionHandler from "./controllers/workout.controller.js";
import authRoutes from "./routes/auth.route.js";
import trackerRoutes from "./routes/tracker.route.js";
import friendRoutes from './routes/friend.route.js';
import workoutRoutes from "./routes/workout.route.js";
import mealPlanRoutes from "./routes/mealPlan.route.js";
import exerciseTrackingRoutes from "./routes/exerciseTracking.route.js";
import weightTrackingRoutes from './routes/weightTracking.routes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Configure middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? ['https://phitness.onrender.com', 'https://phitness.onrender.com'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/exercise-tracking", exerciseTrackingRoutes);
app.use('/api/weight-tracking', weightTrackingRoutes);


// Question route for AI
app.post('/question', (req, res) => {
  return questionHandler(req, res);
});

// Production setup for frontend
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  
  // Log current directory for debugging
  console.log('Current directory:', __dirname);
  
  // Define potential paths where the frontend build might be
  const potentialPaths = [
    path.join(__dirname, "backend/frontend/dist"),
    path.join(__dirname, "frontend/dist"),
    path.join(__dirname, "dist")
  ];
  
  let clientBuildPath = null;
  
  // Find the first path that exists
  try {
    const fs = await import('fs');
    for (const potentialPath of potentialPaths) {
      if (fs.existsSync(potentialPath)) {
        clientBuildPath = potentialPath;
        console.log(`Found frontend build at: ${clientBuildPath}`);
        console.log('Directory contains:', fs.readdirSync(clientBuildPath));
        break;
      }
    }
    
    if (!clientBuildPath) {
      console.error('Could not find frontend build in any of the expected locations:', potentialPaths);
      // Fallback to a path even if it doesn't exist
      clientBuildPath = path.join(__dirname, "backend/frontend/dist");
      console.log('Falling back to:', clientBuildPath);
    }
  } catch (err) {
    console.error('Error checking directories:', err);
    // Default fallback path
    clientBuildPath = path.join(__dirname, "backend/frontend/dist");
  }
  
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// Route not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`=======================================`);
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Test the API: http://localhost:${PORT}/test`);
  console.log(`=======================================`);
  
  // Connect to MongoDB
  connectDB();
});