import React from "react";
import mapIco from "../../../assets/image/icons/map.svg";
import caretDIco from "../../../assets/image/icons/caret-down.svg";
import waveEmoji from "../../../assets/image/icons/wave-emoji.svg";
import notifyIco from "../../../assets/image/icons/notification.svg";
import enspekLogo from "../../../assets/image/ensp.png";
import { Link } from "react-router-dom";

const HomeHeader = ({ show_notification, location, username }) => {
  return (
    <nav className="p-5">
      <div className="flex items-center justify-between">
        <div className="">
          <div className="flex items-center gap-2.5">
            <img src={mapIco} alt="" />
            <div className="text-[#64748B] leading-none font-light text-xs">
              {location}
            </div>
            {/* <img src={caretDIco} alt="" /> */}
          </div>
          <div className="text-[#64748B] text-sm font-medium mt-4 mb-3 leading-none">
            Welcome back!
          </div>
        </div>
        <div className="flex flex-col items-end">
          {show_notification && (
            <Link to={"/client-alerts"}>
              <img src={notifyIco} alt="" />
            </Link>
          )}
          <img src={enspekLogo} alt="" className="w-32" />

        </div>

      </div>
      <div className="flex items-center gap-2">
        <div className="font-bold text-xl leading-none capitalize">
          {username}
        </div>
        <img src={waveEmoji} alt="" />
      </div>

    </nav>
  );
};

export default HomeHeader;
