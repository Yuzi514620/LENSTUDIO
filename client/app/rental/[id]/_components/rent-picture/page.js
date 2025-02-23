// rent-picture

'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

// 預設 6 張圖片（當 API 沒有圖片時使用）
const defaultImages = [
  '/images/rental/test/leica-Q3-0.png',
  '/images/rental/test/leica-Q3-1.png',
  '/images/rental/test/leica-Q3-2.png',
  '/images/rental/test/leica-Q3-3.png',
  '/images/rental/test/leica-Q3-4.png',
  '/images/rental/test/leica-Q3-5.png',
]

export default function RentPicture({ images = [] }) {
  console.log('接收到的 images:', images)
  // 如果 API 沒有圖片，則使用預設圖片
  const finalImages =
    images.length > 0
      ? images.map((img) => `/images/rental/${img}.png`)
      : defaultImages

  // 修正：讓 mainImage 在 API 變動後自動更新
  const [mainImage, setMainImage] = useState(finalImages[0])
  const [useSticky, setUseSticky] = useState(false)


  useEffect(() => {
    if (!mainImage || !finalImages.includes(mainImage)) {
      setMainImage(finalImages[0]) // 確保主圖不會被重置，只有當 API 變動時才更新
    }
  }, [finalImages])

  // 修正：確保 `missingImages` 計算基於 `finalImages`
  const missingImages = finalImages.length < 3 ? 3 - finalImages.length : 0

  // 處理點擊縮圖切換主圖
  const handleThumbnailClick = (image) => {
    setMainImage(image)
  }

  // 🟢 監聽滾動，根據父容器 (col-lg-5) 與頁尾動態切換 sticky 與 relative
  useEffect(() => {
    const handleScroll = () => {
      const pictureSection = document.querySelector('.k-picture-container')
      const contentSection = document.querySelector('.col-lg-5') // 抓父元件 col-lg-5

      if (!pictureSection || !contentSection) return

      const pictureRect = pictureSection.getBoundingClientRect()
      const contentRect = contentSection.getBoundingClientRect()

      const isLargeScreen = window.innerWidth >= 992

      if (isLargeScreen) {
        // 🟢 Sticky 由右側內容 (col-lg-5) 高度控制，避免過早變成 relative
        const shouldUseSticky = pictureRect.bottom <= contentRect.bottom && pictureRect.bottom

        // 🟢 讓圖片區域高度跟隨右側內容變化
        pictureSection.style.height = `${contentRect.height - 28}px`

        if (shouldUseSticky !== useSticky) {
          setUseSticky(shouldUseSticky)
        }
      } else {
        setUseSticky(false) // 小螢幕保持 relative
        pictureSection.style.height = 'auto' // 小螢幕時清除高度設置
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    handleScroll() // 初始化時也執行一次

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [useSticky])


  return (
    <div className={`k-picture-container ${useSticky ? 'sticky' : 'relative'}`}>
      <div className="k-picture-sticky mb-4">
        {/* 主圖顯示區域 */}
        <div className="text-center k-picture-bg">
          <img
            src={mainImage}
            alt="Product Image"
            className="product-image img-fluid"
          />
        </div>

        {/* 縮圖輪播區域 */}
        <div className="k-thumbnails-container mt-3 d-flex align-items-center">
          <Swiper spaceBetween={10} slidesPerView={3}>
            {finalImages.map((img, index) => (
              <SwiperSlide key={index}>
                {/* 縮圖，點擊後切換主圖 */}
                <div
                  className="k-thumbnail k-picture-bg"
                  onClick={() => handleThumbnailClick(img)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index}`}
                    className={`img-fluid ${mainImage === img ? 'active' : ''}`}
                  />
                </div>
              </SwiperSlide>
            ))}

            {/* 使用 CSS 偽元素補足空白，確保只有當圖片少於 3 張時才補齊 */}
            {missingImages > 0 &&
              Array.from({ length: missingImages }).map((_, index) => (
                <SwiperSlide key={`empty-${index}`} className="empty-slide">
                  <div
                    className="k-thumbnail k-picture-bg"
                    aria-hidden="true"
                  ></div>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
