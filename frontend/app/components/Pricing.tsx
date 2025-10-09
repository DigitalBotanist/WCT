import type { JSX } from "react/jsx-runtime";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function Pricing(){
    return(
        <section className="min-h-screen bg-slate-900 py-16">
            <div className="container mx-auto max-w-6xl px-4">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight  text-center ">
                <span className="bg-gradient-to-r from-[#0EAF86] to-[#064938] bg-clip-text text-transparent inline-block">
                    Pricing For Happy Customer
                </span>
                </h1>
                <h4 className="mt-10 text-[#A7F3D0] text-center">Start free.Scale fast.Pay only for what you need</h4>

                <div className="container  mx-auto max-w-6xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 ">
                    {/* Free Version */}
                    <div className=" bg-slate-800 rounded-2xl p-6 shadow-lg h-full flex flex-col">
                        <h4 className="text-[#33CE95] font-semibold text-lg text-center">Free</h4>
                        <hr className="my-2 border-white" />
                        <p className="text-lg text-white text-center">$0</p>
                        <h6 className="text-[#8A8484] text-center">Free for all users</h6>
                        


                        {/* Need to center Items */}
                        <div className="flex flex-col items-center">
                            <div className="flex flex-col gap-3 w-fit">
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">10 Images per Day</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">20 AI chats</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">Species ID+ Special Facts</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">Data retention 30 days</p>
                                </div>  
                            </div>
                        </div> 
                        <div className="text-center mt-14">
                            <span className="bg-gradient-to-r from-[#07DEA1] to-[#047857]  rounded-2xl  ps-10 pe-10 pt-2 pb-2">
                                Free
                            </span> 
                        </div>
                    </div>

                    {/* Standard Vesrion */}
                    <div className=" bg-slate-800 rounded-2xl p-6 shadow-lg h-full flex flex-col">
                        <h4 className="text-[#33CE95] font-semibold text-xl text-center">Standard</h4>
                        <hr className="my-2 border-white" />
                        <p className="text-lg text-white text-center" >$20 / month / user</p>
                        <h6 className="text-[#8A8484] text-center">billed yearly</h6>


                        <div className="flex flex-col items-center">
                            <div className="flex flex-col gap-3 w-fit">
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">50 Images per Day</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">200 AI chats</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">All three agents <br/>(SpeciesID,Migration,Threats)</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">Data retention 6 months</p>
                                </div>  
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <span className="bg-gradient-to-r from-[#07DEA1] to-[#047857]  rounded-2xl  ps-10 pe-10 pt-2 pb-2">
                                Buy Now
                            </span> 
                        </div>
                    </div>



                    {/* Pro Version */}
                    <div className="bg-slate-800 rounded-2xl p-6 shadow-lg h-full flex flex-col">
                        <h4 className="text-[#33CE95] font-semibold text-lg text-center">Pro</h4>
                        <hr className="my-2 border-white" />
                        <p className="text-lg text-white text-center">$50 / month / user</p>
                        <h6 className="text-[#8A8484] text-center">billed yearly</h6>


                        <div className="flex flex-col items-center">
                            <div className="flex flex-col gap-3 w-fit">
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">1000 Images per Day</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">1000 AI chats</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">Bulk export</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]">
                                        <CheckIcon className='text-black text-sm' />
                                    </div>
                                    <p className="text-m text-white text-base">Data retention 24 months</p>
                                </div>  
                            </div>
                        </div>
                        
                        <div className="text-center mt-14">
                            <span className="bg-gradient-to-r from-[#07DEA1] to-[#047857]  rounded-2xl  ps-10 pe-10 pt-2 pb-2">
                                Buy Now
                            </span> 
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}