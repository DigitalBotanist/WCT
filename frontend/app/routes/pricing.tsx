import type { Route } from "./+types/pricing";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Pricing" },
        { name: "description", content: "Pricing details" },
    ];
}
export default function pricing() {
    return (
        <div className="">
            pricing
        </div>
    );
}
