import { Worker } from "bullmq";
import redisClient from "./redisConnect";

const clickEventWorker = new Worker(
  "clicks",
  async (job) => {
    console.log(job);
  },
  {
    connection: redisClient,
  },
);

clickEventWorker.on("completed", (job) => {
  console.log("Completed the job : " + job.id);
});

clickEventWorker.on("error", (job) => {
  console.log("Failed to do the job: " + job.message);
});

export default clickEventWorker;
