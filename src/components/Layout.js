import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ( {engine, setEngine, engines} ) => {

  return (
    <>
      <Header
        engine={engine}
        setEngine={setEngine}
        engines={engines}
      />
      <div className="search-page-wrapper">
      <Outlet />
      <Footer />
      </div>
    </>
  );
};

export default Layout;
