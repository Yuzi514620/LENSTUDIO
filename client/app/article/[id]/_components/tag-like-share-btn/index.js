'use client'

import React, { useState, useEffect } from 'react'
import styles from './index.module.scss'
import Link from 'next/link'
import { FaRegHeart, FaHeart } from 'react-icons/fa6'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// 假設 currentUserId 可從某處獲取，這裡暫時硬編碼為 1
const currentUserId = 1

export default function TagLikeShareBtnIndex({ articleId }) {
  const [tags, setTags] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0) // 初始值從後端取得
  const [isHovered, setIsHovered] = useState(false) // 追蹤 Like 按鈕 hover
  const [isClicked, setIsClicked] = useState(false) // 追蹤 Like 按鈕 active
  // 新增分享按鈕 hover 與 active 狀態
  const [shareHovered, setShareHovered] = useState(false)
  const [shareActive, setShareActive] = useState(false)
  // 新增 Share popup 狀態
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [copyHovered, setCopyHovered] = useState(false)
  const [copyActive, setCopyActive] = useState(false)

  // 新增收藏功能相關狀態
  const [token, setToken] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteHovered, setFavoriteHovered] = useState(false)

  // 在組件載入時獲取 token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('loginWithToken')
      setToken(storedToken)
    }
  }, [])

  // 獲取文章收藏狀態
  useEffect(() => {
    if (!token || !articleId) return;

    const checkFavoriteStatus = async () => {
      try {
        // 修改：增加錯誤處理和降級策略
        try {
          const res = await fetch(
            `http://localhost:8000/api/articles/collection/${articleId}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include', // 確保包含身份驗證憑證
            }
          )

          if (res.ok) {
            const data = await res.json()
            setIsFavorite(!!data.isFavorite)
          } else {
            console.warn('收藏狀態獲取失敗，使用預設值')
            // 失敗時使用預設值，不影響使用者體驗
            setIsFavorite(false)
          }
        } catch (error) {
          console.error('收藏狀態獲取錯誤:', error)
          // 出錯時使用預設值，不影響使用者體驗
          setIsFavorite(false)
        }
      } catch (error) {
        console.error('無法確認收藏狀態:', error)
        // 不拋出錯誤，只記錄日誌
      }
    }

    checkFavoriteStatus()
  }, [articleId, token])

  useEffect(() => {
    // 取得標籤
    const fetchTags = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/tags`)
        if (!response.ok) {
          console.log('response', response)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTags(data)
      } catch (error) {
        console.error('Could not fetch tags:', error)
      }
    }

    // 取得文章的初始 like_count
    const fetchArticleLikeCount = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setLikeCount(Number(data.like_count) || 0)
      } catch (error) {
        console.error('Could not fetch article like count:', error)
      }
    }

    fetchTags()
    fetchArticleLikeCount()
  }, [articleId])

  // 當使用者按讚，僅能按一次
  const handleLike = async () => {
    if (isLiked) return // 已按讚，不重複
    setIsLiked(true)
    const newLikeCount = Number(likeCount) + 1
    setLikeCount(newLikeCount)
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 300)

    try {
      const response = await fetch(`/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likeableId: articleId,
          likeableType: 'article',
          newLikeCount,
          userId: currentUserId,
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error updating like count:', error)
    }
  }

  // 處理收藏點擊
  const handleFavoriteClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      toast.warn('請先登入，即可收藏文章！', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      let url = 'http://localhost:8000/api/articles/collection'

      if (method === 'DELETE') {
        url = `http://localhost:8000/api/articles/collection/${articleId}`
      }

      // 先更新UI狀態，提供即時反饋
      setIsFavorite(!isFavorite)

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 確保包含身份驗證憑證
        body:
          method === 'POST' ? JSON.stringify({ article_id: articleId }) : null,
      })

      if (!res.ok) {
        // 如果API調用失敗，恢復原始狀態
        setIsFavorite(isFavorite)
        const errorText = await res.text()
        throw new Error(errorText || '收藏操作失敗')
      }

      toast.success(isFavorite ? '已取消收藏！' : '成功加入收藏！', {
        position: 'top-right',
        autoClose: 2000,
      })
    } catch (error) {
      console.error('收藏錯誤:', error)
      // 已經在上面恢復了狀態，只需顯示錯誤訊息
      toast.error('操作失敗：' + (error.message || '發生錯誤，請稍後再試'), {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  // 分享按鈕點擊事件：彈出一個置中 overlay 並提供複製網址功能
  const handleShare = () => {
    setShowSharePopup(true)
  }

  return (
    <>
      <div
        className={`d-flex justify-content-between align-items-center ${styles['y-tag-like-comment-share-fav-area']}`}
      >
        <div className={`${styles['y-tag-area']}`}>
          {tags.map((tag, index) => (
            <Link
              key={index}
              href={`/article?tag=&search=%23${tag.tag_name.replace('#', '')}`}
              className="text-decoration-none"
            >
              <button className="py-sm-1 px-sm-3 ms-sm-1 fw-medium rounded-pill">
                {tag.tag_name}
              </button>
            </Link>
          ))}
        </div>
        <div className={`${styles['y-like-comment-share-fav']} d-flex`}>
          {/* Like 按鈕 */}
          <button
            className="py-sm-2 px-sm-2 d-flex align-items-center fw-medium rounded-pill"
            onClick={handleLike}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={
                isLiked
                  ? '/images/article/thumb-up-red.svg'
                  : isHovered
                    ? '/images/article/thumb-up-gray.svg'
                    : '/images/article/thumb-up-black.svg'
              }
              className={`me-1 ${styles['y-like-comment-share-fav-pc']}`}
              style={{
                transform: isClicked ? 'scale(1.5)' : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
              alt="Like"
            />
            {/* 電腦版數字 */}
            <span
              className={`${styles['y-count-num-pc']}`}
            >{`${likeCount}`}</span>
            <img
              src={
                isLiked
                  ? '/images/article/thumb-up-red.svg'
                  : isHovered
                    ? '/images/article/thumb-up-gray.svg'
                    : '/images/article/thumb-up-black.svg'
              }
              className={`me-1 ${styles['y-like-comment-share-fav-mb']}`}
              style={{
                transform: isClicked ? 'scale(1.5)' : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
              alt="Like"
            />
            <span className={`${styles['y-count-num']}`}>{`${likeCount}`}</span>
          </button>

          {/* Share 按鈕 */}
          <button
            className="py-sm-2 px-sm-2 d-flex align-items-center fw-medium rounded-pill"
            onClick={handleShare}
            onMouseEnter={() => setShareHovered(true)}
            onMouseLeave={() => {
              setShareHovered(false)
              setShareActive(false)
            }}
            onMouseDown={() => setShareActive(true)}
            onMouseUp={() => setShareActive(false)}
          >
            <img
              src={
                shareActive
                  ? '/images/article/share-active.svg'
                  : shareHovered
                    ? '/images/article/share-hover.svg'
                    : '/images/article/share-origin.svg'
              }
              className={`me-1 ${styles['y-like-comment-share-fav-pc']}`}
              alt="Share"
            />
            <img
              src={
                shareActive
                  ? '/images/article/share-active.svg'
                  : shareHovered
                    ? '/images/article/share-hover.svg'
                    : '/images/article/share-origin.svg'
              }
              className={`me-1 ${styles['y-like-comment-share-fav-mb']}`}
              alt="Share"
            />
          </button>

          {/* 修改後的收藏按鈕，使用 FavoriteButtonG 的樣式 */}
          <button
            onClick={handleFavoriteClick}
            className={`${styles['favorite-btn']} ${styles['article-favorite-btn']}`}
            onMouseEnter={() => setFavoriteHovered(true)}
            onMouseLeave={() => setFavoriteHovered(false)}
          >
            {isFavorite ? (
              <FaHeart color="#FF6464" size={18} className={styles['favorite-icon']} />
            ) : (
              <FaRegHeart
                size={18}
                color={favoriteHovered ? "#838383" : "#1E3C54"}
                className={styles['favorite-icon']}
              />
            )}
          </button>
        </div>
      </div>

      {showSharePopup && (
        <div
          onClick={() => setShowSharePopup(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          {/* 點擊白色區域不會關閉 popup */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '70px',
              borderRadius: '15px',
              textAlign: 'center',
              width: '600px', // 框變長一些
            }}
          >
            <h5>複製以下網址分享</h5>
            <div
              style={{
                position: 'relative',
                width: '100%',
                margin: '20px auto',
              }}
            >
              <input
                type="text"
                readOnly
                value={window.location.href}
                style={{
                  width: '100%',
                  padding: '5px 50px 5px 10px', // 預留右側空間給複製按鈕
                  borderRadius: '10px',
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setCopyActive(true)
                  setTimeout(() => setCopyActive(false), 5000)
                }}
                onMouseEnter={() => setCopyHovered(true)}
                onMouseLeave={() => setCopyHovered(false)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                {(copyHovered || copyActive) && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '120%', // 顯示在按鈕正上方
                      right: 0,
                      background: '#7E7267',
                      color: 'white',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copyActive ? '已複製' : '複製'}
                  </div>
                )}
                <img
                  src={
                    copyActive
                      ? '/images/article/copy-active.svg'
                      : copyHovered
                        ? '/images/article/copy-hover.svg'
                        : '/images/article/copy-origin.svg'
                  }
                  alt="複製"
                  style={{ height: '70%' }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
