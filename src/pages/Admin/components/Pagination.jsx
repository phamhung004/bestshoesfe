import React from "react";
import "./Pagination.css";

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(0, endPage - maxPagesToShow + 1);
  }

  // First page button
  if (startPage > 0) {
    pages.push(
      <button
        key="first"
        onClick={() => onPageChange(0)}
        className="pagination-btn"
        title="Trang đầu"
      >
        « Đầu
      </button>,
    );
  }

  // Previous page button
  if (currentPage > 0) {
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        className="pagination-btn"
        title="Trang trước"
      >
        ‹ Trước
      </button>,
    );
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`pagination-btn ${i === currentPage ? "active" : ""}`}
      >
        {i + 1}
      </button>,
    );
  }

  // Next page button
  if (currentPage < totalPages - 1) {
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        className="pagination-btn"
        title="Trang sau"
      >
        Sau ›
      </button>,
    );
  }

  // Last page button
  if (endPage < totalPages - 1) {
    pages.push(
      <button
        key="last"
        onClick={() => onPageChange(totalPages - 1)}
        className="pagination-btn"
        title="Trang cuối"
      >
        Cuối »
      </button>,
    );
  }

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Hiển thị {startItem} đến {endItem} trong tổng số {totalItems} mục
      </div>
      <div className="pagination-controls">{pages}</div>
    </div>
  );
};

export default Pagination;
