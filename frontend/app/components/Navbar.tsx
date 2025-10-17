import React from "react";
import { Link, useLocation } from "react-router";
import logo from '~/assets/logo_with_name.svg'


function Navbar() {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path ? 'underline' : '';
  return (
     <header className="fixed w-full top-5 flex justify-center z-10">
      <div className="w-1/2 container rounded-xl flex bg-primary-900/60  border-primary-600 flex-col sm:flex-row justify-between items-center py-4 px-8">
        <div className="flex items-center text-2xl">
          <div className="mr-3">
            <img src={logo} alt="My SVG" width={150}/>
          </div>
        </div>

        <div className="flex mt-4 sm:mt-0 text-white justify-center">
          <Link className={`px-4 ${isActive("/") && "text-primary-400" }`} to="/">Home</Link>
          <Link className={`px-4 ${isActive("/pricing") && "text-primary-400"}`} to="/pricing">Pricing</Link>
          <Link className={`px-4 ${isActive("/aboutus") && "text-primary-400"}`} to="/aboutus">About us</Link>
        </div>

        <div className="hidden md:block">
          <Link
            type="button"
            className="py-3 px-8 text-sm bg-primary-800 hover:bg-primary-600 rounded text-white"
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
