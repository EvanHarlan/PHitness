import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import questionHandler from "./question.js";
import authRoutes from "./routes/auth.route.js";
import trackerRoutes from "./routes/tracker.route.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Configure middleware
app.use(cors({
    origin: process.env.NODE_ENV === "production" ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);

// Health & test routes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Question route for AI
app.post('/question', (req, res) => {
  console.log('Question route hit with body:', req.body);
  return questionHandler(req, res);
});

// Production setup for frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// Route not found handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
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
