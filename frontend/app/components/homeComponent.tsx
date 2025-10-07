import React from "react";
import Navbar from "./Navbar"; 

function HomeC() {
    return ( 
        <div>
        <Navbar/>
            <div className="bg-slate-900">
            <div className="bg-slate-900 text-gray-900">
                <main>

                    {/* Hero Section */}
                    <section className="pt-20 md:pt-40 my-12">
                    <div className="container mx-auto px-8 lg:flex">
                        <div className="text-center lg:text-left lg:w-1/2">
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-none text-gray-300">
                            Empowering Conservation Through AI.
                        </h1>
                        <p className="text-xl lg:text-2xl mt-6 font-light text-slate-300">
                            Use AI to understand nature better. Track species, discover threats, and 
                            contribute to global conservation efforts effortlessly
                        </p>
                        <p className="mt-8 md:mt-12">
                            <button type="button" className="py-4 px-12 bg-emerald-800 hover:bg-emerald-600 rounded text-white">
                            Get Started
                            </button>
                        </p>
                        </div>

                        <div className="text-4xl text-white pl-48">
                        <img src="./paw.png" width={400} height={400} alt="Paw" />
                        </div>
                    </div>
                    </section>

                    {/* Main Features Heading */}
                    <div className="text-center my-12">
                    <h2 className="text-3xl lg:text-5xl font-semibold text-gray-300">Main Features</h2>
                    </div>

                    {/* Species Identification */}
                    <section id="services" className="py-20 text-white bg-slate-800">
                    <div className="container mx-auto px-16 items-center flex flex-col lg:flex-row">
                        <div className="lg:w-1/2">
                        <div className="lg:pr-32 xl:pr-48">
                            <h3 className="text-3xl font-semibold leading-tight">Species Identification</h3>
                            <p className="mt-8 text-xl font-light leading-relaxed">
                            We identify wildlife species using advanced image recognition and AI-driven tools, 
                            ensuring accurate and efficient biodiversity monitoring across habitats.
                            </p>
                        </div>
                        </div>
                        <img src="./ident.png" className="w-62 h-64" alt="Species Identification" />
                    </div>
                    </section>

                    {/* Migration Pattern Analysis */}
                    <section className="py-20 text-white">
                    <div className="container mx-auto px-16 items-center flex flex-col lg:flex-row">
                        <div className="lg:w-1/2">
                        <div className="lg:pl-32 xl:pl-48">
                            <h3 className="text-3xl font-semibold leading-tight">Migration Pattern Analysis</h3>
                            <p className="mt-8 text-xl font-light leading-relaxed">
                            We analyze animal migration routes through tracking data and visual maps, revealing seasonal movements and environmental behavior patterns.
                            </p>
                        </div>
                        </div>
                        <img src="./migration.png" className="w-62 h-64 pl-48" alt="Migration" />
                    </div>
                    </section>

                    {/* Threat Analysis */}
                    <section className="py-20 text-white bg-slate-800">
                    <div className="container mx-auto px-16 items-center flex flex-col lg:flex-row">
                        <div className="lg:w-1/2">
                        <div className="lg:pr-32 xl:pr-48">
                            <h3 className="text-3xl font-semibold leading-tight">Threat Analysis</h3>
                            <p className="mt-8 text-xl font-light leading-relaxed">
                            We assess potential risks like habitat loss, poaching, and climate change using intelligent models to support effective conservation decisions.
                            </p>
                        </div>
                        </div>
                        <img src="./threat.png" className="w-62 h-64" alt="Threat" />
                    </div>
                    </section>

                    {/* Stats Section */}
                    <section id="stats" className="py-20 lg:pt-32 text-center">
                    <div className="container mx-auto">
                        <p className="uppercase tracking-wider text-gray-600">Our customers get results</p>
                        <div className="flex flex-col sm:flex-row mt-8 lg:px-24">
                        <div className="w-full sm:w-1/3">
                            <p className="text-4xl lg:text-6xl font-semibold text-teal-500">+100%</p>
                            <p className="font-semibold mb-6">Stats Information</p>
                        </div>
                        <div className="w-full sm:w-1/3">
                            <p className="text-4xl lg:text-6xl font-semibold text-teal-500">+100%</p>
                            <p className="font-semibold mb-6">Stats Information</p>
                        </div>
                        <div className="w-full sm:w-1/3">
                            <p className="text-4xl lg:text-6xl font-semibold text-teal-500">+100%</p>
                            <p className="font-semibold mb-6">Stats Information</p>
                        </div>
                        </div>
                    </div>
                    </section>

                    {/* About Section */}
                    <section className="container mx-auto my-20 py-24 bg-slate-800 rounded-lg text-center text-white">
                    <h3 className="text-5xl font-semibold">Want to know about us?</h3>
                    <p className="mt-8 text-xl font-light">
                        Quis lectus nulla at volutpat diam ut. Enim lobortis scelerisque fermentum dui faucibus in.
                    </p>
                    <p className="mt-8">
                        <button type="button" className="py-5 px-16 text-lg bg-teal-500 hover:bg-teal-600 rounded text-white">
                        About us
                        </button>
                    </p>
                    </section>

                </main>

                {/* Footer */}
                <footer className="container mx-auto py-16 px-3 mt-48 mb-8 text-white">
                    <div className="flex -mx-3">
                    <div className="flex-1 px-3">
                        <h2 className="text-lg font-semibold">About Us</h2>
                        <p className="mt-5">Ridiculus mus mauris vitae ultricies leo integer malesuada nunc.</p>
                    </div>
                    <div className="flex-1 px-3">
                        <h2 className="text-lg font-semibold">Important Links</h2>
                        <ul className="mt-4 leading-loose">
                        <li><a href="https://codebushi.com">Terms &amp; Conditions</a></li>
                        <li><a href="https://codebushi.com">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div className="flex-1 px-3">
                        <h2 className="text-lg font-semibold">Social Media</h2>
                        <ul className="mt-4 leading-loose">
                        <li><a href="https://dev.to/changoman">Dev.to</a></li>
                        <li><a href="https://twitter.com/HuntaroSan">Twitter</a></li>
                        <li><a href="https://github.com/codebushi/gatsby-starter-lander">GitHub</a></li>
                        </ul>
                    </div>
                    </div>
                </footer>
                </div>
        </div>
        </div>
     );
}

export default HomeC;