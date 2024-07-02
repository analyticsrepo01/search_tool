import { Helmet } from "react-helmet";
import React from "react";

// Sets the Page Title (name on the tab) dynamically
const Meta = (props) => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{props.title}</title>
    </Helmet>
  );
};

export default Meta;
