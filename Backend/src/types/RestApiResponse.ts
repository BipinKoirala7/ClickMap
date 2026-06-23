export default class RestApiResponse<T> {
  constructor(
    public success: boolean,
    public statusCode: number,
    public message: string,
    public data: T,
  ) {}

  static success<T>(
    statusCode: number,
    message: string,
    data: T,
  ): RestApiResponse<T> {
    return new RestApiResponse(true, statusCode, message, data);
  }

  static error(statusCode: number, message: string): RestApiResponse<null> {
    return new RestApiResponse(false, statusCode, message, null);
  }
}
