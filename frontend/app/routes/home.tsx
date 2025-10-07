import type { Route } from "./+types/home";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Home" },
        { name: "description", content: "Home page" },
    ];
}
export default function Home() {
    return (
        <div className="">
            Home
        </div>
    );
}
