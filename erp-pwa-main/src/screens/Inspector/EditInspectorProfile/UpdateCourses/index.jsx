import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../../components/Loading";
import TabNavigatorInspector from "../../../../components/TabNavigatorInspector";
import TopBar from "../../../../components/TopBar/TopBar";
import {
  saveInspectorProfile,
  updateInspectorData,
} from "../../../../store/inspector/inspectorSlice";
import { Toaster, toast } from 'sonner'


const schema = yup.object().shape({
  experiences: yup.array().of(yup.string().required("Experience is required")),
});

const CoursesForm = ({ defaultValues }) => {
  const inspector = useSelector((state) => state.inspector.auth_inspector);
  const inspector_loading = useSelector(
    (state) => state.inspector.inspector_loading
  );
  const [experiences, setExperiences] = useState([]);
  const dispatch = useDispatch();
  const bottomRef = useRef(null);

  //   console.log(inspector?.user?.inspector_details?.experience    );
  //   const { handleSubmit, control, register, errors } = useForm({
  //     resolver: yupResolver(schema),
  //     experiences,
  //   });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  console.log(errors, "err");
  const onSubmit = (data) => {
    // Handle form submission, including experience data
    console.log(data, "data");
    console.log(errors, "errors");

    const formattedData = data.experiences.join(","); // Convert array to comma-separated string

    // const formattedData = JSON.stringify(formattedExperiences);

    const formData = new FormData(); // Create a new FormData object
    formData.append("token", inspector?.user.auth_token);
    formData.append("type", "courses");
    formData.append("courses", formattedData);

    dispatch(
      saveInspectorProfile({
        formData: formData,
        token: inspector?.user.auth_token,
      })
    ).then((result) => {
      dispatch(updateInspectorData(inspector?.user.auth_token))
      toast.info('Courses Updated Successfully')

    }).catch((err) => {

    });
  };
  useEffect(() => {
    const initialExperiences =
      inspector?.user?.inspector_details?.courses || [];

    setExperiences(initialExperiences);
  }, [inspector]);

  useEffect(() => {
    dispatch(updateInspectorData(inspector?.user.auth_token));
  }, []);

  //   const experiencesArray = Object.values(inspec  /t  .or?.user?.inspector_details?.experience);

  const handleAddExperience = () => {
    setExperiences([...experiences, ""]);

    setTimeout(scrollToBottom, 100);
  };

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />

      {inspector_loading ? (
        <Loading title={"Loading..."} />
      ) : (
        <>
          <TopBar title={"Edit Course"} show_back />
          <div className="pb-16">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="my-1 py-3 bg-[#15416E] mx-3 px-3 rounded-md text-sm  text-white font-semibold"
                  onClick={handleAddExperience}
                >
                  + Add Course
                </button>
              </div>
              <div className="px-5 py-2">
                {experiences.map((experience, index) => (
                  <div key={index}>
                    <h2
                      className={`text-sm font-semibold grow ${
                        index >= 1 && "mt-5"
                      }`}
                    >
                      {parseInt(index) + 1} Course
                    </h2>

                    <label className="block mb-2 text-sm font-medium text-gray-500 ">
                      Course details
                    </label>
                    <Controller
                      name={`experiences[${index}]`}
                      control={control}
                      defaultValue={experiences[index]}
                      render={({ field }) => (
                        <input
                          {...field}
                          placeholder="Course names"
                          className={`w-full border ${
                            errors?.experiences?.[index]
                              ? "border-red-500"
                              : "border-[#E2E8F0]"
                          } rounded-lg px-3 py-3`}
                        />
                      )}
                    />

                    <span className="text-red-500">
                      {errors?.experiences?.[index]?.message}
                    </span>
                    <hr />
                  </div>
                ))}
              </div>

              {/* <button type="submit">Submit</button> */}
              <button
                type="submit"
                className="my-1 py-3 bg-[#15416E] w-full text-white font-bold fixed bottom-[60px]"
              >
                {"Update Course"}
              </button>
              <div className="h-[200px]"></div>
            </form>
            <div ref={bottomRef} style={{ width: "100%", height: "1px" }}></div>
          </div>
        </>
      )}
      <TabNavigatorInspector current={"/inspector-home"} />
    </>
  );
};

export default CoursesForm;
