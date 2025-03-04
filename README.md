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
```bash
/root
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── lib/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── services/
│       ├── App.js
│       ├── index.css
│       └── Main.js
│
├── .env
├── package.json
├── README.md
└── vite.config.js
```


### Key File Descriptions
**Backend**
- `lib/db.js`: Handles MongoDB connection
- `lib/redis.js`: Manages Redis client instance
- `middleware/auth.js`: Authentication middleware

**Frontend**
- `index.css`: Contains Tailwind CSS directives (`@tailwind base`, etc.)
- `services/api.js`: Axios instance with base URL configuration
