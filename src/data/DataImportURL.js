import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import ImportMetadata from "./ImportMetadata";
import ReactPdfViewer from "../pdf/ReactPdfViewer";
import config from "../config";

const DataImportURL = ({ engine, isRefresh, setIsRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isPDF, setIsPDF] = useState(true);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [gcsLink, setGcsLink] = useState("");

  const [tenantList, setTenantList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tenant, setTenant] = useState("");
  const [newTenant, setNewTenant] = useState("");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [fileError, setFileError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [url, setUrl] = useState("");

  const [isSummarize, setIsSummarize] = useState(false);
  const toggleSummarize = () => {
    // console.log(!isSummarize);
    setIsSummarize(!isSummarize);
  };
  // const regex = /^[a-zA-Z0-9\-_\(\) ]{0,100}$/; // Alphanumeric with "-", "_", "(", ")", and space allowed, max 60 characters
  // const regexError = "File Name is invalid. Please use alphanumeric characters with '-', '_','(',')' allowed, maximum 100 characters.";

  // Reset States
  useEffect(() => {
    setIsConverting(false);
    setPdfPreviewUrl("");
    setGcsLink("");
    setTenantList([]);
    setCategoryList([]);
    setTitle("");
    setCategory("");
    setTenant("");
    setNewTenant("");
    setIsFileUploaded(false);
    setFileError("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsSummarize(false);
    setUrl("");
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
  }, [isRefresh, engine]);

  const handleTitleChange = (event) => {
    const { value } = event.target;
    setTitle(value);
    // setErrorMessage(regex.test(value) ? "" : regexError);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleTenantChange = (event) => {
    const selectedTenant = event.target.value;
    if (selectedTenant === "addNew") {
      setTenant("addNew");
      setNewTenant("");
    } else {
      setTenant(selectedTenant);
    }
  };

  const handleNewTenantChange = (event) => {
    setNewTenant(event.target.value);
  };

  // Upload
  const handleUpload = async () => {
    setErrorMessage("");
    setFileError("");
    setSuccessMessage("");

    if (!title || !category || !tenant || (tenant === "addNew" && !newTenant)) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }

    const formData = new FormData();
    formData.append("engine_id", engine);
    formData.append("url", gcsLink);
    formData.append("fileName", title);
    formData.append("category", category);
    formData.append("tenant", tenant === "addNew" ? newTenant : tenant);

    try {
      setIsLoading(true);
      const response = await uploadFile(formData);
      setIsLoading(false);
      if (response.status === "success") {
        setSuccessMessage("Uploaded Successfully!");

        // Reset the form states
        setGcsLink("");
        setPdfPreviewUrl("");
        setTitle("");
        setCategory("");
        setTenant("");
        setNewTenant("");
        setIsFileUploaded(false);
        setUrl("");
      } else {
        setErrorMessage("Failed to upload the file.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while uploading the file: ", error);
    }
  };

  // API call
  const uploadFile = async (formData) => {
    try {
      const response = await fetch(`${config.LOCALHOST}/uploadConverted`, {
        method: "POST",
        body: formData,
      });
      setIsLoading(false);
      return await response.json();
    } catch (error) {
      setIsLoading(false);
      // Handle the error
    }
  };

  const handleConvert = async () => {
    try {
      setIsPDF(true);
      setIsConverting(true);
      console.log("Convert url: ", url);

      const response = await fetch(`${config.LOCALHOST}/convert`, {
        timeout: 30000,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        setFileError("Failed to convert the URL to PDF. Please try again.");
        setIsConverting(false);
        return;
      }

      const data = await response.json();
      const gcsLink = data.gcs_link;
      setGcsLink(gcsLink);
      fetchPdfUrl(gcsLink);

      setIsFileUploaded(true);
      setSuccessMessage("");
      setFileError("");
      setErrorMessage("");

      setTitle("");
      setCategory("");
      setTenant("");
      setNewTenant("");

      setIsConverting(false);
    } catch (error) {
      setIsConverting(false);
      setFileError(error.message);
    }
  };

  const handleConvertHTML = async () => {
    try {
      setIsPDF(false);
      setIsConverting(true);

      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("Request timed out"));
        }, 30000);
      });

      const apiRequestPromise = fetch(`${config.LOCALHOST}/convertHTML`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      const response = await Promise.race([apiRequestPromise, timeoutPromise]);

      if (!response.ok) {
        setFileError("Failed to convert the URL to PDF.");
        setIsConverting(false);
        return;
      }

      const data = await response.json();
      const gcsLink = data.gcs_link;
      console.log("gcsLink:", gcsLink);
      setGcsLink(gcsLink);
      fetchPdfUrl(gcsLink);

      setIsFileUploaded(true);
      setSuccessMessage("");
      setFileError("");
      setErrorMessage("");

      setTitle("");
      setCategory("");
      setTenant("");
      setNewTenant("");

      setIsConverting(false);
    } catch (error) {
      setIsConverting(false);
      setFileError(error.message);
    }
  };

  const handlePdfGenerator = async () => {
    try {
      setIsConverting(true);
      console.log("url: ", url);

      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("Request timed out"));
        }, 30000); // Timeout after 30 seconds
      });

      const apiRequestPromise = fetch(`${config.LOCALHOST}/pdfgenerator`, {
        timeout: 30000,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      const response = await Promise.race([apiRequestPromise, timeoutPromise]);

      if (!response.ok) {
        setFileError("Failed to convert the URL to PDF. Please try again.");
        setIsConverting(false);
        return;
      }

      const data = await response.json();
      const gcsLink = data.gcs_link;
      setGcsLink(gcsLink);
      fetchPdfUrl(gcsLink);

      setIsFileUploaded(true);
      setSuccessMessage("");
      setFileError("");
      setErrorMessage("");

      setTitle("");
      setCategory("");
      setTenant("");
      setNewTenant("");

      setIsConverting(false);
    } catch (error) {
      setIsConverting(false);
      setFileError(error.message);
    }
  };

  const fetchPdfUrl = async (gcsLink) => {
    try {
      const response = await fetch(`${config.LOCALHOST}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uriLink: gcsLink }),
      });
      const pdfBinary = await response.json();
      setPdfPreviewUrl(pdfBinary);
    } catch (error) {
      console.log("Error fetching PDF URL:", error);
    }
  };

  return (
    <div className="my-1">
      {/* Upload */}
      <div className="filter-sort-grid p-4 mb-3 shadow">
        <div className="">
          <label>
            <h5>Enter URL</h5>
          </label>
          <br />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="standard-input"
          />
          <div className="d-flex justify-content-start align-items-center mt-3">
            <button
              hidden={false}
              className="button-convert"
              onClick={handlePdfGenerator}
              disabled={isLoading || isConverting}
              style={{
                backgroundColor: isLoading || isConverting ? "grey" : "",
              }}
            >
              Convert to PDF
            </button>
            <button
              className="button-convert"
              hidden={true}
              onClick={handleConvert}
              disabled={isLoading || isConverting}
              style={{
                backgroundColor: isLoading || isConverting ? "grey" : "",
              }}
            >
              Convert to PDF
            </button>
            <button
              className="button-convert"
              onClick={handleConvertHTML}
              disabled={isLoading || isConverting}
              style={{
                backgroundColor: isLoading || isConverting ? "grey" : "",
              }}
            >
              Convert to HTML
            </button>

            {isConverting && (
              <div className="import-loading-icon">
                <div className="import-spinner"></div>
              </div>
            )}
          </div>
        </div>

        {/* PDF Preview */}
        {pdfPreviewUrl && (
          <div className="pdf-preview-container mt-3">
            {isPDF ? (
              <ReactPdfViewer
                fileUrl={`data:application/pdf;base64,${pdfPreviewUrl}`}
              />
            ) : (
              <embed
                className="embedded-pdf"
                src={`data:text/html;base64,${pdfPreviewUrl}`}
                type="text/html"
              />
            )}
          </div>
        )}
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
          newTenant={newTenant}
          handleNewTenantChange={handleNewTenantChange}
          isFileUploaded={isFileUploaded}
          isLoading={isLoading}
          handleUpload={handleUpload}
          successMessage={successMessage}
          errorMessage={errorMessage}
          tenantList={tenantList}
          categoryList={categoryList}
          canSummarize={false}
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

export default DataImportURL;
