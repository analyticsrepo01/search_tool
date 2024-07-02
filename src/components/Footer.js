import React, { useState } from "react";
import { BsLinkedin } from "react-icons/bs";
import Toast from "./Toast";
import newsletter from "../images/newsletter.png";
import config from "../config";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const handleRegister = () => {
    console.log("Registering email:", email);
    fetch(`${config.LOCALHOST}/registerEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("API response:", data);
        setEmail("");
        setSuccessMessage(data.message);
      })
      .catch((error) => {
        setErrorMessage("Error:", error);
        console.error("Error:", error);
        setEmail("");
      });
  };

  const handleEmailChange = (event) => {
    setSuccessMessage("");
    setEmail(event.target.value);
  };

  return (
    <>
      <footer className="p-4">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-5">
              <div className="footer-top-data d-flex gap-30 align-items-center">
                <img src={newsletter} alt="newsletter" />
                <h2 className="mb-0 text-white">Register your interest here!</h2>
              </div>
            </div>
            <div className="col-7">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control py-1"
                  placeholder="Your Email Address"
                  aria-label="Your Email Address"
                  aria-describedby="basic-addon2"
                  value={email}
                  onChange={handleEmailChange}
                />
                <button
                  type="button"
                  className="input-group-text px-4 py-1"
                  id="basic-addon2"
                  onClick={handleRegister}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <footer className="py-4">
        <div className="container-xxl">
          <div className="row">
            <div className="col-1">
              <a  className="text-white" 
                  href="https://www.linkedin.com/in/elroy-liang-94a61a1a6/"
                  target="_blank"
                  rel="noopener noreferrer">
                <BsLinkedin className="fs-4" />
              </a>
            </div>
            <div className="col-11">
              <p className="text-center mb-0 text-white">
                &copy; {new Date().getFullYear()} Powered by Google Cloud Run
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Toast */}
      {successMessage &&
        <Toast type="success" message={successMessage} />
      }
      {errorMessage &&
        <Toast type="error" message={errorMessage} />
      }
    </>
  );
};

export default Footer;
