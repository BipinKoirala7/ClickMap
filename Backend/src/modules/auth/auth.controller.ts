import { type Request, type Response } from "express";

export async function registerUserController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function loginUserController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function logoutUserController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function deActivateUserController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}

export async function refreshTokenController(req: Request, res: Response) {
  res.status(200).json({ message: "Done" });
}
