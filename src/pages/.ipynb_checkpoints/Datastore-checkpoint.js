import React, { useState, useEffect } from "react";
// import BreadCrumb from "../components/BreadCrumb";
import ToggleSidebar from "../components/ToggleSidebar";
import Meta from "../components/Meta";
import Container from "../components/Container";
import DataFilter from "../data/DataFilter";
import DataSidebar from "../data/DataSidebar";
import DataManage from "../data/DataManage";
import DataImport from "../data/DataImport";
import DataImportURL from "../data/DataImportURL";
import DataImportJSON from "../data/DataImportJSON";
import DataImportCSV from "../data/DataImportCSV";
import Logo from "../components/Logo";
import config from "../config";

const Datastore = ({ engine, setEngine, setEngines }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("dataManage");
  const [isRefresh, setIsRefresh] = useState(false);

  const handleRefresh = (refreshValue) => {
    setIsRefresh(refreshValue); // Update isRefresh state
  };

  // Load engines
  useEffect(() => {
    const listEngines = async () => {
      try {
        const response = await fetch(`${config.LOCALHOST}/listEngines`, {
          method: "GET",
        });
        const data = await response.json();
        setEngines(data);
        if (engine === "") {
          setEngine(data[0]);
        }
      } catch (error) {
        console.log("Error fetching engines:", error);
      }
    };
    if (engine === "") listEngines();
  }, [engine, setEngine, setEngines]);

  // Handle Sidebar
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <>
      <Meta title={"Datastore"} />
      {/* <BreadCrumb title="Datastore" /> */}

      <Container class1="store-wrapper home-wrapper-2 py-3">
        <div className="row">
          <div className="col-3 sidebar-wrapper">
            <Logo />
          </div>
          <div className="col-9">
            <DataFilter
              activeMenuItem={activeMenuItem}
              onRefresh={handleRefresh}
            />
          </div>
        </div>

        <div className="row">
          {isSidebarExpanded && (
            <DataSidebar
              activeMenuItem={activeMenuItem}
              setActiveMenuItem={setActiveMenuItem}
            />
          )}

          <div className={`datapage ${isSidebarExpanded ? "col-9" : "col-12"}`}>
            {activeMenuItem === "dataManage" ? (
              <DataManage
                engine={engine}
                isRefresh={isRefresh}
                setIsRefresh={setIsRefresh}
              />
            ) : activeMenuItem === "dataImport" ? (
              <DataImport
                engine={engine}
                isRefresh={isRefresh}
                setIsRefresh={setIsRefresh}
              />
            ) : activeMenuItem === "dataImportJSON" ? (
              <DataImportJSON
                engine={engine}
                isRefresh={isRefresh}
                setIsRefresh={setIsRefresh}
              />
            ) : activeMenuItem === "dataImportCSV" ? (
              <DataImportCSV
                engine={engine}
                isRefresh={isRefresh}
                setIsRefresh={setIsRefresh}
              />
            ) : (
              // activeMenuItem === "dataImportURL" ?
              <DataImportURL
                engine={engine}
                isRefresh={isRefresh}
                setIsRefresh={setIsRefresh}
              />
            )}
          </div>
        </div>
      </Container>

      {/* ToggleSidebar */}
      <div>
        <ToggleSidebar
          toggleIcon={toggleSidebar}
          isSidebarExpanded={isSidebarExpanded}
        />
      </div>
    </>
  );
};

export default Datastore;
