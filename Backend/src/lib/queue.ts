import { Queue } from "bullmq";

const connection = {
  host: "localhost",
  port: 6379,
};

export const clicksQueue = new Queue("clicks", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
