import { registry } from "@/openapi/registry.ts";
import { publicUserSchema } from "./user.schema";

registry.registerPath({
  path: "/",
  method: "get",
  responses: {
    ["200"]: {
      description: "User Info Successfully Fetched",
      content: {
        "application/json": {
          schema: publicUserSchema,
        },
      },
    },
    ["401"]: {
      description: "User is not logged in",
    },
  },
});

registry.registerPath({
  path: "/",
  method: "put",
  request: {
    body: {
      content: {
        "application/json": {
          schema: publicUserSchema,
        },
      },
    },
  },
  responses: {
    ["200"]: {
      description: "User Info Updated",
    },
    ["401"]: {
      description: "User is not logged in",
    },
  },
});
