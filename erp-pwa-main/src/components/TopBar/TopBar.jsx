import React, { useEffect, useState } from "react";
import backBtn from "../../assets/image/icons/back-btn.svg";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutClient } from "../../store/client/clientSlice";
import { logoutInspector } from "../../store/inspector/inspectorSlice";
import moment from "moment";
import axios from "axios";
import { WEBSITE_API_URL } from "../../config/api";

function TopBar({ title, show_back, show_logout, show_check_in, isLocationFetched, __grabLocation, availability, enquiry_id }) {
  const navigate = useNavigate();
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [isCurrentDateAvailable, setIsCurrentDateAvailable] = useState(false);

  const [currentDate, setCurrentDate] = useState(moment().format("DD/MM/YYYY"));
  const [nextCheckInDate, setNextCheckInDate] = useState(null);

  const inspector = useSelector((state) => state.inspector.auth_inspector);

  const __goBack = () => {
    navigate(-1);
  };

  useEffect(() => {
   
    // Check if the user already checked in for today
    const checkIfAlreadyCheckedIn = async () => {
      try {
        const response = await axios.get(WEBSITE_API_URL + `/check-ins`, {
          params: {
            date: currentDate,
            enquiry_id: enquiry_id // Include enquiry_id as a query parameter
          },

          headers: {
            'Authorization': `Bearer ${inspector?.user?.auth_token}` // Attach the token in the header
          }
        });
        if (response.data.checked_in == true) {
          setAlreadyCheckedIn(true);
        }
      } catch (error) {
        console.error("Error checking check-in status", error);
      }
    };

    if (inspector?.user?.auth_token) {
    checkIfAlreadyCheckedIn();
      
    }
  }, [currentDate, ]);




  useEffect(() => {
    // Parse availability string into an array of moment objects
    const availableDates = availability?.split(',')
      .map(date => moment(date, 'DD/MM/YYYY')); // Convert each date string to a moment object

    // Find the next available date that is after today
    const nextDate = availableDates?.find(date => date.isAfter(moment()));

    if (nextDate) {
      setNextCheckInDate(nextDate?.format('DD/MM/YYYY')); // Format as 'DD/MM/YYYY'
    }

    const isCurrentDateAvailable = availableDates?.some(date => date.isSame(moment(), 'day'));
    if (isCurrentDateAvailable) {
      setIsCurrentDateAvailable(true)
    }




    // Check if the user already checked in for today (logic omitted for brevity)
    // You would call your API here to see if they already checked in

  }, [availability]);

  const dispatch = useDispatch();

  return (
    <nav className="flex items-center pt-8 pb-5 px-5 gap-5">
      {show_back && (
        <div onClick={__goBack}>
          <img src={backBtn} alt="" />
        </div>
      )}
      <h1 className="text-md font-semibold grow">
        {title && title?.length > 12 ? `${title?.substring(0, 12)}...` : title}
      </h1>      {show_logout && (
        <div className="justify-end">
          <div
            onClick={() => {
              dispatch(logoutClient());
              dispatch(logoutInspector());
              navigate("/");
            }}
            className="flex items-center border p-2 rounded-lg bg-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            <div className="text-sm ms-2">Sign Out</div>
          </div>
        </div>
      )}
      {show_check_in &&

        <>

          {isCurrentDateAvailable ? (
            <>
              {alreadyCheckedIn ? (
                <div className="flex flex-col items-start bg-gray-400 text-white text-xs px-2 py-2 font-bold rounded-sm">

                  <div className=" ">Already checked in</div>
                  {nextCheckInDate ? (
                    <div className=" ">Next check-in date is {nextCheckInDate}</div>
                  ) : (
                    <div className=" " >No upcoming check-in dates available</div>
                  )}
                </div>

              ) : (
                <div className="justify-end">
                  <div
                    onClick={() => __grabLocation()}
                    className="flex items-center border px-2.5 py-2.5 text-sm text-center font-bold text-white rounded-md float-right bg-[#15416E]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    <div className="text-sm ms-2">{isLocationFetched ? "Re Check In" : "Check In"}</div>
                  </div>
                </div>
              )}

            </>
          ) : (
            <>
              {nextCheckInDate ? (
                <div className="text-sm text-gray-500">Next check-in date is {nextCheckInDate}</div>
              ) : (
                <div className="text-sm text-gray-500" 
                 onClick={() => __grabLocation()}>No upcoming check-in dates</div>
              )}

            </>
          )}
        </>
      }
    </nav>
  );
}

export default TopBar;
