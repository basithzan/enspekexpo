import React from 'react'
import SplashImg from "../../assets/image/ensp.png";

function SplashScreen() {
  return (
    <div className='grid place-items-center w-screen h-screen'>
      <img src={SplashImg} className='w-2/3' alt="" />
    </div>
  )
}

export default SplashScreen