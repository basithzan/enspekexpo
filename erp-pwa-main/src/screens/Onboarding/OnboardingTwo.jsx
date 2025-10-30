import React from 'react'
import Img from '../../assets/image/onboard-2-new.png';
import { Link } from 'react-router-dom';

const OnboardingTwo = () => {
  return (
    <div className='grid place-content-center w-screen h-screen text-center'>
      <img src={Img} className='w-11/12 mx-auto REMOVE h-[285px] object-cover object-top REMOVE' alt=""/>
      <div className='px-12 text-[#0F172A] font-medium text-3xl'>Simplify your inspection processes.</div>
      <div className="text-sm px-10 pt-3 pb-5 leading-tight text-[#64748B]">Managing inspection works can get overwhelming, but it doesn&apos;t have to be that way. Now you can simplify your inspection management with Enspek</div>
      <Link to={'/welcome'}>

      <button className='mx-auto bg-[#15416E] text-white font-bold rounded-2xl px-14 py-4'>Get Started</button>
      </Link>
      <div className='mt-5 mx-auto flex gap-1'>
        <div className='h-1 w-1 bg-[#E2E8F0] rounded'></div>
        <div className='h-1 w-6 bg-[#15416E] rounded'></div>
      </div>
    </div>
  )
}

export default OnboardingTwo