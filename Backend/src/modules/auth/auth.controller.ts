import { type Request, type Response } from "express";

export async function deActivateUserController(req: Request, res: Response) {
  const supabaseId = req.user!.sub as string;
  if (!supabaseId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }
  res.status(200).json({ message: "Done" });
}

export async function activateUserController(req: Request, res: Response) {
  const supabaseId = req.user!.sub as string;
  if (!supabaseId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }
  res.status(200).json({ message: "Done" });
}
