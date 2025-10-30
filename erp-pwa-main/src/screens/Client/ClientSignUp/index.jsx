import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutClient, registerClient } from "../../../store/client/clientSlice";
import Loading from "../../../components/Loading";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { logoutInspector } from "../../../store/inspector/inspectorSlice";
import Select from 'react-select';
import countryData from './data.json';

const ClientSignUp = () => {
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    company_name: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false); // New state for checkbox
  const [showModal, setShowModal] = useState(false);
  const [contentType, setContentType] = useState(""); // Track content type

  const [countryCode, setCountryCode] = useState({ value: '+1', label: '+1 (USA)' });

  const client = useSelector((state) => state.client.auth_client);
  const auth_loading = useSelector((state) => state.client.auth_loading);

  const options = countryData.map(option => ({ value: option.value, label: `${option.dial_code} (${option.label})` }));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (client !== [] && client?.success) {
      setAuthError(false);
      navigate("/sign-up-success");
    } else {
      setAuthError(true);
      setAuthErrorMsg(client?.data);
      console.log(client);
    }
  }, [client]);

  useEffect(() => {
    dispatch(logoutClient());
    dispatch(logoutInspector());
  }, []);
  const handlePasswordToggleClick = () => {
    setShowPassword((prevState) => !prevState);
  };

  const passwordToggleClasses =
    "absolute  cursor-pointer text-gray-400  w-4 h-4 absolute top-1/2 transform translate-y-1/2 right-3";

  const handleOnchange = (text, input) => {
    // console.log(text.target.value);
    if (authError) {
      setAuthError(false);
    }
    if (input == "confirm_password") {
      if (text.target.value !== inputs.password) {
        handleError("Passwords do not match", "confirm_password");
      } else {
        setErrors((prevState) => ({ ...prevState, [input]: null }));
      }
    }
    setInputs((prevState) => ({ ...prevState, [input]: text.target.value }));
  };

  const handleError = (error, input) => {
    setErrors((prevState) => ({ ...prevState, [input]: error }));
  };

  const validate = async (e) => {
    e.preventDefault();
    setAuthError(false);

    let isValid = true;
    if (!inputs.name) {
      handleError("Please enter name", "name");
      isValid = false;
    }
    if (!inputs.email) {
      handleError("Please enter email", "email");
      isValid = false;
    }
    if (!inputs.password) {
      handleError("Please enter password", "password");
      isValid = false;
    }

    if (!inputs.phone) {
      handleError("Please enter phone number", "phone");
      isValid = false;
    } else if (inputs.phone && inputs.phone?.length < 9) {
      handleError("Invalid phone number", "phone");
      isValid = false;
    }
    if (!inputs.company_name) {
      handleError("Please enter company name", "company_name");
      isValid = false;
    }

    if (!acceptTerms) { // Check if terms are accepted
      handleError("You must accept the terms and conditions", "acceptTerms");
      isValid = false;
    }

    if (isValid) {
      register();
    }
  };

  const register = () => {
    const countryName = countryCode.label.split("(")[0].split(")")[0];
    inputs.country_id = countryName;

    console.log(inputs);
    
    // return
    dispatch(registerClient(inputs));
    setTimeout(async () => {
      // setLoading(false);
    }, 3000);
  };

  // Function to handle link clicks and show iframe

  const showContent = (type) => {
    setContentType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="">
      {auth_loading ? (
        <Loading title={"Signing Up"} />
      ) : (
        <>
          <div className="text-lg font-bold px-5 py-5  flex items-center gap-5">
            <Link to={'/client-login'}>

              <ArrowLeftIcon className="w-6 font-bold" />
            </Link>
            <div>
              Sign Up
            </div>
          </div>
          <form onSubmit={(e) => validate(e)} className=" px-8 pt-10 pb-8 mb-4">
            <div className="">
              <label className="block  text-sm font-medium text-gray-500 py-2">
                Enter your name
              </label>
              <input
                autoComplete="off"
                className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${errors?.name ? "border border-red-500" : "border-none"
                  }`}
                id="name"
                name="name"
                type="text"
                placeholder="Full Name"
                onChange={(text) => handleOnchange(text, "name")}

              />
              {errors?.name && (
                <div>
                  <h6 className="text-red-500 text-xs">{errors?.name}</h6>
                </div>
              )}
            </div>
            <div className="mt-0">
              <label className="block  text-sm font-medium text-gray-500 py-2">
                Enter your email
              </label>
              <input
                autoComplete="off"
                className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${errors?.email ? "border border-red-500" : "border-none"
                  }`}
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                onChange={(text) => handleOnchange(text, "email")}

              />
              {errors?.email && (
                <div>
                  <h6 className="text-red-500 text-xs">{errors?.email}</h6>
                </div>
              )}
            </div>
            <div className="mt-0">
              <label className="block  text-sm font-medium text-gray-500 py-2">
                Select your country
              </label>
              <Select
                options={options}
                value={countryCode}
                onChange={(value) => setCountryCode(value)}
              />

            </div>
            <div className="mt-0 ">
              <label className="block  text-sm font-medium text-gray-500 py-2">
                Enter phone number ( No country code required)
              </label>
              <input
                autoComplete="off"
                className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${errors?.phone ? "border border-red-500" : "border-none"
                  }`}
                id="phone"
                name="phone"
                type="text"
                placeholder="Mobile Number"
                onChange={(text) => handleOnchange(text, "phone")}

              />
              {errors?.phone && (
                <div>
                  <h6 className="text-red-500 text-xs">{errors?.phone}</h6>
                </div>
              )}
            </div>

            <div className="">
              <label className="block  text-sm font-medium text-gray-500 py-2">
                Enter company name
              </label>
              <input
                autoComplete="off"
                className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${errors?.company_name ? "border border-red-500" : "border-none"
                  }`}
                id="company_name"
                name="company_name"
                type="text"
                placeholder="Company Name"
                onChange={(text) => handleOnchange(text, "company_name")}

              />
              {errors?.company_name && (
                <div>
                  <h6 className="text-red-500 text-xs">{errors?.company_name}</h6>
                </div>
              )}
            </div>

            <div className=" relative">
              <label className="block  text-sm font-medium text-gray-500 py-2">
                Enter password
              </label>
              <input
                autoComplete="off"
                className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none focus:outline-gray-500${errors?.password ? "border border-red-500" : "border-none"
                  }`}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                onChange={(text) => handleOnchange(text, "password")}

              />
              <div
                className={passwordToggleClasses}
                onClick={handlePasswordToggleClick}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </div>
              {errors?.password && (
                <div>
                  <h6 className="text-red-500 text-xs mt-1">{errors?.password}</h6>
                </div>
              )}
            </div>

            {authError && (
              <div className="text-red-500 text-center text-sm mt-2 font-semibold">
                {authErrorMsg}
              </div>
            )}

            <div className="mt-4 flex items-start">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={() => setAcceptTerms(!acceptTerms)}
                className="mr-2 mt-1"
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
            {errors?.acceptTerms && (
              <div>
                <h6 className="text-red-500 text-xs">{errors?.acceptTerms}</h6>
              </div>
            )}


            <button
              type="submit"
              className=" mt-4 flex items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 border rounded-lg outline-none mb-3 focus:outline-gray-500"
            >
              Sign Up
            </button>
            <Link to={'/client-login'} className="text-xs  text-center justify-between mt-2">
              <div>
                Already have an account?
                <span className="text-[#15416E] text-md ml-1">Sign In</span>
              </div>
            </Link>
            {/* <div className="text-xs  text-center justify-between mt-2">
          <Link to={"/register"}>
            <div>
              Don’t have an account?{" "}
              <span className="text-blue">Create an account</span>
            </div>
          </Link>
        </div> */}
          </form>
        </>
      )}

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 h-5/6 relative overflow-auto p-5">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-red-500 font-bold"
            >
              X
            </button>
            <div className="content">
              {contentType === "privacy" && (
                <div>
                  <h2 className="font-bold">Privacy Policy for Enspek</h2>
                  <p className="font-medium py-3">
                    1. Introduction<br />
                    Welcome to Enspek. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
                  </p>
                  <h3>Information We Collect</h3>
                  <p className="font-medium py-3">We may collect and process the following data:</p>
                  <ul>
                    <li>Personal Identification Information (Name, email address, phone number)</li>
                    <li>Usage Data (App usage patterns, features accessed)</li>
                    <li>Device Information (IP address, device type, operating system)</li>
                    <li>User Content (Photos, documents, and other files uploaded by users)</li>
                  </ul>
                  <h3>How We Use Your Information</h3>
                  <p className="font-medium py-3">We use the information we collect in the following ways:</p>
                  <ul>
                    <li>To provide and maintain our service</li>
                    <li>To notify you about changes to our service</li>
                    <li>To provide customer support</li>
                    <li>To gather analysis or valuable information so that we can improve our service</li>
                  </ul>
                  <h3>Sharing Your Information</h3>
                  <p className="font-medium py-3">We do not share your personal information with third parties except:</p>
                  <ul>
                    <li>With your consent</li>
                    <li>For legal reasons (compliance with laws and regulations)</li>
                  </ul>
                  <h3>Security of Your Information</h3>
                  <p className="font-medium py-3">
                    We use administrative, technical, and physical security measures to help protect your personal information. This includes assurance that your information will be kept confidential even when stored on third-party cloud services. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                  </p>
                  <h3>Your Data Protection Rights</h3>
                  <p className="font-medium py-3">
                    You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your data. To exercise these rights, please contact us at{" "}
                    <a href="/cdn-cgi/l/email-protection#167f7870795673786566737d3875797b">
                      <span className="__cf_email__" data-cfemail="9ff6f1f9f0dffaf1eceffaf4b1fcf0f2"> info@enspek.com</span>
                    </a>.
                  </p>
                  <h3>Changes to This Privacy Policy</h3>
                  <p className="font-medium py-3">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
                  <h3>Contact Us</h3>
                  <p className="font-medium py-3">
                    If you have any questions about this Privacy Policy, please contact us at{" "}
                    <a href="/cdn-cgi/l/email-protection#9af3f4fcf5dafff4e9eafff1b4f9f5f7">
                      <span className="__cf_email__" data-cfemail="1e777078715e7b706d6e7b75307d7173"> info@enspek.com</span>
                    </a>.
                  </p>
                </div>
              )}
              {contentType === "terms" && (
                <div>
                  <h2 className="font-bold">Terms & Conditions for Enspek</h2>
                  <p className="font-medium py-3">
                    1. Acceptance of Terms<br />
                    By downloading and using Enspek, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, then you may not access the app.
                  </p>
                  <p className="font-medium py-3">
                    2. Use of the App<br />
                    You agree to use the app only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the app.
                  </p>
                  <p className="font-medium py-3">
                    3. User Accounts<br />
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                  </p>
                  <p className="font-medium py-3">
                    4. Intellectual Property<br />
                    The app and its original content, features, and functionality are and will remain the exclusive property of Enspek and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Enspek.
                  </p>
                  <p className="font-medium py-3">
                    5. User Content<br />
                    Users are prohibited from uploading unnecessary or inappropriate photos & documents. We reserve the right to delete any photos or content that violate this policy. By entering any content or data onto our site, you represent and warrant to us that you have the right to submit such content and that our use of your content as described herein will not infringe or violate the rights of any third party.
                    It is your responsibility to ensure the accuracy, suitability and compliance of any content submitted by you and you agree that we will not be liable for any damages whatsoever arising from your failure to do so.
                    Unless otherwise specified in any other document pertaining to specific content, you will continue to own all content you submit to our site; however, you grant us the right and license to use such content on the Site for purposes in connection with Services.
                  </p>
                  <p className="font-medium py-3">
                    6. Copyright<br />
                    By submitting any content to the app, you represent and warrant that you own all rights to the content or have obtained all necessary rights or permissions to use the content. You may not post, distribute, or reproduce in any way any copyrighted material, trademarks, or other proprietary information without obtaining the prior written consent of the owner of such proprietary rights.
                  </p>
                  <p className="font-medium py-3">
                    7. Termination<br />
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. You agree that we, in our sole discretion, may terminate your access to our Service for any reason or no reason, including without limitation your breach of these Terms. You agree that any termination of your access to our Service may be affected without prior notice, and you acknowledge and agree that we may immediately deactivate or delete any of your accounts and all related information and files in such accounts, and bar any further access to such files or our Service. You agree that we will not be liable to you or any third party for any loss or damages of any kind resulting from any termination of your access to our Service.
                  </p>
                  <p className="font-medium py-3">
                    8. Limitation of Liability<br />
                    In no event shall Enspek, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the app. We will not be liable for any failure or delay in performing under these terms where such failure or delay is due to causes beyond our reasonable control, including natural catastrophes, governmental acts or omissions, laws or regulations, terrorism, labour strikes or difficulties, communications systems breakdowns, hardware or software failures, transportation stoppages or slowdowns, or the inability to procure supplies or materials.
                  </p>
                  <p className="font-medium py-3">
                    9. Governing Law<br />
                    These Terms shall be governed and construed in accordance with the laws of [Your Country], without regard to its conflict of law provisions.
                  </p>
                  <p className="font-medium py-3">
                    10. Changes to Terms<br />
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our app after those revisions become effective, you agree to be bound by the revised terms.
                  </p>
                  <p className="font-medium py-3">
                    Contact Us<br />
                    If you have any questions about these Terms, please contact us at{" "}
                    <a href="/cdn-cgi/l/email-protection#a1c8cfc7cee1c4cfd2d1c4ca8fc2cecc">
                      <span className="__cf_email__" data-cfemail="a0c9cec6cfe0c5ced3d0c5cb8fc3cfcd"> info@enspek.com</span>
                    </a>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientSignUp;
