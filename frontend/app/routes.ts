import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/auth.tsx"),
    route("dashboard", "routes/dashboard.tsx"), 
    route("chat/:session_id?", "routes/chat.tsx")
] satisfies RouteConfig;
