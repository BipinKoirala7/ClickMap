import { Worker } from "bullmq";
import redisClient from "./redisConnect";
import type { CreateClickEventInput } from "@/modules/analytics/analytics.schema";
import analyticsService from "@/modules/analytics/analytics.service";
import { logger } from "./logger";

const clickEventWorker = new Worker<CreateClickEventInput, void, "clicks">(
  "clicks",
  async (job) => {
    const event = job.data;

    await analyticsService
      .createEvent(event)
      .catch((err) => console.log("Error: ", err));

    logger.info({ event }, "Event came to the worker");
  },
  {
    connection: redisClient,
  },
);

clickEventWorker.on("completed", (job) => {
  console.log("Completed the job : " + job.id);
});

clickEventWorker.on("failed", (job, err) =>
  console.log("Job failed:", job?.id, err.message),
);

clickEventWorker.on("error", (job) => {
  console.log("Failed to do the job: " + job.message);
});

export default clickEventWorker;
