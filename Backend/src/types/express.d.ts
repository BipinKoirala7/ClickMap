declare global {
  namespace Express {
    interface Request {
      userId?: string | undefined;
      visitorId?: string | undefined;
    }
  }
}

export {};
