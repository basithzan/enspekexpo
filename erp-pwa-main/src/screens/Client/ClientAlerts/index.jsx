import React, { useEffect } from "react";
import TopBar from "../../../components/TopBar/TopBar";
import ErpSelect from "../../../components/InputFields/ErpSelect/ErpSelect";
import SearchBar from "../../../components/Home/SearchBar/SearchBar";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import RequestBlock from "../../../components/Home/RequestBlock/RequestBlock";
import { getClientAlerts } from "../../../store/client/clientSlice";
import AlertBlock from "../../../components/Home/AlertBlock/AlertBlock";
import Loading from "../../../components/Loading";

const ClientAlerts = () => {
  const client = useSelector((state) => state.client.auth_client);
  const client_loading = useSelector((state) => state.client.client_loading);
  const client_alerts = useSelector((state) => state.client.client_alerts);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getClientAlerts(client?.user.auth_token));
  }, []);
  return (
    <>
      {client_loading ? (
        <Loading title={"Loading..."} />
      ) : (
        <>
          <TopBar title={"My Alerts"} show_back />

          {client_alerts && client_alerts?.alerts && (
            <>
              {client_alerts?.alerts?.map((item, indexQ) => (
                <Link to={"/view-inspection/" + item?.enquiry?.id}>
                  <div className="grid gap-4 px-5 mt-2">
                    <AlertBlock
                      title={item.enquiry?.job_title}
                      message={item?.message}
                      is_read={item?.is_read}
                      date={item?.created_at}
                      jobId={item.enquiry_no}
                      bidAmount="200"
                    />
                  </div>
                </Link>
              ))}
            </>
          )}
        </>
      )}

      <TabNavigatorClient current={"client-alerts"} />
    </>
  );
};

export default ClientAlerts;
