import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("aboutus", "routes/aboutus.tsx"),
    route("pricing", "routes/pricing.tsx"),
    route("auth", "routes/auth.tsx"),
    route("dashboard", "routes/dashboard.tsx"), 
    route("chat/:session_id?", "routes/chat.tsx")
] satisfies RouteConfig;
