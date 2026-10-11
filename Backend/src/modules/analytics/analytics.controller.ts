import { AuthenticationError } from "@/errors/Errors";
import RestApiResponse from "@/types/RestApiResponse";
import type { Request, Response } from "express";
import analyticsService from "./analytics.service";

async function getOverviewAnalytics(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId || userId.trim().length == 0) {
    throw new AuthenticationError();
  }

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

export const analyticsController = {
  getOverviewAnalytics,
};
