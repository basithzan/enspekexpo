import React from "react";
import TopBar from "../../components/TopBar/TopBar";
import TabNavigatorClient from "../../components/TabNavigatorClient";
import RequestBlock from '../../components/Home/RequestBlock/RequestBlock'
import TabNavigatorInspector from "../../components/TabNavigatorInspector";

function SavedList() {
  return (
    <div>
      <TopBar title={"My saved List"} show_back />
      {/* <div className="grid gap-4 grid-cols-3 grid-rows-3">
      <div className="border rounded-lg px-4 mx-5 py-2 absolute">
        <div className="flex items-center justify-between gap-3">
          <div className="">image</div>
          <div className="grow">
            <div className="flex items-center justify-between">
              <div className="text-xs">Category: Industrial</div>
              <div className="font-bold">heart</div>
            </div>
            <div className="font-bold">Dubai Pre-Shipment Inspection</div>
          </div>
        </div>
        <div className="flex gap-5">
          <div className="text-[#64748B] font-semibold">Dubai, UAE</div>
          <div className="text-[#64748B] ">Jan 16, 23</div>
        </div>

        <div className="border rounded-lg bg-[#15416E] text-[#DBEDFF] py-1 px-2 float-left relative">
          Extensive Quality Audit
        </div>
      </div>
      </div> */}
      <div className="grid gap-3 px-5 pb-20">

      <RequestBlock
                    category={'Industrial'}
                    title={'Dubai Pre-Shipment Inspection'}
                    location={'Dubai, UAE'}
                    date={'Jan 16, 23'}
                    status={'Rejected'}
                    jobId={'95477'}
                    bidAmount='200'
                />
                </div>
      <TabNavigatorInspector current={"saved-list"}/>
    </div>
  );
}

export default SavedList;
