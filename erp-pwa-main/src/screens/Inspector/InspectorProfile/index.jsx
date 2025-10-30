import React, { useState } from "react";
import AboutMe from "../../../components/Profile/AbouteMe/AboutMe";
import TopBar from "../../../components/TopBar/TopBar";
import Skills from "../../../components/Skills/Skills";
import Experience from "../../../components/Experience/Experience";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import { UilEdit } from "@iconscout/react-unicons";
import Bg from "../../../assets/image/BG.png";
import Img2 from "../../../assets/image/crystalheal.jpg";
import Edu from "../../../assets/image/education.png";
import TabNavigatorInspector from "../../../components/TabNavigatorInspector";
import { useSelector } from "react-redux";
import { WEBSITE_IMAGE_URL } from "../../../config/api";
import { Link } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/20/solid";

function Profile() {
  const inspector = useSelector((state) => state.inspector.auth_inspector);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const openFileOnBrowser = (file) => {
    if (window.ReactNativeWebView) {
      const response = {
        type: 'open_file_on_browser',
        data: file,
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(response));
    } else {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = file;
      link.target = '_blank'; // Open in a new tab

      // Append the link to the body
      document.body.appendChild(link);

      // Trigger the click event
      link.click();

      // Remove the link from the document
      document.body.removeChild(link);
    }
  }

 


  const handleDeleteClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };
  return (
    <>
      <TopBar title={"Profiles"} show_back show_logout={true} />
      {isPopupVisible && (
        <div className="absolute top-0 left-0 w-full h-[100vh] flex items-center justify-center bg-black bg-opacity-50 z-50 px-5">
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
          src={WEBSITE_IMAGE_URL + "/" + inspector?.user?.details?.avatar}
          alt=""
          className="w-28 h-28 object-cover rounded-full border-[6px] absolute -bottom-14 left-1/2 translate-x-[-50%]"
        />
      </div>
      <div className="w-full items-center justify-center flex ">
        <Link
          to={"/edit-inspector-profile"}
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
        <div
        onClick={() => openFileOnBrowser(WEBSITE_IMAGE_URL + "/" + inspector?.user?.details?.cv)}
          className="bg-[#004E96] text-white px-3 mt-3 border rounded-md py-1 flex  justify-center items-center "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"
            />
          </svg>

          <div>Download CV</div>
        </div>
      </div>

      {/* <div className="flex justify-between mx-5 mt-5 mb-8">
        <div className="bg-[#FAFAFC] px-4 py-2 font-bold rounded-lg">
          {inspector?.user?.appliedCount} &nbsp;
          <span className="font-semibold text-[#78828A]">Applied</span>
        </div>
        <div className="bg-[#FAFAFC] px-4 py-2 font-bold rounded-lg">
          {inspector?.user?.acceptedCount} &nbsp;
          <span className="font-semibold text-[#78828A]">Accepted</span>
        </div>
      </div> */}
      <div className="">
        <AboutMe bio={inspector?.user?.inspector_details?.bio} />
        {/* <Skills /> */}
        <Experience />
        <div>
          <div className="border rounded-2xl border-[#ECF1F6] mt-8 mx-5 px-4 py-2">
            <div className="flex justify-between">
              <div className="font-bold font-sans text-[18px]">Education</div>
              <Link to={"/inspector-education-form"}>
                <div className="">
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
                </div>
              </Link>
            </div>
            {inspector?.user?.details && inspector?.user?.details?.education ? (
              <div className=" py-2">
                {Object.keys(inspector?.user?.details?.education).map((key) => (
                  <div className="flex items-center mt-3">
                    <div className="grow border-b">
                      <div className="text-sm font-semibold mb-1">
                        {inspector?.user?.details?.education[key]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="border rounded-2xl border-[#ECF1F6] mt-8 mx-5 px-4 py-2">
            <div className="flex justify-between">
              <div className="font-bold font-sans text-[18px]">Languages</div>
              <Link to={"/inspector-language-form"}>
                <div className="">
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
                </div>
              </Link>
            </div>
            {inspector?.user?.details && inspector?.user?.details?.languages ? (
              <div className=" py-2">
                {Object.keys(inspector?.user?.details?.languages).map((key) => (
                  <div className="flex items-center mt-3">
                    <div className="grow border-b">
                      <div className="text-sm font-semibold mb-1">
                        {inspector?.user?.details?.languages[key]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="border rounded-2xl border-[#ECF1F6] mt-8 mx-5 px-4 py-2">
            <div className="flex justify-between">
              <div className="font-bold font-sans text-[18px]">
                Certifications
              </div>
              <Link to={"/inspector-certifications-form"}>
                <div className="">
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
                </div>
              </Link>
            </div>
            {inspector?.user?.details &&
            inspector?.user?.details?.certifications ? (
              <div className=" py-2">
                {Object.keys(inspector?.user?.details?.certifications).map(
                  (key) => (
                    <div className="flex items-center mt-3">
                      <div className="grow border-b">
                        <div className="text-sm font-semibold mb-1">
                          {inspector?.user?.details?.certifications[key]}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="border rounded-2xl border-[#ECF1F6] mt-8 mx-5 px-4 py-2">
            <div className="flex justify-between">
              <div className="font-bold font-sans text-[18px]">Courses</div>
              <Link to={"/inspector-courses-form"}>
                <div className="">
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
                </div>
              </Link>
            </div>
            {inspector?.user?.details && inspector?.user?.details?.courses ? (
              <div className=" py-2">
                {Object.keys(inspector?.user?.details?.courses).map((key) => (
                  <div className="flex items-center mt-3">
                    <div className="grow border-b">
                      <div className="text-sm font-semibold mb-1">
                        {inspector?.user?.details?.courses[key]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
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
        <div className="h-[100px]"></div>
        <div className="h-[100px]"></div>

        <TabNavigatorInspector current={"profile"} />
      </div>
    </>
  );
}

export default Profile;
