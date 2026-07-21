import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "@/app";
import { userService } from "@/modules/user/user.service";
import type { PublicUserDto } from "@/modules/user/user.schema";
import { jwtService } from "@/modules/auth/jwt.service";
import type { User } from "@/modules/auth/auth.schema";
import { nanoid } from "nanoid";
import type TestAgent from "supertest/lib/agent";
import { UserNotFoundError } from "@/errors/Errors";
import { ZodError } from "zod";

const user: PublicUserDto = {
  name: "Bipin Koirala",
  userName: "bipin123",
  email: "bipinkoirala2061@gmail.com",
  plan: "free",
  isActive: false,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("@/modules/user/user.service.ts");

const userServiceMock = vi.mocked(userService);

let server: TestAgent;

beforeAll(() => {
  server = request(app);
})

describe("GET /user Request", () => {
  it("returns 200 when token is valid", async () => {
    // Arrange 
    userServiceMock.getUserById.mockResolvedValue(user);
    const accessToken = await jwtService.createAccessToken({ id: nanoid(), email: user.email } as User);

    // Act 
    const res = await server.get("/api/v1/user").set("Cookie", [`accessToken=${accessToken}`])

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(user.email);
  })

  it("returns 401 when token is not present", async () => {
    const res = await server.get("/api/v1/user").send();

    expect(res.statusCode).toBe(401);

  })

  it("returns 401 when token is invalid", async () => {
    const res = await request(app)
      .get("/api/v1/user")
      .set("Cookie", ["accessToken=garbage.invalid.token"]);

    expect(res.statusCode).toBe(401);
  })

  it("return 404 when User is not found", async () => {
    // Arrange
    userServiceMock.getUserById.mockThrow(new UserNotFoundError());
    const accessToken = await jwtService.createAccessToken({ id: nanoid(), email: user.email } as User);

    // Act 
    const res = await server.get("/api/v1/user").set("Cookie", [`accessToken=${accessToken}`])

    // Assert
    expect(res.statusCode).toBe(404);
  })
})

describe("PUT /user Request", () => {
  it("returns 200 when token and update body is valid", async () => {
    // Arrange    
    const accessToken = await jwtService.createAccessToken({ id: nanoid(), email: user.email } as User);
    const res = await server.put("/api/v1/user").set("Cookie", [`accessToken=${accessToken}`])
      .send({ name: "BipinKoirala", userName: "bipin.koirala.123" })

    expect(res.statusCode).toBe(200);
  })

  it("returns 401 when token is invalid", async () => {
    const res = await request(app)
      .put("/api/v1/user")
      .set("Cookie", ["accessToken=garbage.invalid.token"]);

    expect(res.statusCode).toBe(401);
  })

  it("returns 422 when update body is null", async () => {
    userServiceMock.updateUser.mockThrow(new ZodError([
      {
        code: "invalid_type",
        expected: "object",
        path: [],
        message: "Expected object, received null",
      },
    ]));
    const accessToken = await jwtService.createAccessToken({ id: nanoid(), email: user.email } as User);
    const res = await server.put("/api/v1/user").set("Cookie", [`accessToken=${accessToken}`]);
    expect(res.statusCode).toBe(422);
  })

  it("returns 404 when User is not found", async () => {
    userServiceMock.updateUser.mockRejectedValue(new UserNotFoundError());
    const accessToken = await jwtService.createAccessToken({ id: nanoid(), email: user.email } as User);

    const res = await server.put("/api/v1/user").set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.statusCode).toBe(404);
  })

})
