import { config } from "@/config/config";
import Redis from "ioredis";

const redisClient = new Redis(config.REDIS_URL, {
  connectTimeout: 6000,
  lazyConnect: true,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 5) {
      console.log("Redis Unreachable");
      return null;
    }
    return times * 200;
  },
});

redisClient.on("error", (err) => console.log("Redis Error Occurred", err));
redisClient.on("ready", () => console.log("Redis is ready"));

export async function redisConnect() {
  if (redisClient.status === "wait") {
    await redisClient.connect();
  }
}

export default redisClient;
