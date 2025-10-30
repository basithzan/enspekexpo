import React from 'react'
import SplashImg from "../../assets/image/ensp.png";
import {
  EnvelopeIcon
} from "@heroicons/react/24/solid";
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className='grid place-content-center place-items-center h-screen'>
      <img src={SplashImg} className='w-1/2 mb-10' alt="" />
      <div className="font-bold text-black/70 mb-10 text-lg">Welcome to Enspek</div>
      <Link to={'/sign-in'} className='bg-[#15416E] px-16 py-3 rounded-full font-medium text-white/90 leading-none flex items-center justify-center text-sm'>
        <EnvelopeIcon className='w-5 h-5 me-2 inline-block' />
        Login with Mobile Number
      </Link>
      <p className='mt-3 font-bold text-sm text-black/40'>
        Don&apos;t have an account?
        <a href="" className='text-[#15416E] ms-1.5'>Create Account</a>
      </p>
    </div>
  )
}

export default Welcome