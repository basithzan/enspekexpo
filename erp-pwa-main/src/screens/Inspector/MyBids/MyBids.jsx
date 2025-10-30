import React from "react";
import TopBar from "../../../components/TopBar/TopBar";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import RequestBlock from "../../../components/Home/RequestBlock/RequestBlock";
import TabNavigatorInspector from "../../../components/TabNavigatorInspector";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import InspectorRequestBlock from "../../../components/Home/RequestBlock/InspectorRequestBlock";

const MyBids = () => {
  const my_bids = useSelector((state) => state.inspector.my_bids);
  console.log(my_bids);

  return (
    <>
      <TopBar title={"My Bids"} show_back />
      {my_bids && my_bids?.my_bids && (
        <div className="px-5 pb-20">
          {my_bids?.my_bids?.map((item, indexQ) => (
            <Link to={"/bid-now/" + item.id}>
              <div className="grid gap-4 mt-2">
                <InspectorRequestBlock
                  category={item.category}
                  title={item.job_title}
                  location={item?.country?.name}
                  date={item.created_at}
                  status={item?.accepted_inspectors[0]?.status}
                  jobId={item.id}
                  bidAmount={item?.accepted_inspectors[0]?.amount}
                  commodity = {item.commodity}
                  bidCurrency={item?.accepted_inspectors[0]?.currencies}
                  bid={item}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
      <TabNavigatorInspector current={"my-bids"} />
    </>
  );
};

export default MyBids;
