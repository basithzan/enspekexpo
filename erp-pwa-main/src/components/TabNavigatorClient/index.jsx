import React from "react";
import {
  UilEstate,
  UilHeart,
  UilUser,
  UilTrophy,
  UilBell,
} from "@iconscout/react-unicons";
import { Link } from "react-router-dom";
const TabNavigatorClient = ({ current }) => {
  return (
    <div>
      <div className="bg-white fixed bottom-0 w-full flex items-center justify-around px-3 py-2 border border-t-2 border-color-red-500 rounded-t-lg">
        <Link
          to={"/home-client"}
          className="flex flex-col items-center justify-center"
        >
          <div>
            <UilEstate
              size="26"
              className={`mt-1 font-semibold
              ${current == "home" ? "text-[#15416E]" : `text-gray-400`}`}
            />
          </div>
          <div
            className={`mt-1 font-semibold text-xs ${
              current == "home" ? "text-[#15416E]" : `text-gray-400`
            }`}
          >
            Home
          </div>
        </Link>
        <Link
          to={"/my-requests"}
          className="flex flex-col items-center justify-center"
        >
          <div>
            <UilTrophy
              size="26"
              className={`mt-1 font-semibold
              ${current == "my-requests" ? "text-[#15416E]" : `text-gray-400`}`}
            />
          </div>
          <div
            className={`mt-1 font-semibold  text-xs  ${
              current == "my-requests" ? "text-[#15416E]" : `text-gray-400`
            }`}
          >
            My Requests
          </div>
        </Link>

        <Link
          to={"/client-alerts"}
          className="flex flex-col items-center justify-center"
        >
          <div>
            <UilBell
              size="26"
              className={`mt-1 font-semibold
              ${current == "client-alerts" ? "text-[#15416E]" : `text-gray-400`}`}
            />
          </div>
          <div
            className={`mt-1 font-semibold  text-xs ${
              current == "client-alerts" ? "text-[#15416E]" : `text-gray-400`
            }`}
          >
            Alerts
          </div>
        </Link>
        <Link
          to={"/client-profile"}
          className="flex flex-col items-center justify-center"
        >
          <div>
            <UilUser
              size="26"
              className={`mt-1 font-semibold
              ${
                current == "client-profile" ? "text-[#15416E]" : `text-gray-400`
              }`}
            />
          </div>
          <div
            className={`mt-1 font-semibold text-xs  ${
              current == "client-profile" ? "text-[#15416E]" : `text-gray-400`
            }`}
          >
            Profile
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TabNavigatorClient;
