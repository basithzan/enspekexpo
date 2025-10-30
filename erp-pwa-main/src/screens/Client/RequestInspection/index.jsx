import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TopBar from "../../../components/TopBar/TopBar";
import ReactModal from "react-modal";
import SuccessImg from "../../../assets/image/success-modal.png";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  category_options,
  commodity_options,
  country_options,
  scope_options,
  service_type_options,
} from "./datas";
import {
  clearRequestSuccess,
  requestNewInspection,
} from "../../../store/client/clientSlice";
import Loading from "../../../components/Loading";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-multi-date-picker";
import moment from "moment";

// Define the validation schema
const formSchema = yup.object().shape({
  job_name: yup.string().required("Inspection name is required"),
  // job_description: yup.string().required("Job Description is required"),
  supplier_name: yup.string().required("Supplier Name is required"),
  supplier_location: yup.string().required("Supplier Location is required"),
  additional_note: yup
    .string()
    .max(500, "Additional note must be less than 500 characters"),

  // service_type: yup
  //   .object()
  //   .shape({
  //     value: yup.string().required("Service Type is required"),
  //     label: yup.string().required("Service Type is required"),
  //   })
  //   .required("Service Type is required"),

  category: yup
    .object()
    .shape({
      value: yup.string().required("Category is required"),
      label: yup.string().required("Category is required"),
    })
    .required("Category is required"),

  scope: yup
    .object()
    .shape({
      value: yup.string().required("Scope of inspection is required"),
      label: yup.string().required("Scope of inspection is required"),
    })
    .required("Category is required"),

  scope: yup.mixed().test("required", "Scope is required", function (value) {
    if (!this.parent.scope_other) {
      return !!value;
    }
    return true;
  }),

  category_other: yup
    .string()
    .test("isRequired", "Other category is required", function (value) {
      const { category } = this.parent;

      // If commodity is 'Other', require a value for commodity_other
      if (category?.value === "Other") {
        return !!value;
      }
      console.log("Parent:", this.parent);
      return true; // Validation passes for other cases
    }),

  scope_other: yup
    .string()
    .test("isRequired", "Other Scope is required", function (value) {
      const { scope } = this.parent;

      // If commodity is 'Other', require a value for commodity_other
      if (scope?.value === "Other") {
        return !!value;
      }
      console.log("Parent:", this.parent);
      return true; // Validation passes for other cases
    }),

  commodity: yup
    .mixed()
    .test("required", "Commodity is required", function (value) {
      if (!this.parent.commodity_other) {
        return !!value;
      }
      return true;
    }),
  commodity_other: yup
    .string()
    .test("isRequired", "Other Commodity is required", function (value) {
      const { commodity } = this.parent;

      // If commodity is 'Other', require a value for commodity_other
      if (commodity?.value === "Other") {
        return !!value;
      }
      console.log("Parent:", this.parent);
      return true; // Validation passes for other cases
    }),

  country: yup
    .object()
    .shape({
      value: yup.string().required("Country is required"),
      label: yup.string().required("Country is required"),
    })
    .required("Couuntry is required"),
});

