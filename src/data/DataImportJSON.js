import React, { useState, useEffect } from "react";
import Toast from "../components/Toast";
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from "react-icons/ai";
import config from "../config";

const DataImportJSON = ({ engine, isRefresh, setIsRefresh }) => {
  const [tenantList, setTenantList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const defaultRow = { uri: "", documentTitle: "", category: "", tenant: "" }
  const [rows, setRows] = useState([defaultRow]);

  // Reset States
  useEffect(() => {
    setTenantList([]);
    setCategoryList([]);
    setErrorMessage("");
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
  }, [isRefresh, engine]);

  const addRow = () => {
    setRows([...rows, defaultRow]);
  };

  const removeRow = (index) => {
    const updatedRows = [...rows];
    if (updatedRows.length > 1) {
      updatedRows.splice(index, 1);
      setRows(updatedRows);
    }
  };

  const handleInputChange = (e, index, field) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = e.target.value;
    setRows(updatedRows);
  };
  
  // Bulk Upload
  const bulkImport = async () => {
    setErrorMessage("");
    setSuccessMessage("");
  
    const validationError = validateFields();
  
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    const request = {
      engine_id: engine,
      metadata_list: rows,
    }
    console.log("request:", request);

    try {
      setIsLoading(true);
      console.log("Uploading...")
      const response = await uploadFile(request);
      if (response.status === "success") {
        console.log("Upload success!")
        setSuccessMessage("Uploaded Successfully!");

        setRows([defaultRow]); // Reset the table
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

  // API /bulk_import
  const uploadFile = async (request) => {
    try {
      const response = await fetch(`${config.LOCALHOST}/bulk_import_json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      return await response.json();
    } catch (error) {
      // Handle the error
    }
  };

  // Validate Input Fields
  const validateFields = () => {
    // gs://bucket/file.ext
    const uriRegex = /^gs:\/\/[^/]+\/.+\.(pdf|txt|html)$/;
    for (const row of rows) {
      const { uri, documentTitle, category, tenant } = row;
      const trimmedUri = uri.trim();
      if (trimmedUri === "" || documentTitle.trim() === "" || category.trim() === "" || tenant.trim() === "" ) {
        return "All fields are required. Please fill in all fields.";
      }
      if (!uri.match(uriRegex)) {
        return "URI must start with 'gs://' and end with '.pdf', '.txt', or '.html', e.g. gs://bucket/file.ext";
      }
    return null;
    }
  };

  return (
    <>
      {/* Metadata */}
      <div className="product-card position-relative p-4 shadow">
        <div className="product-details">
          <h5 className="product-title mb-3">Input Metadata</h5>
          <table className="import-json-table">
            <thead>
              <tr>
                <th>URI {`(pdf/html/txt)`}</th>
                <th>Title</th>
                <th>Category</th>
                <th>Tenant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={row.uri}
                      onChange={(e) => handleInputChange(e, index, "uri")}
                      className="standard-input"
                      placeholder="gs://bucket/file.pdf"
                      required="yes"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.documentTitle}
                      onChange={(e) => handleInputChange(e, index, "documentTitle")}
                      className="standard-input"
                      placeholder="Document Title"
                      required="yes"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      list="categoryList"
                      value={row.category}
                      onChange={(e) => handleInputChange(e, index, "category")}
                      className="standard-input"
                      placeholder="Category"
                      required="yes"
                    />
                    <datalist id="categoryList">
                      {categoryList.map((cat, idx) => (
                        <option key={idx} value={cat} />
                      ))}
                    </datalist>
                  </td>
                  <td>
                    <input
                      type="text"
                      list="tenantList"
                      value={row.tenant}
                      onChange={(e) => handleInputChange(e, index, "tenant")}
                      className="standard-input"
                      placeholder="Tenant Name"
                      required="yes"
                    />
                    <datalist id="tenantList">
                      {tenantList.map((ten, idx) => (
                        <option key={idx} value={ten} />
                      ))}
                    </datalist>
                  </td>
                  <td className="remove-row-button">
                    <button onClick={() => removeRow(index)}>
                      <AiOutlineMinusCircle className="fs-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="add-row-button">
            <button onClick={addRow}>
              <AiOutlinePlusCircle className="fs-5" />
            </button>
          </div>
          <div className="d-flex justify-content-end align-items-center">
            {isLoading && (
              <>
                {/* <span className="metadata-subtitle mt-3">
                  This might take a few minutes...
                </span> */}
                <div className="import-loading-icon px-3 mt-3">
                  <div className="import-spinner"></div>
                </div>
              </>
            )}
            <button
              className="button-regenerate"
              onClick={bulkImport}
              disabled={isLoading}
              style={{ backgroundColor: isLoading ? "grey" : "" }}
            >
              Upload
            </button>
          </div>
        </div>

        {/* Toast */}
        {errorMessage && <Toast type="error" message={errorMessage} />}
        {successMessage && <Toast type="success" message={successMessage} />}

      </div>
    </>
  );
};

export default DataImportJSON;