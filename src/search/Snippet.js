import React from "react";
import parse from 'html-react-parser';

const Snippet = ({ title, snippet }) => {
  
  return (
    <div>
      <h6 className="snippet-title">{title}</h6>
      <p className="description d-block">
        {parse(snippet)}
      </p>
    </div>
  );
};

export default Snippet;
