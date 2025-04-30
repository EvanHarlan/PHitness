# PHitness - Project Overview

## Project Description
PHitness is a comprehensive fitness and health tracking application that helps users manage their workouts, nutrition, and overall health progress. The platform provides personalized workout plans, meal recommendations, and progress tracking features. It's designed to be user-friendly while offering advanced features for fitness enthusiasts.

## Tech Stack

### Frontend
- **Framework**: React.js (v18.2.0)
- **State Management**: Zustand (v4.5.0)
- **Styling**: Tailwind CSS (v3.4.0)
- **UI Components**: Material-UI (MUI) (v5.15.0)
- **Charts**: Recharts (v2.12.0)
- **HTTP Client**: Axios (v1.6.0)
- **Routing**: React Router (v6.22.0)
- **Notifications**: React Hot Toast (v2.4.1)
- **Form Handling**: React Hook Form (v7.50.0)
- **Date Handling**: date-fns (v3.3.0)

### Backend
- **Runtime**: Node.js (v20.11.0)
- **Framework**: Express.js (v4.18.2)
- **Database**: MongoDB (v7.0.0)
- **ORM**: Mongoose (v8.0.0)
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **API Documentation**: Swagger/OpenAPI (swagger-ui-express v5.0.0)
- **Validation**: express-validator (v7.0.1)
- **Security**: bcrypt (v5.1.1), helmet (v7.1.0)

### Development Tools
- **Version Control**: Git (v2.42.0)
- **Package Manager**: npm (v10.2.0)
- **Environment Variables**: dotenv (v16.3.1)
- **Code Quality**: ESLint (v8.56.0)
- **Build Tool**: Vite (v5.0.0)
- **Testing**: Jest (v29.7.0), React Testing Library (v14.1.2)
- **Code Formatting**: Prettier (v3.2.0)

## Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── DashboardStats.jsx
│   │   ├── WeightNotification.jsx
│   │   ├── WorkoutCard.jsx
│   │   └── MealPlanCard.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Workouts.jsx
│   │   ├── Nutrition.jsx
│   │   └── Profile.jsx
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── workoutStore.js
│   │   └── nutritionStore.js
│   ├── lib/
│   │   ├── api.js
│   │   ├── constants.js
│   │   └── utils.js
│   ├── App.jsx
│   └── main.jsx
```

### Backend Structure
```
backend/
├── controllers/
│   ├── auth.controller.js
│   ├── workout.controller.js
│   ├── nutrition.controller.js
│   └── weightTracking.controller.js
├── models/
│   ├── User.js
│   ├── Workout.js
│   ├── Exercise.js
│   └── WeightEntry.js
├── routes/
│   ├── auth.routes.js
│   ├── workout.routes.js
│   └── nutrition.routes.js
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── lib/
│   ├── db.js
│   └── logger.js
└── server.js
```

## Features

### User Management
- **Authentication System**
  - Email/password registration and login
  - JWT-based session management
  - Password reset functionality
  - Email verification
- **Profile Management**
  - Personal information editing
  - Profile picture upload
  - Fitness goals setting
  - Privacy settings
- **Achievement System**
  - Streak tracking
  - Milestone badges
  - Progress rewards
  - Achievement sharing

### Workout Features
- **Workout Generation**
  - AI-powered workout plan creation
  - Customizable difficulty levels
  - Equipment-based filtering
  - Target muscle group selection
- **Exercise Tracking**
  - Real-time progress logging
  - Set/rep tracking
  - Weight progression
  - Rest timer
- **Workout History**
  - Detailed workout logs
  - Performance analytics
  - Progress comparison
  - Export functionality

### Nutrition Features
- **Meal Planning**
  - AI-generated meal plans
  - Dietary restriction consideration
  - Calorie goal tracking
  - Macro nutrient balancing
- **Food Tracking**
  - Barcode scanning
  - Custom food creation
  - Meal logging
  - Water intake tracking
- **Nutrition Analytics**
  - Daily/weekly summaries
  - Macro breakdown
  - Progress visualization
  - Goal tracking

### Health Tracking
- **Weight Management**
  - Daily/weekly weight logging
  - Progress visualization
  - Trend analysis
  - Goal setting
- **Health Metrics**
  - Body measurements
  - Progress photos
  - Health indicators
  - Custom metrics

### Social Features
- **Community**
  - Friend system
  - Follow/unfollow
  - Activity feed
  - Direct messaging
- **Sharing**
  - Workout sharing
  - Progress updates
  - Achievement posts
  - Challenge creation

## API Endpoints

### Authentication
- **POST /api/auth/register**
  - Request: { email, password, name }
  - Response: { token, user }
- **POST /api/auth/login**
  - Request: { email, password }
  - Response: { token, user }
- **GET /api/auth/me**
  - Headers: Authorization: Bearer {token}
  - Response: { user }
- **POST /api/auth/logout**
  - Headers: Authorization: Bearer {token}
  - Response: { message }

### Workouts
- **POST /api/workouts/generate**
  - Request: { difficulty, equipment, targetMuscles }
  - Response: { workout }
- **GET /api/workouts/:id**
  - Response: { workout }
- **GET /api/workouts/by-date**
  - Query: date
  - Response: { workouts }
- **POST /api/workouts/:id/complete**
  - Request: { exercises }
  - Response: { workout }

### Nutrition
- **POST /api/meal-plans/generate**
  - Request: { preferences, goals }
  - Response: { mealPlan }
- **GET /api/meal-plans/:id**
  - Response: { mealPlan }
- **POST /api/tracker**
  - Request: { meal, time, portions }
  - Response: { entry }

### Weight Tracking
- **POST /api/weight-tracking/submit**
  - Request: { weight, type }
  - Response: { entry }
- **GET /api/weight-tracking/history**
  - Query: period
  - Response: { entries }
- **GET /api/weight-tracking/status**
  - Response: { lastEntry, needsUpdate }

## Data Models

### User
```javascript
{
  name: String,
  email: String,
  password: String,
  age: Number,
  height: Number,
  weight: Number,
  goals: [String],
  preferences: {
    dietaryRestrictions: [String],
    workoutPreferences: Object
  },
  achievements: [{
    type: String,
    date: Date,
    details: Object
  }],
  friends: [{
    userId: ObjectId,
    status: String
  }]
}
```

### Workout
```javascript
{
  name: String,
  description: String,
  exercises: [{
    exerciseId: ObjectId,
    sets: Number,
    reps: Number,
    weight: Number
  }],
  duration: Number,
  difficulty: String,
  targetMuscles: [String],
  equipment: [String],
  createdBy: ObjectId,
  completed: Boolean
}
```

### Weight Entry
```javascript
{
  userId: ObjectId,
  weight: Number,
  date: Date,
  type: String, // 'daily' or 'weekly'
  notes: String
}
```

## Security Features
- **Authentication**
  - JWT token-based authentication
  - Token refresh mechanism
  - Secure password hashing with bcrypt
  - Session management
- **Data Protection**
  - Input validation
  - XSS protection
  - CSRF protection
  - Rate limiting
- **API Security**
  - CORS configuration
  - Helmet security headers
  - Request sanitization
  - Error handling

## Performance Optimizations
- **Frontend**
  - Code splitting
  - Lazy loading
  - Memoization
  - Virtual scrolling
- **Backend**
  - Query optimization
  - Caching
  - Connection pooling
  - Compression
- **Database**
  - Indexing
  - Aggregation optimization
  - Query optimization
  - Connection management

## Development Guidelines
- **Code Style**
  - ESLint configuration
  - Prettier formatting
  - Naming conventions
  - Documentation standards
- **Testing**
  - Unit testing
  - Component testing
  - Integration testing
  - Performance testing
- **Git Workflow**
  - Feature branches
  - Pull requests
  - Code review
  - CI/CD pipeline

## Deployment
- **Frontend**
  - Vercel deployment
  - Environment configuration
  - Build optimization
  - CDN integration
- **Backend**
  - Heroku deployment
  - Database configuration
  - SSL setup
  - Monitoring
- **Database**
  - MongoDB Atlas
  - Backup strategy
  - Scaling configuration
  - Security setup

## Team Members
- **Project Manager**: [Name]
  - Project planning
  - Team coordination
  - Timeline management
- **Frontend Lead**: [Name]
  - UI/UX design
  - React development
  - State management
- **Backend Lead**: [Name]
  - API development
  - Database design
  - Security implementation
- **Full Stack Developer**: [Name]
  - Feature implementation
  - Testing
  - Documentation

## Project Timeline
- **Phase 1: Foundation** (Month 1)
  - Project setup
  - Basic authentication
  - Core database models
- **Phase 2: Core Features** (Month 2)
  - Workout system
  - Nutrition tracking
  - Weight management
- **Phase 3: Enhancement** (Month 3)
  - Social features
  - Analytics
  - UI improvements
- **Phase 4: Polish** (Month 4)
  - Testing
  - Performance optimization
  - Documentation
  - Deployment

## Contact Information
- **Project Repository**: [GitHub URL]
- **Documentation**: [Documentation URL]
- **Support Email**: [Support Email]
- **Team Communication**: [Slack/Discord Channel] 