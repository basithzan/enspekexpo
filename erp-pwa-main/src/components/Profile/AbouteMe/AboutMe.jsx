import React from "react";
import { UilEdit } from "@iconscout/react-unicons";

function AboutMe({ bio }) {
  return (
    <div>
      <div className="border rounded-2xl border-[#ECF1F6] px-4 mx-5 py-2 mt-3 align-right">
        <div className="flex justify-between px-2">
          <div className="font-bold text-24px  mt-2">About Me</div>
          <div className="mt-2">{/* <UilEdit size="26" /> */}</div>
        </div>
        <div className="mt-3 text-[#78828A]">{bio}</div>
      </div>
    </div>
  );
}

export default AboutMe;
