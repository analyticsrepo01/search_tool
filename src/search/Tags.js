import React from "react";

const Tags = ({ category, tenant }) => {
  return (
    <div className="tags">
      {category &&
      <span className="category-box">
        <span className="category">{category}</span>
      </span>
      }
      {tenant &&
      <span className="tenant-box">
        <span className="tenant">{tenant}</span>
      </span>
      }
    </div>
  );
};

export default Tags;
