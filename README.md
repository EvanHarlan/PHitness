**Initial Setup**
**Packages:** express, dotenv, mongoose, jsonwebtoken, cookie-parser, bcryptjs, ioredis, nodemon

jsonwebtoken -> allows creation, signing and verification of JWT's for authentication/authorization.
cookie-parser -> Node.js middleware that parses cookies from an HTTP request header and makes the cookie data accessible within the request object.
bcryptjs -> for hashing passwords and other information.
ioredis -> Used for interacting with a redis database. Used for common/frequently accessed data (JWT's/cookies) - can help persist logins or data.