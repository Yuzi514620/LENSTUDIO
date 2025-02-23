// rent-hashtag

'use client'
import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap' // ✅ 引入 Bootstrap Modal

export default function RentHashtag({ hashtags = [], onHashtagClick }) {
  const [showModal, setShowModal] = useState(false) // 控制 Modal 開關
  const [maxVisibleTags, setMaxVisibleTags] = useState(4) // 預設最多顯示 4 個

  // 📌 **根據視窗大小動態調整 `maxVisibleTags`**
  useEffect(() => {
    const updateMaxVisibleTags = () => {
      if (window.innerWidth < 768) {
        setMaxVisibleTags(4)
      } else if (window.innerWidth < 1200) {
        setMaxVisibleTags(3)
      } else {
        setMaxVisibleTags(4)
      }
    }

    updateMaxVisibleTags() // 初始化時立即執行
    window.addEventListener('resize', updateMaxVisibleTags) // 監聽視窗變更
    return () => window.removeEventListener('resize', updateMaxVisibleTags) // 清除監聽
  }, [])

  // 📌 **依據 `maxVisibleTags` 計算 `visibleTags` & `hiddenTags`**
  const visibleTags = hashtags.slice(0, maxVisibleTags)
  const hiddenTags = hashtags.slice(maxVisibleTags)
  return (
    <>
      {/* 📌 **前 4 個標籤** */}
      <div className="my-2 d-flex flex-wrap align-items-center">
        {visibleTags.map((tag) => (
          <span
            key={tag.id}
            className="badge k-tag-bg me-1"
            style={{ cursor: 'pointer' }}
            onClick={() => onHashtagClick(tag.tags)}
          >
            {tag.tags}
          </span>
        ))}

        {/* 📌 **當標籤超過 4 個時，顯示 `...` 按鈕** */}
        {hiddenTags.length > 0 && (
          <span
            className="badge k-tag-bg me-1"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowModal(true)}
          >
            ...
          </span>
        )}
      </div>

      {/* 📌 **Bootstrap Modal - 顯示所有標籤** */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="sm"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>點擊查詢</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 📌 **標籤最多 4 個一排** */}
          <div className="d-flex flex-wrap">
            {hashtags.map((tag) => (
              <span
                key={tag.id}
                className="badge k-tag-bg m-1 d-flex align-items-center justify-content-center"
                style={{
                  cursor: 'pointer',
                  width: 'calc(25% - 8px)', // 讓每行最多 4 個，留點間距
                  textAlign: 'center',
                  display: 'inline-block',
                }}
                onClick={() => {
                  onHashtagClick(tag.tags)
                  setShowModal(false) // ✅ 點擊標籤後關閉 Modal
                }}
              >
                {tag.tags}
              </span>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}
