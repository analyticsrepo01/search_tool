import React, {useState} from "react";
import parse from 'html-react-parser';
import PdfPopup from "./PdfPopup";

const Answer = ({ pageNum, answer, title, uriLink }) => {

  const [showPdfPopup, setShowPdfPopup] = useState(false);

  const handleTitleClick = () => {
    setShowPdfPopup(true);
  };

  return (
    <div>
      {pageNum &&(
      <div className="answer">
        <div 
          className="answer-page"
          onClick={handleTitleClick}
        >
          Page {pageNum} 
        </div>
        {parse(answer)}
      </div>
      )}
      {!pageNum &&(
      <div className="answer">
          {parse(answer)}
      </div>
      )}
      {showPdfPopup && (
        <PdfPopup
          onClose={() => setShowPdfPopup(false)}
          title={title}
          pageNum={pageNum}
          answer={answer}
          uriLink={uriLink}
        />
      )}

    </div>
  );
};

export default Answer;
