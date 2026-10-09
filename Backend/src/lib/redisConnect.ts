import { config } from "@/config/config";
import redis from "redis";

const redisClient = redis.createClient({
  url: config.REDIS_URL,
  socket: {
    connectTimeout: 60000,
    reconnectStrategy: (retries) =>
      retries > 5 ? new Error("Redis Unreachable") : retries * 200,
  },
});

redisClient.on("error", (err) => console.log("Redis Error Occurred", err));
redisClient.on("ready", () => console.log("Redis is ready"));

export async function redisConnect() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export default redisClient;
