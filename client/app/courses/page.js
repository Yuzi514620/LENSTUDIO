'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './course-list.module.scss'
import CoursesBanner from './_components/courses-banner/page'
import CoursesCategory from './_components/courses-category/page'
import CoursesBreadcumb from './_components/courses-breadcumb/page'
import CoursesFilter from './_components/courses-filter/page'
import PopularTeacher from './_components/popular-teacher/page'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('所有課程')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const searchParams = useSearchParams()
  const category = searchParams.get('category') || '所有課程'

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const API_URL = 'http://localhost:8000/api/courses'
        console.log('發送 API 請求:', API_URL)

        const res = await fetch(API_URL)
        console.log('API 回應狀態:', res.status)

        if (!res.ok)
          throw new Error(`錯誤: ${res.statusText} (狀態碼: ${res.status})`)

        const data = await res.json()
        console.log('API 回傳資料:', data)
        setCourses(data)
        setFilteredCourses(data)
      } catch (err) {
        console.error('載入課程失敗:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    if (!courses || courses.length === 0) return

    if (selectedCategory !== category) {
      setSelectedCategory(category)
    }

    if (category === '所有課程') {
      setFilteredCourses(courses)
    } else {
      setFilteredCourses(courses.filter((course) => course.category === category))
    }
  }, [category, courses])

  return (
    <>
      <CoursesBanner courses={courses} />
      <CoursesCategory selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      <CoursesBreadcumb selectedCategory={selectedCategory} />

      <div className={styles['course-list-container']}>
        <CoursesFilter courses={filteredCourses} setFilteredCourses={setFilteredCourses} />
      </div>

      {loading && <></>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && <PopularTeacher courses={filteredCourses} />}
    </>
  )
}
