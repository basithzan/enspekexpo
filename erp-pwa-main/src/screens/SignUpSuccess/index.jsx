import React from "react";
import SignUpImg from "../../assets/image/signupprocess.png";
import { Link } from "react-router-dom";

const SignUpSuccess = () => {
  return (
    <div>
      <div className="flex justify-center   items-center h-[70vh] px-4">
        <img src={SignUpImg} alt="" className="" />
      </div>
      <div className="text-xl font-bold text-center">
        <div>Successfully Registered</div>
        <span className="text-base">
          Your account has been verified succesfully, now let’s enjoy Enspeck
          features!
        </span>
      </div>
      <div className="mt-12 px-4">
      <Link to={'/home-client'}>

        <button
          type="submit"
          className=" mt-4 flex mt-10 items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 border rounded-lg outline-none mb-3 focus:outline-gray-500"
        >
         Go To Home
        </button>
      </Link>
      </div>
    </div>
  );
};

export default SignUpSuccess;
