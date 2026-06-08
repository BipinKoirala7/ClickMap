import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createLinnk } from "./links.controller.js";

const linkRouter = Router();

linkRouter.post("/", createLinnk);

export default linkRouter;
