import { type Request, type Response } from "express";

export async function createUserController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function updateUserController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}
