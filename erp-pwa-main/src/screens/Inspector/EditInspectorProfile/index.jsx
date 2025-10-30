import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { toast } from "sonner";
import { Toaster } from "sonner";
import TopBar from "../../../components/TopBar/TopBar";
import Loading from "../../../components/Loading";
import TabNavigatorInspector from "../../../components/TabNavigatorInspector";
import { updateInspectorProfile, updateInspectorData } from "../../../store/inspector/inspectorSlice";
import { getAllCountries } from "../../../store/client/clientSlice";
import { WEBSITE_IMAGE_URL } from "../../../config/api";

const fileSchema = yup.object().shape({
  name: yup.string().required("User name is required"),
  phone: yup.string().required("Contact is required"),
  location: yup.string().required("City is required"),
  bio: yup.string().required("Bio is required"),
  nationality: yup.string().required("Nationality is required"),
  country: yup
    .object()
    .shape({
      value: yup.string().required("Country is required"),
      label: yup.string().required("Country is required"),
    })
    .required("Country is required"),
  cost_type: yup
    .object()
    .shape({
      value: yup.string().required("Cost Type is required"),
      label: yup.string().required("Cost Type is required"),
    })
    .required("Cost Type is required"),
  dob: yup.date().required("DOB is required"),
  cost: yup.string().required("Cost is required"),
  // avatar: yup
  //   .mixed()
  //   .required("File is required")
  //   .test("fileType", "Unsupported file format", (value) => {
  //     if (!value && value[0]) return true; // If no file is selected, validation passes
  //     const supportedFormats = ["image/jpeg", "image/png"];
  //     return supportedFormats.includes(value[0]?.type);
  //   })
  //   .test("fileSize", "File size is too large", (value) => {
  //     if (!value && value[0]) return true; // If no file is selected, validation passes
  //     const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
  //     return value[0]?.size <= maxSizeInBytes;
  //   }),
});

