import { registry } from "@/openapi/registry.ts";

registry.registerPath({
  path: "/activate",
  method: "post",
  description: "Activates an users account",
  responses: {
    200: { description: "User Account Activated" },
  },
});

registry.registerPath({
  path: "/deactivate",
  method: "post",
  responses: {
    200: { description: "User Account Deactivated" },
  },
});
