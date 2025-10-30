import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import 'leaflet/dist/leaflet.css';

import { Routes, Route, BrowserRouter } from "react-router-dom";
import RegistrationScreen from "./screens/Inspector/Registration";
import ClientSignUp from "./screens/Client/ClientSignUp";
import SignUpSuccess from "./screens/SignUpSuccess";
import SplashScreen from "./screens/SplashScreen";
import OnboardingOne from "./screens/Onboarding/OnboardingOne";
import OnboardingTwo from "./screens/Onboarding/OnboardingTwo";
import HomeInspector from "./screens/Inspector/HomeInspector";
import RequestInspection from "./screens/Client/RequestInspection";
import ClientProfile from "./screens/Client/ClientProfile";
import MyRequests from "./screens/Client/MyRequests";
import LatestNotification from "./screens/Notification";
import BidStatus from "./screens/BidStatus";
import JobsNearMe from "./screens/JobsNearMe/JobsNearMe";
import MyBids from "./screens/Inspector/MyBids/MyBids";
import BidNow from "./screens/Inspector/BidNow/BidNow";
import Welcome from "./screens/Welcome/Welcome";
import SignIn from "./screens/SignIn/SignIn";
import VerifyAccount from "./screens/VerifyAccount/VerifyAccount";
import Profile from "./screens/Inspector/InspectorProfile";
import SavedList from "./screens/MySavedList";
import InspectorLogin from "./screens/Inspector/InspectorLogin";
import ClientLogin from "./screens/Client/ClientLogin";
import WelcomeChoose from "./screens/Onboarding/OnboardingChoose";
import HomeClient from "./screens/Client/HomeClient";
import ClientAlerts from "./screens/Client/ClientAlerts";
import UploadRFI from "./screens/Client/UploadRFI";
import ViewInspection from "./screens/Client/ViewInspection";
import EditInspection from "./screens/Client/EditInspection";
import EditClientProfile from "./screens/Client/EditClientProfile";
import EditInspectorProfile from "./screens/Inspector/EditInspectorProfile";
import ExperienceForm from "./screens/Inspector/EditInspectorProfile/UpdateExperience";
import EducationForm from "./screens/Inspector/EditInspectorProfile/UpdateEducation";
import LanguageForm from "./screens/Inspector/EditInspectorProfile/UpdateLanguages";
import CerttificationForm from "./screens/Inspector/EditInspectorProfile/UpdateCertifications";
import CoursesForm from "./screens/Inspector/EditInspectorProfile/UpdateCourses";
import InspctorOtpLogin from "./screens/Inspector/Registration/InspctorOtpLogin";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path={"/"} exact element={<SplashScreen />} /> */}
        <Route path={"/"} exact element={<OnboardingOne />} />
        <Route path={"/onboard-2"} exact element={<OnboardingTwo />} />
        <Route path={"/welcome"} exact element={<WelcomeChoose />} />

        <Route path={"/client-sign-up"} exact element={<ClientSignUp />} />
        <Route path={"/sign-up-success"} exact element={<SignUpSuccess />} />
        <Route path={"/client-login"} exact element={<ClientLogin />} />
        <Route path={"/home-client"} exact element={<HomeClient />} />
        <Route path={"/request-inspection"} exact element={<RequestInspection />} />
        <Route path={"/client-alerts"} exact element={<ClientAlerts />} />
        <Route path={"/upload-rfi"} exact element={<UploadRFI />} />
        <Route path={"/view-inspection/:id"} exact element={<ViewInspection />} />
        <Route path={"/edit-inspection/:id"} exact element={<EditInspection />} />
        <Route path={"/client-profile"} exact element={<ClientProfile />} />
        <Route path={"/edit-client-profile"} exact element={<EditClientProfile />} />

        <Route path={"/inspector-sign-up"} exact element={<RegistrationScreen />} />
        <Route path={"/inspector-login"} exact element={<InspectorLogin />} />
        <Route path={"/inspector-otp-login"} exact element={<InspctorOtpLogin />} />
        <Route path={"/client-otp-login"} exact element={<InspctorOtpLogin />} />

        <Route path={"/home-inspector"} exact element={<HomeInspector />} />
        <Route path={"/my-requests"} exact element={<MyRequests />} />
        <Route path={"/bid-status"} exact element={<BidStatus />} />
        <Route path={"/my-bids"} exact element={<MyBids />} />
        <Route path={"/bid-now/:id"} exact element={<BidNow />} />
        <Route path={"/inspector-profile"} exact element={<Profile />} />
        <Route path={"/edit-inspector-profile"} exact element={<EditInspectorProfile />} />
        <Route path={"/inspector-experience-form"} exact element={<ExperienceForm />} />
        <Route path={"/inspector-education-form"} exact element={<EducationForm />} />
        <Route path={"/inspector-language-form"} exact element={<LanguageForm />} />
        <Route path={"/inspector-certifications-form"} exact element={<CerttificationForm />} />
        <Route path={"/inspector-courses-form"} exact element={<CoursesForm />} />


        <Route path={"/onboard-1"} exact element={<OnboardingOne />} />
        <Route path={"/onboard-2"} exact element={<OnboardingTwo />} />
        <Route path={"/notification"} exact element={<LatestNotification />} />
        <Route path={"/jobs-near-me"} exact element={<JobsNearMe />} />
        <Route path={"/welcome"} exact element={<Welcome />} />
        <Route path={"/sign-in"} exact element={<SignIn />} />
        <Route path={"/verify-account"} exact element={<VerifyAccount />} />
        <Route path={"/my-saved-list"} exact element={<SavedList />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
