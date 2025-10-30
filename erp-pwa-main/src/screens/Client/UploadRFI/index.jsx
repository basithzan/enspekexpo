import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TopBar from "../../../components/TopBar/TopBar";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import { clearRequestSuccess, uploadRfiFile } from "../../../store/client/clientSlice";
import Loading from "../../../components/Loading";
import ReactModal from "react-modal";
import { useNavigate } from "react-router-dom";
import SuccessImg from "../../../assets/image/success-modal.png";

const fileSchema = yup.object().shape({
  name: yup.string().required("RFI name is required"),

  rfi_file: yup
    .mixed()
    .required("File is required")
    .test("fileType", "Unsupported file format", (value) => {
        if (!value && value[0]) return true; // If no file is selected, validation passes
      const supportedFormats = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword", // Word document (.doc)
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word document (.docx)
        "application/vnd.ms-excel", // Excel (.xls)
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (.xlsx)
      ];
      return supportedFormats.includes(value[0]?.type);
    })
    .test("fileSize", "File size is too large", (value) => {

      if (!value  && value[0]) return true; // If no file is selected, validation passes
      const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
      return value[0]?.size <= maxSizeInBytes;
    }),
});

const UploadRFI = () => {
  const client = useSelector((state) => state.client.auth_client);
  const client_loading = useSelector((state) => state.client.client_loading);
  const request_success = useSelector((state) => state.client.request_success);

  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(fileSchema) });

  const onSubmit = (data) => {
    console.log(data);

    const formData = new FormData(); // Create a new FormData object

    // Append the form data to the FormData object
    formData.append('name', data.name);
    formData.append('rfi_file', data.rfi_file[0]); // Use data.rfi_file[0] to get the selected file
    // console.log(extractedData);
    // // Dispatch submitRequest action here
    dispatch(
      uploadRfiFile({
        formData: formData,
        token: client?.user.auth_token,
      })
    );
  };
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (request_success) {
      toggleModal();
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);

      setTimeout(() => {
          dispatch(clearRequestSuccess());
          navigate("/");
      }, 2500);
    }
  }, [request_success,client_loading]);
  return (
    <div>
      {client_loading ? (
        <Loading title={"Uploading RFI"} />
      ) : (
        <>
          <TopBar title={"Upload RFI"} show_back />

          <div className="pb-16">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter RFi name
                </label>
                <input
                  type="text"
                  className={`w-full border ${
                    errors.name ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Enter RFi name"}
                  {...register("name")}
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name.message}</div>
                )}
              </div>

              {/* Job Description */}
              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Upload RFI file
                </label>

                <input
                  type="file"
                  className={`w-full border ${
                    errors.rfi_file ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  accept="image/*"
                  
                  placeholder={"Upload RFI file"}
                  {...register("rfi_file")}
                />
                {errors.rfi_file && (
                  <div className="text-red-500">{errors.rfi_file.message}</div>
                )}
              </div>
              <div className="divide-y-8 h-28"></div>
              <button
                type="submit"
                className="my-1 py-3 bg-[#15416E] w-full text-white font-bold fixed bottom-[60px]"
              >
                {"Request for Inspection"}
              </button>
              <div className="blur-lg"></div>
            </form>


            <ReactModal
              isOpen={isOpen}
              onRequestClose={toggleModal}
              contentLabel="Example Modal"
              className="bg-white rounded-2xl p-6 mx-auto outline-none text-center"
              overlayClassName="flex items-center fixed inset-0 px-12 bg-black/30 backdrop-blur"
              appElement={document.getElementById("root")}
            >
              <img src={SuccessImg} className="w-1/2 mx-auto" alt="" />
              <div
                className={`font-bold mt-5 ${
                  request_success ? "text-green-500" : "text-red-500"
                } `}
              >
                {request_success ? "Success" : "Failure"}
              </div>
              <div
                className={`text-sm leading-snug my-3 ${
                  request_success ? "text-green-500" : "text-red-500"
                }`}
              >
                {request_success
                  ? "Your RFI File has uploaded successfully."
                  : "An error occurred while submitting your rfi. Please try again."}
              </div>
              <button
                className="bg-[#15416E] text-xs text-white px-6 py-3 rounded-full"
                onClick={() => {
                  request_success ? navigate("/") : toggleModal();
                }}
              >
                {request_success ? "Go Back" : "Try again"}
              </button>
            </ReactModal>
          </div>
        </>
      )}
      <TabNavigatorClient current={"home"} />
    </div>
  );
};

export default UploadRFI;
