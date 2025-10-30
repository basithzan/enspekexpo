import React from "react";
import TopBar from "../../components/TopBar/TopBar";
import TabNavigatorClient from "../../components/TabNavigatorClient";
import BidStatusDetail from "../../components/BidStatus/BidStatusDetail";
import BidEstimated from "../../components/BidEstimated/BidEstimated";
import TabNavigatorInspector from "../../components/TabNavigatorInspector";

function BidStatus() {
  return (
    <div className="">
      <TopBar title={"Test inspection 1.."} show_back />

      <div className="flex items-center justify-between mx-5 gap-3">
        <div className="bg-[#15416E] text-white py-1 px-3 rounded-md">
          My Bid: $200
        </div>
        <div className="bg-[#FF9D0B] text-white py-1 px-3 rounded-md">
          Status: Pending Review
        </div>
      </div>

      <div className="border rounded-xl px-4 mx-5 py-2 mt-3">
        <div className="grow">
          <div className="text-sm font-bold">
            Job: Test inspection 1 Inspection - #95477
          </div>
          <div className="text-[#8C8C8C] text-sm">
            Created Date: Aug 18, 2022
          </div>
        </div>
      </div>
      <BidStatusDetail />
      <BidEstimated />
      <div className="border rounded-xl px-4 mx-5 py-2 mt-3 align-right m-3">
        <div className="font-bold">Additional Requirements</div>
        <div className="text-xs mt-3">
          DATE OF INSPECTION : loading into containers will be on 27/8/2022
          (scope of inspection is PSI); and witnessing loading into container/s
          until sealing (photos should be taken during inspection and loading) -
          COMMIDITY: Test inspection 1
        </div>
      </div>
      <div className="">Edit My Bid</div>
      <TabNavigatorInspector current={"home"} />
    </div>
  );
}

export default BidStatus;