const RequestInspection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOtherCommodityInput, setShowOtherCommodityInput] = useState(false);
  const [showOtherScopeInput, setShowOtherScopeInput] = useState(false);
  const [showOtherCategoryInput, setShowOtherCategoryInput] = useState(false);

  // Placeholder value for request status
  const client = useSelector((state) => state.client.auth_client);
  const client_loading = useSelector((state) => state.client.client_loading);
  const request_success = useSelector((state) => state.client.request_success);
  const [values, setValues] = useState([]);
  const [dateError, setdateError] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(formSchema) });

  // console.log(errors);
  const onSubmit = (data) => {
    // console.log(data);
    if (values?.length == 0) {
      setdateError(true);
    } else {

      console.log(values);
      const formattedDates = values.map((element) => {

        // moment(element).format("D/M/Y")
        const date = new Date(element);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1 and pad with 0 if needed
        const day = String(date.getDate()).padStart(2, '0');
      
        return `${year}-${month}-${day}`;
        // console.log(new Date(element));
      }
      );
      console.log(formattedDates);


      const extractedData = {
        country: data.country.value,
        // commodity: data.commodity.value,
        commodity:
          data.commodity.value === "Other"
            ? data.commodity_other
            : data.commodity.value,

        scope:
          data.scope.value === "Other" ? data.scope_other : data.scope.value,
        category: data.category.value  === "Other" ? data.category_other : data.category.value,
        // service_type: data.service_type.value,
        supplier_location: data.supplier_location,
        supplier_name: data.supplier_name,
        // job_description: data.job_description,
        additional_note: data.additional_note, // Include the additional_note field

        dates: formattedDates,
        job_name: data.job_name,
      };

      console.log(extractedData);
      // Dispatch submitRequest action here

      // return;
      dispatch(
        requestNewInspection({
          formData: extractedData,
          token: client?.user.auth_token,
        })
      );
    }
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const customStyles = {
    control: (provided, { selectProps }) => ({
      ...provided,
      borderColor: errors[selectProps.name] ? "red" : "gray-400",
      "&:hover": {
        borderColor: "blue-500",
      },
    }),
  };

  useEffect(() => {
    if (request_success) {
      toggleModal();
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);

      setTimeout(() => {
        navigate("/");
        dispatch(clearRequestSuccess());
      }, 2500);
    }
  }, [request_success, client_loading]);

  return (
    <>
      {client_loading ? (
        <Loading title={"Requesting inspection"} />
      ) : (
        <>
          <TopBar title={"Request for inspection"} show_back />

          <div className="pb-16">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter Job Title
                </label>
                <input
                  type="text"
                  className={`w-full border ${
                    errors.job_name ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Job Title"}
                  {...register("job_name")}
                />
                {errors.job_name && (
                  <div className="text-red-500">{errors.job_name.message}</div>
                )}
              </div>

              {/* Vendor Name */}
              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter Supplier Name
                </label>

                <input
                  type="text"
                  className={`w-full border  ${
                    errors.supplier_name ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Supplier Name"}
                  {...register("supplier_name")}
                />
                {errors.supplier_name && (
                  <div className="text-red-500">
                    {errors.supplier_name.message}
                  </div>
                )}
              </div>

              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter Supplier Location
                </label>

                <input
                  type="text"
                  className={`w-full border  ${
                    errors.supplier_location
                      ? "border-red-500"
                      : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Supplier Location"}
                  {...register("supplier_location")}
                />
                {errors.supplier_location && (
                  <div className="text-red-500">
                    {errors.supplier_location.message}
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500 ">
                  Choose Category
                </label>

                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      styles={customStyles}
                      options={category_options}
                      isClearable
                      className={`react-select `}
                      classNamePrefix="react-select"
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption);
                        if (selectedOption?.value === "Other") {
                          setShowOtherCategoryInput(true);
                        } else {
                          setShowOtherCategoryInput(false);
                        }
                      }}
                    />
                  )}
                />
                {errors.category?.label && (
                  <div className="text-red-500">
                    {errors.category?.label.message}
                  </div>
                )}
              </div>

              {showOtherCategoryInput && (
                <div className="px-5 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-500">
                    Enter Other Category name
                  </label>

                  <input
                    type="text"
                    className={`w-full border ${
                      errors.category_other ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                    placeholder={"Other Category name"}
                    {...register("category_other")}
                  />
                  {errors.category_other && (
                    <div className="text-red-500">
                      {errors.category_other.message}
                    </div>
                  )}
                </div>
              )}

              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Choose Scope of inspection
                </label>

                <Controller
                  name="scope"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      styles={customStyles}
                      options={
                        scope_options
                      } // Add an "Other" option
                      isClearable
                      className={`react-select `}
                      classNamePrefix="react-select"
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption);
                        if (selectedOption?.value === "Other") {
                          setShowOtherScopeInput(true);
                        } else {
                          setShowOtherScopeInput(false);
                        }
                      }}
                    />
                  )}
                />

                {errors.scope?.label && (
                  <div className="text-red-500">
                    {errors.scope?.label.message}
                  </div>
                )}
              </div>

              {showOtherScopeInput && (
                <div className="px-5 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-500">
                    Enter Other Scope of Inspection
                  </label>

                  <input
                    type="text"
                    className={`w-full border ${
                      errors.scope_other ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                    placeholder={"Other Scope of Inspection"}
                    {...register("scope_other")}
                  />
                  {errors.scope_other && (
                    <div className="text-red-500">
                      {errors.scope_other.message}
                    </div>
                  )}
                </div>
              )}

              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Choose Commodity
                </label>

                <Controller
                  name="commodity"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      styles={customStyles}
                      options={[
                        ...commodity_options,
                        { value: "Other", label: "Other" },
                      ]} // Add an "Other" option
                      isClearable
                      className={`react-select `}
                      classNamePrefix="react-select"
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption);
                        if (selectedOption?.value === "Other") {
                          setShowOtherCommodityInput(true);
                        } else {
                          setShowOtherCommodityInput(false);
                        }
                      }}
                    />
                  )}
                />

                {errors.commodity?.label && (
                  <div className="text-red-500">
                    {errors.commodity?.label.message}
                  </div>
                )}
              </div>

              {/* Conditional rendering for Other Commodity input */}
              {showOtherCommodityInput && (
                <div className="px-5 py-2">
                  <label className="block mb-2 text-sm font-medium text-gray-500">
                    Enter Other Commodity
                  </label>

                  <input
                    type="text"
                    className={`w-full border ${
                      errors.commodity_other
                        ? "border-red-500"
                        : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                    placeholder={"Other Commodity"}
                    {...register("commodity_other")}
                  />
                  {errors.commodity_other && (
                    <div className="text-red-500">
                      {errors.commodity_other.message}
                    </div>
                  )}
                </div>
              )}

              {/* Country */}
              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500 ">
                  Choose Country
                </label>

                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select
                      styles={customStyles}
                      {...field}
                      options={country_options}
                      isClearable
                      className={`react-select `}
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.country?.label && (
                  <div className="text-red-500">
                    {errors.country?.label.message}
                  </div>
                )}
              </div>
              {/* Dates */}
              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Select Dates
                </label>
                <DatePicker
                  style={{
                    height: "50px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    padding: "3px 10px",
                    width: "90vw",
                  }}
                  multiple
                  format="YYYY-MM-DD "
                  value={values}
                  onChange={setValues}
                />
                {dateError && (
                  <div className="text-red-500">
                    Choose estimated inspection dates
                  </div>
                )}
              </div>

              <div className="px-5 py-2">
                <label className="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter Additional Note (optional)
                </label>
                <textarea
                  className={`w-full border ${
                    errors.additional_note
                      ? "border-red-500"
                      : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-2`}
                  rows="4"
                  placeholder={"Additional Note"}
                  {...register("additional_note")}
                />
                {errors.additional_note && (
                  <div className="text-red-500">
                    {errors.additional_note.message}
                  </div>
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
                  ? "Your inspection request has been successfully submitted."
                  : "An error occurred while submitting your request. Please try again."}
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
      ;
      <TabNavigatorClient current={"home"} />
    </>
  );
};

export default RequestInspection;
