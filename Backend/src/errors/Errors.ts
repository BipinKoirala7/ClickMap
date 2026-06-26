import AppError from "./AppError.ts";

/* User Related Errors */

export class UserNotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/* Authentication Related Errors */

export class AuthenticationError extends AppError {
  constructor(message = "User is not logged In") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403);
  }
}

export class MissingTokenError extends AppError {
  constructor(message = "User is not logged In") {
    super(message, 401);
  }
}

export class TokenExpredError extends AppError {
  constructor(message = "User Session expred, Please Log in again") {
    super(message, 401);
  }
}

/* Link Related Erros */

export class LinkNotFoundError extends AppError {
  constructor(message = "Link Not Found") {
    super(message, 404);
  }
}

export class LinkAlreadyActiveError extends AppError {
  constructor(message = "Link is already active") {
    super(message, 400);
  }
}

export class LinkAlreadyDeactivatedError extends AppError {
  constructor(message = "Link is already deactivated") {
    super(message, 400);
  }
}
