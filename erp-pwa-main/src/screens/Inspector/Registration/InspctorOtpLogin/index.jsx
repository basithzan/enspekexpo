import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import Loading from '../../../../components/Loading';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WEBSITE_API_URL } from '../../../../config/api';
import { useDispatch } from 'react-redux';
import { setInspectorReduxData } from '../../../../store/inspector/inspectorSlice';
import { setClientReduxData } from '../../../../store/client/clientSlice';
import countryData from './data.json';

const InspctorOtpLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState({ value: '+1', label: '+1 (USA)' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [contentType, setContentType] = useState(""); // Track content type
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [inspectorData, setInspectorData] = useState({
    name: '',
    email: '',
    country: '',
    freelanceType: '',
    termsAccepted: false,
    phone: '',
    otp: ''
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    country: '',
    company_name: '',
    termsAccepted: false,
    phone: '',
    otp: ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [signupError, setSignupError] = useState('');

  const options = countryData.map(option => ({ value: option.value, label: `${option.dial_code} (${option.label})` }));

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
    setPhoneError('');
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length < 8) {
      setPhoneError('Please enter a valid phone number.');
      return;
    }

    try {
      setLoading(true)
      const country = countryData.find(option => option.dial_code === countryCode.value)?.label;
      const countryName = countryCode.label.split("(")[0].split(")")[0];

      // console.log(countryName);
      // return
      const response = await axios.post(WEBSITE_API_URL + '/send-otp', {
        // phone_number: `${countryCode.value}${phoneNumber}`,
        phone_number: `${phoneNumber}`,
        code: countryName,
        country_label: country

      });
      if (response.data.success) {
        setOtpSent(true);
      } else {
        setPhoneError('Failed to send OTP, please try again.');
      }
      setLoading(false)

    } catch (error) {
      console.error('Error sending OTP:', error);
      setPhoneError('Error sending OTP. Please try again later.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true)
      const countryName = countryCode.label.split("(")[0].split(")")[0];

      const response = await axios.post(WEBSITE_API_URL + '/verify-otp', {
        // phone_number: `${countryCode.value}${phoneNumber}`,
        phone_number: `${phoneNumber}`,
        otp,
        code: countryName,
        country_label: countryCode.label
      });
      if (response.data.success) {
        const userRole = response.data.role;
        if (userRole === 'inspector') {
          dispatch(setInspectorReduxData(response.data?.userData))
          navigate("/home-inspector")
        } else if (userRole === 'client') {
          dispatch(setClientReduxData(response.data?.userData))
          navigate("/home-client")

        } else {
          setOtpVerified(true);
        }
        setLoading(false);

      } else {
        setLoading(false);

        setOtpError('Invalid OTP, please try again.');
      }
      setLoading(false)

    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Error verifying OTP. Please try again later.');
      setLoading(false);

    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInspectorData({ ...inspectorData, [name]: value });
    setSignupError('');
  };

  const handleInputChange2 = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
    setSignupError('');
  };

  const handleSignup = async () => {
    const currentPath = location.pathname;

    console.log(currentPath);
    setInspectorData({ ...inspectorData, phone: '8876565799', otp: '12345' });

    if (!inspectorData.termsAccepted) {
      setSignupError('Please accept the terms and conditions.');
      return;
    }

    if (!inspectorData.name) {
      setSignupError('Name is required.');
      return;
    }

    if (!inspectorData.email) {
      setSignupError('Email is required.');
      return;
    }


    if (!inspectorData.freelanceType) {
      setSignupError('Freelance type is required.');
      return;
    }

    // const countryLabel = countryData.find(option => option.dial_code === countryCode.value)?.label;

    const countryName = countryCode.label.split("(")[0].split(")")[0];
  
    const extractedData = {
      name: inspectorData.name,
      email: inspectorData.email,
      country_id: countryName,
      phone: phoneNumber,
      type: inspectorData.freelanceType,
      password: phoneNumber,
      register_type: "inspector"
    };
    try {
      setLoading(true);
      const response = await axios.post(WEBSITE_API_URL + '/register-user-otp', extractedData);
      if (response.data.success) {


        if (currentPath === '/inspector-otp-login') {
          dispatch(setInspectorReduxData(response.data))
          // navigate("/home-inspector")
          showContent("agreement")
        } else if (currentPath === '/client-otp-login') {
          dispatch(setClientReduxData(response.data))
          navigate("/home-client")
        } else {
          setOtpVerified(true);
        }
      } else {
        setSignupError('Signup failed, please try again. ' + response.data.data);
      }
      // if (response.data.success) {
      //   window.location.href = '/homepage';
      // } else {
      //   setSignupError('Signup failed, please try again.');
      // }
    } catch (error) {
      console.error('Error signing up:', error);
      setSignupError('Error signing up. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


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
  }
  const handleSignupClient = async () => {
    const currentPath = location.pathname;

    setCompanyData({ ...companyData, phone: '8876565799', otp: '12345' });
    console.log(companyData);

    if (!companyData.termsAccepted) {
      setSignupError('Please accept the terms and conditions.');
      return;
    }

    if (!companyData.name) {
      setSignupError('Name is required.');
      return;
    }

    if (!companyData.email) {
      setSignupError('Email is required.');
      return;
    }


    if (!companyData.company_name) {
      setSignupError('Company name is required.');
      return;
    }
    const countryName = countryCode.label.split("(")[1].split(")")[0];

 
    const extractedData = {
      name: companyData.name,
      email: companyData.email,
      country_id: countryName,
      phone: phoneNumber,
      company_name: companyData.company_name,
      password: phoneNumber,
      register_type: "client"
    };

    console.log('====================================');
    console.log(extractedData,'jjj');
    console.log('====================================');
    try {
      // setLoading(true);
      const response = await axios.post(WEBSITE_API_URL + '/register-user-otp', extractedData);
      if (response.data.success) {


        if (currentPath === '/inspector-otp-login') {
          dispatch(setInspectorReduxData(response.data))
          // navigate("/home-inspector")
          showContent("")
        } else if (currentPath === '/client-otp-login') {
          dispatch(setClientReduxData(response.data))
          navigate("/home-client")
        } else {
          setOtpVerified(true);
        }
      } else {
        setSignupError('Signup failed, please try again. ' + response.data.data);
      }
      // if (response.data.success) {
      //   window.location.href = '/homepage';
      // } else {
      //   setSignupError('Signup failed, please try again.');
      // }
    } catch (error) {
      console.error('Error signing up:', error);
      setSignupError('Error signing up. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      {loading ? (
        <Loading title={"Loading..."} />

      ) : (
        <>
          <div className="text-lg font-bold px-5 py-5  flex items-center gap-5">
            <Link to={'/welcome'}>

              <ArrowLeftIcon className="w-6 font-bold" />
            </Link>
            <div>
              Sign Up
            </div>
          </div>
          <div className=" px-8 pt-10 pb-8 mb-4">

            {!otpSent ? (
              <>
                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                    Select your country
                  </label>
                  <Select
                    options={options}
                    value={countryCode}
                    onChange={(value) => setCountryCode(value)}
                  />

                </div>
                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                    Enter Phone Number
                  </label>
                  <input
                    type="number"
                    placeholder="Enter phone number without country code"
                    className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${phoneError ? "border border-red-500" : "border-none"
                      }`}
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                  />
                  {phoneError && <div className="text-red-500 text-xs">{phoneError}</div>}
                  <button
                    className=" mt-4 flex items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 border rounded-lg outline-none mb-3 focus:outline-gray-500"

                    onClick={handleSendOtp}>Send OTP</button>
                </div>
              </>
            ) : !otpVerified ? (

              <div>
               <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                    Enter Otp recieved on whatsapp
                  </label>
                <input
                  placeholder="Enter OTP"
                  value={otp}
                  type="number"

                  maxLength={5}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError('');
                  }}
                  className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${otpError ? "border border-red-500" : "border-none"
                    }`}
                />
                {otpError && <div className="text-red-500 text-xs">{otpError}</div>}
                <button
                  className=" mt-4 flex items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 border rounded-lg outline-none mb-3 focus:outline-gray-500"

                  onClick={handleVerifyOtp}>Verify OTP</button>
              </div>
            ) : (

              <React.Fragment>
                {location.pathname == "/inspector-otp-login" ? (

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                      Enter your name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter name"
                      value={inspectorData.name}
                      onChange={handleInputChange}
                      className="appearance-none w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3"
                    />
                    <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                      Enter your email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={inspectorData.email}
                      onChange={handleInputChange}
                      className="appearance-none w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3"
                    />
                    <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                      Select freelance type
                    </label>
                    <select
                      name="freelanceType"
                      value={inspectorData.freelanceType}
                      onChange={handleInputChange}
                      className="appearance-none w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3"
                    >
                      <option value="">Select freelance type</option>
                      <option value="freelance inspector">Freelance Inspector</option>
                      <option value="inspection agency">Inspection Agency</option>
                    </select>
                    <label className="block mt-4">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={inspectorData.termsAccepted}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (e.target.checked) setTermsError('');
                        }}
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
                    </label>
                    {termsError && <div className="error-message text-red-500">{termsError}</div>}
                    <button
                      onClick={handleSignup}
                      // disabled={loading || !(inspectorData.name && inspectorData.email && inspectorData.freelanceType && inspectorData.termsAccepted)}
                      className=" mt-4 flex items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 border rounded-lg outline-none mb-3 focus:outline-gray-500"
                    >
                      Sign Up
                    </button>
                    {signupError && <div className="text-red-500 mt-4 text-center">{signupError}</div>}
                  </div>
                ) : (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                      Enter your name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter name"
                      value={companyData.name}
                      onChange={handleInputChange2}
                      className="appearance-none w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3"
                    />
                    <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                      Enter your email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={companyData.email}
                      onChange={handleInputChange2}
                      className="appearance-none w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3"
                    />
                    <label className="block mb-2 text-sm font-medium text-gray-500 py-2">
                      Enter your company name
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      placeholder="Enter company name"
                      value={companyData.company_name}
                      onChange={handleInputChange2}
                      className="appearance-none w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3"
                    />
                    <label className="block mt-4">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={companyData.termsAccepted}
                        onChange={(e) => {
                          handleInputChange2(e);
                          if (e.target.checked) setTermsError('');
                        }}
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
                    </label>
                    {termsError && <div className="error-message text-red-500">{termsError}</div>}
                    <button
                      onClick={handleSignupClient}
                      className=" mt-4 flex items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 border rounded-lg outline-none mb-3 focus:outline-gray-500"
                    >
                      Sign Up
                    </button>
                    {signupError && <div className="text-red-500 mt-4">{signupError}</div>}
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
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

export default InspctorOtpLogin;
