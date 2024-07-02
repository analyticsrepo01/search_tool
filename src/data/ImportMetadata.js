import React from "react";
import Toast from "../components/Toast";

const ImportMetadata = ({
  isLoading,
  
  canSummarize, 
  isSummarize,
  toggleSummarize,

  title,
  handleTitleChange,
  category,
  handleCategoryChange,
  tenant,
  handleTenantChange,
  isFileUploaded,
  handleUpload,
  successMessage,
  errorMessage,

  tenantList,
  categoryList,
}) => {

  return (
    <div className="product-card position-relative p-4 mb-4 shadow">
      <div className="product-details">
        <h5 className="product-title">Input Metadata</h5>
        <div className="mt-4 metadata-subtitle">
          <label>Document Title*</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="standard-input"
            placeholder="Enter Title"
            required="yes"
          />
        </div>
        <div className="mt-4 metadata-subtitle">
          <label>Category*</label>
          <br />
          <input
            type="text"
            list="categoryList"
            value={category}
            onChange={handleCategoryChange}
            className="standard-input"
            placeholder="Enter Category"
            required="yes"
          />
          <datalist id="categoryList">
            {categoryList.map((cat, index) => (
              <option key={index} value={cat} />
            ))}
          </datalist>
        </div>
        <div className="mt-4 metadata-subtitle">
          <label>Tenant*</label>
          <br />
          <input
            type="text"
            list="tenantList"
            value={tenant}
            onChange={handleTenantChange}
            className="standard-input"
            placeholder="Enter Tenant Name e.g. ldap"
            required="yes"
          />
          <datalist id="tenantList">
            {tenantList.map((ten, index) => (
              <option key={index} value={ten} />
            ))}
          </datalist>
        </div>

        {/* {canSummarize && (
        <div className="mt-4 metadata-subtitle">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value="markdown"
            className="sr-only peer"
            checked={isSummarize}
            onChange={toggleSummarize}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ml-3">Summarize Document &#40;will take a few minutes to run&#41;</span>
        </label>
        </div>
        )} */}

        <div className="d-flex justify-content-end align-items-center mt-4">
          {isLoading && (
            <>
              <span className="metadata-subtitle">
                This might take a few minutes...
              </span>
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

      {errorMessage && (
        <Toast type="error" message={errorMessage} />
      )}
    </div>
  );
};

export default ImportMetadata;
