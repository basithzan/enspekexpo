import React, { useState } from "react";
import TopBar from "../../../components/TopBar/TopBar";
import ErpInputField from "../../../components/InputFields/ErpInputField/ErpInputField";
import ErpTextArea from "../../../components/InputFields/ErpTextArea/ErpTextArea";
import ErpFileInput from "../../../components/InputFields/ErpFileInput/ErpFileInput";
import ErpSubmitBtn from "../../../components/InputFields/ErpSubmitBtn/ErpSubmitBtn";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import Bg from "../../../assets/image/BG.png";
import Img2 from "../../../assets/image/crystalheal.jpg";
import AboutMe from "../../../components/Profile/AbouteMe/AboutMe";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { WEBSITE_URL } from "../../../config/api";
import { TrashIcon } from "@heroicons/react/20/solid";

const ClientProfile = () => {
  const client = useSelector((state) => state.client.auth_client);
  const handleImageError = (event) => {
    // Replace the failed image with the placeholder image
    event.target.src = Img2;
  };

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleDeleteClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };
  return (
    <>
      <TopBar title={"My profile"} show_back show_logout={true} />

      {isPopupVisible && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50 px-5">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="font-bold text-xl mb-4">Delete Account</div>
            <p className="mb-4">
              To delete your account, please mail your registered email ID and phone number to our support team at:
              <br />
              <strong>info@enspek.com</strong>
              <br />
              Once we receive your email, your data and account will be deleted within 15 days.
            </p>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 w-full"
              onClick={handleClosePopup}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="relative mb-16">
        <img src={Bg} alt="" className="w-full px-5" />
        <img
          src={WEBSITE_URL + '/' + client?.user?.client_details?.avatar}
          onError={handleImageError}
          onImã
          alt=""
          className="w-28 h-28 rounded-full border-[6px] absolute -bottom-14 left-1/2 translate-x-[-50%] object-cover"
        />
      </div>
      <div className="text-center grow">
        <div className="font-semibold text-[20px] capitalize">
          {client?.user.name}
        </div>
        <div className="text-[#9CA4AB]">{client?.user.email}</div>
      </div>
      <div className="w-full items-center justify-center flex ">
        <Link
          to={"/edit-client-profile"}
          className="bg-[#004E96] text-white px-3 mt-3 border rounded-md py-1 flex  justify-center items-center "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 me-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          <div>Edit profile</div>
        </Link>
      </div>

      {/* <div className="flex justify-between mx-5 mt-5 mb-8">
        <div className="bg-[#FAFAFC] px-4 py-2 font-bold rounded-lg">
          25 &nbsp;<span className="font-semibold text-[#78828A]">Applied</span>
        </div>
        <div className="bg-[#FAFAFC] px-4 py-2 font-bold rounded-lg">
          25 &nbsp;
          <span className="font-semibold text-[#78828A]">Accepted</span>
        </div>
      </div> */}
      <div className="">
        <AboutMe
          bio={client?.user?.client_details?.bio}
        />
      </div>
      <div>
        <div onClick={handleDeleteClick} className="border rounded-2xl border-[#ECF1F6] px-4 mx-5 py-2 mt-3 align-right" >
          <div className="flex  px-2">
            <div className="mt-2">
              <TrashIcon color="#ff0000" className="h-6" />
            </div>
            <div className="font-bold text-24px text-red-500 mt-2">Delete My Account </div>

          </div>

        </div>
        <div style={{ height: "100px" }}></div>
      </div>
      <TabNavigatorClient current={"client-profile"} />
    </>
  );
};

export default ClientProfile;
