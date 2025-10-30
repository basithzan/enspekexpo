import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../components/Loading/index";
import TopBar from "../../../components/TopBar/TopBar";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { updateProfile } from "../../../store/client/clientSlice";

const fileSchema = yup.object().shape({
  name: yup.string().required("User name is required"),
  company_name: yup.string().required("Company name is required"),
  company_size: yup.string().required("Company size is required"),
  phone: yup.string().required("Contact is required"),
  city: yup.string().required("City is required"),
  bio: yup.string().required("Bio is required"),
  industry: yup.string().required("Industry is required"),
  country: yup
    .object()
    .shape({
      value: yup.string().required("Country is required"),
      label: yup.string().required("Country is required"),
    })
    .required("Country is required"),
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

const EditClientProfile = () => {
  const client = useSelector((state) => state.client.auth_client);
  const countries = useSelector((state) => state.client.countries);
  const client_loading = useSelector((state) => state.client.client_loading);
  const dispatch = useDispatch();

  const [countriesOptions, setCountriesOptions] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(fileSchema) });

  const onSubmit = (data) => {
    console.log(data);

    const formData = new FormData(); // Create a new FormData object

    // Append the form data to the FormData object
    formData.append("token", client?.user.auth_token);

    formData.append("name", data.name);
    formData.append("avatar", data.avatar[0]); // Use data.avatar[0] to get the selected file
    formData.append("country_id", data.country?.value); // Use data.avatar[0] to get the selected file
    formData.append("bio", data.bio); // Use data.avatar[0] to get the selected file
    formData.append("city", data.city);
    formData.append("company_name", data.company_name);
    formData.append("company_size", data.company_size);
    formData.append("industry", data.industry);
    formData.append("phone", data.phone);
    // console.log(extractedData);
    // // Dispatch submitRequest action here
    dispatch(
      updateProfile({
        formData: formData,
        token: client?.user.auth_token,
      })
    );
  };

  useEffect(() => {
    console.log(client?.user);
    
    // return () => {
      setValue("name", client?.user?.client_details?.name);
      setValue("avatar", client?.user?.client_details?.avatar);
      setValue("phone", client?.user?.client_details?.phone || client?.user?.client_details?.mobile );
      setValue("email", client?.user?.client_details?.email);
      setValue("country", client?.user?.client_details?.country?.id);
      setValue("company_name", client?.user?.client_details?.company_name);
      setValue("company_size", client?.user?.client_details?.company_size);
      setValue("city", client?.user?.client_details?.city);
      setValue("industry", client?.user?.client_details?.industry);
      setValue("bio", client?.user?.client_details?.bio);
      
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
    // Assuming the client data is stored in the variable `client`
    const selectedCountryId = client?.user?.client_details?.country?.id;

    // Find the selected option object that matches the country ID
    const selectedOption = countriesOptions.find(
      (option) => option.value === selectedCountryId
    );

    // Set the selected option using React Hook Form's `setValue` method
    setValue("country", selectedOption);

    console.log("country", selectedOption);
  }, [setValue, client, countriesOptions]);


  const customStyles = {
    control: (provided, { selectProps }) => ({
      ...provided,
      borderColor: errors[selectProps.name] ? "red" : "gray-400",
      "&:hover": {
        borderColor: "blue-500",
      },
    }),
  };

  return (
    <>
      {client_loading ? (
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

                <input
                  type="file"
                  accept="image/*"
                  className={`w-full border ${
                    errors.avatar ? "border-red-500" : "border-[#E2E8F0]"
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
                  Enter user name
                </label>
                <input
                  type="text"
                  className={`w-full border ${
                    errors.name ? "border-red-500" : "border-[#E2E8F0]"
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
                  className={`w-full border ${
                    errors.phone ? "border-red-500" : "border-[#E2E8F0]"
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
                  Enter bio
                </label>
                <textarea
                  type="text"
                  className={`w-full border ${
                    errors.bio ? "border-red-500" : "border-[#E2E8F0]"
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
                  className={`w-full border ${
                    errors.email ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Enter email id"}
                  {...register("email")}
                />
                {errors.email && (
                  <div className="text-red-500">{errors.email.message}</div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Company name
                </label>
                <input
                  type="text"
                  
                  className={`w-full border ${
                    errors.company_name ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Company name"}
                  {...register("company_name")}
                />
                {errors.company_name && (
                  <div className="text-red-500">
                    {errors.company_name.message}
                  </div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Company size
                </label>
                <input
                  type="text"
                  
                  className={`w-full border ${
                    errors.company_size ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Company size"}
                  {...register("company_size")}
                />
                {errors.company_size && (
                  <div className="text-red-500">
                    {errors.company_size.message}
                  </div>
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
                  Enter city
                </label>
                <input
                  type="text"
                  
                  className={`w-full border ${
                    errors.company_size ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Enter city"}
                  {...register("city")}
                />
                {errors.city && (
                  <div className="text-red-500">
                    {errors.city.message}
                  </div>
                )}
              </div>

              <div className="px-5 py-2">
                <label class="block mb-2 text-sm font-medium text-gray-500 ">
                  Enter industry
                </label>
                <input
                  type="text"
                  
                  className={`w-full border ${
                    errors.industry ? "border-red-500" : "border-[#E2E8F0]"
                  } rounded-lg px-3 py-3`}
                  placeholder={"Enter industry"}
                  {...register("industry")}
                />
                {errors.industry && (
                  <div className="text-red-500">
                    {errors.industry.message}
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
      <TabNavigatorClient current={"/client-home"} />
    </>
  );
};

export default EditClientProfile;
