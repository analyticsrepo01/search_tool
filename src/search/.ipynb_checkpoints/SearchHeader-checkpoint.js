import React from "react";
import { BsSearch } from "react-icons/bs";

const SearchHeader = ({ query, setQuery, onSearch, correctedQuery, isLoading, isLoadingRegenerate }) => {

  const placeholderText = "Search Internal Documents"

  const handleSearch = () => {
    onSearch(query, 0);
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <header className="header-upper">
        <div className="container-fluid">

          {/* Search Bar */}
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mt-3">

              <div className="input-group shadow">
                <input
                  // ref={queryRef}
                  type="text"
                  className="form-control py-3 px-3"
                  placeholder={placeholderText}
                  aria-label={placeholderText}
                  aria-describedby="basic-addon2"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isLoadingRegenerate}
                />

                <div className="input-group-text search-icon px-4" id="basic-addon2" onClick={handleSearch}>
                  <BsSearch className="fs-6" />
                </div>
              </div>
              {isLoading && (
                <div className="loading-icon m-3">
                  <div className="spinner"></div>
                </div>
              )}
            </div>

            {/* Corrected Query */}
            {correctedQuery && (
              <p className="text-muted mx-2 mt-2" style={{ fontSize: "14px" }}>
                Showing results for <span style={{ color: "var(--font-red)" }}>{correctedQuery}</span> instead.
              </p>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default SearchHeader;
