'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation' // ✅ 取得動態路由參數
import styles from './detail-page.module.scss'
import CourseInfo from './_components/course-info/page'
import FourInfo from './_components/four-info/page'
import DetailNav from './_components/detail-nav/page'
import CourseContent from './_components/course-content/page'
import TeacherInfo from './_components/teacher-info/page'
import CourseRating from './_components/course-rating/page'
import PriceFixed from './_components/price-fixed/page'
import RelatedCourses from './_components/related-course/page'

export default function CourseDetailPage() {
  const { id } = useParams() // ✅ 取得 URL 中的課程 ID
  const [course, setCourse] = useState(null) // ✅ 儲存單一課程資料
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0); //  每次進入時滾動到最上方
  }, []);

  useEffect(() => {
    if (!id) return // ✅ 避免 ID 未載入時發送錯誤請求

    const fetchCourse = async () => {
      try {
        const API_URL = `http://localhost:8000/api/courses/${id}`
        console.log('發送 API 請求:', API_URL)

        const res = await fetch(API_URL)
        console.log('API 回應狀態:', res.status)

        if (!res.ok)
          throw new Error(`錯誤: ${res.statusText} (狀態碼: ${res.status})`)

        const data = await res.json()
        console.log('API 回傳資料:', data)

        setCourse(data) // 如果 API 回傳的是陣列，請改成 data[0]
      } catch (err) {
        console.error('載入課程失敗:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    console.log('取得的課程資料:', course)

    fetchCourse()
  }, [id]) // 監聽 ID 變化

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        document.body.style.paddingBottom = '80px'; // 1200px 以下才加 padding
      } else {
        document.body.style.paddingBottom = '0px'; //1200px 以上移除
      }
    };

    handleResize(); // 先執行一次，確保進入頁面時生效
    window.addEventListener('resize', handleResize); // 監聽視窗大小變化

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.paddingBottom = '0px'; // 確保離開頁面時清除
    };
  }, []);

  return (
    <>
      {loading && <></>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && course && (
        <>
          <CourseInfo course={course} />
          <FourInfo course={course} />
          <section className={styles['course-detail-container']}>
            <div className="container">
              <DetailNav />
              <div className={styles['course-detail-title']}  id="course-content">
                <div className={styles['title-block']}></div>
                <h2>課程內容</h2>
                <div className={`${styles['line']} d-block d-sm-none`}></div>
              </div>
              <div className="row">
                <div className="col-12 col-xl-8">
                  <CourseContent content={course.content} />
                  <TeacherInfo teacherId={course.teacher_id} course={course} />
                  <CourseRating />
                </div>
                <div className="col-12 col-md-4 d-block">
                {/* <div className="col-md-4 d-none d-xl-block"> */}
                  <PriceFixed course={course}/>
                </div>
              </div>
              <RelatedCourses course={course} />
            </div>
          </section>
        </>
      )}
    </>
  )
}
