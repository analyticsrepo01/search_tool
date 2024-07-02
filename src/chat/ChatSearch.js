import React, { useState, useRef, useEffect } from "react";
import { BsSearch } from "react-icons/bs";

const ChatSearch = ({onSearch, isLoading, resetOnClick}) => {
  
  const [query, setQuery] = useState("");
  
  const inputRef = useRef(null);
  
  const placeholderText = "Ask Follow-up Questions"

  const handleSearch = () => {
    onSearch(query);
    setQuery("");
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(()=>{
    inputRef.current.focus();
  }, [isLoading])

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
      <button
        onClick={resetOnClick}
        className="reset-button mr-2 shadow"
        disabled={isLoading}
        style={{ backgroundColor: isLoading ? "grey" : "" }}>
        Reset
      </button>
        <div className="input-group shadow">
          <input
            type="text"
            className="form-control py-3 px-3"
            placeholder={placeholderText}
            aria-label={placeholderText}
            aria-describedby="basic-addon2"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoFocus
            ref={inputRef}
          />
          <div className="search-icon input-group-text px-4" id="basic-addon2" onClick={handleSearch}>
            <BsSearch className="fs-6" />
          </div>
        </div>
        {isLoading && (
          <div className="loading-icon-regenerate">
            <img alt="" className="star ml-3" src="https://www.gstatic.com/lamda/images/sparkle_thinking_v2_darkmode_4c6a95bde842a7825eb83.gif"></img>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatSearch;
