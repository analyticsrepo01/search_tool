import React from "react";
import ChatResult from "./ChatResult";

const ChatResults = ({
  searchResults,
  isLoading
}) => {

  return (
    <div className="products-list pb-5">
      {/* {isLoading && (
        <div className="loading-icon m-3 d-flex justify-content-center">
          <div className="spinner"></div>
        </div>
      )} */}
      <div className="d-flex gap-10 flex-wrap">
        {searchResults.map((item, index) => (
          <ChatResult
            key={index}
            index={index}
            item={item}
          />
        ))}

      </div>
    </div >
  );
};

export default ChatResults;