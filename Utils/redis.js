import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "http://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis error", err));

redisClient.connect().then(() => console.log("Redis Connected"));

export default redisClient;
