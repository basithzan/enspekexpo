import React from "react";
import searchIco from "../../../assets/image/icons/search.svg";

const SearchBar = ({ placeholder, inputValue, changeHandler }) => {
  return (
    <div className="mx-5 max-w-full relative">
      <input
        type="text"
        value={inputValue}
        onChange={changeHandler}
        className="ps-12 py-4 border border-gray-300 bg-transparent rounded-lg w-full text-sm"
        placeholder={placeholder}
      />
      <img src={searchIco} className="absolute inset-y-4 left-4" alt="" />
    </div>
  );
};

SearchBar.defaultProps = {
  placeholder: "Search...",
};

export default SearchBar;
