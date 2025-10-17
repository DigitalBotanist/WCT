import logo from "~/assets/logo.svg"
import { IoLogoInstagram } from "react-icons/io5";
import { FaFacebookSquare } from "react-icons/fa";
import { CiTwitter } from "react-icons/ci";

export default function Footer(){
    return(
        <footer className="bg-slate-800 " >
            <div className="flex flex-row gap-30 pt-5 pb-5 ps-80 items-center">
                <div className=" flex flex-col ps-3 pt-2 pb-2" >
                    <div className="flex gap-3">
                        <img src={logo} className="h-10 w-10 "></img>
                        <p className="text-2xl mt-2 text-emerald-700">WCT</p>
                    </div>
                    <p className="text-l mt-4">Empowering Discovery Through Intelligent<br></br> Wildlife Recognition.</p>
                   
                </div>
                <div className="flex flex-col gap-3">
                     <p className="text-l text-emerald-300">MAIN</p>
                     <p className="text-m">Dashboard</p>
                     <p className="text-m">Home</p>
                     <p className="text-m">About Us</p>
                     <p className="text-m">Pricing</p>
                </div>
                <div className="flex flex-col gap-3">
                     <p className="text-l text-emerald-300">Support</p>
                     <p className="text-m">Contact Us</p>
                     <p className="text-m">Term & Conditions</p>
                     <p className="text-m">Privacy Policy</p>
                     <p className="text-m">Help</p>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-row gap-5">
                        <IoLogoInstagram size={30}/>
                        <FaFacebookSquare size={30}/>
                    </div>
                    <CiTwitter size={30}/>
                </div>
                
            </div>
            <hr className="w-full mx-auto border-t-2 border-white"></hr>
            <p className="text-s pt-5 ps-10 pb-5 text-gray-600">© 2025 Wildlife AI — Empowering Discovery Through Intelligent Wildlife Recognitionx</p>
        </footer>
    )
    
}   