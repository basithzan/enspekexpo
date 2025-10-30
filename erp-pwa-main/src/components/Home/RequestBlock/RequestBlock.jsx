import React from "react";
import Logo from "../../../assets/image/atlassian.png";
import HeartIcon from "../../../assets/image/icons/heart.svg";
import mapIco from "../../../assets/image/icons/map-grey.svg";
import calenderIco from "../../../assets/image/icons/calender.svg";
import moment from "moment";

const RequestBlock = ({
  category,
  title,
  location,
  date,
  status,
  jobId,
  bidAmount,
  rfi,
  is_completed
}) => {
  let statusClass = "";
  let statusNme = "";

  switch (status) {
    case 0:
      statusClass = "bg-[#FF9D0B]";
      statusNme = "Awarded";
      break;
    case 1:
      statusClass = "bg-[#FF9D0B]";
      statusNme = "Voided";
      break;
    case 2:
      statusClass = "bg-[#F90000]";
      statusNme = "Rejected";

      break;
    case 3:
      statusClass = "bg-[#F90000]";
      statusNme = "In Process";

      break;
    case 4:
      statusClass = "bg-[#F90000]";
      statusNme = "No Response";

      break;

    case 5:
      statusClass = "bg-[#4EC506]";
      statusNme = "Completed";

      break;

    case 6:
      statusClass = "bg-[#F90000]";
      statusNme = "Cancelled";
      break;
    default:

      statusNme = "Pending";
      statusClass = "bg-[#FF9D0B]";
  }

  return (
    <div className="border rounded-lg p-4 relative">
      <div className="flex items-start gap-5">
        <img src={Logo} className="mt-3.5" alt="" />
        <div>
          <div className="text-sm text-[#475569]">
            Category:&nbsp;{category}
          </div>
          <div className="font-bold text-[#0F172A]">{title}</div>
        </div>
      </div>

      <div className="flex gap-8 mt-3">
        <div className="flex items-center gap-2.5">
          <img src={mapIco} alt="" />
          <div className="text-[#64748B] leading-none font-light">
            {location}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <img src={calenderIco} alt="" />
          <div className="text-[#64748B] leading-none font-light">
            {moment(date).format("D/M/Y")}
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-nowrap">

        <div className="text-[#15416E] bg-[#DBEDFF] rounded-lg inline-block px-3 py-1 mt-4 text-xs">
          RFI  No:&nbsp;RFI{rfi}
        </div>
      </div>
      {is_completed ? (
        <div
          className={`px-2.5 py-1.5 min-w-[90px] max-w-[90px]  text-sm font-light text-white rounded-s-md absolute right-0 top-2 bg-[#4EC506]`}
        >
          Completed
        </div>
      ) : (
        <div
          className={`px-2.5 py-1.5 min-w-[90px] max-w-[90px]  text-sm font-light text-white rounded-s-md absolute right-0 top-2 ${statusClass}`}
        >
          {" "}
          {statusNme}
        </div>
      )}

    </div>
  );
};

export default RequestBlock;
