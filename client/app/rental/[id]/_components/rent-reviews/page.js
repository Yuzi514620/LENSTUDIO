// rent-reviews

'use client'

import { useState } from 'react'

const reviews = [
  {
    name: '中壢大谷祥平',
    avatar: 'https://ui-avatars.com/api/?name=中壢大谷祥平&background=random',
    rating: 4,
    comment:
      '桃園棒球場第一排 拿出這台直接高調\n客服聲音一聽就正妹 加個IG直接給五星',
  },
  {
    name: '卡哇七寶媽',
    avatar: 'https://ui-avatars.com/api/?name=卡哇七寶媽&background=random',
    rating: 5,
    comment:
      '宅配到府真的超推!!!\n上次運動會帶這支很方便，不用額外組鏡頭，費用也很值在，下次會再來租借👍👍',
  },
  {
    name: '彤彤',
    avatar: 'https://ui-avatars.com/api/?name=彤彤&background=random',
    rating: 5,
    comment: '大學專題一起借，可以直接寄社辦 很方便!!!',
  },
  {
    name: '中壢大谷祥平',
    avatar: 'https://ui-avatars.com/api/?name=中壢大谷祥平&background=random',
    rating: 4,
    comment:
      '桃園棒球場第一排 拿出這台直接高調\n客服聲音一聽就正妹 加個IG直接給五星',
  },
  {
    name: '卡哇七寶媽',
    avatar: 'https://ui-avatars.com/api/?name=卡哇七寶媽&background=random',
    rating: 5,
    comment:
      '宅配到府真的超推!!!\n上次運動會帶這支很方便，不用額外組鏡頭，費用也很值在，下次會再來租借👍👍',
  },
  {
    name: '彤彤',
    avatar: 'https://ui-avatars.com/api/?name=彤彤&background=random',
    rating: 5,
    comment: '大學專題一起借，可以直接寄社辦 很方便!!!',
  },
  // Add more reviews as needed...
]

export default function RentReviews() {
  const [itemsPerPage, setItemsPerPage] = useState(3)

  // Handle "Show More" button click
  const showMore = () => {
    setItemsPerPage(itemsPerPage + 3) // Increase by 3 reviews each time
  }

  return (
    <div className="mt-4">
      <h5>評價</h5>
      <div className="d-flex align-items-center">
        <span className="k-warn-text">★★★★★</span>
        <span className="ms-2">4.0 (25 條評論)</span>
      </div>
      <div className="mt-3" id="reviewContainer">
        {reviews.slice(0, itemsPerPage).map((review, index) => (
          <div key={index} className="border p-3 mb-3 d-flex">
            <img
              src={review.avatar}
              alt={review.name}
              className="rounded-circle me-3"
              width="50"
              height="50"
            />
            <div>
              <strong>{review.name}</strong>
              <p>
                {review.comment.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <span className="k-warn-text">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </span>
            </div>
          </div>
        ))}
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-warning k-main-radius" onClick={showMore}>
            顯示更多
          </button>
        </div>
      </div>
    </div>
  )
}
