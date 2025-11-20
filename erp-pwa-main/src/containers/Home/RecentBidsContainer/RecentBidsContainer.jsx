import React from "react";
import BlockHeading from "../../../components/Home/BlockHeading/BlockHeading";
import BidBlock from "../../../components/Home/BidBlock/BidBlock";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import InspectorBidBlock from "../../../components/Home/BidBlock/InspectorBidBlock";

const RecentBidsContainer = () => {
  const my_bids = useSelector((state) => state.inspector.my_bids);

  return (
    <div className="mx-5 py-4">
      {my_bids && my_bids?.my_bids && (
        <>
          <BlockHeading title={"My Recent Bids"} route={"/my-bids"} />
          {my_bids?.my_bids?.slice(0, 5)?.map((item, indexQ) => (
            <Link to={"/bid-now/" + item.id}>
              <div className="grid gap-4 mt-2">
                <InspectorBidBlock
                  jobId={item.id}
                  title={item.job_title}
                  status={item?.accepted_inspectors[0]?.status}
                  bidAmount={item?.accepted_inspectors[0]?.amount}
                  bidCurrency={item?.accepted_inspectors[0]?.currencies}
                  bid={item}
                />
              </div>
            </Link>
          ))}
        </>
      )}
    </div>
  );
};

export default RecentBidsContainer;
