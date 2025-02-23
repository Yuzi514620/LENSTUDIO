// rent-detail

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import RentPicture from '../rent-picture/page'
import RentTabs from '../rent-tabs/page'
import RentHashtag from '../rent-hashtag/page'
import RentReviews from '../rent-reviews/page'
import RentRecommend from '../rent-recommend/page'

export default function RentDetail() {
  const { id } = useParams()
  const [rental, setRental] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    fetch(`http://localhost:8000/api/rental/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setRental(data.data)
          setRecommendations(data.recommendations) // ✅ 取得推薦商品
        } else {
          console.error('商品資料加載失敗:', data.error)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('無法載入商品資料:', error)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p className="text-center mt-5">🚀 資料載入中...</p>
  if (!rental)
    return <p className="text-center text-danger mt-5">❌ 找不到商品</p>

  return (
    <div className="container">
      <main>
        <div className="row">
          <div className="col-lg-7">
            <RentPicture images={rental.images} />
          </div>

          <div className="col-lg-5">
            <h2>
              {rental.brand || '無資料'} {rental.name || '無資料'}
            </h2>
            <p className="k-main-text h4 ms-2 mt-2">
              NT$ {rental.fee ? rental.fee.toLocaleString() : '無資料'}/ 天
            </p>
            <RentTabs rental={rental} />
            <RentHashtag hashtags={rental.hashtags} />
            <RentReviews rentalId={rental.id} />
          </div>
        </div>
      </main>

      {/* ✅ 直接將推薦商品傳遞到 RentRecommend */}
      <div className="col-lg-12 col-xl-10 mx-auto my-4">
        <RentRecommend recommendations={recommendations} />
      </div>
    </div>
  )
}
