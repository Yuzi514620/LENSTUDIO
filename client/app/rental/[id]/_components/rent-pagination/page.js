// rent-pagination

'use client'

import { useEffect } from 'react'
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi'

export default function RentPagination({
  currentIndex = 0,
  setCurrentIndex,
  totalItems = 0,
  itemsPerPage = 3,
}) {
  if (totalItems === 0) return null

  useEffect(() => {
    console.log('Updated currentIndex:', currentIndex)
    console.log('RentPagination -> totalItems:', totalItems)
  }, [currentIndex])

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage))
      console.log('Prev Clicked:', currentIndex - itemsPerPage)
    }
  }

  const handleNext = () => {
    if (currentIndex + itemsPerPage < totalItems) {
      setCurrentIndex((prev) =>
        Math.min(
          prev + itemsPerPage,
          totalItems - (totalItems % itemsPerPage || itemsPerPage)
        )
      )
      console.log('Next Clicked:', currentIndex + itemsPerPage)
    }
  }

  return (
    <div className="d-flex gap-2">
      <button
        className="btn btn-primary btn-sm k-recommend"
        onClick={handlePrev}
        disabled={currentIndex === 0}
      >
        <span aria-hidden="true">
          <BiSolidLeftArrow size={16} className="left-btn" />
        </span>
        <span className="visually-hidden">往前一個 Previous</span>
      </button>
      <button
        className="btn btn-primary btn-sm k-recommend"
        onClick={handleNext}
        disabled={currentIndex + itemsPerPage >= totalItems}
      >
        <span aria-hidden="true">
          <BiSolidRightArrow size={16} className="right-btn" />
        </span>
        <span className="visually-hidden">往後一個 Next</span>
      </button>
    </div>
  )
}
