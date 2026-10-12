declare global {
  namespace Express {
    interface Request {
      userId?: string;
      visitorId?: string;
    }
  }
}

export {};
