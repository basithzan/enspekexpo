import { Fragment, useEffect, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { getAllCountries, logoutClient } from "../../../store/client/clientSlice";
import { logoutInspector, registerInspector } from "../../../store/inspector/inspectorSlice";
import Loading from "../../../components/Loading";

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

// Define the validation schema
const formSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
phone: yup
  .string()
  .required("Phone number is required")
  .min(9, "Enter valid phone number"),
    password: yup.string().required("Password is required"),
  type: yup.object().required("Your role is required"),
  country: yup.object().required("Country is required"),

  // country: yup
  // .array()
  // .of(
  //   yup.object().shape({
  //     value: yup.string().required(),
  //     label: yup.string().required(),
  //   })
  // )
  // .required("At least one country should be selected.")
  // .nullable(),
});

const RegistrationScreen = () => {
  const [countriesOptions, setCountriesOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const countries = useSelector((state) => state.client.countries);
  const inspector = useSelector((state) => state.inspector.auth_inspector);
  const auth_loading = useSelector((state) => state.inspector.auth_loading);
  const [authError, setAuthError] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [contentType, setContentType] = useState(""); // Track content type
  const [termsError, setTermsError] = useState(false); // State to track checkbox validation
  const [acceptTerms, setAcceptTerms] = useState(false); // State to track if terms are accepted

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(formSchema) });


  useEffect(() => {
    if (inspector !== [] && inspector?.success) {

      setAuthError(false);
      setShowModal(true);
      setContentType("agreement")
      // navigate("/home-inspector");
    } else {

      if (inspector?.success == false) {

        console.log(inspector,'inspector');
        
        setAuthError(true);
        setAuthErrorMsg(inspector?.data);

        setTimeout(() => {
          setAuthError(false);
        setAuthErrorMsg(null);
        }, 1500);

      }
    }
  }, [inspector]);


  const onSubmit = (data) => {
    if (!acceptTerms) {
      setTermsError(true);
      return; // Prevent form submission
    }

    setTermsError(false);



    const extractedData = {
      name: data.name,
      email: data.email,
      country_id: data.country?.value,
      phone: data.phone,
      type: data.type?.value,
      password: data.password,
    };
    dispatch(
      registerInspector({ formData: extractedData })
    );
  };


  console.log(errors);
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
    dispatch(getAllCountries("token"));
  

  }, []);

  useEffect(() => {
    // Assuming the API data is stored in the variable `countriesData`
    const formattedOptions = countries?.countries?.map((country) => ({
      value: country.id,
      label: country.name,
    }));

    setCountriesOptions(formattedOptions);
  }, [countries]);

  const passwordToggleClasses =
    "absolute  cursor-pointer text-gray-400  w-4 h-4 absolute top-1/2 transform -translate-y-1/2 right-3";

  const handlePasswordToggleClick = () => {
    setShowPassword((prevState) => !prevState);
  };

  const user_type_options = [
    { value: "0", label: "Freelance Inspector" },
    { value: "1", label: "Inspection Agency" },
  ];

  // Function to show the modal with terms or privacy content
  const showContent = (type) => {
    setContentType(type);
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  const acceptAgreement = () => {
    navigate("/home-inspector");

  };
  return (
    <div>
      {auth_loading ? (
        <Loading title={"Signing Up"} />
      ) : (
        <>


          <div className="text-lg font-bold px-5 py-5  flex items-center gap-5">
            <Link to={'/inspector-login'}>

              <ArrowLeftIcon className="w-6 font-bold" />
            </Link>
            <div>
              Sign Up
            </div>
          </div>          <form onSubmit={handleSubmit(onSubmit)} className=" px-8 pt-5 pb-8 mb-4">
            <label class="block mb-2 text-xs font-medium text-gray-500 ">
              Enter your name
            </label>
            <div className="mb-2 relative">
              <div className="cursor-pointer text-gray-400 w-4 h-4 absolute top-3 left-3">
                <UserIcon />
              </div>
              <input
                autoComplete="off"
                className={`appearance-none pl-10  w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${errors?.name ? "border border-red-500" : "border-none"
                  }`}
                id="username"
                type="text"
                placeholder="Full Name"
                {...register("name")}
              />
              {errors?.name && (
                <div>
                  <h6 className="text-red-500 text-xs">{errors?.name.message}</h6>
                </div>
              )}{" "}
            </div>

            <label class="block mb-2 text-xs font-medium text-gray-500 ">
              Enter email address
            </label>
            <div className="mb-2 relative">
              <div className="cursor-pointer text-gray-400 w-4 h-4 absolute top-3 left-3">
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
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <input
                autoComplete="off"
                className={`appearance-none lowercase pl-10  w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${errors?.email ? "border border-red-500" : "border-none"
                  }`}
                id="username"
                name="email"
                type="email"
                placeholder="Email"
                {...register("email")}
              />
              {errors?.email && (
                <div>
                  <h6 className="text-red-500 text-xs">{errors?.email.message}</h6>
                </div>
              )}
            </div>
            
            <label class="block mb-2 text-xs font-medium text-gray-500 ">
              Enter contact number
            </label>
            <div className="mb-2 relative">
              <div className="cursor-pointer text-gray-400 w-4 h-4 absolute top-3 left-3">
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
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
              </div>
              <input
                autoComplete="off"
                className={`appearance-none pl-10  w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${errors?.phone ? "border border-red-500" : "border-none"
                  }`}
                id="username"
                name="phone"
                type="number"
                placeholder="Enter contact number"
                {...register("phone")}
              />
              {errors?.phone && (
                <div>
                  <h6 className="text-red-500 text-xs">{errors?.phone.message}</h6>
                </div>
              )}
            </div>

            <label class="block mb-2 text-xs font-medium text-gray-500 ">
              Choose country
            </label>
            <div className="mb-2 relative">
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
              {errors.country?.message && (
                <div className="text-red-500">{errors.country?.message}</div>
              )}
            </div>


            <label class="block mb-2 text-xs font-medium text-gray-500 ">
              Are you a Freelance inspector?
            </label>
            <div className="mb-2 relative">
              <Controller
                name="type"
                defaultValue={null} // Set the default value to null
                control={control}
                render={({ field }) => (
                  <Select
                    styles={customStyles}
                    {...field}
                    options={user_type_options}
                    isClearable
                    className={`react-select`}
                    classNamePrefix="react-select"
                  />
                )}
              />
              {errors.type?.message && (
                <div className="text-red-500">{errors.type?.message}</div>
              )}
            </div>

            <label class="block mb-2 text-xs font-medium text-gray-500 ">
              Enter password
            </label>

            <div className="mb-2 relative">
              <input
                autoComplete="off"
                className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none focus:outline-gray-500${errors?.password ? "border border-red-500" : "border-none"
                  }`}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                {...register("password")}

              />
              <div
                className={passwordToggleClasses}
                onClick={handlePasswordToggleClick}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </div>
              {errors?.password && (
                <div>
                  <h6 className="text-red-500 text-xs mt-1">{errors?.password?.message}</h6>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mr-2 mt-1"
                checked={acceptTerms}
                onChange={() => setAcceptTerms(!acceptTerms)}
              />
              <label htmlFor="acceptTerms" className="text-xs text-[#666161]">
                I accept the{" "}
                <span
                  className="text-[#15416E] cursor-pointer"
                  onClick={() => showContent("terms")}
                >
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span
                  className="text-[#15416E] cursor-pointer"
                  onClick={() => showContent("privacy")}
                >
                  Privacy Policy
                </span>.
              </label>
            </div>
            {authError && (
              <div className="text-red-500 text-center text-sm mt-2 font-semibold">
              {authErrorMsg ? authErrorMsg : "User with this email already exist"}  
              </div>
            )}
            {termsError && (
              <div className="text-red-500 text-xs">
                You must accept the terms and conditions to proceed.
              </div>
            )}
            <button
              type="submit"
              className=" mt-4 flex items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 border rounded-lg outline-none mb-3 focus:outline-gray-500"
            >
              Sign Up
            </button>
          </form>
        </>
      )}

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 h-5/6 relative overflow-auto p-5">
          {contentType !== "agreement" && 
          
          
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-red-500 font-bold"
            >
              X
            </button>
          }
            <div className="content">
              {contentType === "privacy" && (
                <div>
                  <h2>Privacy Policy for Enspek</h2>
                  <p>
                    1. Introduction<br />
                    Welcome to Enspek. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
                  </p>
                  <h3>Information We Collect</h3>
                  <p>We may collect and process the following data:</p>
                  <ul>
                    <li>Personal Identification Information (Name, email address, phone number)</li>
                    <li>Usage Data (App usage patterns, features accessed)</li>
                    <li>Device Information (IP address, device type, operating system)</li>
                    <li>User Content (Photos, documents, and other files uploaded by users)</li>
                  </ul>
                  <h3>How We Use Your Information</h3>
                  <p>We use the information we collect in the following ways:</p>
                  <ul>
                    <li>To provide and maintain our service</li>
                    <li>To notify you about changes to our service</li>
                    <li>To provide customer support</li>
                    <li>To gather analysis or valuable information so that we can improve our service</li>
                  </ul>
                  <h3>Sharing Your Information</h3>
                  <p>We do not share your personal information with third parties except:</p>
                  <ul>
                    <li>With your consent</li>
                    <li>For legal reasons (compliance with laws and regulations)</li>
                  </ul>
                  <h3>Security of Your Information</h3>
                  <p>
                    We use administrative, technical, and physical security measures to help protect your personal information. This includes assurance that your information will be kept confidential even when stored on third-party cloud services. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                  </p>
                  <h3>Your Data Protection Rights</h3>
                  <p>
                    You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your data. To exercise these rights, please contact us at{" "}
                    <a href="/cdn-cgi/l/email-protection#167f7870795673786566737d3875797b">
                      <span className="__cf_email__" data-cfemail="9ff6f1f9f0dffaf1eceffaf4b1fcf0f2">[email&#160;protected]</span>
                    </a>.
                  </p>
                  <h3>Changes to This Privacy Policy</h3>
                  <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
                  <h3>Contact Us</h3>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at{" "}
                    <a href="/cdn-cgi/l/email-protection#9af3f4fcf5dafff4e9eafff1b4f9f5f7">
                      <span className="__cf_email__" data-cfemail="1e777078715e7b706d6e7b75307d7173">[email&#160;protected]</span>
                    </a>.
                  </p>
                </div>
              )}
              {contentType === "terms" && (
                <div>
                  <h2>Terms & Conditions for Enspek</h2>
                  <p>
                    1. Acceptance of Terms<br />
                    By downloading and using Enspek, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, then you may not access the app.
                  </p>
                  <p>
                    2. Use of the App<br />
                    You agree to use the app only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the app.
                  </p>
                  <p>
                    3. User Accounts<br />
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms  Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                  </p>
                  <p>
                    4. Intellectual Property<br />
                    The app and its original content, features, and functionality are and will remain the exclusive property of Enspek and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Enspek.
                  </p>
                  <p>
                    5. User Content<br />
                    Users are prohibited from uploading unnecessary or inappropriate photos & documents. We reserve the right to delete any photos or content that violate this policy. By entering any content or data onto our site, you represent and warrant to us that you have the right to submit such content and that our use of your content as described herein will not infringe or violate the rights of any third party.
                    It is your responsibility to ensure the accuracy, suitability, and compliance of any content submitted by you, and you agree that we will not be liable for any damages whatsoever arising from your failure to do so.
                    Unless otherwise specified in any other document pertaining to specific content, you will continue to own all content you submit to our site; however, you grant us the right and license to use such content on the Site for purposes in connection with Services.
                  </p>
                  <p>
                    6. Copyright<br />
                    By submitting any content to the app, you represent and warrant that you own all rights to the content or have obtained all necessary rights or permissions to use the content. You may not post, distribute, or reproduce in any way any copyrighted material, trademarks, or other proprietary information without obtaining the prior written consent of the owner of such proprietary rights.
                  </p>
                  <p>
                    7. Termination<br />
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. You agree that we, in our sole discretion, may terminate your access to our Service for any reason or no reason, including without limitation your breach of these Terms. You agree that any termination of your access to our Service may be affected without prior notice, and you acknowledge and agree that we may immediately deactivate or delete any of your accounts and all related information and files in such accounts, and bar any further access to such files or our Service. You agree that we will not be liable to you or any third party for any loss or damages of any kind resulting from any termination of your access to our Service.
                  </p>
                  <p>
                    8. Limitation of Liability<br />
                    In no event shall Enspek, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the app. We will not be liable for any failure or delay in performing under these terms where such failure or delay is due to causes beyond our reasonable control, including natural catastrophes, governmental acts or omissions, laws or regulations, terrorism, labor strikes or difficulties, communications systems breakdowns, hardware or software failures, transportation stoppages or slowdowns, or the inability to procure supplies or materials.
                  </p>
                  <p>
                    9. Governing Law<br />
                    These Terms shall be governed and construed in accordance with the laws of [Your Country], without regard to its conflict of law provisions.
                  </p>
                  <p>
                    10. Changes to Terms<br />
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our app after those revisions become effective, you agree to be bound by the revised terms.
                  </p>
                  <p>
                    Contact Us<br />
                    If you have any questions about these Terms, please contact us at{" "}
                    <a href="/cdn-cgi/l/email-protection#a1c8cfc7cee1c4cfd2d1c4ca8fc2cecc">
                      <span className="__cf_email__" data-cfemail="a0c9cec6cfe0c5ced3d0c5cb8fc3cfcd">[email&#160;protected]</span>
                    </a>.
                  </p>
                </div>
              )}


              {contentType === "agreement" && (
                <div>
                  <h2 className="font-bold">Freelance Contractor Agreement for Enspek</h2>

                  <p className="font-medium py-3">
                    1. Effective Date<br />
                    This Agreement shall commence upon validation of the Contractor by Enspek in its sole discretion (referred to as the "Effective Date").
                  </p>

                  <p className="font-medium py-3">
                    2. Description of Work<br />
                    Contractor agrees to perform services, including inspections, surveys, audits, and photography, as offered by Enspek. Each assignment may be accepted or declined at the discretion of the Contractor.
                  </p>

                  <p className="font-medium py-3">
                    3. Acceptance of Assignments<br />
                    Assignments may be accepted via Enspek's business website. Enspek has the right to re-assign work if the Contractor fails to complete assignments in a timely and accurate manner.
                  </p>

                  <p className="font-medium py-3">
                    4. Payment<br />
                    Enspek shall pay the Contractor as agreed upon after 30 days from the report acceptance. All requests for payment must be presented as invoices or by other prescribed methods.
                  </p>

                  <p className="font-medium py-3">
                    5. Independent Contractor Status<br />
                    Contractor is not an employee of Enspek and is responsible for their own taxes, insurance, and benefits.
                  </p>

                  <p className="font-medium py-3">
                    6. Methods of Performing Assignments<br />
                    Contractor is responsible for determining their methods, apparel, and equipment, provided they meet industry standards and Enspek’s safety requirements.
                  </p>

                  <p className="font-medium py-3">
                    7. Brand<br />
                    Enspek refers to its Contractors as "Inspectors." Contractor agrees to comply with branding, using identification badges as required.
                  </p>

                  <p className="font-medium py-3">
                    8. Prohibition of Weapons, Drugs, Alcohol<br />
                    Contractor is prohibited from carrying weapons or being under the influence of drugs or alcohol while performing assignments.
                  </p>

                  <p className="font-medium py-3">
                    9. Timeliness<br />
                    Contractor must complete all assignments by the communicated deadlines. Time is of the essence in every assignment.
                  </p>

                  <p className="font-medium py-3">
                    10. Accessibility<br />
                    Contractor must be accessible to Enspek while completing assignments and respond to communications in a timely manner.
                  </p>

                  <p className="font-medium py-3">
                    11. Consent to Release Name<br />
                    Contractor consents to their name and contact information being shared with customers.
                  </p>

                  <p className="font-medium py-3">
                    12. Consent to Record Calls<br />
                    Contractor consents to Enspek recording phone calls for business purposes.
                  </p>

                  <p className="font-medium py-3">
                    13. Entry on Private Property<br />
                    Contractor may enter private property only with consent from the property owner and must document consent.
                  </p>

                  <p className="font-medium py-3">
                    14. Dress Code<br />
                    While performing Services under this Agreement, whether or not Contractor is meeting with anyone, Contractor agrees to dress in a manner that is appropriate and professional at all times, and to comply with the following requirements:<br />
                    • No hardware in pierced tongue or other visible body parts (other than conservative ear piercing).<br />
                    • No inappropriate slogans or pictures.<br />
                    • No torn pants or jeans that reveal any skin or undergarments.<br />
                    • No excessively short garments.<br />
                    • No t-shirts.<br />
                    • No sagging pants.<br />
                    • No bare midriff.<br />
                    • No tank tops.<br />
                    • Skirts must be at a length appropriate in a professional workplace.<br />
                    • No extremely baggy pants.<br />
                    • No pyjama bottoms or tops.<br />
                    • No shorts.<br />
                    • No sleeveless shirts on men.<br />
                    • Shoes must be worn at all times.<br />
                    • No house shoes.<br />
                    • No sandals.<br />
                    • No skull caps, stocking caps, du-rags, etc.<br />
                    • No hats worn backward or sideways.<br />
                    Failure to adhere to these requirements may result in the work being reassigned and the Contractor being denied further assignments. Provided that the Contractor does not violate the foregoing dress code, it is understood by the parties to this Agreement that Contractor will provide their own clothing and make their own decisions regarding attire to be worn while performing Services under this Agreement.
                  </p>

                  <p className="font-medium py-3">
                    15. Termination of Assignments<br />
                    Enspek may cancel assignments at any time without a cancellation fee to the Contractor.
                  </p>

                  <p className="font-medium py-3">
                    16. Termination of Agreement<br />
                    Enspek may terminate this Agreement with 1-day notice for breach, fraud, or misconduct by the Contractor.
                  </p>

                  <p className="font-medium py-3">
                    17. Delegation of Duties<br />
                    Contractor cannot subcontract or assign duties without prior written consent from Enspek.
                  </p>

                  <p className="font-medium py-3">
                    18. Compliance<br />
                    Contractor must perform services ethically, legally, and professionally, adhering to Enspek's rules and industry standards.
                  </p>

                  <p className="font-medium py-3">
                    19. Immigration Compliance<br />
                    Contractor is responsible for ensuring they and any subcontractors comply with applicable immigration laws.
                  </p>

                  <p className="font-medium py-3">
                    20. Business Ethics<br />
                    Contractor agrees not to offer or accept gratuities and to uphold ethical practices.
                  </p>

                  <p className="font-medium py-3">
                    21. Use of Offshore Resources<br />
                    Contractor must obtain Enspek’s written consent to use resources outside their country for service delivery.
                  </p>

                  <p className="font-medium py-3">
                    22. Taxes and Liabilities<br />
                    Contractor is solely responsible for their taxes and contributions, and indemnifies Enspek against related liabilities.
                  </p>

                  <p className="font-medium py-3">
                    23. Litigation<br />
                    Contractor must notify Enspek immediately of any litigation related to their services.
                  </p>

                  <p className="font-medium py-3">
                    24. Assumption of Risk<br />
                    Contractor assumes all risks associated with assignments and may withdraw if conditions are deemed unsafe.
                  </p>

                  <p className="font-medium py-3">
                    25. Security Breach Damages<br />
                    Contractor will defend, indemnify, and hold Enspek harmless in case of a security breach.
                  </p>

                  <p className="font-medium py-3">
                    26. Limitation of Liability<br />
                    Neither Enspek nor the Contractor will be liable for special, indirect, or consequential damages.
                  </p>

                  <p className="font-medium py-3">
                    27. Indemnity<br />
                    Contractor agrees to indemnify Enspek against claims arising from property damage, personal injury, or intellectual property infringement.
                  </p>

                  <p className="font-medium py-3">
                    28. Participation in Disputes<br />
                    Contractor agrees to participate in dispute resolution upon Enspek's request.
                  </p>

                  <p className="font-medium py-3">
                    29. Background Investigation<br />
                    Contractor agrees to submit to a background investigation if requested by Enspek.
                  </p>

                  <p className="font-medium py-3">
                    30. Harassment and Convictions<br />
                    Contractor represents that they will refrain from harassment and have not been convicted of crimes involving dishonesty, violence, or sexual misconduct.
                  </p>

                  <p className="font-medium py-3">
                    31. Confidential Information<br />
                    Contractor agrees to maintain the confidentiality of all information disclosed by Enspek during assignments.
                  </p>

                  <p className="font-medium py-3">
                    32. Copyright and Works Made for Hire<br />
                    All work performed by the Contractor under this Agreement will be owned by Enspek, including copyrights and intellectual property.
                  </p>

                  <p className="font-medium py-3">
                    33. No Reverse Engineering<br />
                    Contractor may not reverse-engineer Enspek’s website or any associated code.
                  </p>

                  <p className="font-medium py-3">
                    34. Non-Solicitation<br />
                    Contractor agrees not to solicit Enspek's customers or employees during or after the term of this Agreement.
                  </p>

                  <p className="font-medium py-3">
                    35. Notices<br />
                    All notices under this Agreement must be provided by certified mail and email.
                  </p>

                  <p className="font-medium py-3">
                    36. Modifications<br />
                    Enspek may modify this Agreement at any time, and each new assignment constitutes acceptance of the updated terms.
                  </p>


                  <p className="font-medium py-3">
                    37. Governing Law<br />
                    This Agreement is governed by the laws of the Contractor’s country.
                  </p>

                  <p className="font-medium py-3">
                    38. Force Majeure<br />
                    Neither party is liable for delays due to causes beyond their control.
                  </p>

                  <p className="font-medium py-3">
                    39. Captions<br />
                    Headings in this Agreement are for convenience and do not affect its interpretation.
                  </p>

                  <p className="font-medium py-3">
                    40. Forbearance and Waiver<br />
                    Failure to enforce any right or provision of this Agreement does not constitute a waiver of future enforcement of that right.
                  </p>

                  <button
              onClick={acceptAgreement}
              className=" mt-4 flex items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 border rounded-lg outline-none mb-3 focus:outline-gray-500"
            >
              Accept
            </button>
                </div>


              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationScreen;
