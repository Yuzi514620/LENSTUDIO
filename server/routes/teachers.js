import express from 'express'
import pool from '../db.js'
import jwt from 'jsonwebtoken'
import authenticate from '../middlewares.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'

// 取得所有老師資料
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        t.id AS teacher_id,
        t.name AS teacher_name,
        t.image AS teacher_image,
        t.bio AS teacher_bio,
        COALESCE(SUM(c.student_count), 0) AS total_students
      FROM teachers t
      LEFT JOIN courses c ON t.id = c.teacher_id
      GROUP BY t.id
      ORDER BY total_students DESC;
    `
    const [rows] = await pool.execute(sql)

    res.json(rows)
  } catch (error) {
    console.error('❌ 無法獲取講師列表:', error)
    res.status(500).json({ error: '無法獲取講師列表' })
  }
})

// 取得完整講師資料
router.get('/me', async (req, res) => {
  console.log('✅ /api/teachers/me 被請求...')

  try {
    if (!req.headers.authorization) {
      console.log('❌ 未提供 Authorization Header')
      return res.status(401).json({ error: '未提供驗證 token' })
    }

    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      console.log('❌ Token 格式錯誤')
      return res.status(401).json({ error: 'Token 格式錯誤' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    

    if (!decoded) {
      console.log('❌ Token 解析失敗')
      return res.status(403).json({ error: '權限不足' })
    }

    // ✅ 查詢 `teachers` 表，取得完整講師資料
    console.log(`📌 正在查詢 user_id = ${decoded.id} 的講師資料`)
    const sql = `
      SELECT t.id AS teacher_id, t.name, t.email, t.bio, t.website, 
             t.facebook, t.instagram, t.youtube, t.image
      FROM teachers t
      WHERE t.user_id = ?
      LIMIT 1
    `
    const [rows] = await pool.query(sql, [decoded.id])


    // 🔴 **如果找不到講師資料**
    if (rows.length === 0) {
      console.log(`❌ 找不到 user_id = ${decoded.id} 的講師資料`)
      return res.status(404).json({ error: '找不到講師資料' })
    }

    // ✅ 取得講師資料
    const teacher = rows[0]


    // 🔹 回傳完整的講師資訊給前端
    res.json({
      id: decoded.id, // 用戶 ID
      name: teacher.name,
      email: teacher.email,
      bio: teacher.bio,
      website: teacher.website,
      facebook: teacher.facebook,
      instagram: teacher.instagram,
      youtube: teacher.youtube,
      image: teacher.image || '/images/teachers/default-avatar.jpg', // 預設大頭貼
      teacher_id: teacher.teacher_id, // 講師 ID
    })
  } catch (error) {
    console.error('❌ 獲取講師資訊失敗:', error)
    res.status(500).json({ error: '無法獲取講師資訊' })
  }
})

// 編輯老師資料
router.put('/me', authenticate, async (req, res) => {
  console.log('✅ 收到更新請求 /api/teachers/me')

  const { name, email, bio, website, facebook, instagram, youtube } = req.body
  const userId = req.userId // 從 Token 取得 userId

  console.log('🔍 檢查 userId:', userId)
  if (!userId) {
    return res.status(401).json({ error: '未授權，請重新登入' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction() // 開始交易

    console.log('📌 更新 users 表')
    const updateUserSql = `UPDATE users SET name = ?, mail = ? WHERE id = ?`
    console.log('SQL:', updateUserSql, [name, email, userId])
    await connection.execute(updateUserSql, [name, email, userId])

    console.log('📌 更新 teachers 表')
    const updateTeacherSql = `
      UPDATE teachers 
      SET name = ?, email = ?, bio = ?, website = ?, facebook = ?, instagram = ?, youtube = ?
      WHERE user_id = ?
    `

    await connection.execute(updateTeacherSql, [
      name,
      email,
      bio,
      website,
      facebook,
      instagram,
      youtube,
      userId,
    ])

    await connection.commit() // 提交變更
    console.log('✅ 更新成功！')
    res.json({ message: '✅ 更新成功！' })
  } catch (error) {
    await connection.rollback() // 回滾交易（如果有錯誤）
    console.error('❌ 更新講師資料失敗:', error)
    res.status(500).json({ error: '無法更新講師資料', details: error.message })
  } finally {
    connection.release() // 釋放連線
  }
})

// ✅ 獲取特定講師的資訊 + 該老師的所有課程(包含評分)
router.get('/:id', async (req, res) => {
  const teacherId = parseInt(req.params.id, 10)
  if (isNaN(teacherId)) {
    return res.status(400).json({ error: 'Invalid teacher ID' })
  }

  try {
    // 取得講師基本資料
    const teacherSql = `
      SELECT t.*, 
        (SELECT COUNT(*) FROM courses WHERE teacher_id = t.id) AS courseCount,
        (SELECT COALESCE(SUM(student_count), 0) FROM courses WHERE teacher_id = t.id) AS studentCount
      FROM teachers t
      WHERE t.id = ?
    `

    // 取得該老師的所有課程，並計算平均評分
    const coursesSql = `
      SELECT 
        c.id, c.title, c.image_url, c.category, c.sale_price, 
        c.student_count, c.status,
        COALESCE(AVG(cm.rating), 0) AS rating  -- ✅ 計算該課程的平均評分
      FROM courses c
      LEFT JOIN comments cm ON c.id = cm.course_id  -- ✅ 連結 comments 表
      WHERE c.teacher_id = ? AND c.status = 'published'
      GROUP BY c.id, c.title, c.image_url, c.category, c.sale_price, c.student_count, c.status
    `

    // 執行 SQL 查詢
    const [teacherRows] = await pool.execute(teacherSql, [teacherId])
    const [courseRows] = await pool.execute(coursesSql, [teacherId])

    // 如果講師不存在
    if (teacherRows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' })
    }

    // 合併結果
    const teacherData = {
      ...teacherRows[0],
      courses: courseRows, // ✅ 加入該老師的所有課程
    }

    res.json(teacherData)
  } catch (error) {
    console.error('❌ 獲取講師資料失敗:', error)
    res.status(500).json({ error: '無法獲取講師資料' })
  }
})

// **老師登入**
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body
    const [teachers] = await pool.query(
      'SELECT * FROM teacher WHERE email = ?',
      [email]
    )

    if (teachers.length === 0) {
      return res.status(401).json({ error: '帳號或密碼錯誤' })
    }

    // 產生 JWT Token
    const token = jwt.sign({ id: teachers[0].id }, JWT_SECRET, {
      expiresIn: '7d',
    })

    res.json({ token, teacher: teachers[0] })
  } catch (error) {
    res.status(500).json({ error: '登入失敗' })
  }
})

// **取得當前老師的課程**
router.get('/me/courses', async (req, res) => {
  try {
    console.log('✅ 收到 /me/courses API 請求')

    // **1️⃣ 確保有 Token**
    if (!req.headers.authorization) {
      console.log('❌ 未提供驗證 token')
      return res.status(401).json({ error: '未提供驗證 token' })
    }

    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      console.log('❌ Token 格式錯誤')
      return res.status(401).json({ error: 'Token 格式錯誤' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  

    // **2️⃣ 檢查是否為老師**
    if (!decoded || decoded.level !== 1) {
      console.log('❌ 權限不足，非老師帳戶')
      return res.status(403).json({ error: '權限不足' })
    }

    // **3️⃣ 取得 `teacher_id`**
    const sqlTeacher = `SELECT id FROM teachers WHERE user_id = ?`
    const [teacherRows] = await pool.query(sqlTeacher, [decoded.id])

    if (teacherRows.length === 0) {
      console.log('❌ 找不到該老師 user_id:', decoded.id)
      return res.status(404).json({ error: '找不到對應的老師' })
    }

    const teacherId = teacherRows[0].id
    console.log(`✅ 找到老師 ID: ${teacherId}`)

    // **4️⃣ 查詢老師的課程**
    const sqlCourses = `
      SELECT 
        c.*,
        t.name AS teacher_name, 
        t.image AS teacher_image,
        u.level,  
        u.mail,
        IFNULL(AVG(cm.rating), 0) AS rating,
        COUNT(cm.id) AS review_count
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN comments cm ON c.id = cm.course_id
      WHERE c.teacher_id = ?
      GROUP BY c.id, t.id, u.level
    `

    const [courses] = await pool.query(sqlCourses, [teacherId])


    // **5️⃣ 如果沒有課程，回傳空陣列**
    if (courses.length === 0) {
      console.log('⚠️ 該老師沒有課程')
      return res.status(200).json([])
    }

    res.json(courses)
  } catch (error) {
    console.error('❌ 獲取課程失敗:', error)
    res.status(500).json({ error: '無法獲取課程' })
  }
})

export default router
