'use client'

import { useState, useEffect } from 'react'
import styles from './teacher-info.module.scss'
import {
  FaChevronRight,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa'
import TeacherCoursesList from '../teacher-courses-list/page'
import Link from "next/link";


export default function TeacherInfo({ teacherId }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null); // ✅ 保留你的狀態
  const [teacherData, setTeacherData] = useState({
    user_id: null,
    author_name: "",
    articleCount: 0
  });

  useEffect(() => {
    if (!teacherId) return;

    console.log("開始請求 API:", `http://localhost:8000/api/teachers/${teacherId}`);

    fetch(`http://localhost:8000/api/teachers/${teacherId}`)
      .then((res) => {
        console.log("API 回應狀態:", res.status);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("API 回傳資料:", data);
        setTeacher(data);
        setTeacherData({
          user_id: data.user_id,
          author_name: data.author_name,
          articleCount: data.articleCount
        }); // ✅ 設定新的 teacherData
        setLoading(false);
      })
      .catch((error) => {
        console.error("獲取講師資料失敗:", error);
        setTeacher(null);
        setLoading(false);
      });
  }, [teacherId]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // 禁止背景滾動
    } else {
      document.body.style.overflow = "auto"; // 允許滾動
    }
    return () => {
      document.body.style.overflow = "auto"; // 彈出視窗關閉時恢復滾動
    };
  }, [isModalOpen]);

  console.log("📌 TeacherInfo 接收到的 teacherId:", teacherId);
  if (loading) return <p></p>;
  if (!teacher) return <p>無法找到講師資料</p>;

  return (
    <section className={styles['teacher-info-container']} id="teacher-info">
      <div className={styles['section-detail-title']} data-aos="fade-right">
        <div className={styles['title-block']}></div>
        <h2>關於講師</h2>
      </div>
      <div className={styles['teacher-info']} data-aos="fade-up">
        <div className={styles['teacher-info-img']}>
          <img
            src={teacher.image || '/images/teacher/default.avif'}
            alt={teacher.name}
          />
        </div>

        <div className={styles['teacher-info-text']}>
          <h3>{teacher.name}</h3>
          <ul className={styles['teacher-data']}>
            <li className={styles['data-item']}>
              <img src="/images/icon/course-icon.svg" alt="" />
              <p>
                {teacher.courseCount?.toLocaleString('en-US') || '0'} 堂課程
              </p>
            </li>
            <li className={styles['data-item']}>
              <Link href={`/article?user_id=${teacher.user_id}&author_name=${encodeURIComponent(teacher.author_name)}`} className={styles['link-wrapper']}>
                <img src="/images/icon/article-icon.svg" alt="" />
                <p>{teacher.articleCount?.toLocaleString() || "0"} 篇文章</p>
              </Link>
            </li>
            <li className={styles['data-item']}>
              <img src="/images/icon/student-icon.svg" alt="" />
              <p>
                {Number(teacher.studentCount)?.toLocaleString('en-US') || '0'}{' '}
                位學生
              </p>
            </li>
          </ul>
          <div className={styles['line']}></div>
          <p>{teacher.bio}</p>
          <div className={styles['go-page-link']}>
            <button
              onClick={() => {
                setSelectedTeacher(teacher) // 設定選擇的講師
                setIsModalOpen(true)
              }}
              className={styles['open-modal-btn']}
            >
              前往講師頁面
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* 彈出視窗  */}
      {isModalOpen && selectedTeacher && (
        <div
          className={styles['modal-overlay']}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles['modal-content']}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles['close-btn']}
              onClick={() => setIsModalOpen(false)}
            >
              ✖
            </button>

            <div className={styles['modal-body']}>
              {/* 左側：講師頭像 + 社群連結 */}
              <div className={styles['modal-left-container']}>
                <div className={styles['modal-left']}>
                  <div className={styles['modal-left-img']}>
                    <img
                      src={
                        selectedTeacher.image || '/images/teacher/default.avif'
                      }
                      alt={selectedTeacher.name}
                      className={styles['modal-img']}
                    />
                  </div>
                  <h2 className={styles['teacher-name']}>
                    {selectedTeacher.name}
                  </h2>

                  <div className={styles['social-links']}>
                    {selectedTeacher.website && (
                      <a
                        href={selectedTeacher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGlobe />
                      </a>
                    )}
                    {selectedTeacher.facebook && (
                      <a
                        href={selectedTeacher.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFacebook />
                      </a>
                    )}
                    {selectedTeacher.instagram && (
                      <a
                        href={selectedTeacher.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaInstagram />
                      </a>
                    )}
                    {selectedTeacher.youtube && (
                      <a
                        href={selectedTeacher.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaYoutube />
                      </a>
                    )}
                  </div>
                  <hr />
                </div>
                <ul className={styles['modal-teacher-data']}>
                  <li className={styles['data-item']}>
                    <img src="/images/icon/course-icon-w.svg" alt="" />
                    <p>
                      {selectedTeacher.courseCount?.toLocaleString('en-US') ||
                        '0'}{' '}
                      堂課程
                    </p>
                  </li>
                  <li className={styles['data-item']}>
                    <Link href={`/article?user_id=${teacher.user_id}&author_name=${encodeURIComponent(teacher.author_name)}`} className={styles['link-wrapper']}>
                      <img src="/images/icon/article-icon-w.svg" alt="" />
                      <p>{teacher.articleCount?.toLocaleString() || "0"} 篇文章</p>
                    </Link>
                  </li>
                  <li className={styles['data-item']}>
                    <img src="/images/icon/student-icon-w.svg" alt="" />
                    <p>
                      {Number(selectedTeacher.studentCount)?.toLocaleString(
                        'en-US'
                      ) || '0'}{' '}
                      位學生
                    </p>
                  </li>
                </ul>
              </div>

              {/* 右側：簡介 + 課程 */}
              <div className={styles['modal-right']}>
                <p>{selectedTeacher.bio}</p>
                <hr className={styles['hr-line']} />
                <TeacherCoursesList courses={selectedTeacher.courses || []} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
