import React from "react";

const DataSidebar = ({ activeMenuItem, setActiveMenuItem }) => {
  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  return (
    <div className="col-3 sidebar-wrapper">
      <div className="filter-card p-3 shadow">
        <h3 className="data-title">Datastore</h3>
        <div>
          <ul className="data-sidebar">
            <li
              className={activeMenuItem === "dataManage" ? "active" : ""}
              onClick={() => handleMenuClick("dataManage")}
            >
              Manage Documents
            </li>
            <li
              className={activeMenuItem === "dataImport" ? "active" : ""}
              onClick={() => handleMenuClick("dataImport")}
            >
              Import Document
            </li>
            <li
              className={activeMenuItem === "dataImportJSON" ? "active" : ""}
              onClick={() => handleMenuClick("dataImportJSON")}
            >
              Import using JSON
            </li>
            <li
              className={activeMenuItem === "dataImportCSV" ? "active" : ""}
              onClick={() => handleMenuClick("dataImportCSV")}
            >
              Import using CSV
            </li>
            <li
              className={activeMenuItem === "dataImportURL" ? "active" : ""}
              onClick={() => handleMenuClick("dataImportURL")}
            >
              Import Webpage
            </li>
          </ul>
        </div>
      </div>
      <div className="sidebar-content"></div>
    </div>
  );
};

export default DataSidebar;
