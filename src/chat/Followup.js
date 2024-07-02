import Modal from "react-modal";
import Chat from "./Chat"; // Import the Chat component

Modal.setAppElement("#root");

const Followup = ({ onClose, engine, initialQuery }) => {
  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "80%",
      minWidth: "80%",
      maxHeight: "93%",
      padding: "20px",
      backgroundColor: "#fff",
      borderRadius: "4px",
      // display: "flex",
      // flexDirection: "column",
      // textAlign: "center",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };
  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Follow-up"
      style={modalStyles}
    >
      <Chat engine={engine} initialQuery={initialQuery} isFollowup={true} />
    </Modal>
  );
};

export default Followup;
