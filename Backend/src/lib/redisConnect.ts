import redis from "redis";

const REDIS_PORT = 6379;

const redisClient = redis.createClient({
  url: process.env.REDIS_URL ?? `redis://localhost:${REDIS_PORT}`,
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
