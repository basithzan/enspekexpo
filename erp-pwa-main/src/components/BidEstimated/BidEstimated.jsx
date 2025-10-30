import React from "react";

function BidEstimated() {
  return (
    <div>
      <div>
        <div className="border rounded-xl px-4 mx-5 py-2 mt-3 align-right m-3">
          <div className="text-xl font-semibold">Estimated Inspection</div>
          <div className="grow">
            <div className="text-base">Start Date:</div>
            <div className="text-xs text-[#535354]">Aug 27, 2022</div>
            <hr />
            <div className="text-base">End Date:</div>
            <div className="text-xs text-[#535354]">Aug 27, 2022</div>
            <hr />
            <div className="text-base">Time:</div>
            <div className="text-xs text-[#535354]">One Time</div>
            <hr />
            <div className="text-base">Country:</div>
            <div className="text-xs text-[#535354]">United Arab Emirates</div>
            <hr />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BidEstimated;
