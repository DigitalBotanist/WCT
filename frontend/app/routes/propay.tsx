import type { Route } from "./+types/propay";
import Pro from '~/components/PayemntPagePro'
export function meta(args: Route.MetaArgs) {
    return [
        { title: "About us" },
        { name: "description", content: "About us details" },
    ];
}
export default function propay() {
    return (
        <div className="">
            <Pro/>
        </div>
    );
}
