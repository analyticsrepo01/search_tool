import React, { useState } from "react";
// import Select from "react-select";
// import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import { AiOutlineMail } from "react-icons/ai";
import { BsPersonAdd, BsBug } from "react-icons/bs";
import Container from "../components/Container";
import Toast from "../components/Toast";
// import countries from "../constants/countries";
import config from "../config";

const Contact = () => {

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    // country: "",
    companyName: "",
    companyEmail: "",
    mobileNumber: "",
    comments: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formdata: ", formData)
    try {
      const response = await fetch(`${config.LOCALHOST}/sendEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        let message = "Email sent successfully!"
        console.log(message);
        setSuccessMessage(message);
      } else {
        let message = "Failed to send email."
        console.error(message);
        setErrorMessage(message);
      }
    } catch (error) {
      console.error("An error occurred while sending the email.", error);
    }
  };

  // Update form data when input fields change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <Meta title={"Contact Us"} />
      {/* <BreadCrumb title="Contact Us" /> */}
      <Container class1="contact-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <iframe
              title="maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8286643735514!2d103.79746517492927!3d1.2761806987116886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1911f12998e9%3A0x43e454b88753032a!2sGoogle%20Asia%20Pacific%2C%20Singapore!5e0!3m2!1sen!2ssg!4v1688537943084!5m2!1sen!2ssg"
              width="600"
              height="450"
              className="border-0 w-100"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="col-12 mt-5">
            <div className="contact-inner-wrapper d-flex justify-content-between ">
              <div>
                <h3 className="contact-title mb-4">Contact</h3>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-15">
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  {/* <div>
                    <Select
                      options={countries}
                      placeholder="Country"
                      name="country"
                      value={formData.country}
                      onChange={(selectedOption) =>
                        setFormData((prevData) => ({
                          ...prevData,
                          country: selectedOption,
                        }))
                      }
                    />
                  </div> */}
                  <div>
                    <input
                      type="company"
                      className="form-control"
                      placeholder="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Company Email"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Mobile Number"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <textarea
                      name="comments"
                      id=""
                      className="w-100 form-control"
                      cols="30"
                      rows="4"
                      placeholder="Comments"
                      value={formData.comments}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div>
                    <button className="button-email" type="submit">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
              <div>
                <h3 className="contact-title mb-4">Get in touch with us</h3>
                <div>
                  <ul className="ps-0">
                    <li className="mb-3 d-flex gap-15 align-items-center">
                      <BsBug className="fs-5" />
                      <address className="mb-0">
                        <a href="https://docs.google.com/spreadsheets/d/1DrLq4csxe5kYvtIJh9u-iBsxmbU-5-qsO5Urcs-Pn7M/edit#gid=0" target="_blank" rel="noopener noreferrer">
                          Report Bugs Here!
                        </a>
                      </address>
                    </li>
                    <li className="mb-3 d-flex gap-15 align-items-center">
                      <BsPersonAdd className="fs-5" />
                      <address className="mb-0">
                        <a href="https://forms.gle/Rq3NNdiK3xJsGX78A" target="_blank" rel="noopener noreferrer">
                          Request Access Here!
                        </a>
                      </address>
                    </li>
                    <li className="mb-3 d-flex gap-15 align-items-center">
                      <AiOutlineMail className="fs-5" />
                      <a href="mailto:elroylbj@google.com" target="_blank" rel="noopener noreferrer">
                        Contact Owner Here!
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

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

export default Contact;
