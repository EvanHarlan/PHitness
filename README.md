**Initial Setup**
**Packages:** 
- express
- dotenv
- mongoose
- jsonwebtoken
- cookie-parser
- bcryptjs
- ioredis
- nodemon

jsonwebtoken -> allows creation, signing and verification of JWT's for authentication/authorization.
cookie-parser -> Node.js middleware that parses cookies from an HTTP request header and makes the cookie data accessible within the request object.
bcryptjs -> for hashing passwords and other information.
ioredis -> Used for interacting with a redis database. Used for common/frequently accessed data (JWT's/cookies) - can help persist logins or data.


***Project Structure***
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
