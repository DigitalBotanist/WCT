import type { Route } from "./+types/home";
import HomeC from '../components/homeComponent'

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Home" },
        { name: "description", content: "Home page" },
    ];
}
export default function Home() {
    return (
        <div className="">
            <HomeC/>
        </div>
    );
}