const EditInspectorProfile = () => {
  const inspector = useSelector((state) => state.inspector.auth_inspector);
  const countries = useSelector((state) => state.client.countries);
  const inspector_loading = useSelector(
    (state) => state.inspector.inspector_loading
  );
  const dispatch = useDispatch();

  const [countriesOptions, setCountriesOptions] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ resolver: yupResolver(fileSchema) });

  const onSubmit = (data) => {
    // Format the date before submitting
    const dobParts = getValues("dob").split("-");
    if (dobParts.length === 3) {
      const [year, month, day] = dobParts;
      const formattedDob = `${day}-${month}-${year}`;
      data.dob = formattedDob;
      console.log(formattedDob, "formattedDob");
    }

    const formData = new FormData(); // Create a new FormData object

    // Append the form data to the FormData object
    formData.append("token", inspector?.user.auth_token);

    formData.append("name", data.name);
    formData.append("avatar", data.avatar?.length > 0 && data.avatar[0]); // Use data.avatar[0] to get the selected file
    formData.append("cv", data.cv?.length > 0 && data.cv[0]); // Use data.avatar[0] to get the selected file
    formData.append("country_id", data.country?.value); // Use data.avatar[0] to get the selected file
    formData.append("bio", data.bio); // Use data.avatar[0] to get the selected file
    formData.append("location", data.location);
    formData.append("dob", data.dob);
    formData.append("cost_type", data.cost_type?.value);
    formData.append("cost", data.cost);
    formData.append("nationality", data.nationality);
    formData.append("phone", data.phone);
    // console.log(extractedData);
    // // Dispatch submitRequest action here
    dispatch(
      updateInspectorProfile({
        formData: formData,
        token: inspector?.user.auth_token,
      })
    ).then((result) => {
      dispatch(updateInspectorData(inspector?.user.auth_token))
      toast.info('Profile Updated Successfully')

    }).catch((err) => {

    });
  };

  useEffect(() => {
    dispatch(getAllCountries("token"));

    dispatch(updateInspectorData(inspector?.user.auth_token))


    if (inspector?.user?.inspector_details?.dob) {
      const dobParts = inspector.user.inspector_details.dob.split("-");
      if (dobParts.length === 3) {
        const [day, month, year] = dobParts;
        const formattedDob = `${year}-${month}-${day}`;
        setValue("dob", formattedDob);
      }
    }
    console.log(inspector.user.inspector_details.inspector_details?.cost_type);
    // return () => {
    setValue("name", inspector?.user?.inspector_details?.name);
    setValue("avatar", inspector?.user?.inspector_details?.avatar);
    setValue("cv", inspector?.user?.inspector_details?.cv);
    setValue("phone", inspector?.user?.inspector_details?.phone);
    setValue("email", inspector?.user?.inspector_details?.email);
    setValue("country", inspector?.user?.inspector_details?.country?.id);
    setValue("bio", inspector?.user?.inspector_details?.bio);
    setValue("nationality", inspector?.user?.inspector_details?.nationality);
    setValue("location", inspector?.user?.inspector_details?.location);

    // Ensure cost is updated
    const costValue = inspector?.user?.inspector_details?.inspector_details?.cost;
    if (costValue) {
      setValue("cost", costValue);
    } else {
      setValue("cost", ""); // Set to empty string or any default value if cost is not available
    }

    const costTypeValue = inspector?.user?.inspector_details?.inspector_details?.cost_type;

    if (costTypeValue === "0" || costTypeValue === "Hourly") {
      setValue("cost_type", { value: "Hourly", label: "Hourly" });
    } else if (costTypeValue === "1" || costTypeValue === "Daily") {
      setValue("cost_type", { value: "Daily", label: "Daily" });
    } else {
      setValue("cost_type", null); // or set a default value if needed
    }

    // };/
  }, []);

  useEffect(() => {
    // Assuming the API data is stored in the variable `countriesData`
    const formattedOptions = countries?.countries?.map((country) => ({
      value: country.id,
      label: country.name,
    }));

    setCountriesOptions(formattedOptions);
  }, [countries]);

  useEffect(() => {
    // Assuming the inspector data is stored in the variable `inspector`
    const selectedCountryId = inspector?.user?.inspector_details?.country?.id;
    // Find the selected option object that matches the country ID
    const selectedOption = countriesOptions?.find(
      (option) => option?.value === selectedCountryId
    );

    // Set the selected option using React Hook Form's `setValue` method
    setValue("country", selectedOption);
  }, [setValue, inspector, countriesOptions]);

  const customStyles = {
    control: (provided, { selectProps }) => ({
      ...provided,
      borderColor: errors[selectProps.name] ? "red" : "gray-400",
      "&:hover": {
        borderColor: "blue-500",
      },
    }),
  };

  const cost_type_options = [
    { value: 'Hourly', label: "Hourly" },
    { value: 'Daily', label: "Daily" },
  ];
  return (
    <>
      <Toaster richColors position="top-right" />
      {inspector_loading ? (
        <Loading title={"Loading..."} />
      ) : (
        <>
          <TopBar title={"Edit profile"} show_back />
          <div className="pb-16">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Avatar */}
              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Upload profile picture
                </label>

                {/* Avatar Preview */}
                {inspector?.user?.details?.avatar && (
                  <div className="mb-2">
                    <img
                      src={`${WEBSITE_IMAGE_URL}/${inspector.user.details.avatar}`}
                      alt="Current avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className={`w-full border ${errors.avatar ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Upload profile picture"}
                  {...register("avatar")}
                />
                {errors.avatar && (
                  <div className="text-red-500">{errors.avatar.message}</div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Upload CV
                </label>

                {/* CV Preview */}
                {inspector?.user?.details?.cv && (
                  <div className="mb-2">
                    <div className="flex items-center p-2 bg-gray-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate">
                        {inspector.user.details.cv.split('/').pop()}
                      </span>
                      <a
                        href={`${WEBSITE_IMAGE_URL}/${inspector.user.details.cv}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

                  className={`w-full border ${errors.cv ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Upload CV"}
                  {...register("cv")}
                />
                {errors.cv && (
                  <div className="text-red-500">{errors.cv.message}</div>
                )}
              </div>
              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter user name
                </label>
                <input
                  type="text"
                  className={`w-full border ${errors.name ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Enter user name"}
                  {...register("name")}
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name.message}</div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter contact number
                </label>
                <input
                  type="text"
                  className={`w-full border ${errors.phone ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Enter contact Number"}
                  {...register("phone")}
                />
                {errors.phone && (
                  <div className="text-red-500">{errors.phone.message}</div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter DOB
                </label>
                <input
                  type="date"
                  className={`w-full border ${errors.dob ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Enter dob"}
                  {...register("dob")}
                />
                {errors.dob && (
                  <div className="text-red-500">DOB is required</div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter bio
                </label>
                <textarea
                  type="text"
                  className={`w-full border ${errors.bio ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Enter bio"}
                  {...register("bio")}
                />
                {errors.bio && (
                  <div className="text-red-500">{errors.bio.message}</div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter email id (Non editable)
                </label>
                <input
                  type="text"
                  disabled
                  className={`w-full border ${errors.email ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Enter email id"}
                  {...register("email")}
                />
                {errors.email && (
                  <div className="text-red-500">{errors.email.message}</div>
                )}
              </div>
              {/* Scope */}
              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Choose country
                </label>

                <Controller
                  name="country"
                  defaultValue={null} // Set the default value to null
                  control={control}
                  render={({ field }) => (
                    <Select
                      styles={customStyles}
                      {...field}
                      options={countriesOptions}
                      isClearable
                      className={`react-select`}
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

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter location
                </label>
                <input
                  type="text"
                  className={`w-full border ${errors.location ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Enter location"}
                  {...register("location")}
                />
                {errors.location && (
                  <div className="text-red-500">{errors.location.message}</div>
                )}
              </div>

              {/* Cost Type */}
              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Choose Cost Type
                </label>
                <Controller
                  name="cost_type"
                  defaultValue={null} // Set the default value to null or any other default value you want
                  control={control}
                  render={({ field }) => (
                    <Select
                      styles={customStyles}
                      {...field}
                      options={cost_type_options}
                      isClearable
                      className={`react-select`}
                      classNamePrefix="react-select"
                    />
                  )}
                />


                {errors.cost_type?.label && (
                  <div className="text-red-500">
                    {errors.cost_type?.label.message}
                  </div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter cost
                </label>
                <input
                  type="text"
                  className={`w-full border ${errors.cost ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Enter cost"}
                  {...register("cost")}
                />
                {errors.cost && (
                  <div className="text-red-500">{errors.cost.message}</div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter Nationality
                </label>
                <input
                  type="text"
                  className={`w-full border ${errors.nationality ? "border-red-500" : "border-[#E2E8F0]"
                    } rounded-lg px-3 py-3`}
                  placeholder={"Enter nationality"}
                  {...register("nationality")}
                />
                {errors.nationality && (
                  <div className="text-red-500">
                    {errors.nationality.message}
                  </div>
                )}
              </div>
              <div className="divide-y-8 h-28"></div>
              <button
                type="submit"
                className="my-1 py-3 bg-[#15416E] w-full text-white font-bold fixed bottom-[60px]"
              >
                {"Update Profile"}
              </button>
              <div className="blur-lg"></div>
            </form>
          </div>
          <div className="h-[100px]"></div>
        </>
      )}
      <TabNavigatorInspector current={"/inspector-home"} />
    </>
  );
};

export default EditInspectorProfile;
