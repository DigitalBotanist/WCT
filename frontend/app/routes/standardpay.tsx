import type { Route } from "./+types/standardpay";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "About us" },
        { name: "description", content: "About us details" },
    ];
}
export default function standardpay() {
    return (
        <div className="">
            standard
        </div>
    );
}
