import React, { useEffect } from "react";
import HomeHeader from "../../../components/Home/HomeHeader/HomeHeader";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import BtnBlock from "../../../components/Home/BtnBlock";
import RequestsContainer from "../../../containers/Home/RequestsContainer/RequestsContainer";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../components/Loading";
import { clearRequestSuccess, getAllCountries, getClientRequests } from "../../../store/client/clientSlice";
import TwilioVideoList from "../../../components/TwilioVideoList";

const HomeClient = () => {
  const client = useSelector((state) => state.client.auth_client);
  const client_loading = useSelector((state) => state.client.client_loading);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getClientRequests(client?.user.auth_token));
    dispatch(clearRequestSuccess())
    dispatch(getAllCountries(client?.user.auth_token))
  }, []);

  const clientLocation = client?.user?.client_details?.city
    || client?.user?.client_details?.location
    || client?.user?.city;

  const clientCountry = client?.user?.client_details?.country?.name
    || client?.user?.country?.name;

  const headerLocation = [clientLocation, clientCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {client_loading ? (
        <Loading title={"Loading..."} />
      ) : (
        <div className="pb-16">
          <HomeHeader
            show_notification
            location={headerLocation || client?.user?.client_details?.country?.name}
            username={client?.user?.name}
          />

          <BtnBlock
            title={"Request For Inspection"}
            link={"/request-inspection"}
          />
          <BtnBlock title={"Upload RFI"} link={"/upload-rfi"} />
          <RequestsContainer />

          {/* Twilio Video Section */}
          <div className="px-4 py-4">
            {/* <TwilioVideoList /> */}
          </div>

          <div className="divide-y-8 h-28"></div>
          <div className="divide-y-8 h-28"></div>

        </div>
      )}

      <TabNavigatorClient current={"home"} />
    </>
  );
};

export default HomeClient;
