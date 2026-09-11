import type { Request, Response, NextFunction } from "express";
import AppError from "./AppError.ts";
import RestApiResponse from "../types/RestApiResponse.ts";
import { ZodError } from "zod";
import {
  JOSEError,
  JWSSignatureVerificationFailed,
  JWTClaimValidationFailed,
  JWTExpired,
  JWTInvalid,
} from "jose/errors";

// Jose needs to be distincted with different messages
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Error: ", error);
  console.error("Error occured: ", error.name);
  console.error("Error information: ", error.message);

  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json(RestApiResponse.error(error.statusCode, error.message));
  }

  if (error instanceof JOSEError) {
    if (error instanceof JWTExpired) {
      return res
        .status(401)
        .json(
          RestApiResponse.error(
            401,
            "User Session expired, Please Log in again",
          ),
        );
    }

    if (error instanceof JWSSignatureVerificationFailed) {
      return res
        .status(401)
        .json(
          RestApiResponse.error(
            401,
            "User Session expred, Please Log in again",
          ),
        );
    }

    if (error instanceof JWTClaimValidationFailed) {
      return res
        .status(401)
        .json(
          RestApiResponse.error(
            401,
            "User Session expred, Please Log in again",
          ),
        );
    }

    if (error instanceof JWTInvalid) {
      return res
        .status(401)
        .json(
          RestApiResponse.error(
            401,
            "User Session expred, Please Log in again",
          ),
        );
    }

    return res
      .status(401)
      .json(
        RestApiResponse.error(401, "User Session expired, Please Log in again"),
      );
  }

  if (error instanceof ZodError) {
    return res
      .status(422)
      .json(RestApiResponse.error(422, "Please sent valid information"));
  }

  return res
    .status(500)
    .json(RestApiResponse.error(500, "Unexpected Error Occured"));
}
