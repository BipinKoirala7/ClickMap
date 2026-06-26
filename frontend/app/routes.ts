import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/auth/register", "routes/Register.tsx"),
  route("/auth/login", "routes/Login.tsx"),
  layout("components/dashboard/Layout.tsx", [
    route("/dashboard", "routes/Dashboard.tsx"),
  ]),
] satisfies RouteConfig;
