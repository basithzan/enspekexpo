import React from "react";
import Logo from "../../../assets/image/atlassian.png";
import dropIco from "../../../assets/image/icons/dropdown-btn.svg";
import budgetIco from "../../../assets/image/icons/budget.svg";
import moment from "moment";

const BidBlock = ({ jobId, title, status, bidAmount, budgetAmount ,date,rfi}) => {
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
      statusNme = "Proposed";

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
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-8">
        <img src={Logo} className="mt-3.5" alt="" />
        <div className="grow">
          <div className="text-sm text-[#475569]">RFI NO:&nbsp;RFI{jobId}</div>
          <div className="font-bold text-[#0F172A]">{title}</div>
        </div>
        <img src={dropIco} alt="" />
      </div>
      <div className="flex items-end justify-between -mt-2">
        <div className="flex items-center ml-14 gap-2 text-[#64748B]">
          <img src={budgetIco} alt="" />
          {date && (
            <div className="text-sm leading-none">
              Date:{moment(date).format('D/M/Y')}
            </div>
          )}
          {budgetAmount && (
            <div className="text-sm leading-none">
              RFI Number:&nbsp;RFI{rfi}
            </div>
          )}
        </div>
        <div
          className={`px-2.5 py-1.5 text-sm font-light text-white rounded-md float-right ${statusClass}`}
        >
          {statusNme}
        </div>
      </div>
    </div>
  );
};

export default BidBlock;
