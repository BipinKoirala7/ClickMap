import { AuthenticationError } from "@/errors/Errors";
import RestApiResponse from "@/types/RestApiResponse";
import type { Request, Response } from "express";
import analyticsService from "@/modules/analytics/analytics.service";

async function getOverviewAnalytics(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId || userId.trim().length === 0) throw new AuthenticationError();

  res
    .status(200)
    .json(
      RestApiResponse.success(
        200,
        "Link analytics retrieved successfully",
        await analyticsService.getOverviewAnalytics(userId),
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
  getOverviewAnalytics,
  getAnalytics,
  getLinkAnalytics,
};
