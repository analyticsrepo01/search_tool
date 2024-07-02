import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ReactPdfViewer from "../pdf/ReactPdfViewer";
import config from "../config";

Modal.setAppElement("#root");

const Popup = ({ onClose, title, description, uriLink }) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileExtension, setFileExtension] = useState("");

  const summary =
    typeof description === "string" || description instanceof String
      ? description.trim()
      : "";

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "80%",
      minWidth: "60%",
      maxHeight: "90%",
      padding: "20px",
      backgroundColor: "#fff",
      borderRadius: "4px",
      display: "flex",
      flexDirection: "column",
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

      const ext = uriLink.split(".").pop();
      if (ext === "pdf") {
        setFileExtension("application/pdf");
        const byte64 = `data:application/pdf;base64,${res}`;
        setPdfUrl(byte64);
      } else if (ext === "txt") {
        setFileExtension("text/plain");
        const byte64 = `data:text/plain;base64,${res}`;
        setPdfUrl(byte64);
      } else if (ext === "html") {
        setFileExtension("text/html");
        const byte64 = `data:text/html;base64,${res}`;
        setPdfUrl(byte64);
      } else console.log("ERROR at fetchPdfUrl!");
    } catch (error) {
      console.log("Error fetching PDF URL:", error);
    }
  };

  useEffect(() => {
    fetchPdfUrl();
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

      {summary !== "" && (
        <div>
          <div className="snippet-title">DocAI Summary</div>
          <div className="popup-segment">
            <p>{summary}</p>
          </div>
        </div>
      )}

      {pdfUrl && (
        <div>
          {fileExtension === "pdf" || fileExtension === "application/pdf" ? (
            <ReactPdfViewer fileUrl={pdfUrl} />
          ) : (
            <>
              <hr className="pdf-preview-divider" />
              <br />
              <embed
                className="embedded-pdf"
                src={`${pdfUrl}#view=fitH`}
                type={fileExtension}
              />
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default Popup;
