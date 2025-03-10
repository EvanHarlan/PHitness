// Configuring Upstash Redit to store the tokens

import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// Redis:
// Key-value store (giant json - lists, hashes, sets, sorted sets)
// Key value store with refresh token