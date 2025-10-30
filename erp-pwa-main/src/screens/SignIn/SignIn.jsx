import React from 'react'
import TopBar from '../../components/TopBar/TopBar'
import { Link } from 'react-router-dom'

const SignIn = () => {
    return (
        <>
            <TopBar show_back />

            <div className="flex justify-between flex-col h-[85vh]">
                <div className="">
                    <div className="text-center mt-14 font-bold text-lg mb-2.5">Login</div>
                    <div className="text-black/40 text-center font-bold text-sm">Welcome back! Sign in to continue.</div>

                    <input type="tel" className='mx-auto block w-4/5 border border-[#CCCCCC] rounded-full px-5 py-3 mt-16 mb-5' placeholder='Mobile Number' />
                    <Link to={'/verify-account'} className='text-center w-4/5 px-5 py-3 bg-[#15416E] mx-auto block rounded-full text-white'>Get OTP</Link>
                </div>

                <Link to={'/'} className='text-center w-4/5 px-5 py-2 border border-[#CCCCCC] mx-auto block rounded-full font-medium'>Need Help?</Link>
            </div>

        </>
    )
}

export default SignIn