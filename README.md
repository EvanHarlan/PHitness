## Initial Setup

### Packages
- **express**: Web framework for Node.js
- **dotenv**: Loads environment variables from `.env` file
- **mongoose**: MongoDB object modeling
- **jsonwebtoken**: Create/sign/verify JWTs for authentication
- **cookie-parser**: Parse cookies from HTTP request headers
- **bcryptjs**: Password hashing and data encryption
- **ioredis**: Redis client for caching frequent data (JWTs/cookies)
- **nodemon**: Development server with hot-reloading

## Project Structure
/root
│── backend/            # Node.js & Express backend
│   │── controllers/    # Handles request logic
│   │── models/         # Mongoose schemas/models
|   |-- lib/            # Contains connection logic for various services (Ex. db.js -> Database connection)
│   │── routes/         # API route definitions
│   │── middleware/     # Custom middleware functions
│   │── server.js       # Entry point for backend server
│
│── frontend/           # React frontend
|   |-- public/         # All public assets - images, branding, etc.
│   │── src/
│   │   │── components/ # Reusable UI components
│   │   │── pages/      # Page components
│   │   │── context/    # React Context for global state
│   │   │── services/   # API request functions
│   │   │── App.js      # Main React component
│   │   │── index.css   # Global CSS file containing Tailwind imports
|   |   |-- Main.js
│
│── .env                # Environment variables
│── package.json        # Project dependencies & scripts
│── README.md           # Project documentation
|-- ViteConfig, etc.


### Key File Descriptions
**Backend**
- `lib/db.js`: Handles MongoDB connection
- `lib/redis.js`: Manages Redis client instance
- `middleware/auth.js`: Authentication middleware

**Frontend**
- `index.css`: Contains Tailwind CSS directives (`@tailwind base`, etc.)
- `services/api.js`: Axios instance with base URL configuration
