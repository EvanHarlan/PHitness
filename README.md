# PHitness - AI-Powered Fitness and Nutrition App

PHitness is a modern web application that combines fitness tracking with AI-powered meal planning to help users achieve their health and fitness goals.

## Project Structure

```
PHitness/
├── backend/              # Backend server code
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic and services
│   ├── lib/            # Utility functions and helpers
│   └── server.js       # Main server file
├── frontend/            # Frontend React application
│   ├── public/         # Static files
│   └── src/            # Source files
│       ├── components/ # React components
│       ├── context/    # React context providers
│       ├── pages/      # Page components
│       └── lib/        # Utility functions
└── .env                # Environment variables
```

## Features

- User authentication and authorization
- AI-powered meal planning based on nutritional goals
- Fitness tracking and progress monitoring
- Modern, responsive UI with Tailwind CSS

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PHitness.git
   cd PHitness
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your MongoDB URI, OpenAI API key, and other required variables

4. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm run dev

   # Start frontend development server (from frontend directory)
   npm run dev
   ```

## Environment Variables

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `PORT`: Backend server port (default: 8080)
- `ACCESS_TOKEN_SECRET`: JWT access token secret
- `REFRESH_TOKEN_SECRET`: JWT refresh token secret
- `OPENAI_API_KEY`: OpenAI API key for meal planning

## API Documentation

### Authentication Endpoints
- POST `/api/auth/signup`: Create a new user account
- POST `/api/auth/login`: Log in an existing user
- GET `/api/auth/user`: Get current user information (protected)

### Meal Planning Endpoints
- POST `/api/meal-plans/generate`: Generate AI-powered meal suggestions

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

