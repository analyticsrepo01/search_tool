import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import config from "../config";

const DataImportCSV = ( {engine, isRefresh, setIsRefresh} ) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
    setSelectedFile(null);
    setIsRefresh(false);
  }, [isRefresh, engine])

  const handleFileChange = (event) => {
    setErrorMessage("");
    setSuccessMessage("");
    const file = event.target.files[0];
    if (file == null) {
      return;
    }

    // Check filetype
    const allowedExtensions = [".csv"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const isValidFile = allowedExtensions.includes(`.${fileExtension}`);
    if (!isValidFile) {
      setErrorMessage("Invalid file type. Only csv is accepted.");
      console.log("Invalid file type. Only csv is accepted.");
      return;
    }

    setSelectedFile(file);
  };

  // Upload
  const handleUpload = async () => {
    setErrorMessage("")
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("engine_id", engine);
    formData.append("file", selectedFile);
    console.log("file: ", selectedFile);

    try {
      setIsLoading(true);
      console.log("Uploading...")
      const response = await uploadFile(formData);
      if (response.status === "success") {
        setSuccessMessage("Uploaded Successfully!");
        setSelectedFile(null);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setErrorMessage("Failed to upload the file. Please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("An error occurred while uploading the file: ", error);
    }
  };

  // API /upload
  const uploadFile = async (file) => {
    try {
      const response = await fetch(`${config.LOCALHOST}/bulk_import_csv`, {
        method: "POST",
        body: file,
      });
      return await response.json();
    } catch (error) {
      // Handle the error
    }
  };

  return (
    <div className="my-1">
      {/* Upload */}
      <div className="filter-sort-grid p-4 mb-3 shadow">
        <h5>Import from CSV</h5>
        <div>
          <span>Template: </span>
          <a  href="http://go/cymbalsearch-csv"                   
            target="_blank"
            rel="noopener noreferrer">go/cymbalsearch-csv</a>
        </div>
        <div className="mt-2 clickable-header">
          <input type="file" accept=".csv" className="choose-file" onChange={handleFileChange} disabled={isLoading}/>
        </div>

        <div className="d-flex justify-content-end align-items-center">
            {isLoading && (
              <>
                <div className="import-loading-icon px-3">
                  <div className="import-spinner"></div>
                </div>
              </>
            )}
            <button
              className="button-regenerate"
              onClick={handleUpload}
              disabled={isLoading}
              style={{ backgroundColor: isLoading ? "grey" : "" }}
            >
              Upload
            </button>
          </div>
          
      </div>

      {/* Toast */}
      {successMessage && (
        <Toast type="success" message={successMessage} />
      )}
      {errorMessage && (
        <Toast type="error" message={errorMessage} />
      )}
    </div>
  );
};

export default DataImportCSV;