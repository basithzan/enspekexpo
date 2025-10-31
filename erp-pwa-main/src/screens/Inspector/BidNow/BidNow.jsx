import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import TopBar from "../../../components/TopBar/TopBar";
import SuccessImg from "../../../assets/image/success-modal.png";
import TabNavigatorInspector from "../../../components/TabNavigatorInspector/index";
import { useDispatch, useSelector } from "react-redux";
import {
  bidEnquiry,
  confirmProceed,
  deleteInspectionDoc,
  emptyBidStatus,
  emptyNoteUploadSuccess,
  emptyUploadSuccess,
  saveCheckInEnquiry,
  submitReportNote,
  uploadFlashReport,
  uploadInspectionData,
  viewSingleEnquiry,
} from "../../../store/inspector/inspectorSlice";
import { VideoCameraIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useParams } from "react-router-dom";
import Loading from "../../../components/Loading";
import moment from "moment";
import { WEBSITE_API_URL } from "../../../config/api";
import DatePicker from "react-multi-date-picker";
import Select from "react-select";
import { amount_type_options } from "../../Client/RequestInspection/datas";
import InspectionMap from "./Map";
import { ArrowDownCircleIcon, TrashIcon } from "@heroicons/react/20/solid";
import { Toaster, toast } from 'sonner'
import { CameraIcon } from "@heroicons/react/24/solid";

// Utility function to detect the device platform
const isAndroid = () => /Android/i.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

