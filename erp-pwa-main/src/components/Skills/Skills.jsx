import React from "react";
import { UilEdit } from "@iconscout/react-unicons";

function Skills() {
  return (
    <div>
      <div className="border rounded-2xl border-[#ECF1F6] mx-5 px-4 py-3 mt-8">
        <div className="flex justify-between px-2">
          <div className="font-bold text-[17px] font-inter">Skills</div>
          <div className="">
            <UilEdit size="26" />
          </div>
        </div>
        <div className="flex flex-wrap justify-evenly m-3">
          <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
            Construction
          </div>
          <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
            Agricultural Services
          </div>
          <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
            Forestry
          </div>
          <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
            Mining
          </div>
          <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
            Retail Trade
          </div>
          <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
            Retail Trade
          </div>
          <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
            Retail Trade
          </div>
          <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
            Retail{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skills;
