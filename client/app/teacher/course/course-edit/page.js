'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import '@/styles/ck-custom.css'
import styles from './course-edit.module.scss'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const editorConfig = {
  extraPlugins: [
    function (editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return {
          upload: async () => {
            const file = await loader.file
            const formData = new FormData()
            formData.append('upload', file)

            const response = await fetch(
              'http://localhost:8000/api/course-ct-upload',
              {
                method: 'POST',
                body: formData,
              }
            )

            const data = await response.json()
            console.log('✅ 圖片上傳成功，URL:', data.url)
            return { default: `http://localhost:8000${data.url}` }
          },
        }
      }
    },
  ],

  image: {
    toolbar: [
      'imageTextAlternative',
      '|',
      'imageStyle:full',
      'imageStyle:side',
    ],
    upload: {
      types: ['jpeg', 'png', 'gif', 'avif', 'webp'],
    },
  },

  imageUpload: {
    allowedTypes: ['jpeg', 'png', 'gif', 'avif', 'webp'],
  },

  toolbar: [
    'undo',
    'redo',
    'heading',
    '|',
    'bold',
    'italic',
    '|',
    'imageUpload',
    '|',
  ],

  heading: {
    options: [
      { model: 'paragraph', title: '內文', class: 'ck-heading_paragraph' },
      {
        model: 'heading3',
        view: 'h3',
        title: '標題',
        class: 'ck-heading_heading3',
      },
    ],
  },
}

export default function CourseEdit() {
  const searchParams = useSearchParams()
  const fileInputRef = useRef(null)
  const router = useRouter()
  const [previewImg, setPreviewImg] = useState(
    '/images/course-cover/default.jpg'
  ) // ✅ 預設圖片

  const courseId = searchParams.get('id')
  console.log('🔍 取得的 `courseId`:', courseId)

  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    original_price: '',
    sale_price: '',
    image_url: '',
    content: '',
    status: "draft",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!courseId) {
      setError('❌ 沒有提供課程 ID')
      return
    }

    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('loginWithToken')
        if (!token) {
          router.push('/login')
          return
        }

        const res = await fetch(`/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error(`API 錯誤: ${res.status}`)

        const data = await res.json()
        setCourse(data)
      } catch (error) {
        console.error('❌ 獲取課程失敗:', error)
        setError('無法獲取課程資料')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, router])

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      console.log('✅ 嘗試開啟檔案選擇視窗...')
      fileInputRef.current.click()
    } else {
      console.log('❌ fileInputRef.current 為 null，請檢查 `ref` 是否正確綁定')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("upload", file);
  
    try {
      const response = await fetch(
        "http://localhost:8000/api/course-cv-upload",
        {
          method: "POST",
          body: formData,
        }
      );
  
      // 🔹 確保 `Content-Type` 是 `application/json`
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("❌ API 沒回傳 JSON，可能是 404/500 錯誤");
      }
  
      // ✅ 解析 JSON
      const data = await response.json();
      if (!data.url) {
        throw new Error("❌ API 回傳無效的圖片 URL");
      }
  
      const imageUrl = `http://localhost:8000${data.url}`;
      console.log("✅ 圖片上傳成功，URL:", imageUrl);
  
      // ✅ 更新圖片預覽
      setPreviewImg(imageUrl);
      setCourse((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error("❌ 圖片上傳錯誤:", error);
      alert(error.message); // 🔴 顯示錯誤訊息
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCourse((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditorChange = (event, editor) => {
    const data = editor.getData()
    console.log('編輯器內容變更:', data) 
    setCourse((prev) => ({ ...prev, content: data }))
  }

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    if (!courseId) {
      console.error("❌ `courseId` 無效！");
      return;
    }
  
    const apiUrl = `http://localhost:8000/api/courses/${courseId}`;
    console.log("🚀 發送 `PUT` 請求到:", apiUrl);
  
    try {
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("loginWithToken")}`,
        },
        body: JSON.stringify({ ...course, status }),
      });
  
      console.log("🔍 API 回應狀態:", res.status);
  
      if (!res.ok) {
        const errorText = await res.text(); // 讀取錯誤訊息
        console.error("❌ API 錯誤:", errorText);
        throw new Error(`❌ API 錯誤: ${res.status}`);
      }
  
      console.log("✅ 課程更新成功！");
      router.push("/teacher");
    } catch (error) {
      console.error("❌ 更新課程失敗:", error);
    }
  };
  
  

  if (loading) return <p></p>
  if (error) return <p className="text-danger">{error}</p>

  return (
    <div className={styles['center-content']}>
      <div className={styles['nav-bar']}>
        <h1>編輯課程</h1>
      </div>

      {/* 📌 編輯表單 */}
      <form className={styles['course-edit']} onSubmit={handleSubmit}>
        <div className="row">
          {/* 🔹 課程圖片上傳 */}
          <div className="col-md-4">
            <div className={styles['form-group']}>
              <label>
                課程縮圖 <span className={styles['required']}>*</span>
              </label>
              <div
                className={styles['image-upload']}
                onClick={handleUploadClick}
              >
                <img
                  src={course.image_url || '/images/course-cover/default.jpg'}
                  alt="課程圖片"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* 🔹 課程名稱 */}
            <div className={styles['form-group']}>
              <label>
                課程名稱 <span className={styles['required']}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={course.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* 🔹 課程簡介 */}
            <div className={styles['form-group']}>
              <label>
                課程簡介 <span className={styles['required']}>*</span>
              </label>
              <textarea
                className={styles['course-info']}
                name="description"
                rows="4"
                value={course.description}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* 🔹 課程分類 */}
            <div className={styles['form-group']}>
              <label>
                請選擇分類 <span className={styles['required']}>*</span>
              </label>
              <select
                className={styles['category-select']}
                name="category"
                value={course.category}
                onChange={handleInputChange}
                required
              >
                <option value="影像創作">影像創作</option>
                <option value="商業攝影">商業攝影</option>
                <option value="後製剪輯">後製剪輯</option>
                <option value="攝影理論">攝影理論</option>
              </select>
            </div>

            {/* 🔹 價格設定 */}
            <div className={styles['price-container']}>
              <div className={styles['form-group']}>
                <label>
                  課程定價 <span className={styles['required']}>*</span>
                </label>
                <input
                  type="number"
                  name="original_price"
                  value={course.original_price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles['form-group']}>
                <label>
                  課程售價 <span className={styles['required']}>*</span>
                </label>
                <input
                  type="number"
                  name="sale_price"
                  value={course.sale_price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* 🔹 課程內容 */}
          <div className="col-md-8 course-content-container">
            <div className={styles['form-group']}>
              <label>
                課程內容 <span className={styles['required']}>*</span>
              </label>
              <div className={styles['editor-container']}>
                <CKEditor
                  editor={ClassicEditor}
                  data={course.content}
                  onChange={handleEditorChange}
                  config={editorConfig}
                />
              </div>
            </div>

            {/* 🔹 按鈕區 */}
            <div className={styles['form-actions']}>
              {/* 🔹 儲存為草稿 */}
              <button
                type="button"
                className={styles['save-btn']}
                onClick={(e) => handleSubmit(e, 'draft')}
              >
                儲存為草稿
              </button>

              {/* 🔹 上架課程 */}
              <button
                type="button"
                className={styles['publish-btn']}
                onClick={(e) => handleSubmit(e, 'published')}
              >
                上架課程
              </button>

              {/* 🔹 返回課程管理 */}
              <button
                type="button"
                className={styles['cancel-btn']}
                onClick={() => router.push('/teacher')}
              >
                返回課程列表
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
