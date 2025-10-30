import React from "react";
import BlockHeading from "../../../components/Home/BlockHeading/BlockHeading";
import JobBlock from "../../../components/Home/JobBlock/JobBlock";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const JobsNearContainer = () => {
  const nearby_jobs = useSelector((state) => state.inspector.nearby_jobs);

  console.log(nearby_jobs);
  return (
    <div className="mx-5 py-4">
      <BlockHeading title={"Jobs Near Me"} />
      {nearby_jobs &&
      nearby_jobs?.nearby_jobs &&
      nearby_jobs?.nearby_jobs?.length > 0 ? (
        <>
          {nearby_jobs?.nearby_jobs?.map((item, indexQ) => (
            <Link to={"/bid-now/" + item.id}>
              <div className="grid gap-4 mt-2">
                <JobBlock
                  category={item.category}
                  title={item.job_title}
                  location={item?.country?.name}
                 
                  tag={item.enquiry_scope}
                  added_date={item.created_at}
                  item={item}
                  scope={item.enquiry_scope}
                />
              </div>
            </Link>
          ))}
        </>
      ) : (
        <div className="text-black text-center font-bold text-base">
          Sorry,No jobs near you
        </div>
      )}
    </div>
  );
};

export default JobsNearContainer;
