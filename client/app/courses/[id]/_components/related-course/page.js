'use client'

import { useEffect, useState } from 'react'
import '@/styles/globals.css'
import styles from './related-course.module.scss'
import StarRating from '@/app/courses/_components/star-rating/page'
import FavoriteButton from '@/app/courses/_components/favorite-button/page'

export default function RelatedCourses({ course }) {
  const [relatedCourses, setRelatedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!course || !course.category || !course.id) return 

    const fetchRelatedCourses = async () => {
      try {
        const API_URL = `http://localhost:8000/api/courses/related/${course.category}`
        console.log('🚀 發送 API 請求:', API_URL)

        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`❌ API 錯誤: ${res.statusText}`)

        let data = await res.json()
        console.log('✅ API 回傳相關課程:', data)

    
        data = data.filter(relatedCourse => relatedCourse.id !== course.id)

        setRelatedCourses(data.slice(0, 4))
      } catch (error) {
        console.error('❌ 獲取相關課程失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedCourses()
  }, [course.category, course.id]) 

  if (loading) return <p></p>
  if (relatedCourses.length === 0) return <p>沒有找到相關課程</p>

  return (
    <div className={styles['container']} id="related-courses">
      <hr />
      <div className={styles['section-detail-title']}>
        <div className={styles['title-block']}></div>
        <h2>相關課程推薦</h2>
      </div>
      <div className="row mt-4">
        {relatedCourses.map((relatedCourse) => (
          <div
            key={relatedCourse.id}
            className="col-lg-3 col-md-6 col-12"
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <a
              href={`/courses/${relatedCourse.id}`}
              className={styles['course-card-link']}
            >
              <div className={`${styles['course-card']} mb-4 mb-md-5`}>
                <div className='e-card-img'>
                  <img
                    src={relatedCourse.image_url}
                    alt={relatedCourse.title}
                    className="img-fluid"
                  />
                  <div className='e-img-overlay'></div>
                  <FavoriteButton
                    isFavorite={isFavorite}
                    toggleFavorite={() => setIsFavorite(!isFavorite)}
                  />
                </div>
                <h3 className={styles['course-title']}>
                  {relatedCourse.title}
                </h3>
                <p className={styles['teacher-name']}>
                  {relatedCourse.teacher_name}
                </p>
                <div className={styles['rating-student']}>
                  <div className={styles['rating']}>
                    <p>{parseFloat(relatedCourse.rating).toFixed(1)}</p>
                    <StarRating rating={relatedCourse.rating} />
                  </div>
                  <div className={styles['student-count']}>
                    <img src="/images/icon/student-count.svg" alt="學生數量" />
                    <div className={styles['student-num']}>
                      {relatedCourse.student_count.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={styles['course-price']}>
                  <p>NT$ {relatedCourse.sale_price.toLocaleString()}</p>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
