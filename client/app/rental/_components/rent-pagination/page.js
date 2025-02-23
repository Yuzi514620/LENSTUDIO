// rent-pagination

'use client'

import { useEffect } from 'react'

export default function RentPagination({
  totalItems = 1,
  itemsPerPage = 1,
  onPageChange,
  currentPage,
  setCurrentPage
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (onPageChange) onPageChange(currentPage)
  }, [currentPage, onPageChange])

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber)
    }
  }

  // // 📌 **回到上一頁**
  // const handlePrev = () => {
  //   if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  // }

  // // 📌 **跳到下一頁**
  // const handleNext = () => {
  //   if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  // }


  // 📌 **跳轉到第一頁**
  const handleFirstPage = () => {
    if (currentPage !== 1) setCurrentPage(1)
  }

  // 📌 **跳轉到最後一頁**
  const handleLastPage = () => {
    if (currentPage !== totalPages) setCurrentPage(totalPages)
  }


  // 📌 **計算顯示的頁碼範圍**
  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, currentPage + 2)

  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4)
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4)
    }
  }



  return (
    <div className="d-flex justify-content-center align-items-center k-pagination mt-4 mb-1">
      {/* 📌 跳轉到第一頁按鈕 */}
      <button
        className="page-link"
        onClick={handleFirstPage}
        disabled={currentPage === 1}
      >
        &laquo;
      </button>

      {/* 📌 產生頁碼按鈕 */}
      {Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      ).map((page) => (
        <button
          key={page}
          className={`page-link ${currentPage === page ? 'active' : ''}`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      ))}

      {/* 📌 跳轉到最後一頁按鈕 */}
      <button
        className="page-link"
        onClick={handleLastPage}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </button>
    </div>
  )
}
