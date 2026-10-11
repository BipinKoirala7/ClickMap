import { AuthenticationError, InvalidEventError } from "@/errors/Errors";
import analyticsRepository from "./analytics.repository";
import {
  createClickEventSchema,
  type CreateClickEventInput,
} from "./analytics.schema";
import { logger } from "@/lib/logger";
import { linkService } from "../links/links.service";

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

async function getOverviewAnalytics(userId: string) {
  if (!userId || userId.trim().length === 0) throw new AuthenticationError();

  // Todo: Get the following data form the month ranges
  // Todo: Create a typescript type for the return value of this function
  // Todo: Make sure to handle the case when there are no links or clicks for the user

  const monthRanges = getMonthRanges();

  const total_links = await linkService.getUserTotalLinks(userId);
  const total_clicks = await linkService.getTotalClicksForUser(userId);
  const total_active_links =
    await linkService.getTotalActiveLinksForUser(userId);
  const click_rate = await linkService.getClickRateForUser(userId);

  console.log("total_links", total_links);
  console.log("total_clicks", total_clicks);
  console.log("total_active_links", total_active_links);
  console.log("click_rate", click_rate);
  console.log("monthRanges", monthRanges);
}

// Helper functions
function getMonthRanges(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Month boundaries. Day 0 of the next month = last day of this month.
  const thisMonthStart = new Date(year, month, 1);
  const thisMonthEnd = new Date(year, month + 1, 0);

  // Month -1 rolls the year back automatically, so no special case for January.
  const prevMonthStart = new Date(year, month - 1, 1);
  const prevMonthEnd = new Date(year, month, 0);

  return {
    today: fmt(now),
    thisMonth: { start: fmt(thisMonthStart), end: fmt(thisMonthEnd) },
    prevMonth: { start: fmt(prevMonthStart), end: fmt(prevMonthEnd) },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const analyticsService = {
  createEvent,
  getEvents,
  getOverviewAnalytics,
};

export default analyticsService;
