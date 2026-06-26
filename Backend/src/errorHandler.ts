import type { Request, Response, NextFunction } from "express";
import AppError from "./errors/AppError.ts";
import RestApiResponse from "./types/RestApiResponse.ts";
import { ZodError } from "zod";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json(RestApiResponse.error(error.statusCode, error.message));
  }

  if (error instanceof ZodError) {
    console.error("Error occured: ", error.name);
    console.error("Error information: ", error.message);
    return res
      .status(422)
      .json(RestApiResponse.error(422, "Please sent valid information"));
  }

  console.error("Unexpected error:", error);

  return res
    .status(500)
    .json(RestApiResponse.error(500, "Unexpected Error Occured"));
}
