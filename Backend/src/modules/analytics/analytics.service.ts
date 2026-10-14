import { InvalidEventError, LinkNotFoundError } from "@/errors/Errors";
import analyticsRepository from "@/modules/analytics/analytics.repository";
import {
  createClickEventSchema,
  type CreateClickEventInput,
} from "@/modules/analytics/analytics.schema";
import { logger } from "@/lib/logger";
import { linkRepository } from "../links/links.repository";
import { getPeriodRanges } from "@/lib/time";

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

// Overview Analytics
async function getOverviewStats(userId: string) {
  const monthRanges = getPeriodRanges();

  const total_links = await linkRepository.getTotalUserLinks(
    userId,
    monthRanges.current.end,
  );

  const prev_total_links = await linkRepository.getTotalUserLinks(
    userId,
    monthRanges.previous.end,
  );

  const total_clicks = await linkRepository.getTotalClicksForUser(
    userId,
    monthRanges.current.start,
    monthRanges.current.end,
  );

  const prev_total_clicks = await linkRepository.getTotalClicksForUser(
    userId,
    monthRanges.previous.start,
    monthRanges.previous.end,
  );

  const total_active_links = await linkRepository.getTotalActiveLinksForUser(
    userId,
    monthRanges.current.end,
  );

  const prev_total_active_links =
    await linkRepository.getTotalActiveLinksForUser(
      userId,
      monthRanges.previous.end,
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

async function getClicksOverTime(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const clicks = await linkRepository.getClicksOverTime(
    userId,
    startDate,
    endDate,
  );

  return clicks;
}

async function getUserRecentLinks(userId: string) {
  return linkRepository.getUserRecentLinks(userId);
}

// Analytics
async function getAnalytics(userId: string, startDate: Date, endDate: Date) {
  const kpiStats = await getAnalyticsStats(userId, startDate, endDate);
  const clicksOverTime = await getClicksOverTime(userId, startDate, endDate);
  const audienceAnalytics = await getAudienceAnalytics(
    userId,
    startDate,
    endDate,
  );
  const topReferrers = await getTopReferrersForClicks(
    userId,
    startDate,
    endDate,
  );
  const usersTopLinks = await getUsersTopLinks(userId, startDate, endDate);

  return {
    kpiStats,
    clicksOverTime,
    audience: audienceAnalytics,
    referrers: topReferrers,
    topLinks: usersTopLinks,
  };
}

async function getAnalyticsStats(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const totalClicks = await linkRepository.getTotalClicksForUser(
    userId,
    startDate,
    endDate,
  );

  const totalUniqueVisitors =
    await linkRepository.getTotalUniqueVisitorsForUser(
      userId,
      startDate,
      endDate,
    );

  const topReferrer = await linkRepository.getTopReferrerForClicks(
    userId,
    startDate,
    endDate,
  );

  const topLocation = await linkRepository.getTopLocationForClicks(
    userId,
    startDate,
    endDate,
  );

  return {
    totalClicks,
    totalUniqueVisitors,
    topReferrer,
    topLocation,
  };
}

async function getAudienceAnalytics(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const deviceTypeDistribution =
    await linkRepository.getDeviceTypeDistributionForClicks(
      userId,
      startDate,
      endDate,
    );

  const browserDistribution =
    await linkRepository.getBrowserDistributionForClicks(
      userId,
      startDate,
      endDate,
    );

  const countryDistribution =
    await linkRepository.getCountryDistributionForClicks(
      userId,
      startDate,
      endDate,
    );

  return {
    deviceTypeDistribution,
    browserDistribution,
    countryDistribution,
  };
}

async function getTopReferrersForClicks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const topReferrers = await linkRepository.getTopReferrersForClicks(
    userId,
    startDate,
    endDate,
  );

  return topReferrers;
}

async function getUsersTopLinks(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const topLinks = await linkRepository.getUsersTopLinks(
    userId,
    startDate,
    endDate,
  );

  return topLinks;
}

async function getLinkAnalytics(
  userId: string,
  linkId: string | undefined,
  startDate: Date,
  endDate: Date,
) {
  if (!linkId || linkId.trim().length === 0) {
    throw new LinkNotFoundError("Link ID is required to fetch analytics");
  }

  const totalClicks = await linkRepository.getTotalClickInLink(
    userId,
    linkId,
    startDate,
    endDate,
  );

  const totalUniqueVisitors = await linkRepository.getTotalUniqueVisitorsInLink(
    userId,
    linkId,
    startDate,
    endDate,
  );

  const topReferrer = await linkRepository.getTopReferrerInLink(
    userId,
    linkId,
    startDate,
    endDate,
  );

  const topLocation = await linkRepository.getTopLocationInLink(
    userId,
    linkId,
    startDate,
    endDate,
  );

  const clicksOverTime = await linkRepository.getClicksOverTimeInLink(
    userId,
    linkId,
    startDate,
    endDate,
  );

  const deviceTypeDistribution =
    await linkRepository.getDeviceTypeDistributionInLink(
      userId,
      linkId,
      startDate,
      endDate,
    );

  const topLocations = await linkRepository.getTopLocationsInLink(
    userId,
    linkId,
    startDate,
    endDate,
  );

  const recentClickEvents = await linkRepository.getRecentClickEvents(userId);

  return {
    kpiStats: {
      totalClicks,
      totalUniqueVisitors,
      topReferrer,
      topLocation,
    },
    clicksOverTime,
    audience: {
      deviceTypeDistribution,
      topLocations,
    },
    recentClickEvents,
  };
}

const analyticsService = {
  createEvent,
  getOverviewStats,
  getClicksOverTime,
  getUserRecentLinks,
  getAudienceAnalytics,
  getTopReferrersForClicks,
  getUsersTopLinks,
  getAnalytics,
  getLinkAnalytics,
};

export default analyticsService;
