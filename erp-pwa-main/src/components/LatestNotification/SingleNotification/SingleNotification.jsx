import React from "react";
import Logo from "../../../assets/image/atlassian.png";

const SingleNotification = () => {
  return (
    <>
      <div className="border rounded-lg px-4 mx-5 py-2">
        <div className="flex items-center gap-5">
          <img src={Logo} className="mt-3.5" alt="" />
          <div className="grow">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#64748B]">Related to your latest bid</div>
              <div className="text-xs text-[#2684FF]">30 minutes ago</div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="font-bold text-xl">
                Test inspection 1 Inspection
              </div>
              <button className="text-white bg-[#15416E] py-1 px-2 rounded-md">
                View
              </button>
            </div>
            <div className="text-[#64748B]">Bid Submitted | Aug 18 2022 5:39PM</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleNotification;
