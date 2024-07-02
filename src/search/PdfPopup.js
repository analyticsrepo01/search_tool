import React, { useEffect, useState } from "react";
import parse from 'html-react-parser';
import Modal from "react-modal";
import JumpToFirstMatchExample from "../pdf/JumpToFirstMatchExample";
// import ReactPdfViewer from "../pdf/ReactPdfViewer"; 
import config from "../config";

Modal.setAppElement("#root");

const PdfPage = ({ onClose, title, answer, segment, pageNum, uriLink }) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileExtension, setFileExtension] = useState("");
  const [showFullSegment, setShowFullSegment] = useState(false);
  const searchText_answer = answer;
  const searchText_segment = segment;
  // const searchText_segment = segment.substring(0,200);

  const toggleFullSegment = () => {
    setShowFullSegment(!showFullSegment);
  };

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      maxWidth: "80%", 
      minWidth: "80%",
      maxHeight: "90%",
      minHeight: "90%",
      padding: "20px",
      backgroundColor: "#fff",
      borderRadius: "4px",
      display: "flex",
      flexDirection: "column",
      // alignItems: "center",
      // textAlign: "center",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  const fetchPdfUrl = async () => {
    try {
      const response = await fetch(`${config.LOCALHOST}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uriLink }),
      });
      const res = await response.json();
      
      const ext = uriLink.split('.').pop()
      if (ext === "pdf"){
        setFileExtension("application/pdf")
        const byte64 = `data:application/pdf;base64,${res}`;
        setPdfUrl(byte64);
      }
      else if (ext === "txt"){
        setFileExtension("text/plain")
        const byte64 = `data:text/plain;base64,${res}`;
        setPdfUrl(byte64);
      }
      else if (ext === "html"){
        setFileExtension("text/html")
        const byte64 = `data:text/html;base64,${res}`;
        setPdfUrl(byte64);
      }
    } catch (error) {
      console.log("Error fetching PDF URL:", error);
    }
  };

  useEffect(() => {
    fetchPdfUrl();
  // eslint-disable-next-line
  }, []);

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Document Preview"
      style={modalStyles}
    >
      <div className="popup-title">
        {/* <a className="pdf-title" href={pdfUrl} target="_blank" rel="noopener noreferrer"> */}
          {title}
        {/* </a> */}
      </div>
      {answer && (
        <div className="">
          <div className="snippet-title">
            Page {pageNum}
          </div>
          <p className="description d-block">
            {parse(answer)}
          </p>
        </div>
      )}
      {segment && (
        <div>
          <div className="answer">
            <span className="answer-page">
              Page {pageNum} 
              {!showFullSegment && (
              <span className="answer-page" onClick={toggleFullSegment}> (see more)</span>
              )}
              {showFullSegment && (
              <span className="answer-page" onClick={toggleFullSegment}> (see less)</span>
              )}
            </span>
            {/* <span className="clickable-header mx-2 mt-1" >
                {showFullSegment ? <BsFillEyeSlashFill /> : <BsFillEyeFill />}
            </span> */}
            <p className="description d-block">
              {showFullSegment ? parse(segment) : parse(segment.split("\n").slice(0, 3).join("\n"))} 
              ...
              {showFullSegment && (parse(segment))}
              
            </p>
          </div>
        </div>
      )}
      <div>
      <br/>
        {pdfUrl && (
          <div style={{ height: "720px" }}>
            {answer && (
            <JumpToFirstMatchExample fileUrl={pdfUrl} keyword={searchText_answer} pageNum={pageNum}/>
            )}
            {segment && (
            <div>
              {fileExtension === "application/pdf" ? (
                // <embed className="embedded-pdf" src={`${pdfUrl}#view=fitH`} type="application/pdf" />
                // <ReactPdfViewer fileUrl={pdfUrl}/>
                <JumpToFirstMatchExample fileUrl={pdfUrl} keyword={searchText_segment} pageNum={pageNum}/>
              ) : (
                <>
                <hr className="pdf-preview-divider" /><br/>
                <embed className="embedded-pdf" src={`${pdfUrl}#view=fitH`} type="text/plain" />
                </>
              )}
            </div>
            )}
          </div>
          )}
      </div>
    </Modal>
  );
};

export default PdfPage;