const BidNow = ({ route }) => {
  const dispatch = useDispatch();
  const params = useParams();
  const today = new Date();
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const [showAndroidButton, setShowAndroidButton] = useState(false);

  const [values, setValues] = useState([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);
  const [selectedAmountType, setSelectedAmountType] = useState("");
  const [capturedImage, setCapturedImage] = useState(null); // State to store the image URL

  const [currencies, setCurrencies] = useState([]);
  const inspector = useSelector((state) => state.inspector.auth_inspector);
  const bid_success = useSelector((state) => state.inspector.bid_success);
  const upload_success = useSelector((state) => state.inspector.upload_success);
  const note_upload_success = useSelector((state) => state.inspector.note_upload_success);
  const single_job = useSelector((state) => state.inspector.single_job);
  const inspector_loading = useSelector(
    (state) => state.inspector.inspector_loading
  );
  const countries = useSelector((state) => state.client.countries);
  const [countriesOptions, setCountriesOptions] = useState([]);

  const [isOpenPopup1, setIsOpenPopup1] = useState(false);
  const [isOpenPopup2, setIsOpenPopup2] = useState(false);
  const [uploadSucessPopUp, setuploadSucessPopUp] = useState(false);
  const [noteuploadSucessPopUp, setnoteuploadSucessPopUp] = useState(false);
  const [docName, setdocName] = useState("");
  const [flashName, setflashName] = useState("");
  const [reportNote, setreportNote] = useState("");
  const [isLocationFetched, setIsLocationFetched] = useState(false);
  const [fetchedLocation, setFetchedLocation] = useState([]);
  const [checkInNote, setCheckInNote] = useState("");
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkInphotoPreview, setCheckInPhotoPreview] = useState(null); // To store the image preview

  // Video conferencing states
  const [activeVideoCalls, setActiveVideoCalls] = useState([]);
  const [videoCallLoading, setVideoCallLoading] = useState(false);

  const [inputs, setInputs] = useState({
    amount: "",
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [flashFile, setFlashFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  const handleOnchange = (text, input) => {
    // console.log(text.target.value);

    setInputs((prevState) => ({ ...prevState, [input]: text.target.value }));
  };
  const handleError = (error, input) => {
    setErrors((prevState) => ({ ...prevState, [input]: error }));
  };
  const validate = async (e) => {
    e.preventDefault();
    let isValid = true;

    if (values?.length == 0) {
      handleError("Please choose dates", "dates");
      isValid = false;
    }

    if (selectedCurrencies?.length == 0) {
      handleError("Please choose currencies", "currency");
      isValid = false;
    }

    if (!inputs.amount) {
      handleError("Please input bid amount", "amount");
      isValid = false;
    }

    console.log();

    if (selectedAmountType == "") {
      handleError("Please choose amount type", "amount_type");
      isValid = false;
    }
    // if (!inputs.date) {
    //   handleError("Please input password", "password");
    //   isValid = false;
    // }
    if (isValid) {
      bidNow();
    }
  };

  const bidNow = () => {
    console.log(inputs);
    const formattedDates = values.map((element) => {
      // If the element is already a string, convert it to a date object
      const date = new Date(element);
      // Format the date into D/M/Y format using moment.js
      return moment(date).format("D/M/YYYY");
    });



    dispatch(
      bidEnquiry({
        token: inspector?.user.auth_token,
        id: params.id,
        inputs: inputs,
        dates: formattedDates,
        currencies: selectedCurrencies?.label,
        amount_type: selectedAmountType,
      })
    );
    setTimeout(async () => {
      dispatch(emptyBidStatus());
    }, 3000);
  };

  const togglePopup1 = () => {
    setValues([])
    setSelectedCurrencies([])
    setSelectedCurrencies('')
    setIsOpenPopup1(!isOpenPopup1);
  };

  const togglePopup2 = () => {



    setIsOpenPopup2(!isOpenPopup2);
  };

  const toggleSuccessPopup2 = () => {
    setIsOpenPopup1(!isOpenPopup1);
    setIsOpenPopup2(!isOpenPopup2);
  };

  useEffect(() => {
    dispatch(emptyBidStatus());
    dispatch(emptyUploadSuccess());
    dispatch(emptyNoteUploadSuccess())
    dispatch(
      viewSingleEnquiry({ token: inspector?.user.auth_token, id: params.id })
    );

    if (isAndroid()) {
      setShowAndroidButton(true);
    }

  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
        if (event && event.data) {

            try {
              const data = JSON.parse(event.data);
              if (data.type === 'location_update') {
                setFetchedLocation(data.data);
                setIsLocationFetched(true);
              }
            } catch (error) {
              console.error('Error parsing message data:', error);
            }
          };

          window.addEventListener('message', handleMessage);


          const isAndroid = navigator.userAgent.toLowerCase().includes('android');
          const isIOS = navigator.userAgent.toLowerCase().includes('iphone') || navigator.userAgent.toLowerCase().includes('ipad');

          if (isAndroid) {
            document.addEventListener("message", handleWebViewCheckinMessage);
            document.addEventListener('message', handleMessage);

          } else if (isIOS) {
            window.addEventListener("message", handleWebViewCheckinMessage);
            window.addEventListener('message', handleMessage);

          }




          return () => {
            if (isAndroid) {
              document.removeEventListener("message", handleWebViewCheckinMessage);
              document.removeEventListener('message', handleMessage);

            } else if (isIOS) {
              window.removeEventListener("message", handleWebViewCheckinMessage);
              window.removeEventListener('message', handleMessage);

            }
          };
        }
  }, []);

  const handleWebViewCheckinMessage = (event) => {
    // Parse the incoming message data
    const response = JSON.parse(event.data);

    // Handle the message based on its type
    if (response.type === "photo_upload") {
      setCapturedImage(response.data); // Set the captured image URL to state
    }
  };




  useEffect(() => {
    if (bid_success === true) {
      // togglePopup1()
      togglePopup2();
    }
  }, [bid_success]);

  useEffect(() => {
    // Assuming the API data is stored in the variable `countriesData`
    const formattedOptions = countries?.countries?.map((country) => ({
      value: country.id,
      label: country.currency,
    }));

    setCountriesOptions(formattedOptions);
  }, [countries]);

  const toggleUploadSucessPopUp = () => {
    setuploadSucessPopUp(!uploadSucessPopUp);
  };

  const toggleNoteUploadSucessPopUp = () => {
    setnoteuploadSucessPopUp(!noteuploadSucessPopUp);
  };


  useEffect(() => {
    if (upload_success == true) {
      toggleNoteUploadSucessPopUp();
    }
  }, [upload_success]);

  useEffect(() => {
    if (note_upload_success == true) {
      toggleNoteUploadSucessPopUp();
      dispatch(
        viewSingleEnquiry({ token: inspector?.user.auth_token, id: params.id })
      );
    }
  }, [note_upload_success]);

  let statusClass = "";
  let statusNme = "";
  switch (single_job?.my_bid?.status) {

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
      statusClass = "bg-[#FFA500]";
      statusNme = "Proceeded";
      break;
    default:
      statusNme = "Pending";
      statusClass = "bg-[#FF9D0B]";
  }
  // const handleFileUpload = (event, type) => {
  //   const file = event.target.files[0]; // Get the selected file
  //   // Perform actions with the file, such as uploading it to a server or processing it further
  //   // alert(file); // Example: Log the file details to the console
  //   if (type == "flash") {
  //     setflashName(event.target.files[0]?.name);
  //   } else {
  //     console.log(type, "doc");

  //     setdocName(event.target.files[0]?.name);
  //   }

  //   setFlashFile(file);
  // };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (type === "doc") {
      setDocFile(file);
      setdocName(e.target.files[0]?.name);

    } else if (type === "flash") {
      setFlashFile(file);
      setflashName(e.target.files[0]?.name);
    }
  };


  const __uploadFlashReport = (e, type) => {
    e.preventDefault();
    // console.log(1);

    let formData = new FormData();
    formData.append("flash_report", flashFile);
    formData.append("enquiry_log_id", params.id);
    formData.append("master_log_id", single_job?.enquiry?.master_logs[0]?.id);
    formData.append("token", inspector?.user.auth_token);
    formData.append("type", type);

    dispatch(uploadFlashReport(formData))
  };
  const dateComp = () => {
    return single_job?.enquiry?.est_inspection_date
      .split(",")
      .map((date, key) => (
        <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
          {date}
        </div>
      ));
  };

  const handleCountryChange = (selectedOptions) => {
    setSelectedCurrencies(selectedOptions);
  };

  const handleAmountTtypeChange = (selectedOptions) => {
    setSelectedAmountType(selectedOptions?.label);
  };

  const handleChangeReportNote = (e) => {
    setreportNote(e.target.value)
  }

  const handleChangeCheckINNote = (e) => {
    setCheckInNote(e.target.value)
  }

  const handleCheckInPhotoUpload = (e) => {
    const uploadedFile = e.target.files[0]; // Get the first selected file
    setCheckInPhoto(uploadedFile);
    setCheckInPhotoPreview(URL.createObjectURL(uploadedFile));
  };
  const __submitReportNote = (e) => {
    e.preventDefault();
    console.log(1);

    dispatch(submitReportNote({
      token: inspector?.user.auth_token,
      id: single_job?.enquiry?.master_logs[0]?.id,
      note: reportNote
    }))
  }

  const openFileOnBrowser = (file) => {
    if (window.ReactNativeWebView) {
      const response = {
        type: 'open_file_on_browser',
        data: file,
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(response));
    } else {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = file;
      link.target = '_blank'; // Open in a new tab

      // Append the link to the body
      document.body.appendChild(link);

      // Trigger the click event
      link.click();

      // Remove the link from the document
      document.body.removeChild(link);
    }
  }

  const __confirmProceed = () => {
    dispatch(
      confirmProceed({
        token: inspector?.user.auth_token,
        id: single_job?.my_bid?.id,
      })
    ).then((result) => {
      dispatch(
        viewSingleEnquiry({ token: inspector?.user.auth_token, id: params.id })
      );
    }).catch((err) => {

    });;
  }

  const __grabLocation = () => {
    // dispatch(
    //   confirmProceed({
    //     token: inspector?.user.auth_token,
    //     id: single_job?.my_bid?.id,
    //   })
    // ).then((result) => {
    //   dispatch(
    //     viewSingleEnquiry({ token: inspector?.user.auth_token, id: params.id })
    //   );
    // }).catch((err) => {

    // });;
    if (window.ReactNativeWebView) {

      const response = {
        type: 'fetch_location',
        data: [],
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(response));
    }
  }

  const __openCamera = () => {
    if (window.ReactNativeWebView) {
      const response = {
        type: 'open_camera',
        data: [],
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(response));
    } else {
      // Fallback for web - try to trigger file input with camera
      const fileInput = document.getElementById('capture-image');
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  const jobLocation = {
    latitude: 37.7749,  // Replace with your latitude
    longitude: -122.4194,  // Replace with your longitude
  };


  const handleSubmitCheckIn = (e) => {
    e.preventDefault();

    if (capturedImage == null && checkInPhoto == null ) {
      toast.info('Please add check in photo')
      return
    }

    if (!fetchedLocation || !fetchedLocation.address) {
      toast.info('Please fetch location first')
      return
    }

    let formData = new FormData();
    formData.append("token", inspector?.user.auth_token);
    formData.append("enquiry_log_id", params.id);
    formData.append("master_log_id", single_job?.enquiry?.master_logs[0]?.id);

    formData.append("address", fetchedLocation?.address);
    formData.append("latitude", fetchedLocation?.latitude);
    formData.append("longitude", fetchedLocation?.longitude);

    // Only append the image that exists
    if (checkInPhoto) {
      formData.append("imageAndroid", checkInPhoto);
    }
    if (capturedImage) {
      formData.append("image", capturedImage);
    }

    if (checkInNote) {
      formData.append("note", checkInNote);
    }

    dispatch(saveCheckInEnquiry(formData)).then((result) => {
      setCheckInNote(null)
      setFetchedLocation([])
      setIsLocationFetched(false)
      setCheckInPhoto(null)
      setCheckInPhotoPreview(null)
      setCapturedImage(null)
      dispatch(
        viewSingleEnquiry({ token: inspector?.user.auth_token, id: params.id })
      );
      toast.success('Checked In Successfully')

    }).catch((err) => {
      toast.error(err?.response?.data?.message || 'Failed to check in. Please try again.')
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let formData = new FormData();
    formData.append("flash_report", flashFile);
    formData.append("insp_doc", docFile);
    formData.append("note", reportNote);
    formData.append("enquiry_log_id", params.id);
    formData.append("master_log_id", single_job?.enquiry?.master_logs[0]?.id);
    formData.append("token", inspector?.user.auth_token);

    dispatch(uploadInspectionData(formData)).then((result) => {
      dispatch(
        viewSingleEnquiry({ token: inspector?.user.auth_token, id: params.id })
      );

      setFlashFile(null)
      setflashName(null)
      setDocFile(null)
      setdocName(null)
      setreportNote(null)
    }).catch((err) => {

    });;
  };


  const __deleteDocs = (id) => {
    dispatch(deleteInspectionDoc({ token: inspector?.user.auth_token, id: id })).then((result) => {
      dispatch(
        viewSingleEnquiry({ token: inspector?.user.auth_token, id: params.id })
      );
    }).catch((err) => {

    });;
  }

  useEffect(() => {
    console.log('Selected Dates:', values);
  }, [values]);

  // Fetch active video calls when single_job data is available
  useEffect(() => {
    if (single_job?.enquiry?.master_logs?.[0]?.id) {
      fetchActiveVideoCalls();
    }
  }, [single_job]);

  // Fetch active video calls for the current enquiry
  const fetchActiveVideoCalls = async () => {
    if (!single_job?.enquiry?.master_logs?.[0]?.id) return;

    setVideoCallLoading(true);
    try {
      // Get all video calls for the specific enquiry ID
      const enquiryId = single_job.enquiry.id;

      // Fetch all video calls for this enquiry (using existing endpoint)
      const response = await fetch(`${WEBSITE_API_URL}/agora-video/enquiry/${enquiryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${inspector?.user.auth_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Handle both single object and array responses
          const calls = Array.isArray(data.data) ? data.data : [data.data];
          setActiveVideoCalls(calls);
        }
      }
    } catch (error) {
      console.error('Error fetching video calls:', error);
      toast.error('Failed to load video calls');
    } finally {
      setVideoCallLoading(false);
    }
  };

  // Join video call
  const joinVideoCall = (channelName) => {
    // Use Agora join endpoint with full URL
    const joinUrl = `${WEBSITE_API_URL}/agora-video/${channelName}/join`;

    // Open in new tab/window
    if (window.ReactNativeWebView) {
      const response = {
        type: 'open_url',
        data: joinUrl,
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(response));
    } else {
      window.open(joinUrl, '_blank');
    }
  };
  return (
    <div>
      <Toaster richColors position="top-right" />

      {inspector_loading ? (
        <Loading title={"Loading..."} />
      ) : (
        <>
          <div>
            { }
            {single_job?.already_bidded && statusNme == "Accepted" ? (
              <TopBar title={single_job?.enquiry?.job_title} show_back show_check_in isLocationFetched={isLocationFetched} __grabLocation={__grabLocation}
                availability={single_job?.my_bid?.availability}
                enquiry_id={single_job?.my_bid?.enquiry_id}
              />

            ) : (
              <TopBar title={single_job?.enquiry?.job_title} show_back />

            )}
          </div>

          <div className="grid gap-2 px-5">

            {isLocationFetched && fetchedLocation?.address !== undefined &&
              <form onSubmit={(e) => handleSubmitCheckIn(e)} encType="multipart/form-data">
                <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
                  <div className="font-medium text-xl mb-2.5">Check In Details</div>

                  <label className="block mb-2 text-sm font-medium  py-2">

                    <strong className="font-bold text-black"> Current Location  : {fetchedLocation?.address}</strong>
                  </label>
                  <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                    Enter Check In Note (Optional)
                  </label>
                  <input
                    onChange={(e) => handleChangeCheckINNote(e)}
                    value={checkInNote || ''}
                    type="text"
                    className={`w-full border ${"border-[#E2E8F0]"} rounded-lg px-3 py-3`}
                    placeholder={"Enter Check In Note (Optional)"}

                  />

                  <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                    Upload Check In Photo
                  </label>

                  {showAndroidButton ? (
                    <div>

                      {capturedImage && (
                        <div className="mt-4">
                          <img
                            src={capturedImage}
                            alt="Check-in Preview"
                            className="rounded-lg w-32 h-32 mb-3"
                          />
                        </div>
                      )}


                      <button type="button" onClick={__openCamera} className="mt-5 py-3 border-[#15416E] border w-full rounded-md text-[#15416E] font-semibold flex items-center justify-center gap-2"
                      >
                        <CameraIcon className="w-6 h-6" />
                        Open Camera</button>
                    </div>
                  ) : (

                    <div >
                      {checkInphotoPreview && (
                        <div className="mt-4">
                          <img
                            src={checkInphotoPreview}
                            alt="Check-in Preview"
                            className="rounded-lg w-32 h-32 mb-3"
                          />
                        </div>
                      )}
                      <label htmlFor="capture-image" className="block w-full">
                        <input
                          id="capture-image" 
                          accept="image/*" 
                          capture="environment"
                          onChange={(e) => handleCheckInPhotoUpload(e)}
                          type="file"
                          className="hidden"
                        />
                        <button 
                          type="button"
                          onClick={() => document.getElementById('capture-image').click()}
                          className="mt-5 py-3 border-[#15416E] border w-full rounded-md text-[#15416E] font-semibold flex items-center justify-center gap-2"
                        >
                          <CameraIcon className="w-6 h-6" />
                          {checkInphotoPreview ? 'Change Photo' : 'Take Photo'}
                        </button>
                      </label>
                    </div>
                  )}
                  {/* Image Preview */}

                  {(capturedImage || checkInPhoto) && (
                    <button
                      type="submit"
                      className="mt-5 py-3 bg-[#15416E] w-full rounded-md text-white font-bold"
                    >
                      Submit Check In
                    </button>
                  )}
                </div>
              </form>
      }
            <div className="flex items-center justify-between  gap-3">
              <div className="bg-[#15416E] text-xs px-3 py-1.5 rounded-md text-white min-w-[28vw] max-w-[28vw] min-h-[48px] max-h-[48px] flex items-center">
                Enquiry Views: {single_job?.enquiry?.viewers_count}
              </div>
              {single_job?.already_bidded ? (
                <div className="bg-[#15416E] text-xs px-3 py-1.5 rounded-md text-white min-w-[28vw] max-w-[28vw]  min-h-[48px] max-h-[48px] flex items-center">
                  My Bid: <br />
                  {single_job?.my_bid?.currencies} {single_job?.my_bid?.amount}
                </div>
              ) : (
                <div className="bg-[#15416E] text-xs px-3 py-1.5 rounded-md text-white min-w-[28vw]  max-w-[28vw] min-h-[48px] max-h-[48px] flex items-center">
                  My Bid: No bids
                </div>
              )}
              {single_job?.already_bidded && (
                <>
                  {single_job?.my_bid?.status == 5 ? (
                    <div
                      className={`px-3 py-1.5 text-sm font-light text-white rounded-md float-right min-w-[28vw]  max-w-[28vw] min-h-[48px] max-h-[48px] flex items-center bg-[#4EC506]`}
                    >
                      Status: Completed
                    </div>
                  ) : (

                    <div
                      className={`px-3 py-1.5 text-sm font-light text-white rounded-md float-right min-w-[28vw]  max-w-[28vw] min-h-[48px] max-h-[48px] flex items-center ${statusClass}`}
                    >
                      Status: {statusNme}
                    </div>
                  )}
                </>
              )}
            </div>

            {/*  {single_job?.already_bidded && statusNme == "Accepted" && (
              <div
                onClick={() => __confirmProceed()}
                className={`px-2.5 py-2.5 text-sm text-center font-bold text-white rounded-md float-right bg-[#F90000]`}
              >
                Confirm to proceed
              </div>
            )}*/}


            <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
              <div className="font-medium text-lg">
                Job: {single_job?.enquiry?.job_title}
              </div>
              <div className="text-sm text-[#8C8C8C]">
                Created Date:
                {moment(single_job?.enquiry?.created_at).format("D/M/Y")}
              </div>
            </div>
            <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
              <div className="font-medium text-xl mb-2.5">Job Detail</div>
              <div className="font-medium">RFI Number:</div>
              <input
                type="text"
                value={"RFI" + single_job?.enquiry?.id}
                disabled
                className="font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5 bg-white"
              />
              {/* <div className="font-medium">Job Budget:</div>
              <input
                type="text"
                disabled
                className="font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5 bg-white"
                value="Hourly Rate - Target price was not specified."
              /> */}

              {/* <div className="font-medium">Category:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.category}
              /> */}
              <div className="font-medium">Commoidity:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.commodity}
              />
              <div className="font-medium">Supplier Location:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.vendor_location}
              />
              <div className="font-medium">Scope of inspectoin:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.enquiry_scope}
              />
              {/* <div className="font-medium">Group:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.service_type}
              /> */}
              <div className="font-medium">Country:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.country?.name}
              />
              <div className="font-medium">No of visists:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.no_of_visits}
              />
            </div>
            <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
              <div className="font-medium">Estimated inspection dates:</div>
              <div>
                {single_job?.enquiry &&
                  single_job?.enquiry?.est_inspection_date ? (
                  <div className="py-2">
                    <div className="flex flex-wrap justify-evenly">
                      {dateComp()}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* <InspectionMap latitude={single_job?.enquiry?.country ? single_job?.enquiry?.country?.latitude : inspector?.user.country?.latitude} longitude={single_job?.enquiry?.country ? single_job?.enquiry?.country?.longitude : inspector?.user.country?.longitude}
              name={single_job?.enquiry?.country?.name} /> */}
            <InspectionMap
              latitude={
                (single_job?.enquiry?.latitude && single_job?.enquiry?.longitude)
                  ? single_job?.enquiry?.latitude
                  : inspector?.user?.country?.latitude
              }
              longitude={
                (single_job?.enquiry?.latitude && single_job?.enquiry?.longitude)
                  ? single_job?.enquiry?.longitude
                  : inspector?.user?.country?.longitude
              }
              name={single_job?.enquiry?.country?.name}
            />

            {/* <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
              <div className="font-medium text-xl mb-2.5">Location</div>
              <div className="text-sm text-[#535354] font-medium">
                Address: Dubai - Dubai Emirliği - Birleşik Arap Emirlikleri
              </div>
              <div className="w-full h-20 mt-3 rounded-xl bg-yellow-100"></div>
            </div> */}
            <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
              <div className="font-medium text-xl mb-2.5">
                Additional Requirements
              </div>
              <div className="text-sm text-[#535354] font-medium">
                {single_job?.enquiry?.note}
                { }
              </div>
            </div>

            {/* Video Conferencing Section */}
            {single_job?.enquiry?.master_logs?.[0]?.id && (
              <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
                <div className="font-medium text-xl mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VideoCameraIcon className="w-6 h-6 text-blue-600" />
                    Video Conferencing
                  </div>
                  <button
                    onClick={fetchActiveVideoCalls}
                    disabled={videoCallLoading}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                  >
                    {videoCallLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {videoCallLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading video calls...</p>
                  </div>
                ) : activeVideoCalls.length > 0 ? (
                  <div className="space-y-3">
                    {activeVideoCalls.map((videoCall, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              {videoCall.title || 'Video Call'}
                            </h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  videoCall.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : videoCall.status === 'completed'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {videoCall.status?.charAt(0).toUpperCase() + videoCall.status?.slice(1)}
                                </span>
                              </div>
                              <p><span className="font-medium">Channel:</span> {videoCall.channel_name}</p>
                              <p><span className="font-medium">Duration:</span> {videoCall.duration} minutes</p>
                              <p><span className="font-medium">Start Time:</span> {moment(videoCall.start_time).format('MMM DD, YYYY h:mm A')}</p>
                              {videoCall.description && (
                                <p><span className="font-medium">Description:</span> {videoCall.description}</p>
                              )}
                              {videoCall.client_name && (
                                <p><span className="font-medium">Client:</span> {videoCall.client_name}</p>
                              )}
                              {videoCall.inspector_name && (
                                <p><span className="font-medium">Inspector:</span> {videoCall.inspector_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            {/* Check if joinee_link is available */}
                            {videoCall.status === 'active' && videoCall.participants?.joinee_link ? (
                              <a
                                href={videoCall.participants?.joinee_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
                              >
                                <PlayIcon className="w-4 h-4" />
                                Join Call
                              </a>
                            ) : videoCall.status === 'active' ? (
                              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium text-center">
                                Join link will be available when admin starts the meeting
                              </div>
                            ) : (
                              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-center">
                                Call {videoCall.status}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No active video calls available</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Video calls will appear here when scheduled for this inspection
                    </p>
                  </div>
                )}
              </div>
            )}


            {single_job?.checkIns &&
              single_job?.checkIns?.length > 0 ? (
              <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
                <>
                  <div className="font-medium text-xl mt-2.5 ">
                    Check Ins
                  </div>
                  {single_job?.checkIns?.map((item, indexQ) => (
                    <div className="p-2 flex items-center justify-between border-b-2">
                      <div>
                        <span className="font-bold">{indexQ + 1} ) </span>
                        <span className="text-sm">
                          Checked In Date :{" "}
                          {moment(item.created_at).format("D-M-Y")}
                        </span>
                        <br />
                        <span className="text-sm max-w-[80px]">
                          Address :{" "}
                          {item.address}
                        </span>
                      </div>
                      {/* <div
                            onClick={() => openFileOnBrowser(WEBSITE_IMAGE_URL +
                              item?.photo)}

                            className="text-center bg-red-500 p-2 text-white font-semibold rounded-lg text-xs"
                            download
                          >
                            View
                          </div> */}
                    </div>
                  ))}
                </>
              </div>
            ) : (
              <></>
            )}
            {single_job?.my_bid?.status == 2 ||
              single_job?.my_bid?.status == 5 || single_job?.my_bid?.status == 6 ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  {single_job?.enquiry?.master_logs[0]
                    ?.assignment_instruction && (
                      <div
                        onClick={() => openFileOnBrowser(WEBSITE_IMAGE_URL +
                          single_job?.enquiry?.master_logs[0]
                            ?.assignment_instruction)}

                        className="text-center flex items-center justify-center gap-3 bg-red-500 p-3 text-white font-semibold rounded-lg text-xs w-full"
                        download
                      >
                        <ArrowDownCircleIcon className="w-5" /><span>Download Assignment Instruction</span>
                      </div>
                    )}
                  {/* {single_job?.enquiry?.master_logs[0]?.output_document && (
                      <a
                        href={
                          WEBSITE_IMAGE_URL +
                          single_job?.enquiry?.master_logs[0]?.output_document
                        }
                        className="text-center bg-green-500 p-3 text-white font-semibold rounded-lg text-xs"
                      >
                        Download Input Doc
                      </a>
                    )} */}
                </div>

                <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
                  {single_job?.output_docs &&
                    single_job?.output_docs?.length > 0 ? (
                    <>
                      <div className="font-medium text-xl mt-2.5 ">
                        Download Input Documents
                      </div>
                      {single_job?.output_docs?.map((item, indexQ) => (
                        <div className="p-2 flex items-center justify-between border-b-2">
                          <div>
                            <span className="font-bold">{indexQ + 1} ) </span>
                            <span className="text-sm">
                              Upload Date :{" "}
                              {moment(item.created_at).format("D-M-Y")}
                            </span>
                          </div>
                          <div
                            onClick={() => openFileOnBrowser(WEBSITE_IMAGE_URL +
                              item?.file)}

                            className="text-center bg-red-500 p-2 text-white font-semibold rounded-lg text-xs"
                            download
                          >
                            Download
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </div>

                <hr />
                {single_job?.enquiry?.master_logs[0]
                  ?.assignment_instruction && single_job?.output_docs &&
                  single_job?.output_docs?.length > 0 ? (
                  <>



                    {single_job?.enquiry?.is_completed !== 1 &&

                      <div className="font-medium text-xl mb-2.5">
                        Upload Inspection data
                      </div>
                    }
                    <form onSubmit={(e) => handleSubmit(e)} encType="multipart/form-data">
                      {/* {single_job?.enquiry?.is_completed !== 1 && */}

                      <div className="border border-[#E2E8F0] rounded-lg px-1 py-2 mb-2.5">

                        <div>
                          <p className="py-2">Choose Inspection document</p>
                          {docName?.length > 0 &&

                            <div className=" text-black px-2 py-1 my-3 rounded-md flex items-center justify-between">

                              <p>{docName.substring(0, 18)}</p>
                              <div className="font-bold" onClick={() => {
                                setdocName("");
                                setDocFile(null)
                              }}>
                                <TrashIcon className="w-6 text-red-500" />
                              </div>
                            </div>
                          }
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="dropzone-file-2"
                              className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-200 dark:bg-gray-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-100 dark:hover:bg-gray-200"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                  aria-hidden="true"
                                  className="w-5 h-5 mb-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  ></path>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">Click to upload inspection documents</span>
                                </p>
                              </div>
                              <input
                                id="dropzone-file-2"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "doc")}
                                name="insp_doc"

                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <p className="py-2">Choose Inspection report</p>

                          {flashName?.length > 0 &&

                            <div className=" text-black px-2 py-1 my-3 rounded-md flex items-center justify-between">

                              <p>{flashName.substring(0, 18)}</p>
                              <div className="font-bold" onClick={() => {
                                setflashName("");
                                setFlashFile(null)
                              }}>
                                <TrashIcon className="w-6 text-red-500" />
                              </div>
                            </div>
                          }                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="dropzone-file"
                              className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-200 dark:bg-gray-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-100 dark:hover:bg-gray-200"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                  aria-hidden="true"
                                  className="w-5 h-5 mb-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  ></path>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">Click to upload Inspection report</span>
                                </p>
                              </div>
                              <input
                                id="dropzone-file"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "flash")}
                                name="flash_report"

                              />
                            </label>
                          </div>
                        </div>

                        <div className="">
                          <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                            Enter Report Note
                          </label>
                          <input
                            onChange={(e) => handleChangeReportNote(e)}
                            // defaultValue={single_job?.enquiry?.master_logs[0]?.flash_note}
                            type="text"
                            className={`w-full border ${"border-[#E2E8F0]"} rounded-lg px-3 py-3`}
                            placeholder={"Enter report note"}

                          />
                        </div>

                        {/* <button
                        type="submit"
                        className="mt-5 py-3 bg-[#15416E] w-full rounded-md text-white font-bold"
                      >
                        Submit All
                      </button> */}
                      </div>
                      {/* } */}

                      <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
                        <div className="font-medium text-xl mt-2.5 ">
                          Uploaded Inspection Documents
                        </div>

                        {single_job?.inspection_docs &&
                          single_job?.inspection_docs?.length > 0 ? (
                          <>
                            {single_job?.inspection_docs?.map((item, indexQ) => (
                              <div className="p-2 flex items-center justify-between border-b-2">
                                <div>
                                  <span className="font-bold">{indexQ + 1} ) </span>
                                  <span className="text-sm">
                                    Upload Date :{" "}
                                    {moment(item.created_at).format("D-M-Y")}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  {/* <div onClick={() => __deleteDocs(item?.id)}>
                                    <TrashIcon className="w-6 text-red-500" />
                                  </div> */}
                                  <div
                                    onClick={() => openFileOnBrowser(WEBSITE_IMAGE_URL +
                                      item?.file)}
                                    className="text-center bg-red-500 p-2 text-white font-semibold rounded-lg text-xs"
                                    download
                                  >
                                    Download
                                  </div>

                                </div>

                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <h6 className="text-center font-medium py-2 text-sm">You haven't uploaded any Inspection Documents</h6>
                          </>
                        )}
                      </div>


                      <div className="border border-[#E2E8F0] rounded-lg px-1 py-2 my-4 ">
                        <div className="font-medium text-xl mt-2.5 ">
                          Uploaded Inspection Report
                        </div>

                        {single_job?.flash_reports &&
                          single_job?.flash_reports?.length > 0 ? (
                          <>

                            {single_job?.flash_reports?.map((item, indexQ) => (
                              <div className="p-2 flex items-center justify-between border-b-2">
                                <div>
                                  <span className="font-bold">{indexQ + 1} ) </span>
                                  <span className="text-sm">
                                    Uploaed Date :{" "}
                                    {moment(item.created_at).format("D-M-Y")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* <div onClick={() => __deleteDocs(item?.id)}>
                                    <TrashIcon className="w-6 text-red-500" />
                                  </div> */}
                                  <div
                                    onClick={() => openFileOnBrowser(WEBSITE_IMAGE_URL +
                                      item?.file)}
                                    className="text-center bg-red-500 p-2 text-white font-semibold rounded-lg text-xs"
                                    download
                                  >
                                    Download
                                  </div>

                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <h6 className="text-center font-medium py-2 text-sm">You haven't uploaded any Inspection Report</h6>
                          </>
                        )}
                      </div>

                      <div className="border border-[#E2E8F0] rounded-lg px-1 py-2 my-4 ">

                        <div className="">
                          <label class="block mb-2 text-sm font-medium text-gray-500 ">
                            Inspections Report Notes
                          </label>
                          <input
                            defaultValue={single_job?.enquiry?.master_logs[0]
                              ?.flash_note}
                            disabled
                            type="text"
                            className={`w-full border bg-white ${" border-none"
                              } rounded-lg px-3 py-3`}
                            placeholder={single_job?.enquiry?.master_logs[0]
                              ?.flash_note ? single_job?.enquiry?.master_logs[0]
                              ?.flash_note : "Notes not added"}

                          />

                        </div>
                      </div>
                      {/* {single_job?.enquiry?.is_completed !== 1 && */}

                      <button
                        type="submit"
                        disabled={!flashFile && !docFile && !reportNote}

                        className="ml-[-25px] py-3 bg-[#15416E] w-[102vw] text-white font-bold fixed bottom-[60px] uppercase"
                      >
                        <h6 className="mb-2 ml-2">

                          {single_job?.flash_reports &&
                            single_job?.flash_reports?.length > 0 || single_job?.inspection_docs &&
                            single_job?.inspection_docs?.length > 0 ? " Update Inspection" : "Submit Inspection"}
                        </h6>
                      </button>
                      {/* } */}
                    </form>
                  </>
                ) : (
                  <div className="mx-auto my-3  text-center bg-red-500 text-white font-bold rounded-md capitalize px-4 py-3">
                    Your bid has been accepted. You will receive the output documents and assignment instructions for review shortly.
                  </div>
                )}

              </>
            ) : null}
            {/* <div className="mx-auto my-3 text-[#4E4949]">
              Posted By: Inspecco Zertifizierungs
            </div> */}
          </div>

          {single_job?.already_bidded ? (
            <>
              {single_job?.my_bid.status == 1 && (
                <>
                  {/*
                <button
                  className="bg-[#15416E] py-3 w-full mb-16 font-bold text-white fixed bottom-0"
                  // onClick={togglePopup1}
                >
                  Edit Bid
                </button> */}
                </>
              )}
            </>
          ) : (
            <button
              className="bg-[#15416E] py-3 w-full mb-16 font-bold text-white fixed bottom-0"
              onClick={togglePopup1}
            >
              Bid Now
            </button>
          )}
          <div className="h-[100px]"></div>
          <ReactModal
            isOpen={isOpenPopup1}
            onRequestClose={togglePopup1}
            contentLabel="Example Modal"
            className="bg-white rounded-2xl p-4 mx-auto outline-none  relative"
            overlayClassName="flex items-center fixed inset-0 px-12 bg-black/30 backdrop-blur"
            appElement={document.getElementById("root")}
          >
            <button
              className="bg-[#15416E] text-xl text-white font-medium w-10 h-10 rounded-full absolute -top-5 -right-5"
              onClick={togglePopup1}
            >
              X
            </button>
            <div className="font-medium text-[#171725] mb-3">
              {single_job?.enquiry?.job_title}
            </div>
            <form onSubmit={(e) => validate(e)}>
              <div className="">
                <label class="block mb-2 mt-2 text-sm font-medium text-gray-500 ">
                  Choose Dates
                </label>
                <DatePicker
                  style={{
                    height: "50px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    padding: "3px 10px",
                    width: "65vw",
                  }}
                  multiple
                  value={values}
                  format="D/M/YYYY" // Format should match what you expect

                  onChange={(dates) => setValues(dates)}
                />
              </div>
              {errors?.dates && (
                <p className="text-red-500">Please choose dates</p>
              )}
              <div className="">
                <label class="block mb-2 mt-2 text-sm font-medium text-gray-500 ">
                  Choose Currencies
                </label>
                <Select
                  defaultValue={currencies}
                  isMulti={false}
                  name="colors"
                  options={countriesOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={handleCountryChange} // Add the onChange handler
                />
              </div>
              {errors?.currency && (
                <p className="text-red-500">Please choose currency</p>
              )}

              <div className="">
                <label class="block mb-2 mt-2 text-sm font-medium text-gray-500 ">
                  Enter Amount
                </label>
                <input
                  type="text"
                  className="border w-full border-gray-400 px-2 py-1 col-span-5 rounded-md"
                  placeholder="Enter Bid Amount"
                  onChange={(text) => handleOnchange(text, "amount")}
                  required
                />
              </div>
              <div className="">
                <label class="block mb-2 mt-2 text-sm font-medium text-gray-500 ">
                  Choose Amount Type
                </label>
                <Select
                  defaultValue={selectedAmountType}
                  isMulti={false}
                  name="colors"
                  options={amount_type_options}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={handleAmountTtypeChange} // Add the onChange handler
                />
              </div>
              {errors?.amount_type && (
                <p className="text-red-500">Please choose amount type</p>
              )}
              <div className="mt-3 flex items-center justify-center gap-1 ">
                <button
                  type="submit"
                  className="text-bold text-white bg-[#15416E] rounded-md w-32 py-1.5 text-sm"
                // onClick={toggleSuccessPopup2}
                >
                  Bid Now
                </button>
                <button
                  className="text-bold text-white bg-[#FE0000] rounded-md w-32 py-1.5 text-sm"
                  onClick={togglePopup1}
                >
                  Cancel
                </button>
              </div>
            </form>
          </ReactModal>
          <ReactModal
            isOpen={isOpenPopup2}
            onRequestClose={togglePopup2}
            contentLabel="Example Modal"
            className="bg-white rounded-2xl p-6 mx-auto outline-none text-center"
            overlayClassName="flex items-center fixed inset-0 px-12 bg-black/30 backdrop-blur"
            appElement={document.getElementById("root")}
          >
            <img src={SuccessImg} className="w-1/2 mx-auto" alt="" />
            <div className="font-bold mt-5 text-[#171725]">Success</div>
            <div className="text-sm text-[#78828A] leading-snug my-3">
              Your bid has been successfully Submitted
            </div>
            <button
              className="bg-[#15416E] text-xs text-white px-6 py-3 rounded-full"
              onClick={toggleSuccessPopup2}
            >
              Continue
            </button>
          </ReactModal>

          <ReactModal
            isOpen={uploadSucessPopUp}
            onRequestClose={togglePopup2}
            contentLabel="Example Modal"
            className="bg-white rounded-2xl p-6 mx-auto outline-none text-center"
            overlayClassName="flex items-center fixed inset-0 px-12 bg-black/30 backdrop-blur"
            appElement={document.getElementById("root")}
          >
            <img src={SuccessImg} className="w-1/2 mx-auto" alt="" />
            <div className="font-bold mt-5 text-[#171725]">Success</div>
            <div className="text-sm text-[#78828A] leading-snug my-3">
              Report has beeen submitted successfully
            </div>
            <button
              className="bg-[#15416E] text-xs text-white px-6 py-3 rounded-full"
              onClick={toggleUploadSucessPopUp}
            >
              Continue
            </button>
          </ReactModal>


          <ReactModal
            isOpen={noteuploadSucessPopUp}
            onRequestClose={togglePopup2}
            contentLabel="Example Modal"
            className="bg-white rounded-2xl p-6 mx-auto outline-none text-center"
            overlayClassName="flex items-center fixed inset-0 px-12 bg-black/30 backdrop-blur"
            appElement={document.getElementById("root")}
          >
            <img src={SuccessImg} className="w-1/2 mx-auto" alt="" />
            <div className="font-bold mt-5 text-[#171725]">Success</div>
            <div className="text-sm text-[#78828A] leading-snug my-3">
              Inspection documents and note has beeen submitted successfully
            </div>
            <button
              className="bg-[#15416E] text-xs text-white px-6 py-3 rounded-full"
              onClick={toggleNoteUploadSucessPopUp}
            >
              Continue
            </button>
          </ReactModal>
        </>
      )}
      <TabNavigatorInspector current={""} />
    </div>
  );
};

export default BidNow;
