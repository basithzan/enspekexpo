import React, { useEffect, useState } from "react";
import Img from "../../assets/image/onboard-1-new.png";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";

const OnboardingOne = () => {
  const client = useSelector((state) => state.client.auth_client);
  const inspector = useSelector((state) => state.inspector.auth_inspector);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (client !== [] && client?.success) {
      setLoading(false);

      navigate("/home-client");
    } else {
      setLoading(false);

      if (client?.success == false) {
        setLoading(false);
      }
    }
  }, [client]);

  useEffect(() => {
    if (inspector !== [] && inspector?.success) {
      setLoading(false);

      navigate("/home-inspector");
    } else {
      setLoading(false);

      if (inspector?.success == false) {
        setLoading(false);
      }
    }
  }, [inspector]);

  return (
    <>
      {loading ? (
        <Loading title={"Loading..."} />
      ) : (
        <div className="grid place-content-center w-screen h-screen text-center">
          <img
            src={Img}
            className="w-11/12 mx-auto REMOVE h-[285px] object-cover object-top REMOVE"
            alt=""
          />
          <div className="px-14 text-[#0F172A] font-medium text-3xl">
          Transform your Inspection and audit job with Enspek.
          </div>
          <div className="text-sm px-10 pt-3 pb-5 leading-tight text-[#64748B]">
            New inspection opportunities if you are an inspector.
          </div>
          <Link to={"/onboard-2"}>
            <button className="mx-auto bg-[#15416E] text-white font-bold rounded-2xl px-14 py-4">
              Get Started
            </button>
          </Link>
          <div className="mt-5 mx-auto flex gap-1">
            <div className="h-1 w-6 bg-[#15416E] rounded"></div>
            <div className="h-1 w-1 bg-[#E2E8F0] rounded"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingOne;
