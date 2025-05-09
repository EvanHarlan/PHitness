## Initial Setup
Locally: 
1. Install Node.js 
2. Pull main branch repository from Github 
3. Drop .env file into root 
4. Install all dependencies listed in README file using "npm i “Dependency name""
5. Make two separate terminals in frontend and backend folders
6. run npm run dev in both terminals

View live App here: https://phitness.onrender.com 



## Packages
- **express**: Web framework for Node.js
- **dotenv**: Loads environment variables from `.env` file
- **mongoose**: MongoDB object modeling
- **jsonwebtoken**: Create/sign/verify JWTs for authentication
- **cookie-parser**: Parse cookies from HTTP request headers
- **bcryptjs**: Password hashing and data encryption
- **ioredis**: Redis client for caching frequent data (JWTs/cookies)
- **nodemon**: Development server with hot-reloading
- **lucide-react**: React icon package
- **recharts**: React charting
- **prop-types**: React typechecking
- **react-confetti**: does confetti animation
- **nodemailer**: sends email
- **cors**: autorization
- **framer-motion**:
- **openai**: handles ai
- **date-fns**: stores date
- **@sendgrid/mail**: uses sendgrid to send mail

## Project Structure
```bash
/root
│
├── backend/ # Node.js & Express backend
│   ├── controllers/ # Request handling logic
│   ├── models/ # Mongoose schemas & models
│   ├── lib/ # Service connections (db.js, redis.js)
│   ├── routes/ # API endpoint definitions
│   ├── middleware/ # Custom middleware functions
│   └── server.js # Backend entry point
│
├── frontend/ # React application
│   ├── public/ # Static assets (images, fonts)
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/ # Page-level components
│       ├── lib/ # Accessory files
│       ├── stores/ # Authentication and user state management
│       ├── App.js/ # Root React component
│       ├── config.js/ # API config
│       ├── index.css # Global styles with Tailwind imports
│       └── Main.js # ReactDOM render point
│
├── .env # Environment variables
├── package.json # Project dependencies & scripts
├── README.md # Project documentation
└── vite.config.js # Vite configuration
```


## Key File Descriptions
**Backend**
- `lib/db.js`: Handles MongoDB connection
- `lib/redis.js`: Manages Redis client instance
- `middleware/auth.js`: Authentication middleware

**Frontend**
- `index.css`: Contains Tailwind CSS directives (`@tailwind base`, etc.)
- `services/api.js`: Axios instance with base URL configuration


## Application Color Palette
- **Neon Green** → `#32CD32`
- **Balanced Green** → `#4CAF50`
- **Dark Gray** → `#1E1E1E`
- **Black** → `#121212`
- **Medium Gray** → `#2A2A2A`
- **Light Gray** → `#B0B0B0`
- **White** → `#F5F5F5`

