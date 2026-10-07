import { InvalidEventError } from "@/errors/Errors";
import analyticsRepository from "./analytics.repository";
import {
  createClickEventSchema,
  type CreateClickEventInput,
} from "./analytics.schema";
import { logger } from "@/lib/logger";

async function createEvent(event: CreateClickEventInput): Promise<void> {
  if (!event) {
    logger.error("Invalid event data provided");
    throw new InvalidEventError();
  }

  const parsedData = createClickEventSchema.safeParse(event);
  if (!parsedData.success) {
    logger.error("Invalid event data provided");
    logger.error(parsedData.error.message);
    throw new InvalidEventError(parsedData.error.message);
  }

  await analyticsRepository.createEvent(parsedData.data);
}

async function getEvents(linkId: string) {
  if (!linkId || linkId.trim().length === 0) {
    logger.error("Invalid link ID provided");
    throw new InvalidEventError();
  }

  return await analyticsRepository.getEventsByLinkId(linkId);
}

const analyticsService = {
  createEvent,
  getEvents,
};

export default analyticsService;
