import AboutUs from "~/components/AboutusPage";
import type { Route } from "./+types/aboutus";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "About us" },
        { name: "description", content: "About us details" },
    ];
}
export default function aboutus() {
    return (
        <div className="">
           <AboutUs/> 
        </div>
    );
}
