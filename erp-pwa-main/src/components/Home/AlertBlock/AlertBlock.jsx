import React from "react";
import { UilBell } from "@iconscout/react-unicons";
import moment from "moment";
const AlertBlock = ({
  message,
  title,
  is_read,
  date,
  status,
  jobId,
  bidAmount,
}) => {
  let statusClass = "";
  let statusNme = "";

  switch (status) {
    case 1:
      statusClass = "bg-[#FF9D0B]";
      statusNme = "Pending";
      break;
    case 2:
      statusClass = "bg-[#4EC506]";
      statusNme = "Accepted";

      break;
    case 3:
      statusClass = "bg-[#F90000]";
      statusNme = "Rejected";

      break;

    case 5:
      statusClass = "bg-[#4EC506]";
      statusNme = "Completed";

      break;
    default:
      statusNme = "Pending";
      statusClass = "bg-[#FF9D0B]";
  }

  return (
    <div
      className={`border rounded-lg p-4 relative ${
        is_read ? "bg-white" : "bg-[#DBEDFF]"
      }`}
    >
      <div className="flex items-start gap-5">
        <UilBell
          size="16"
          className={`mt-1 font-semibold
              ${"text-[#15416E]"}`}
        />
        <div>
          <div className="font-bold text-[#0F172A]">{title}</div>
        </div>
      </div>
      <div className="flex gap-3 flex-nowrap">
        <div className="text-[#15416E]  rounded-lg inline-block px-3 py-1 mt-2 text-xs">
          &nbsp;{message}
        </div>
      </div>
      <div className="text-[#15416E]  rounded-lg  px-3 py-1  text-xs  flex flex-row-reverse">
        {moment(date).format("D/M/Y")}
      </div>
    </div>
  );
};

export default AlertBlock;
