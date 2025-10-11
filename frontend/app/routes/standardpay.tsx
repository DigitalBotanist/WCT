import type { Route } from "./+types/standardpay";
import Standard from "~/components/PaymentPageStandard"

export function meta(args: Route.MetaArgs) {
    return [
        { title: "About us" },
        { name: "description", content: "About us details" },
    ];
}
export default function standardpay() {
    return (
        <div className="">
            <Standard/>
        </div>
    );
}
