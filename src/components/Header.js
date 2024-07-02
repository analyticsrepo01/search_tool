import React from "react";
import { NavLink } from "react-router-dom";

const Header = ({
  engine,
  setEngine,
  engines
}) => {

  const handleEngineChange = (event) => {
    setEngine(event.target.value);
  };

  return (
    <>
      <header className="header-bottom py-2 px-4">
        <div className="container-fluid">
          <div className="row align-items-center" >

            {/* Menu */}
            <div className="col-10">
              <div className="menu-bottom d-flex align-items-center">
                <div className="menu-links">
                  <div className="d-flex align-items-center gap-15">
                    <NavLink to="/">Search</NavLink>
                    <div className="header-separator">|</div>
                    <NavLink to="/datastore">Datastore</NavLink>
                    <div className="header-separator">|</div>
                    <NavLink to="/chatbot">Multi-turn</NavLink>
                    <div className="header-separator">|</div>
                    <NavLink to="/contact">Contact</NavLink>
                  </div>

                </div>
              </div>
            </div>

            {/* Engine Selection */}
            <div className="col-2">
              <div className="d-flex">
                <select
                  className="form-control form-select clickable-header"
                  value={engine}
                  onChange={handleEngineChange}
                >
                  {engines.map((engineOption) => (
                    <option key={engineOption} value={engineOption}>
                      {engineOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
