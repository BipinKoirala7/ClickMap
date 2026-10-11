import { AuthenticationError, InvalidEventError } from "@/errors/Errors";
import analyticsRepository from "@/modules/analytics/analytics.repository";
import {
  createClickEventSchema,
  type CreateClickEventInput,
} from "@/modules/analytics/analytics.schema";
import { logger } from "@/lib/logger";
import { linkRepository } from "../links/links.repository";

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

  const kpiStats = await getKPIStats(userId);
  const clicksOverTime = await getClicksOverTime(userId);
  const recentLinks = await getUserRecentLinks(userId);

  return {
    kpiStats,
    clicksOverTime,
    recentLinks,
  };
}

async function getKPIStats(userId: string) {
  const monthRanges = getMonthRanges();

  const total_links = await linkRepository.getTotalUserLinks(
    userId,
    monthRanges.today,
  );

  const prev_total_links = await linkRepository.getTotalUserLinks(
    userId,
    monthRanges.thisMonth.start,
  );

  const total_clicks = await linkRepository.getTotalClicksForUser(
    userId,
    monthRanges.thisMonth.start,
    monthRanges.nextMonth.start,
  );

  const prev_total_clicks = await linkRepository.getTotalClicksForUser(
    userId,
    monthRanges.prevMonth.start,
    monthRanges.thisMonth.start,
  );

  const total_active_links = await linkRepository.getTotalActiveLinksForUser(
    userId,
    monthRanges.today,
  );

  const prev_total_active_links =
    await linkRepository.getTotalActiveLinksForUser(
      userId,
      monthRanges.thisMonth.start,
    );

  const click_rate = total_links === 0 ? 0 : total_clicks / total_links;
  const prev_click_rate =
    prev_total_links === 0 ? 0 : prev_total_clicks / prev_total_links;

  return {
    total_links,
    prev_total_links,
    total_clicks,
    prev_total_clicks,
    total_active_links,
    prev_total_active_links,
    click_rate,
    prev_click_rate,
  };
}

async function getClicksOverTime(userId: string) {
  const monthRanges = getMonthRanges();

  const clicks = await linkRepository.getClicksOverTime(
    userId,
    monthRanges.thisMonth.start,
    monthRanges.nextMonth.start,
  );

  return clicks;
}

async function getUserRecentLinks(userId: string) {
  return linkRepository.getUserRecentLinks(userId);
}

// Helper functions
function getMonthRanges(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Month boundaries. Day 0 of the next month = last day of this month.
  const thisMonthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);

  // Month -1 rolls the year back automatically, so no special case for January.
  const prevMonthStart = new Date(year, month - 1, 1);

  return {
    today: now,
    thisMonth: { start: thisMonthStart },
    prevMonth: { start: prevMonthStart },
    nextMonth: { start: nextMonthStart },
  };
}

const analyticsService = {
  createEvent,
  getEvents,
  getOverviewAnalytics,
};

export default analyticsService;
