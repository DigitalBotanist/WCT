import type { Route } from "./+types/propay";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "About us" },
        { name: "description", content: "About us details" },
    ];
}
export default function propay() {
    return (
        <div className="">
            pro
        </div>
    );
}
