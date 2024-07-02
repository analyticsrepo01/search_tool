import React from "react";
// import logoVideo from "../images/mp4-search.mp4";
import logoGif from "../images/gif-500.gif";

const Logo = () => {
  const handleRefresh = () => {
    window.location.reload(); 
  };

  return (
    <div className="logo-container clickable-header" onClick={handleRefresh}>
      {/* <video className="logo-image" autoPlay loop muted>
        <source src={logoVideo} type="video/gif"/>
          Your browser does not support the video tag.
      </video> */}
      <img className="logo-image" src={logoGif} alt="Logo GIF" />
    </div>
  );
};

export default Logo;
