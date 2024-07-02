import React, { useState, useEffect } from "react";
import ImportMetadata from "./ImportMetadata";
import Toast from "../components/Toast";

import config from "../config";

const DataImport = ({ engine, isRefresh, setIsRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canSummarize, setCanSummarize] = useState(false);

  const [tenantList, setTenantList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [originalFileName, setOriginalFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tenant, setTenant] = useState("");
  const [docPages, setDocPages] = useState(0);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [fileError, setFileError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [isSummarize, setIsSummarize] = useState(false);

  // Reset States
  useEffect(() => {
    setTenantList([]);
    setCategoryList([]);
    setOriginalFileName("");
    setMimeType("");
    setDocPages(0);
    setCanSummarize(false);
    setTitle("");
    setCategory("");
    setTenant("");
    setIsFileUploaded(false);
    setFileError("");
    setErrorMessage("");
    setIsSummarize(false);
    setSelectedFile(null);
    setSuccessMessage("");
    setIsRefresh(false);

    // Fetch List of Metadata
    const listMetadata = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.LOCALHOST}/listMetadata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ engine_id: engine }),
        });
        const data = await response.json();
        setTenantList(data[0]);
        setCategoryList(data[1]);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setErrorMessage("Error fetching documents:", error);
        console.log("Error fetching documents:", error);
      }
    };
    listMetadata();
  }, [isRefresh, engine, setIsRefresh]);

  const toggleSummarize = () => {
    // console.log(!isSummarize);
    setIsSummarize(!isSummarize);
  };

  const handleTitleChange = (event) => {
    const { value } = event.target;
    setTitle(value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleTenantChange = (event) => {
    const selectedTenant = event.target.value;
    setTenant(selectedTenant);
  };

  const handleFileChange = (event) => {
    setFileError("");
    setSuccessMessage("");
    const file = event.target.files[0];
    if (file == null) {
      return;
    }

    // Check filetype
    const allowedExtensions = [".pdf", ".html", ".txt"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const isValidFile = allowedExtensions.includes(`.${fileExtension}`);
    if (!isValidFile) {
      setFileError("Invalid file type. Only pdf, html, txt are accepted.");
      console.log("Invalid file type. Only pdf, html, txt are accepted.");
      return;
    }

    // Check File Size < 100 MB
    const fileSizeInMB = file.size / (1024 * 1024); // Convert file size to MB
    // console.log("fileSizeInMB: ", fileSizeInMB);
    if (fileSizeInMB > 100) {
      setFileError("File size exceeded 100MB.");
      console.error("File size exceeded 100MB: ", fileSizeInMB);
      setIsFileUploaded(false);
      return;
    }

    // Set mimeType
    const mimeType = file.type;
    setMimeType(mimeType);

    // Try to generate Doc Title and use as placeholder
    var initialFileName = file.name
      .split(".")[0]
      .replace(/[-_]/g, " ") // Replace all "-" and "_" with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first alphabet of each word separated by spaces
    const MAX_FILE_NAME_LENGTH = 100;
    if (initialFileName.length > MAX_FILE_NAME_LENGTH) {
      initialFileName = initialFileName.substring(0, MAX_FILE_NAME_LENGTH);
    }

    // Check number of pages for PDF files
    if (mimeType === "application/pdf") {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onloadend = () => {
        const count = (reader.result.match(/\/Type[\s]*\/Page[^s]/g) || [])
          .length;
        console.log("Number of Pages:", count);
        setDocPages(count);
        if (count <= 250) {
          setCanSummarize(true);
        } else {
          setCanSummarize(false);
        }
      };
    }

    setSelectedFile(file);
    setTitle(initialFileName);
    setOriginalFileName(initialFileName);
    setIsFileUploaded(true);
    setCategory("");
    setTenant("");
  };

  // Upload
  const handleUpload = async () => {
    setErrorMessage("");
    setFileError("");
    setSuccessMessage("");
    if (!title || !category || !tenant) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }

    const formData = new FormData();
    formData.append("engine_id", engine);
    formData.append("file", selectedFile);
    formData.append("originalFileName", originalFileName);
    formData.append("fileName", title);
    formData.append("category", category);
    formData.append("tenant", tenant);
    formData.append("docPages", docPages);
    formData.append("mimeType", mimeType);
    formData.append("isSummarize", isSummarize);
    console.log("file: ", selectedFile);

    try {
      setIsLoading(true);
      console.log("Uploading...");
      const response = await uploadFile(formData);
      if (response.status === "success") {
        console.log("Upload success!");
        setIsLoading(false);
        setSuccessMessage("Uploaded Successfully!");

        // Reset the form states
        setSelectedFile(null);
        setOriginalFileName("");
        setTitle("");
        setCategory("");
        setTenant("");
        setIsFileUploaded(false);
        setIsSummarize(false);
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
      const response = await fetch(`${config.LOCALHOST}/upload`, {
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
        <h5>Import Document</h5>
        <div className="mt-4 clickable-header">
          <input
            type="file"
            accept=".pdf, .html, .txt"
            className="choose-file"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Metadata */}
      {isFileUploaded && (
        <ImportMetadata
          title={title}
          handleTitleChange={handleTitleChange}
          category={category}
          handleCategoryChange={handleCategoryChange}
          tenant={tenant}
          handleTenantChange={handleTenantChange}
          isFileUploaded={isFileUploaded}
          isLoading={isLoading}
          handleUpload={handleUpload}
          successMessage={successMessage}
          errorMessage={errorMessage}
          tenantList={tenantList}
          categoryList={categoryList}
          canSummarize={canSummarize}
          toggleSummarize={toggleSummarize}
          isSummarize={isSummarize}
        />
      )}

      {/* Toast */}
      {successMessage && <Toast type="success" message={successMessage} />}
      {fileError && <Toast type="error" message={fileError} />}
    </div>
  );
};

export default DataImport;
