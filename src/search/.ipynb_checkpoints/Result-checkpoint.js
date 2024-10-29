import React, { useState } from "react";
import prodcompare from "../images/prodcompare.svg";
import view from "../images/view.svg";
import Snippet from "./Snippet";
import Answer from "./Answer";
import Segment from "./Segment";
import Tags from "./Tags";
import Popup from "../components/Popup";

const Result = ({
  index,
  item,
  isChecked,
  numChecked,
  summaryCount,
  onCheckboxChange,
  indexOffset,
  currentPageIndex,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showSegment, setShowSegment] = useState(false);

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleViewOpen = () => {
    setShowView(true);
  };

  const handleViewClose = () => {
    setShowView(false);
  };
  const handleSegmentOpen = () => {
    setShowSegment(true);
  };

  const handleSegmentClose = () => {
    setShowSegment(false);
  };

  const handleCheckboxChange = () => {
    onCheckboxChange(item, !isChecked);
  };

  function capitalizeFirstLetter(str) {
    if (typeof str !== "string") {
      // Handle non-string inputs gracefully (e.g., null, undefined, numbers)
      str = ""; // Convert to empty string (or adjust as needed)
    }
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function getFileName(gcsUrl) {
    const urlParts = gcsUrl.split("/");
    const filename = urlParts[urlParts.length - 1];
    return filename;
  }

  const title = capitalizeFirstLetter(item.filter_name);
  const filename = getFileName(item.uri_link);
  const segment = item.extractive_segments[0];
  // const summary_comprehensive = (typeof item.filter_summary_comprehensive === 'string' || item.filter_summary_comprehensive instanceof String) ? item.filter_summary_comprehensive : "";
  const summary_brief =
    typeof item.filter_summary_brief === "string" ||
    item.filter_summary_brief instanceof String
      ? item.filter_summary_brief
      : "";
  const resultIndex = index + (currentPageIndex - 1) * indexOffset + 1;

  // Determine if the checkbox should be disabled
  const isDisabled = !isChecked && numChecked >= summaryCount;

  return (
    <>
      <div className="product-card position-relative p-4 shadow">
        <div className="product-details">
          <div className="product-title-container">
            <h5 className="product-title">
              [{resultIndex}] {title}
            </h5>
            <div className="wishlist-icon">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                disabled={isDisabled}
              />
            </div>
          </div>

          <div className="product-link urilink" onClick={handlePopupOpen}>
            {filename}
          </div>

          {/* DocAI Summary */}
          {summary_brief && (
            <Snippet title={`DocAI Summary`} snippet={summary_brief.trim()} />
          )}

          {item.snippets.map((snippet, index) => (
            <Snippet key={index} title={`Snippet`} snippet={snippet} />
          ))}

          {item.extractive_answers_content.length > 0 && (
            <h6 className="snippet-title">Extractive Answers</h6>
          )}
          {item.extractive_answers_content.map((answer, index) => (
            <Answer
              key={index}
              pageNum={item.extractive_answers_pageNumber[index]}
              answer={answer}
              title={title}
              uriLink={item.uri_link}
            />
          ))}

          {item.extractive_segments.length > 0 && (
            <h6 className="snippet-title">Extractive Segments</h6>
          )}
          {item.extractive_segments.map((segment, index) => (
            <Segment
              key={index}
              pageNum={item.extractive_segments_pageNumber[index]}
              segment={segment}
              title={title}
              uriLink={item.uri_link}
            />
          ))}

          <Tags
            key={index}
            category={item.filter_category}
            tenant={item.filter_tenant}
          />
        </div>

        {/* magic buttons */}
        <div hidden={true}>
          <div className="action-bar position-absolute">
            <div className="d-flex flex-column gap-15 m-1 py-3">
              <button
                className="border-0 bg-transparent"
                onClick={handleViewOpen}
              >
                <img src={view} alt="view" />
              </button>

              <button
                className="border-0 bg-transparent"
                onClick={handleSegmentOpen}
              >
                <img src={prodcompare} alt="compare" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <Popup
          onClose={handlePopupClose}
          title={title}
          description={item.filter_summary_comprehensive}
          uriLink={item.uri_link}
        />
      )}
      {showView && (
        <Popup
          onClose={handleViewClose}
          title={title}
          description=""
          uriLink={item.uri_link}
        />
      )}
      {showSegment && (
        <Popup
          onClose={handleSegmentClose}
          title={title}
          description={segment}
        />
      )}
    </>
  );
};

export default Result;
