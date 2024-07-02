import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const ConfirmationPopup = ({ message, onCancel, onConfirm, onClose }) => {
  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "80%", // Adjust the width as needed
      maxHeight: "80%",
      padding: "20px",
      backgroundColor: "#fff",
      borderRadius: "4px",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };
  const buttonContainerStyles = {
    marginTop: "20px", // Add some spacing from the message
    textAlign: "center", // Center-align the buttons within the container
  };



  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Document Preview"
      style={modalStyles}
    >
    <div className="confirmation-popup">
      <p className="description d-block">{message}</p>
      <div style={buttonContainerStyles}>
        <button className="button-confirm" onClick={onConfirm}>Confirm</button>
        <button className="button-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
    </Modal>
  );
};

export default ConfirmationPopup;