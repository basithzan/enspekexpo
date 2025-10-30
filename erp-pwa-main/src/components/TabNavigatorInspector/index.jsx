import React from "react";
import {
  UilEstate,
  UilHeart,
  UilUser,
  UilTrophy,
  UilBell

} from "@iconscout/react-unicons";
import { Link } from "react-router-dom";
const TabNavigatorInspector = ({ current }) => {
  return (
    <div>
      <div className="bg-white fixed bottom-0 w-full flex items-center justify-around px-3 py-2 border border-t-2 border-color-red-500 rounded-t-lg">
        <Link
          to={"/home-inspector"}
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
          to={"/my-bids"}
          className="flex flex-col items-center justify-center"
        >
          <div>
            <UilTrophy
              size="26"
              className={`mt-1 font-semibold
              ${current == "my-bids" ? "text-[#15416E]" : `text-gray-400`}`}
            />
          </div>
          <div
            className={`mt-1 font-semibold  text-xs  ${
              current == "my-bids" ? "text-[#15416E]" : `text-gray-400`
            }`}
          >
            My Bids
          </div>
        </Link>

        {/* <Link
          to={"/my-saved-list"}
          className="flex flex-col items-center justify-center"
        >
          <div>
            <UilHeart
              size="26"
              className={`mt-1 font-semibold
              ${current == "saved-list" ? "text-[#15416E]" : `text-gray-400`}`}
            />
          </div>
          <div
            className={`mt-1 font-semibold  text-xs ${
              current == "saved-list" ? "text-[#15416E]" : `text-gray-400`
            }`}
          >
            Saved
          </div>
        </Link> */}
        <Link
          to={"/inspector-profile"}
          className="flex flex-col items-center justify-center"
        >
          <div>
            <UilUser
              size="26"
              className={`mt-1 font-semibold
              ${current == "profile" ? "text-[#15416E]" : `text-gray-400`}`}
            />
          </div>
          <div
            className={`mt-1 font-semibold text-xs  ${
              current == "profile" ? "text-[#15416E]" : `text-gray-400`
            }`}
          >
            Profile
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TabNavigatorInspector;
