import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
// import { BsLink, BsLink45Deg } from "react-icons/bs";
import Popup from "../components/Popup";
import Toast from "../components/Toast";
import ConfirmationPopup from "./ConfirmationPopup";
import config from "../config";

const DataManage = ({ engine, isRefresh, setIsRefresh }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPurging, setIsPurging] = useState(false);
  const [isPurged, setIsPurged] = useState(false);
  const [purgeError, setPurgeError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [documentChecklist, setDocumentChecklist] = useState([]);

  const [isPurgePopupOpen, setIsPurgePopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  const openPurgePopup = () => {
    setIsPurgePopupOpen(true);
  };

  const closePurgePopup = () => {
    setIsPurgePopupOpen(false);
  };

  const openDeletePopup = () => {
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setIsDeletePopupOpen(false);
  };

  useEffect(() => {
    // Fetch the list of documents from the API when the component mounts
    const fetchDocuments = async () => {
      try {
        setPurgeError("");
        setIsPurging(true);
        setIsPurged(false);
        const response = await fetch(`${config.LOCALHOST}/listDocuments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ engine_id: engine }),
        });
        const data = await response.json();
        setDocuments(data);
        // eslint-disable-next-line array-callback-return

        setIsPurging(false);
      } catch (error) {
        console.log("Error fetching documents:", error);
        setPurgeError("Error fetching documents:", error);
        setIsPurging(false);
      }
    };
    if (engine !== "") {
      fetchDocuments();
    }
    // console.log("checked:", documentChecklist);
    if (isRefresh) setIsRefresh(false);
  }, [isPurged, isRefresh, engine, setIsRefresh]);

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
  };

  const handlePopupClose = () => {
    setSelectedDocument(null);
  };

  const handlePurge = async () => {
    try {
      closePurgePopup();
      setIsPurging(true);
      setIsPurged(false);
      setSuccessMessage("");
      setPurgeError("");

      await fetch(`${config.LOCALHOST}/purge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ engine_id: engine }),
      });
      setIsPurging(false);
      setIsPurged(true);
      setSuccessMessage("Purged Successfully!");
    } catch (error) {
      // Handle network or fetch error
      setIsPurging(false);
      setIsPurged(false);
      setPurgeError("Error purging documents:", error);
      console.log("Error purging documents:", error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      console.log(documentChecklist);
      setIsPurging(true);
      closeDeletePopup();
      setSuccessMessage("");
      setPurgeError("");
      const response = await fetch(`${config.LOCALHOST}/deleteDocs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documents: documentChecklist }),
      });
      console.log("DELETE RESPONSE:", response);
      if (response.status === 200) {
        setIsPurging(false);
        setIsPurged(true);
        setSuccessMessage("Deleted Successfully!");
      }
    } catch (error) {
      setIsPurging(false);
      setIsPurged(false);
      setPurgeError("Error deleting documents:", error);
      console.log("Error deleting documents:", error);
    }
  };

  const columns = [
    {
      field: "filter_name",
      headerName: "Name",
      width: 380,
      renderCell: (params) => (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
          className="manage-name clickable-header"
          onClick={() => handleDocumentClick(params.row)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {params.value}
        </a>
      ),
    },
    { field: "filter_category", headerName: "Category", width: 150 },
    { field: "filter_tenant", headerName: "Tenant", width: 150 },
    {
      field: "filter_created_time",
      headerName: "Created",
      width: 200,
      renderCell: (params) => {
        const createdTime = params.value;
        let formattedTime = "-";
        if (typeof createdTime === "string" && createdTime.includes("T")) {
          const date = new Date(createdTime);
          formattedTime = date.toLocaleString();
        }
        return <span>{formattedTime}</span>;
      },
    },
  ];
  const onRowsSelectionHandler = (selectedIds) => {
    const selectedNames = selectedIds.map(
      (id) => rows.find((row) => row.id === id).name
    );
    setDocumentChecklist(selectedNames);
  };
  const rows = documents.map((doc, index) => ({
    id: index, // Unique ID for each row (you might need a different way to generate this)
    filter_name: doc.filter_name,
    filter_category: doc.category,
    filter_tenant: doc.tenant,
    uri: doc.uri,
    filter_created_time: doc.created_time,
  }));
  return (
    <div className="my-1">
      <div className="filter-sort-grid mb-3 p-4 shadow">
        {/* Purge Documents */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* Number of Documents */}
            <div>
              <h5 className="product-title">
                Number of Documents:
                <span className="mx-2" style={{ color: "#08144d" }}>
                  {!isPurging && documents.length}
                </span>
              </h5>
            </div>
          </div>
          {isPurging && (
            <div className="import-loading-icon px-3">
              <div className="import-spinner"></div>
            </div>
          )}
        </div>
        <div className="mt-2">
          <button
            className="button-purge"
            onClick={openDeletePopup}
            disabled={
              documents.length === 0 ||
              documentChecklist.length === 0 ||
              isPurging
            }
            style={{
              backgroundColor:
                documents.length === 0 ||
                documentChecklist.length === 0 ||
                isPurging
                  ? "grey"
                  : "",
            }}
          >
            Delete Selected Documents
          </button>
          <button
            className="button-purge"
            onClick={openPurgePopup}
            disabled={documents.length === 0 || isPurging}
            style={{
              backgroundColor:
                documents.length === 0 || isPurging ? "grey" : "",
            }}
          >
            Purge Datastore
          </button>
        </div>
      </div>
      <div style={{ height: "", width: "" }}>
        <DataGrid
          className="datagrid shadow"
          rows={rows}
          columns={columns}
          checkboxSelection
          loading={isPurging}
          onRowSelectionModelChange={(item) => {
            onRowsSelectionHandler(item);
          }}
        />
      </div>
      <div>
        {/* Render popups */}
        {isPurgePopupOpen && (
          <ConfirmationPopup
            message="Are you sure you want to purge the datastore?"
            onCancel={closePurgePopup}
            onConfirm={handlePurge}
          />
        )}
        {isDeletePopupOpen && (
          <ConfirmationPopup
            message="Are you sure you want to delete the selected documents?"
            onCancel={closeDeletePopup}
            onConfirm={handleDeleteSelected}
          />
        )}
        {/* Popup */}
        {selectedDocument &&
          (console.log(selectedDocument),
          (
            <Popup
              onClose={handlePopupClose}
              title={selectedDocument.filter_name}
              description={selectedDocument.filter_summary_brief}
              uriLink={selectedDocument.uri}
            />
          ))}
      </div>

      {/* Toast */}
      {successMessage && <Toast type="success" message={successMessage} />}
      {purgeError && <Toast type="error" message={purgeError} />}
    </div>
  );
};

export default DataManage;
