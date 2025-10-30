import React from "react";
import Logo from "../../../assets/image/atlassian.png";
import HeartIcon from "../../../assets/image/icons/heart.svg";
import mapIco from "../../../assets/image/icons/map-grey.svg";
import calenderIco from "../../../assets/image/icons/calender.svg";
import moment from "moment";

const JobBlock = ({ category, title, location, date, added_date, item ,scope}) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start gap-3">
        <div className="flex justify-between items-start gap-3">
          <img src={Logo} className="mt-3.5" alt="" />
          <div>
            <div className="font-bold text-[#0F172A]">{title}</div>

            <div className="text-sm text-[#475569]">
              Category:&nbsp;{category}
            </div>
          </div>
        </div>

        {/* <img src={HeartIcon} alt="" /> */}
      </div>
      <div className="flex justify-between items-start gap-3 ms-10">
        {/* <img src={Logo} className="mt-3.5" alt="" /> */}
        <div>
          <div className="text-sm text-[#475569]">Scope : {scope}</div>

        </div>
      </div>
      <div className="flex justify-between items-start gap-3 ms-10">
        {/* <img src={Logo} className="mt-3.5" alt="" /> */}
        <div>
          <div className="text-sm text-[#475569]">Commodity : {item?.commodity}</div>

        </div>
      </div>
      <div className="flex justify-between items-start gap-3 ms-10">
        <div>
        <div className="flex items-center gap-2.5">
        <img src={mapIco} alt="" />

          <div className="text-[#64748B] leading-none font-light">
            {location}
          </div>

        </div>
        </div>
      </div>
      <div className="flex gap-8 mt-3">
        {/* <div className="flex items-center gap-2.5">
          <img src={mapIco} alt="" />
          <div className="text-[#64748B] leading-none font-light">
            {location}
          </div>
        </div> */}
        {/* <div className="flex items-center gap-2.5">
          <img src={calenderIco} alt="" />
          <div className="text-[#64748B] leading-none font-light">{date}</div>
        </div> */}
      </div>
      <div className="flex gap-3 flex-nowrap">
        <div className="text-[#15416E] bg-[#DBEDFF] rounded-lg inline-block px-3 py-1 mt-4 text-xs">
        Posted on {moment(added_date).format("D/M/YYYY")}
        </div>
        <div className="text-[#15416E] bg-[#DBEDFF] rounded-lg inline-block px-3 py-1 mt-4 text-xs">
          RFI  No:&nbsp;RFI{item.id}
        </div>
      </div>

    </div>
  );
};

export default JobBlock;
