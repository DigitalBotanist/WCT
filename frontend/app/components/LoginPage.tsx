import logo from '../assets/logo_with_name.svg'
import polarImg from '../assets/polar_bear.png'

export default function LoginPage() {
    return (
        <div className="absolute w-full h-full bg-black flex items-center flex-col justify-center">
            {/* logo */}
            <div className='mb-8'>
                <img src={logo} alt="logo" />
            </div>
            {/* body */}
            <div className="relative w-4/7 h-3/4 bg-background-800  rounded-4xl flex p-2">
                <img src={polarImg} alt="" className=' w-1/2 object-cover rounded-4xl'/>
                {/* login form */}
                <form action="" className='w-1/2 h-full flex flex-col justify-center items-center p-10 gap-8'>
                    <h1 className='text-5xl'>Login</h1>
                    <div className='flex flex-col w-full'>
                        <label htmlFor="email" className='mb-1'>Email</label>
                        <input type="email" name="email" id="email" className='bg-background-400 px-4 py-3 rounded-lg' placeholder='Enter email'/> 
                        <span className='h-4'></span>
                        <label htmlFor="password" className='mb-1'>Password</label>
                        <input type="password" name="password" id="password" className='bg-background-400 px-4 py-3 rounded-lg' placeholder='Enter password'/> 
                    </div>
                    <button type="submit" className='bg-primary-600 w-full py-3 rounded-lg'>Login</button>
                </form>
            </div>
        </div>
    )
}