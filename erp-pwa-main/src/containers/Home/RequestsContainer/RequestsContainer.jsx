import React, { useEffect } from "react";
import BlockHeading from "../../../components/Home/BlockHeading/BlockHeading";
import BidBlock from "../../../components/Home/BidBlock/BidBlock";
import { useDispatch, useSelector } from "react-redux";
import { getClientRequests } from "../../../store/client/clientSlice";
import { Link } from "react-router-dom";
import RequestBlock from "../../../components/Home/RequestBlock/RequestBlock";

const RequestsContainer = () => {
  const client = useSelector((state) => state.client.auth_client);
  const client_requests = useSelector((state) => state.client.client_requests);

  return (
    <div className="mx-5 py-4">
      {client_requests && client_requests?.enquiries && (
        <>
          <BlockHeading title={"My Requests"} route={"/my-requests"} />
          {client_requests?.enquiries?.slice(0, 5)?.map((item, indexQ) => (
            <>
            <Link to={"/view-inspection/" + item.id}>
              <div key={item.id} className="grid gap-4  mt-2">
                <RequestBlock
                  category={item.category}
                  title={item.job_title}
                  location={item?.country?.name}
                  date={item?.created_at}
                  status={parseInt(item?.status)}
                  jobId={item.enquiry_no}
                  bidAmount="200"
                  rfi={item.id}
                  is_completed ={item.is_completed}
                  
                />
              </div>
            </Link>
            </>
          ))}
        </>
      )}
    </div>
  );
};

export default RequestsContainer;
