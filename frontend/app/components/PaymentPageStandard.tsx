import React from 'react'
import { CheckIcon } from "@heroicons/react/24/solid";
import Navbar from './Navbar';
import Footer from './Footer'
import {Link} from 'react-router'
import {useState} from 'react'

export default function Standard(){
    const [showpopup,setShowPopUp]=useState(false);
    const handleSubmit=()=>{
        setShowPopUp(true);
        
    };

    return(
        <>
            <div> 
                <Navbar/>
            </div>
            <div className='min-h-screen bg-slate-900 flex items-center justify-center h-screen'>

                <section className="flex flex-row  gap-50 ">
                        <div className='flex flex-col '>
                            <div className='flex gap-3 mt-30'>
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D97706]">
                                    <CheckIcon className='text-black text-sm' />
                                </div>
                                <p className="text-2xl text-white ">50 Images per Day</p>
                            </div>

                            <div className='flex gap-3 mt-30'>
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D97706]">
                                    <CheckIcon className='text-black text-sm' />
                                </div>
                                <p className="text-2xl text-white">200 AI chats</p>
                            </div>

                            <div className='flex gap-3 mt-30'>
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D97706]">
                                    <CheckIcon className='text-black text-sm' />
                                </div>
                                <p className="text-2xl text-white ">All three agents (SpeciesID,Migration,Threats)</p>
                            </div>

                            <div className='flex gap-3 mt-30'>
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D97706]">
                                    <CheckIcon className='text-black text-sm' />
                                </div>
                                <p className="text-2xl text-white ">Data retention 6 months</p>
                            </div>
                            
                        </div>
                        <div className='min-h-1 w-px bg-white'></div>

                        <div className='flex flex-col '>
                                
                                <h1 className='text-[#33CE95] font-semibold text-5xl '>Standard Version</h1>
                            
                            
                            
                                <p className='text-2xl text-white mt-30'>Gmail </p>
                                <input className='bg-slate-800 rounded-lg placeholder:Enter Gmail p-1 h-10'></input>

                                <p className='text-2xl text-white mt-15'>Credit Card Number</p>
                                <input className='bg-slate-800 rounded-lg placeholder:Enter credit card number p-1 h-10'></input>

                                <div className='flex flex-row gap-10 mt-15'>
                                    <div className='flex flex-col'>
                                        <p className='text-2xl text-white'>Expiration</p>
                                        <input className='bg-slate-800 rounded-lg placeholder:Enter Expiry Date  p-1 '></input>
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='text-2xl text-white'>Security code </p>
                                        <input className='bg-slate-800 rounded-lg placeholder:Enter Security Code p-1 '></input>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-2 mt-15'>
                                    <label htmlFor='city' className='text-2xl font-medium text-white'>Choose a Country</label>
                                    <select id='city' className='w-50 h-10 rounded-lg border border-[#33CE95]  bg-slate-800 px-3 py-2 text-[#A7F3D0] text-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500'>
                                        <option value="">Select</option>
                                        <option value="America">America</option>
                                        <option value="India">India</option> 
                                        <option value="Sri Lanka">Sri Lanka</option>  
                                        <option value="Russia">Russia</option> 
                                        <option value="United Kingdom">United Kingdom"</option>
                                    </select>
                                </div>
                            
                            <div className='flex justify-center items-center mt-15'>
                                
                                    <button onClick={handleSubmit}  className='bg-gradient-to-r from-[#07DEA1] to-[#047857] hover:from-[#10B981] hover:to-[#064E3B]  rounded-2xl  ps-5 pe-5 pt-2 pb-2 w-40 h-15 text-lg '>Submit</button>
                               

                                {/* Popup Box */}
                                {showpopup &&(
                                    <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
                                        <div className='bg-white rounded-2xl p-6 shadow-xl w-80 text-center animate-fade-in'>
                                            <h2 className="text-lg font-semibold text-emerald-600">
                                                🎉 You unlocked the Standard Version!
                                            </h2>
                                            <p className="mt-2 text-sm text-gray-600">
                                                Enjoy your Standrd Version.
                                            </p>
                                            <Link type='button' to='/auth'>
                                                <button  className='mt-4 bg-gradient-to-r from-emerald-500 to-teal-700 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-800 transition-all'>
                                                    ok
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                
                            </div>
                            
                        </div>
                    
                </section>
                
            </div>
        
        <Footer/>
        </>
    )
}