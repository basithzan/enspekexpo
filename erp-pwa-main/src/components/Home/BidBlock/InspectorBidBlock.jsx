import React from "react";
import Logo from "../../../assets/image/atlassian.png";
import dropIco from "../../../assets/image/icons/dropdown-btn.svg";
import budgetIco from "../../../assets/image/icons/budget.svg";

const InspectorBidBlock = ({ jobId, title, status, bidAmount, budgetAmount,bidCurrency,bid }) => {
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
      case 6:
        statusClass = "bg-orange-500";
        statusNme = "Proceeded";
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
          <div className="text-sm text-[#475569]">RFI No:&nbsp;RFI{jobId}</div>
          <div className="font-bold text-[#0F172A]">{title}</div>
        </div>
       
        {bid?.accepted_inspectors &&  bid?.accepted_inspectors?.length > 0 && bid?.accepted_inspectors[0].status == 5? (
          <div
          className={`px-1 py-1.5 min-w-[90px] max-w-[90px] flex items-center justify-center text-sm font-light text-white rounded-md float-right bg-[#4EC506]`}
        > Completed</div>

            ) : (
              <div
          className={`px-1 py-1.5 min-w-[90px] max-w-[90px] flex items-center justify-center text-sm font-light text-white rounded-md float-right ${statusClass}`}
        >
          {statusNme}
        </div>
            )}
      </div>
      <div className="flex items-end justify-between pt-3">
        <div className="flex items-center ml-14 gap-2 text-[#64748B]">
          <img src={budgetIco} alt="" />
          {bidAmount && (
          <div className="text-sm leading-none">
            Bid Amount:&nbsp;{bidCurrency}{bidAmount}
          </div>
          )}
          {budgetAmount && (
            <div className="text-sm leading-none">
              Bid Amount:&nbsp;${budgetAmount}
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default InspectorBidBlock;