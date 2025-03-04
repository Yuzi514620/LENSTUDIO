import { useEffect, useRef } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import styles from "./product-pagination.module.scss";

export default function Pagination({ totalProducts, currentPage, setCurrentPage }) {
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const firstPageRef = useRef(null);

  useEffect(() => {
    if (currentPage === 1 && firstPageRef.current) {
      firstPageRef.current.focus({ preventScroll: true });
    }
  }, [currentPage]);
  

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setTimeout(() => {
        document.getElementById(`page-${page}`)?.focus();
      }, 10);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPageButtons = window.innerWidth <= 391 ? 3 : 5;

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`d-flex justify-content-center ${styles.paginationContainer}`}>
      <ul className={`pagination ${styles.pagination}`}>

        {/* 上一頁按鈕 */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className={`page-link ${styles["page-link"]}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaAngleLeft size={15} />
          </button>
        </li>

        {/* 產生頁碼 */}
        {generatePageNumbers().map((page, index) => (
          <li key={index} className={`page-item ${currentPage === page ? "active" : ""}`}>
            {page === "..." ? (
              <span className={`page-link ${styles["page-link"]}`}>...</span>
            ) : (
              <button
                ref={page === 1 ? firstPageRef : null}
                id={`page-${page}`}
                className={`page-link ${styles["page-link"]}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* 下一頁按鈕 */}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className={`page-link ${styles["page-link"]}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaAngleRight size={15} />
          </button>
        </li>

      </ul>
    </div>
  );
}
