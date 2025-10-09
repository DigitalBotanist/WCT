import React from "react";
import { Link } from "react-router";


function Navbar() {
  return (
     <header className="sticky top-0 bg-slate-700 shadow">
      <div className="container flex flex-col sm:flex-row justify-between items-center mx-auto py-4 px-8">
        <div className="flex items-center text-2xl">
          <div className="mr-3">
            <img src="./logo with name.svg" alt="My SVG" width={100} height={100} />
          </div>
        </div>

        <div className="flex mt-4 sm:mt-0 text-white">
          <Link className="px-4" to="/">Home</Link>
          <Link className="px-4" to="/pricing">Pricing</Link>
          <Link className="px-4" to="/aboutus">About us</Link>
        </div>

        <div className="hidden md:block">
          <Link
            type="button"
            className="py-3 px-8 text-sm bg-emerald-800 hover:bg-emerald-600 rounded text-white"
            to="/auth"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

// Export at the end
export default Navbar;
