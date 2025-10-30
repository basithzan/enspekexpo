import React from "react";
import Shopee from "../../assets/image/shopee.png";
import Img2 from "../../assets/image/Group.png";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Experience() {
  const inspector = useSelector((state) => state.inspector.auth_inspector);

  return (
    <div>
      <div className="border rounded-2xl border-[#ECF1F6] mt-8 mx-5 px-4 py-2">
        <div className="flex justify-between">
          <div className="font-bold font-sans text-[18px]">Experience</div>
          <Link to={"/inspector-experience-form"}>
            <div className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 me-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </div>
          </Link>
        </div>
        {inspector?.user?.details && inspector?.user?.details?.experience ? (
          <div className=" py-2">
            {Object.keys(inspector?.user?.details?.experience).map((key) => (
              <div className="flex items-center mt-3">
                <div className="grow border-b">
                  <div className="text-sm font-semibold mb-1">
                    {inspector?.user?.details?.experience[key].position}
                  </div>
                  <div className="text-sm font-medium text-[#78828A]">
                    {inspector?.user?.details?.experience[key].company} •{" "}
                    {inspector?.user?.details?.experience[key].year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Experience;
