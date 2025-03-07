import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js'; // Import your db.js
import authRoutes from './routes/auth.js'; // Import your auth routes

dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors()); // To enable CORS for frontend requests
app.use(express.json()); // To parse incoming JSON requests

// Connect to MongoDB
connectDB(); // Calling your connectDB function

// Routes
app.use('../backend/routes/authenticate.js', authRoutes); // Auth routes for handling user sign up, login, etc.

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

