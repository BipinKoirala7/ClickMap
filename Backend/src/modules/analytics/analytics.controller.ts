import { AuthenticationError } from "@/errors/Errors";
import RestApiResponse from "@/types/RestApiResponse";
import type { Request, Response } from "express";
import analyticsService from "@/modules/analytics/analytics.service";

async function getOverviewStats(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId || userId.trim().length === 0) throw new AuthenticationError();

  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "Link analytics retrieved successfully",
        await analyticsService.getOverviewStats(userId),
      ),
    );
}

async function getClicksOverTime(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId || userId.trim().length === 0) throw new AuthenticationError();

  const length = req.query.length ? parseInt(req.query.length as string) : 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - length);

  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "Link analytics retrieved successfully",
        await analyticsService.getClicksOverTime(userId, startDate, endDate),
      ),
    );
}

async function getUserRecentLinks(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId || userId.trim().length === 0) throw new AuthenticationError();

  const length = req.query.length ? parseInt(req.query.length as string) : 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - length);

  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "Link analytics retrieved successfully",
        await analyticsService.getUsersTopLinks(userId, startDate, endDate),
      ),
    );
}

async function getAudienceAnalytics(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId || userId.trim().length === 0) throw new AuthenticationError();

  const length = req.query.length ? parseInt(req.query.length as string) : 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - length);

  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "Link analytics retrieved successfully",
        await analyticsService.getAudienceAnalytics(userId, startDate, endDate),
      ),
    );
}

async function getAnalytics(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId || userId.trim().length === 0) throw new AuthenticationError();

  const length = req.query.length ? parseInt(req.query.length as string) : 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - length);

  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "Link analytics retrieved successfully",
        await analyticsService.getAnalytics(userId, startDate, endDate),
      ),
    );
}

async function getLinkAnalytics(
  req: Request<{ linkId: string | undefined }>,
  res: Response,
) {
  const userId = req.userId;
  const linkId = req.params.linkId;

  if (!userId || userId.trim().length === 0) throw new AuthenticationError();

  const length = req.query.length ? parseInt(req.query.length as string) : 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - length);

  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "Link analytics retrieved successfully",
        await analyticsService.getLinkAnalytics(
          userId,
          linkId,
          startDate,
          endDate,
        ),
      ),
    );
}

export const analyticsController = {
  getOverviewStats,
  getClicksOverTime,
  getAudienceAnalytics,
  getUserRecentLinks,
  getAnalytics,
  getLinkAnalytics,
};
