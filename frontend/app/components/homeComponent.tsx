import React from "react";
import Navbar from "./Navbar";
import migration from "../assets/migration.png";
import ident from "../assets/ident.png";
import threat from "../assets/threat.png";
import paw from "../assets/paw.png";
import Footer from "./Footer";
import horse from "~/assets/horse.jpg";
import whiteBear from "~/assets/white_bear.jpg";
import { Link } from "react-router";


function HomeC() {
    return (
        <div>
            <Navbar />
            <div className="bg-background-700">
                <div className="text-gray-900">
                    <main>
                        {/* Hero Section */}
                        <section
                            style={{ backgroundImage: `url(${whiteBear})` }}
                            className={`h-[100vh] w-full bg-background-700 bg-center bg-cover`}
                        >
                            <div className="h-full w-full lg:flex relative">
                                <div className="text-center lg:text-left lg:w-2/5 absolute right-20 top-50 z-0">
                                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-none text-gray-300">
                                        Empowering Conservation Through AI.
                                    </h1>
                                    <p className="text-xl lg:text-2xl mt-6 font-light text-slate-300">
                                        Use AI to understand nature better.
                                        Track species, discover threats, and
                                        contribute to global conservation
                                        efforts effortlessly
                                    </p>
                                    <p className="mt-8 md:mt-12">
                                        <Link
                                            type="button"
                                            className="py-4 px-12 bg-emerald-800 hover:bg-emerald-600 rounded text-white"
                                            to="/auth"
                                        >
                                            Get Started
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </section>
                        <section
                            id="features"
                            style={{ backgroundImage: `url(${horse})` }}
                            className="h-screen text-white bg-slate-800 p-1 bg-cover bg-center bg-opacity relative"
                        >
                           

                            {/* Card Layout */}
                            <div className="absolute w-full px-50 bottom-40 left-1/2 -translate-x-1/2">
                                <div className="w-full mx-auto px-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                                    {/* Species Identification Card */}
                                    <div className="bg-gray-900 rounded-xl shadow-xl p-8 flex flex-col items-center">
                                        {/* <img
                                            src={ident}
                                            className="w-32 h-32 mb-6 rounded-full object-cover"
                                            alt="Species Identification"
                                        /> */}
                                        <h3 className="text-2xl font-semibold text-primary-400 mb-4">
                                            Species Identification
                                        </h3>
                                        <p className="font-light leading-relaxed text-gray-300">
                                            We identify wildlife species using
                                            advanced image recognition and AI-driven
                                            tools, ensuring accurate and efficient
                                            biodiversity monitoring across habitats.
                                        </p>
                                    </div>
                                    {/* Migration Pattern Analysis Card */}
                                    <div className="bg-gray-900 rounded-xl shadow-xl p-8 flex flex-col items-center">
                                        {/* <img
                                            src={migration}
                                            className="w-32 h-32 mb-6 rounded-full object-cover"
                                            alt="Migration Pattern Analysis"
                                        /> */}
                                        <h3 className="text-2xl font-semibold text-primary-400 mb-4">
                                            Migration Pattern Analysis
                                        </h3>
                                        <p className="font-light leading-relaxed text-gray-300">
                                            We analyze animal migration routes
                                            through tracking data and visual maps,
                                            revealing seasonal movements and
                                            environmental behavior patterns.
                                        </p>
                                    </div>
                                    {/* Threat Analysis Card */}
                                    <div className="bg-gray-900 rounded-xl shadow-xl p-8 flex flex-col items-center">
                                        {/* <img
                                            src={threat}
                                            className="w-32 h-32 mb-6 rounded-full object-cover"
                                            alt="Threat Analysis"
                                        /> */}
                                        <h3 className="text-2xl font-semibold text-primary-400 mb-4">
                                            Threat Analysis
                                        </h3>
                                        <p className="font-light leading-relaxed text-gray-300">
                                            We assess potential risks like habitat
                                            loss, poaching, and climate change using
                                            intelligent models to support effective
                                            conservation decisions.
                                        </p>
                                    </div>
                            </div>
                            </div>
                        </section>
                    </main>

                </div>
            </div>
            <Footer />
        </div>
    );
}

export default HomeC;
