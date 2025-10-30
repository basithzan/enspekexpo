import React from "react";
import SplashImg from "../../assets/image/ensp.png";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const WelcomeChoose = () => {
  return (
    <div className="grid place-content-center place-items-center h-screen">
      <img src={SplashImg} className="w-1/2 mb-10" alt="" />
      <div className="font-bold text-black/70 mb-10 text-lg">
        Welcome to Enspek
      </div>
      <Link
        to={"/inspector-login"}
        className="bg-[#15416E] px-16 py-3 rounded-md font-medium text-white/90 leading-none flex items-center justify-center text-lg  w-[80vw]"
      >
        I'm an inspector
      </Link>
      <Link
        to={"/client-login"}
        className="bg-[#15416E] px-16 py-3 rounded-md font-medium text-white/90 leading-none flex items-center justify-center text-lg mt-2 w-[80vw]"
      >
        I'm a client
      </Link>
    </div>
  );
};

export default WelcomeChoose;
