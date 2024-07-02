import React, { useState } from "react";
import PdfPopup from "./PdfPopup";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";

const Segment = ({ pageNum, segment, title, uriLink }) => {
  const [showPdfPopup, setShowPdfPopup] = useState(false);
  const [showFullAnswer, setShowFullAnswer] = useState(false);

  const handleTitleClick = () => {
    setShowPdfPopup(true);
  };

  const toggleFullAnswer = () => {
    setShowFullAnswer(!showFullAnswer);
  };

  const lines = segment.split("\n");

  return (
    <div>
      {pageNum && (
        <div>
          <div className="answer">
            <div className="segment-title">
              <div className="answer-page" onClick={handleTitleClick}>
                Page {pageNum}
              </div>
              <div className="clickable-header mx-2 mt-1" onClick={toggleFullAnswer}>
                {showFullAnswer ? <BsFillEyeSlashFill /> : <BsFillEyeFill />}
              </div>
            </div>

            <div className="segment">
              {showFullAnswer ? (segment) : (lines.slice(0, 3).join("\n"))} ...
              {showFullAnswer && ((segment))}
            </div>
          </div>
        </div>
      )}
      {showPdfPopup && (
        <PdfPopup
          onClose={() => setShowPdfPopup(false)}
          title={title}
          pageNum={pageNum}
          segment={segment}
          uriLink={uriLink}
        />
      )}
    </div>
  );
};

export default Segment;

