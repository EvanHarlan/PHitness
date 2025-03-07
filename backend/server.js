import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; 
import authRoutes from './routes/authenticate.js'; 
import { connectDB } from './lib/db.js';

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.use(express.json()); 

app.use('/api/auth', authRoutes);

app.listen(port, async () => {
  try {
    console.log(`Server running at http://localhost:${port}`);
    await connectDB();
  } catch (error) {
    console.error('Error starting the server or connecting to the DB:', error.message);
    process.exit(1);  // Exit the process with failure if unable to start server or connect DB
  }
});


