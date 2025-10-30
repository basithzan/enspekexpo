import React, { useState } from "react";
import TopBar from "../../../components/TopBar/TopBar";
import ErpSelect from "../../../components/InputFields/ErpSelect/ErpSelect";
import SearchBar from "../../../components/Home/SearchBar/SearchBar";
import TabNavigatorClient from "../../../components/TabNavigatorClient";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import RequestBlock from "../../../components/Home/RequestBlock/RequestBlock";
import BlockHeading from "../../../components/Home/BlockHeading/BlockHeading";

const MyRequests = () => {
  const client_requests = useSelector((state) => state.client.client_requests);
  const [searchInput, setSearchInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const searchFilteredData = () => {
    return client_requests?.enquiries?.filter(
      (item) =>
        item?.enquiry_no?.toLowerCase().includes(searchInput.toLowerCase()) ||
        item?.vendor?.toLowerCase().includes(searchInput.toLowerCase()) ||
        item?.job_title?.toLowerCase().includes(searchInput.toLowerCase()) ||
        item?.category?.toLowerCase().includes(searchInput.toLowerCase()) ||
        item?.category?.toLowerCase().includes(searchInput.toLowerCase()) ||
        item?.country?.name?.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  const dateFilteredData = () => {
    if (!fromDate && !toDate) return client_requests?.enquiries;

    return client_requests?.enquiries?.filter((item) => {
      const createdAtDate = new Date(item.created_at)
        .toISOString()
        .split("T")[0];
      return (
        (!fromDate || createdAtDate >= fromDate) &&
        (!toDate || createdAtDate <= toDate)
      );
    });
  };

  const filteredData = () => {
    const searchFiltered = searchFilteredData();
    const dateFiltered = dateFilteredData();
    const statusFiltered = statusFilteredData();

    // Combine search and date filters using intersection
    return searchFiltered.filter(
      (item) => dateFiltered.includes(item) && statusFiltered.includes(item)
    );
  };
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const statusFilteredData = () => {
    if (statusFilter === "") return client_requests?.enquiries;

    return client_requests?.enquiries?.filter(
      (item) => item.status === statusFilter
    );
  };

  return (
    <>
      <TopBar title={"My Requests"} show_back />

      <div className="px-5 flex justify-end mb-2"></div>

      <SearchBar
        placeholder="Search enquiry"
        inputValue={searchInput}
        changeHandler={handleSearchInputChange}
      />

      <div>
        <div className="font-medium text-[#0F172A] px-5 py-2 text-sm">
          Filter request by date & status
        </div>
      </div>
      <div className="px-5 grid grid-cols-2 gap-4 mt-1">
        <div className="border border-gray-300 rounded-lg px-4 py-2 text-[#94A3B8] w-full items-center flex justify-between">
          <input
            type="date"
            placeholder={"Choose from date"}
            value={fromDate}
            onChange={handleFromDateChange}
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="border border-gray-300 rounded-lg px-4 py-2 text-[#94A3B8]"
        >
          <option value="">All</option>
          <option value="0">Awarded</option>
          <option value="1">Voided</option>
          <option value="2">Rejected</option>
          <option value="3">In Process</option>
          <option value="4">No Response</option>
          <option value="5">Proposed</option>
          <option value="6">Cancelled</option>
        </select>
      </div>

      <hr className="h-2 my-4 bg-[#D9D9D9]" />
      {client_requests && client_requests?.enquiries && (
        <>
          {filteredData()?.map((item, indexQ) => (
            <Link to={"/view-inspection/" + item.id}>
              <div key={item.id} className="grid gap-4 px-5 mt-2">
                <RequestBlock
                  category={item.category}
                  title={item.job_title}
                  location={item?.country?.name}
                  date={item?.created_at}
                  status={parseInt(item?.status)}
                  jobId={item.enquiry_no}
                  bidAmount="200"
                  rfi={item.id}
                />
              </div>
            </Link>
          ))}
        </>
      )}
      <div className="divide-y-8 h-28"></div>

      <TabNavigatorClient current={"my-requests"} />
    </>
  );
};

export default MyRequests;
