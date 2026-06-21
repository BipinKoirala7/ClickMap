import CustomError from "./CustomError.ts";

class UserNotFound extends CustomError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export { UserNotFound };
