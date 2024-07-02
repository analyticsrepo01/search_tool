import React, { useState, useEffect } from "react";
import { MdOutlineRefresh } from "react-icons/md";

const Header = ({ activeMenuItem, onRefresh }) => {
  const [title, setTitle] = useState("");

  const handleRefresh = () => {
    onRefresh(true);
  };

  useEffect(() => {
    switch (activeMenuItem) {
      case "dataImport":
        setTitle("Import Documents");
        break;
      case "dataImportURL":
        setTitle("Import Webpage");
        break;
      case "dataImportJSON":
        setTitle("Import Using JSON");
        break;
      case "dataImportCSV":
        setTitle("Import Using CSV");
        break;
      case "dataManage":
        setTitle("Manage Documents");
        break;
      default:
        setTitle("");
        break;
    }
  }, [activeMenuItem]);

  return (
    <>
      <header className="header-upper py-3 mb-3">
        <div className="container-fluid">
          <div className="col-12"> {/*Change length of search bar*/}
            <div className="input-group shadow">
              <input
                type="text"
                className="form-control py-3 px-3"
                placeholder={title}
                aria-label=""
                aria-describedby="basic-addon2"
                disabled={true}
              />
              <span className="input-group-text px-4 search-icon" id="basic-addon2" onClick={handleRefresh}>
                <MdOutlineRefresh className="fs-5" />
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
