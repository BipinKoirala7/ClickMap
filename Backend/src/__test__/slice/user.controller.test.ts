import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "@/index";

describe("GET /user Request", () => {
  it("Gets the Authenticated User", async () => {
    const a = request(app);
    const res = await a.get("/api/v1/user").send();

    expect(res.statusCode).toBe(401);
  })
})