import React, { useState } from "react";
import Snippet from "../search/Snippet";
import Answer from "../search/Answer";
import Tags from "../search/Tags";
import Popup from "../components/Popup";

const Result = ({ index, item }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    else console.log(str);
    return str[0];
  }

  function getFileName(gcsUrl) {
    const urlParts = gcsUrl.split("/");
    const filename = urlParts[urlParts.length - 1];
    return filename;
  }

  const title = capitalizeFirstLetter(item.filter_name);
  const filename = getFileName(item.uri_link);
  const segment = item.extractive_segments[0];

  return (
    <>
      <div className="product-card position-relative p-4 shadow">
        <div className="product-details">
          <div className="product-title-container">
            <h5 className="product-title">
              [{index + 1}] {title}
            </h5>
          </div>

          <div className="product-link urilink" onClick={handlePopupOpen}>
            {filename}
          </div>

          {item.snippets.map((snippet, index) => (
            <Snippet key={index} title={`Snippet`} snippet={snippet} />
          ))}

          <h6 className="snippet-title">Extractive Answers</h6>
          {item.extractive_answers_content.map((answer, index) => (
            <Answer
              key={index}
              pageNum={item.extractive_answers_pageNumber[index]}
              answer={answer}
              title={title}
              uriLink={item.uri_link}
            />
          ))}

          {/* <h6 className="snippet-title">Extractive Segments</h6>
          {item.extractive_segments.map((segment, index) => (
            <Segment
              key={index}
              // pageNum={item.extractive_segments_pageNumber[index]}
              pageNum={index+1}
              segment={segment} 
              title={title}
              uriLink={item.uri_link}  
            />
          ))} */}

          <Tags
            key={index}
            category={item.filter_category}
            tenant={item.filter_tenant}
          />
        </div>
      </div>
      {showPopup && (
        <Popup
          onClose={handlePopupClose}
          title={title}
          description={segment}
          uriLink={item.uri_link}
        />
      )}
    </>
  );
};

export default Result;
