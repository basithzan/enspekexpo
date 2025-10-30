import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import TopBar from "../../../components/TopBar/TopBar";
import SuccessImg from "../../../assets/image/success-modal.png";
import TabNavigatorInspector from "../../../components/TabNavigatorInspector/index";
import { useDispatch, useSelector } from "react-redux";
import {
  bidEnquiry,
  emptyBidStatus,
  uploadFlashReport,
  viewSingleEnquiry,
} from "../../../store/inspector/inspectorSlice";
import { getEnquiryInvoices, confirmInspectorSelection } from "../../../store/client/clientSlice";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading";
import moment from "moment";
import { WEBSITE_IMAGE_URL } from "../../../config/api";
import InspectorProfileCard from "./InspectorProfileCard";
import AgoraVideoCard from "../../../components/AgoraVideoCard";
import InvoiceCard from "./InvoiceCard";

const ViewInspection = ({ route }) => {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const client = useSelector((state) => state.client.auth_client);
  const bid_success = useSelector((state) => state.inspector.bid_success);
  const single_job = useSelector((state) => state.inspector.single_job);
  const client_loading = useSelector((state) => state.client.client_loading);
  const enquiry_invoices = useSelector((state) => state.client.enquiry_invoices);
  const enquiry_invoices_loading = useSelector((state) => state.client.enquiry_invoices_loading);
  const [isOpenPopup1, setIsOpenPopup1] = useState(false);
  const [isOpenPopup2, setIsOpenPopup2] = useState(false);

  const [inputs, setInputs] = useState({
    amount: "",
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [flashFile, setFlashFile] = useState(null);

  const handleOnchange = (text, input) => {
    // console.log(text.target.value);

    setInputs((prevState) => ({ ...prevState, [input]: text.target.value }));
  };

  const validate = async (e) => {
    e.preventDefault();

    let isValid = true;
    if (!inputs.amount) {
      handleError("Please input bid amount", "amount");
      isValid = false;
    }
    if (!inputs.date) {
      handleError("Please input password", "password");
      isValid = false;
    }
    if (isValid) {
      bidNow();
    }
  };

  const bidNow = () => {
    console.log(inputs);

    dispatch(
      bidEnquiry({
        token: client?.user.auth_token,
        id: params.id,
        inputs: inputs,
      })
    );
    setTimeout(async () => {
      dispatch(emptyBidStatus());
    }, 3000);
  };

  const togglePopup1 = () => {
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
    dispatch(
      viewSingleEnquiry({ token: client?.user.auth_token, id: params.id })
    );
  }, []);

  // Fetch invoices when single_job data is available
  useEffect(() => {
    if (single_job?.enquiry?.id && client?.user.auth_token) {
      dispatch(getEnquiryInvoices({
        enquiryId: single_job.enquiry.id,
        token: client.user.auth_token
      }));
    }
  }, [single_job?.enquiry?.id, client?.user.auth_token, dispatch]);

  useEffect(() => {
    if (bid_success === true) {
      // togglePopup1()
      togglePopup2();
    }
  }, [bid_success]);

  let statusClass = "";
  let statusNme = "";
  switch (single_job?.my_bid?.status) {
    case 1:
      statusClass = "bg-[#FF9D0B]";
      statusNme = "Pending Bid";
      break;
    case 2:
      statusClass = "bg-[#4EC506]";
      statusNme = "Bid Accepted";

      break;
    case 3:
      statusClass = "bg-[#F90000]";
      statusNme = "Bid Rejected";

      break;
    case 5:
      statusClass = "bg-[#F90000]";
      statusNme = "Inspection Completed";

      break;
    case 6:
      statusClass = "bg-[#FFA500]";
      statusNme = "Inspection Proceeded";
      break;
    default:
      statusNme = "Pending";
      statusClass = "bg-[#FF9D0B]";
  }
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the selected file
    // Perform actions with the file, such as uploading it to a server or processing it further
    // alert(file); // Example: Log the file details to the console
    setFlashFile(file);
  };

  const __uploadFlashReport = (e) => {
    e.preventDefault();
    // console.log(1);

    let formData = new FormData();
    formData.append("flash_report", flashFile);
    formData.append("enquiry_log_id", params.id);
    formData.append("master_log_id", single_job?.enquiry?.master_logs[0]?.id);
    formData.append("token", client?.user.auth_token);

    // formData.flash_report = flashFile;
    // formData.enquiry_log_id = params.id;
    // formData.master_log_id = single_job?.enquiry?.master_logs[0]?.id;
    // formData.token = inspector?.user.auth_token;
    dispatch(uploadFlashReport(formData));
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

  const confirmShortlistedInspector = async (acceptedInspectorId) => {
    if (!client?.user?.auth_token || !acceptedInspectorId) return;
    try {
      await dispatch(confirmInspectorSelection({
        acceptedInspectorId,
        token: client.user.auth_token
      }));
      // Refresh enquiry data
      dispatch(viewSingleEnquiry({ token: client?.user.auth_token, id: params.id }));
    } catch (e) {
      console.error('Failed to confirm inspector', e);
    }
  };
  const dateComp2 = () => {
    return single_job?.accepted_bid?.availability
      .split(",")
      .map((date, key) => (
        <div className="border rounded-2xl border-[#ECF1F6] px-4  py-2 mt-3">
          {date}
        </div>
      ));
  };
  return (
    <>
      {client_loading ? (
        <Loading title={"Loading..."} />
      ) : (
        <>
          <TopBar title={single_job?.enquiry?.job_title} show_back />
          <div className="grid gap-3 px-5">
            <div className="flex items-center justify-between mx-5 gap-3">
              {single_job?.already_bidded && (
                <div
                  className={`px-2.5 py-1.5 text-sm font-light text-white rounded-md float-right ${statusClass}`}
                >
                  Status: {statusNme}
                </div>
              )}

              {/* Edit button - only show if enquiry can be edited */}
              {single_job?.enquiry && single_job.enquiry.status !== 0 && single_job.enquiry.status !== 1 && (
                <button
                  onClick={() => navigate(`/edit-inspection/${params.id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Edit Request
                </button>
              )}
            </div>
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

              <div className="font-medium">Scope of inspection:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.enquiry_scope}
              />
              <div className="font-medium">Category:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.category}
              />

              <div className="font-medium">Commodity:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.commodity}
              />
              <div className="font-medium">Country:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.country?.name}
              />
              <div className="font-medium">Supplier Name:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.vendor}
              />

              <div className="font-medium">Supplier Location:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.vendor_location}
              />

              <div className="font-medium">Additional Note:</div>
              <input
                disabled
                type="text"
                className="bg-white font-medium border-b border-b-[#535354] min-w-[85%] text-[#535354] mb-1.5"
                value={single_job?.enquiry?.note}
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
            {single_job?.accepted_bid && (
              <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
                <div className="font-medium text-xl mb-2.5">
                  Assigned Inspector
                </div>

                {/* Inspector Profile Card */}
                <InspectorProfileCard
                  inspector={single_job.accepted_bid.inspector}
                  enquiryId={single_job?.enquiry?.id}
                  isCompleted={single_job?.enquiry?.is_completed === 1}
                />

                {/* Agora Video Card */}
                <AgoraVideoCard enquiryId={single_job?.enquiry?.id} />

                <div className="text-sm text-[#535354] font-medium mt-4">Check In dates:</div>
                <div>
                  {single_job?.accepted_bid &&
                    single_job?.accepted_bid?.availability ? (
                    <div className="py-2">
                      <div className="flex flex-wrap justify-evenly">
                        {dateComp2()}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {single_job?.shortlisted_inspectors && single_job?.shortlisted_inspectors.length > 0 && !single_job?.accepted_bid && (
              <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
                <div className="font-medium text-xl mb-2.5">
                  Shortlisted Inspectors
                </div>
                <div className="space-y-3">
                  {single_job.shortlisted_inspectors.map((item, idx) => (
                    <div key={item.id || idx} className="space-y-2">
                      <InspectorProfileCard inspector={item.inspector} enquiryId={single_job?.enquiry?.id} isCompleted={single_job?.enquiry?.is_completed === 1} />
                      <button
                        onClick={() => confirmShortlistedInspector(item.id)}
                        disabled={!!single_job?.accepted_bid}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Confirm Inspector
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Section */}
            {single_job?.enquiry?.id && (
              <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
                <div className="font-medium text-xl mb-2.5">
                  Invoices
                </div>

                {enquiry_invoices_loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading invoices...</div>
                  </div>
                ) : enquiry_invoices && enquiry_invoices.length > 0 ? (
                  <div className="space-y-4">
                    {enquiry_invoices.map((invoice, index) => (
                      <InvoiceCard
                        key={invoice.id || index}
                        invoice={invoice}
                        enquiryId={single_job.enquiry.id}
                        masterLogId={single_job?.enquiry?.master_logs?.[0]?.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-lg font-medium mb-2">No invoices available</div>
                    <div className="text-sm">
                      Invoices will appear here once they are generated and sent by the admin.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border border-[#E2E8F0] rounded-lg px-1 py-2">
              <div className="font-medium text-xl mb-2.5">
                Additional Requirements
              </div>
              <div className="text-sm text-[#535354] font-medium">
                {single_job?.enquiry?.note}
              </div>
            </div>
          </div>

          <div className="grid gap-2 px-5 py-5">

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
                          Inspector name :{" "}
                          {item?.inspector?.name}
                        </span>
                        <br/>
                        <span className="text-sm">
                          Checked In Date :{" "}
                          {moment(item.created_at).format("D-M-Y")}
                        </span>
                        <br />
                        <span className="text-sm">
                          Checked In Time :{" "}
                          {moment(item.created_at).format("hh:mm:ss a")}  ({single_job?.accepted_bid?.inspector?.timezone ?single_job?.accepted_bid?.inspector?.timezone : "" })
                        </span>
                        <br />
                        <span className="text-sm max-w-[80px]">
                          Address :{" "}
                          {item.address}
                        </span>
                        <br />
                        <span className="text-sm">
                          Checkin note :{" "}
                          {item?.note}
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
          </div>
          <div className="h-[100px]"></div>
        </>
      )}
      <TabNavigatorClient current={"/client-home"} />
    </>
  );
};

export default ViewInspection;
