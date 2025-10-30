import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginInspector, logoutInspector } from "../../../store/inspector/inspectorSlice";
import Loading from "../../../components/Loading";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { logoutClient } from "../../../store/client/clientSlice";

const InspectorLogin = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");

  const inspector = useSelector((state) => state.inspector.auth_inspector);
  const auth_loading = useSelector((state) => state.inspector.auth_loading);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (inspector !== [] && inspector?.success) {
      setAuthError(false);
      navigate("/home-inspector");
    } else {
      if (inspector?.success == false) {

      setAuthError(true);
      setAuthErrorMsg(inspector?.data);
      dispatch(logoutClient());
      dispatch(logoutInspector());
      }
    }
  }, [inspector]);

  const handlePasswordToggleClick = () => {
    setShowPassword((prevState) => !prevState);
  };

  const passwordToggleClasses =
    "absolute  cursor-pointer text-gray-400  w-4 h-4 absolute top-1/2 transform -translate-y-1/2 right-3";

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
    if (!inputs.email) {
      handleError("Please input email", "email");
      isValid = false;
    }
    if (!inputs.password) {
      handleError("Please input password", "password");
      isValid = false;
    }
    if (isValid) {
      login();
    }
  };

  const login = () => {
    dispatch(loginInspector(inputs));
    setTimeout(async () => {
      // setLoading(false);
 
    }, 500);
  };
  return (
    <div>
      {auth_loading ? (
        <Loading title={"Signing In"} />
      ) : (
        <>
          <div className="text-xl font-bold  text-center pt-12 mt-[100px]">
            <div>Login</div>
          </div>
          <div className="text-center text-xs pt-4 px-4">
            Welcome back! Sign in to continue.
          </div>
          <form onSubmit={(e) => validate(e)} className=" px-8 pt-10 pb-8 mb-4">
            <div className="mb-2">
              <input
                autoComplete="off"
                className={`appearance-none lowercase   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none mb-3 focus:outline-gray-500${
                  errors?.email ? "border border-red-500" : "border-none"
                }`}
                id="username"
                name="email"
                onChange={(text) => handleOnchange(text, "email")}
                type="text"
                placeholder="Email"
              />
              {errors?.email && (
                <div>
                  <h6 className="text-red-500 text-xs">{errors?.email}</h6>
                </div>
              )}
            </div>
            <div className="mt-4 relative">
              <input
                autoComplete="off"
                className={`appearance-none   w-full py-3 px-4 text-[#666161] font-normal text-xs leading-tight border rounded-lg outline-none focus:outline-gray-500${
                  errors?.password ? "border border-red-500" : "border-none"
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
                  <h6 className="text-red-500 text-xs mt-1">
                    {errors?.password}
                  </h6>
                </div>
              )}
            </div>
            {authError && (
              <div className="text-red-500 text-center text-sm mt-2 font-semibold">
                Username or password invalid
              </div>
            )}
            <button
              type="submit"
              className=" mt-4 flex items-center justify-center mx-auto w-full bg-[#15416E] hover:bg-white-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
            <div className="text-md  text-center justify-between mt-2  underline">
              <Link to={"/inspector-otp-login"}>
                <div>
                 Sign In with Mobile Number
                </div>
              </Link>
            </div>
            <div className="text-xs  text-center justify-between mt-2">
              <Link to={"/inspector-sign-up"}>
                <div>
                  Don’t have an account?{" "}
                  <span className="text-blue">Create an account</span>
                </div>
              </Link>
            </div>

            
          </form>
        </>
      )}
    </div>
  );
};

export default InspectorLogin;
