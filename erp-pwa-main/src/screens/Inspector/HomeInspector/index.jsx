import React, { useEffect, useState } from "react";
import HomeHeader from "../../../components/Home/HomeHeader/HomeHeader";
import SearchBar from "../../../components/Home/SearchBar/SearchBar";
import DashboardBlockContainer from "../../../containers/Home/DashboardBlockContainer/DashboardBlockContainer";
import JobsNearContainer from "../../../containers/Home/JobsNearContainer/JobsNearContainer";
import RecentBidsContainer from "../../../containers/Home/RecentBidsContainer/RecentBidsContainer";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import TabNavigatorInspector from "../../../components/TabNavigatorInspector";
import { getMyBids, getNearByJobs, updateInspectorData } from "../../../store/inspector/inspectorSlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../components/Loading";
import { getAllCountries } from "../../../store/client/clientSlice";
import { WEBSITE_API_URL } from "../../../config/api";
import axios from "axios";
import TwilioVideoList from "../../../components/TwilioVideoList";

const HomeInspector = () => {
  const inspector = useSelector((state) => state.inspector.auth_inspector);
  const inspector_loading = useSelector(
    (state) => state.inspector.inspector_loading
  );
  const dispatch = useDispatch();
  const [capturedImage, setCapturedImage] = useState(null); // State to store the image URL

  const getDeviceTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };
  useEffect(() => {
    // console.log(getDeviceTimezone()); // Example output: "America/New_York"

    saveTimezone()
    dispatch(getNearByJobs(inspector?.user.auth_token));
    dispatch(getMyBids(inspector?.user.auth_token))
    dispatch(updateInspectorData(inspector?.user.auth_token))
    dispatch(getAllCountries(inspector?.user.auth_token))

    // Add event listener to listen to messages from the WebView
    // Determine the platform by checking the user agent
    const isAndroid = navigator.userAgent.toLowerCase().includes('android');
    const isIOS = navigator.userAgent.toLowerCase().includes('iphone') || navigator.userAgent.toLowerCase().includes('ipad');

    if (isAndroid) {
      document.addEventListener("message", handleWebViewMessage);
    } else if (isIOS) {
      window.addEventListener("message", handleWebViewMessage);
    }

    // Clean up event listener when the component unmounts
    return () => {
      if (isAndroid) {
        document.removeEventListener("message", handleWebViewMessage);
      } else if (isIOS) {
        window.removeEventListener("message", handleWebViewMessage);
      }
    };


  }, []);

  const saveTimezone = async () => {

    const timezone = getDeviceTimezone();


    try {
      const token = inspector?.user.auth_token; // Ensure auth token is available
      const response = await axios.post(
        WEBSITE_API_URL +  '/update-timezone',
        { timezone },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the auth token in headers
          },
        }
      );
      console.log(response.data.message);
    } catch (error) {
      console.error("Error updating timezone:", error);
    }
  };

  const handleWebViewMessage = (event) => {
    // Parse the incoming message data
    const response = JSON.parse(event.data);

    // Handle the message based on its type
    if (response.type === "photo_upload") {
      setCapturedImage(response.data); // Set the captured image URL to state
    }
  };


  const __openCamera = () => {
    if (window.ReactNativeWebView) {
      const response = {
        type: 'open_camera',
        data: [],
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(response));
    }
  }

  const inspectorLocation = inspector?.user?.inspector_details?.location
    || inspector?.user?.details?.inspector_details?.location
    || inspector?.user?.details?.location;

  const inspectorCountry = inspector?.user?.inspector_details?.country?.name
    || inspector?.user?.details?.inspector_details?.country?.name
    || inspector?.user?.country?.name
    || inspector?.user?.details?.country?.name;

  const headerLocation = [inspectorLocation, inspectorCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {/* <button type="button" onClick={__openCamera} className="camera-button">Open Camera</button> */}

      {capturedImage && (
        <div className="captured-image-container">
          <img src={capturedImage} alt="Captured" style={{ width: "100%", maxWidth: 400, marginTop: 20 }} />
        </div>
      )}
      <input
        style={{ display: 'none' }}
        required
        id="capture-image" accept="image/*" capture="environment"
        onChange={(e) => handleCheckInPhotoUpload(e)}
        type="file"
        className={`w-full border border-[#E2E8F0] rounded-lg px-3 py-3`}
      />
      {inspector_loading ? (
        <Loading title={"Loading..."} />
      ) : (
        <div className="pb-16">
          <HomeHeader
            show_notification={false}
            location={headerLocation || inspector?.user?.country?.name}
            username={inspector?.user?.name}
          />
          {/* <SearchBar placeholder={"Search jobs..."} /> */}
          <DashboardBlockContainer />
          <JobsNearContainer />
          <RecentBidsContainer />

          {/* Twilio Video Section */}
          <div className="px-4 py-4">
            {/* <TwilioVideoList /> */}
          </div>
        </div>
      )}

      <TabNavigatorInspector current={"home"} />
    </>
  );
};

export default HomeInspector;
