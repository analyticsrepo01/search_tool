import React from "react";
import { Link } from "react-router-dom";

const Page = ({ currentPage, pageSize, totalItems, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Generate an array of page numbers from 1 to totalPages
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  return (
    <div className="pagination">
      {pageNumbers.map((page) => (
        <Link
          key={page}
          to="#"
          className={currentPage === page ? "active" : ""}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </Link>
      ))}
    </div>
  );
};

export default Page;
