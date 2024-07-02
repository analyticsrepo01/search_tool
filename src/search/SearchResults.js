import React from "react";
import Result from "../search/Result";

const SearchResults = ({ searchResults, checkedItems, summaryCount, onCheckboxChange, indexOffset, currentPageIndex }) => {
  const handleCheckboxChange = (item, isChecked) => {
    onCheckboxChange(item, isChecked);
  };
  const numChecked = checkedItems.length;

  return (
    <div className="products-list pb-5">
      <div className="d-flex gap-10 flex-wrap">
        {searchResults.map((item, index) => (
          <Result
            key={index}
            index={index}
            item={item}
            isChecked={checkedItems.includes(item)}
            numChecked={numChecked}
            summaryCount={summaryCount}
            onCheckboxChange={handleCheckboxChange}
            indexOffset={indexOffset}
            currentPageIndex={currentPageIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
