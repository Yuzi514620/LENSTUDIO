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
    res.json({ error: '無法獲取講師列表' })
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

    console.log(`📌 正在查詢 user_id = ${decoded.id} 的使用者資料`)

    // **先查詢 `users` 表，取得 level**
    const userSql = `SELECT id, name, mail, level FROM users WHERE id = ? LIMIT 1`
    const [userRows] = await pool.query(userSql, [decoded.id])

    if (userRows.length === 0) {
      console.log(`❌ 找不到 user_id = ${decoded.id} 的使用者`)
      return res.status(404).json({ error: '找不到使用者' })
    }

    const user = userRows[0]

    // **如果是管理員，直接回傳，不查詢 teachers 表**
    if (user.level === 88) {
      console.log("🔹 管理員登入，不查詢 teachers 表")
      return res.json({
        id: user.id,
        name: user.name,
        email: user.mail,
        level: user.level,  // ✅ 讓前端可以判斷身份
        teacher_id: null,
        bio: null,
        website: null,
        facebook: null,
        instagram: null,
        youtube: null,
        image: '/images/teachers/default-avatar.jpg', // 預設圖像
      })
    }

    // **如果是老師，繼續查詢 `teachers` 表**
    console.log(`📌 正在查詢 user_id = ${decoded.id} 的講師資料`)
    const teacherSql = `
      SELECT id AS teacher_id, bio, website, facebook, instagram, youtube, image 
      FROM teachers WHERE user_id = ? LIMIT 1
    `
    const [teacherRows] = await pool.query(teacherSql, [decoded.id])

    if (teacherRows.length === 0) {
      console.log(`❌ user_id = ${decoded.id} 沒有對應的老師資料`)
      return res.status(404).json({ error: '找不到講師資料' })
    }

    const teacher = teacherRows[0]

    // ✅ 回傳老師完整資訊
    res.json({
      id: user.id, 
      name: user.name, 
      email: user.mail, 
      level: user.level, // ✅ 讓前端可以判斷身份
      teacher_id: teacher.teacher_id,
      bio: teacher.bio,
      website: teacher.website,
      facebook: teacher.facebook,
      instagram: teacher.instagram,
      youtube: teacher.youtube,
      image: teacher.image || '/images/teachers/default-avatar.jpg',
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
    res.json({ error: '無法更新講師資料', details: error.message })
  } finally {
    connection.release() // 釋放連線
  }
})

router.get('/admin/courses', async (req, res) => {
  try {
    console.log("✅ 收到 /api/teachers/admin/courses API 請求");

    if (!req.headers.authorization) {
      return res.status(401).json({ error: "未提供驗證 token" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // **查詢 `users.level`，確認是否為管理員**
    const sqlUser = `SELECT level FROM users WHERE id = ?`;
    const [userRows] = await pool.query(sqlUser, [decoded.id]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: "找不到使用者" });
    }

    if (userRows[0].level !== 88) {
      return res.status(403).json({ error: "權限不足，僅限管理員存取" });
    }

    console.log(`✅ 取得管理員等級: ${userRows[0].level}`);

    // **查詢所有課程**
    let query = `
      SELECT 
        c.*,  
        t.name AS teacher_name, 
        t.image AS teacher_image,
        IFNULL(AVG(cm.rating), 0) AS rating,
        COUNT(cm.id) AS review_count
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN comments cm ON c.id = cm.course_id
      GROUP BY c.id, t.id
    `;

    const [courses] = await pool.query(query);

    if (!Array.isArray(courses)) {
      return res.status(500).json({ error: "資料庫錯誤，無法取得課程" });
    }

    res.json(courses); // 🔹 **直接回傳陣列，與老師的 API 格式統一**
  } catch (error) {
    console.error("❌ 取得管理員課程失敗:", error);
    res.status(500).json({ error: "無法取得管理員課程" });
  }
});




// ✅ 獲取特定講師的資訊 + 該老師的所有課程(包含評分)
router.get('/:id', async (req, res) => {
  const teacherId = parseInt(req.params.id, 10);
  if (isNaN(teacherId)) {
    return res.json({ error: 'Invalid teacher ID' });
  }

  try {
    // ✅ 取得講師基本資料
    const teacherSql = `
      SELECT t.*, 
        (SELECT COUNT(*) FROM courses WHERE teacher_id = t.id) AS courseCount,
        (SELECT COALESCE(SUM(student_count), 0) FROM courses WHERE teacher_id = t.id) AS studentCount
      FROM teachers t
      WHERE t.id = ?
    `;

    // ✅ 取得該老師的所有課程，並計算平均評分
    const coursesSql = `
      SELECT 
        c.id, c.title, c.image_url, c.category, c.sale_price, 
        c.student_count, c.status,
        COALESCE(AVG(cm.rating), 0) AS rating  -- ✅ 計算該課程的平均評分
      FROM courses c
      LEFT JOIN comments cm ON c.id = cm.course_id  -- ✅ 連結 comments 表
      WHERE c.teacher_id = ? AND c.status = 'published'
      GROUP BY c.id, c.title, c.image_url, c.category, c.sale_price, c.student_count, c.status
    `;

    // ✅ 取得該老師的 `user_id`
    const userIdSql = `SELECT user_id FROM teachers WHERE id = ?`;

    // ✅ 取得該 `user_id` 的 `nickname`（作為 `author_name`） & 文章數
    const userInfoSql = `
      SELECT u.nickname AS author_name, 
        (SELECT COUNT(*) FROM article WHERE user_id = ?) AS articleCount
      FROM users u
      WHERE u.id = ?
    `;

    // 🔹 執行 SQL 查詢
    const [teacherRows] = await pool.execute(teacherSql, [teacherId]);
    const [courseRows] = await pool.execute(coursesSql, [teacherId]);
    const [userIdRows] = await pool.execute(userIdSql, [teacherId]);

    // 如果講師不存在
    if (teacherRows.length === 0) {
      return res.json({ error: 'Teacher not found' });
    }

    // 🔹 取得 user_id
    const userId = userIdRows[0]?.user_id;
    let authorInfo = { author_name: null, articleCount: 0 };

    if (userId) {
      const [authorRows] = await pool.execute(userInfoSql, [userId, userId]);
      if (authorRows.length > 0) {
        authorInfo = {
          author_name: authorRows[0].author_name,
          articleCount: authorRows[0].articleCount,
        };
      }
    }

    // 🔹 合併結果
    const teacherData = {
      ...teacherRows[0],
      courses: courseRows, // 加入該老師的所有課程
      user_id: userId, // ✅ 加入 user_id
      author_name: authorInfo.author_name, // ✅ 加入作者名稱
      articleCount: authorInfo.articleCount, // ✅ 加入文章數
    };

    res.json(teacherData);
  } catch (error) {
    console.error('❌ 獲取講師資料失敗:', error);
    res.json({ error: '無法獲取講師資料' });
  }
});


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
    res.json({ error: '登入失敗' })
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
    res.json({ error: '無法獲取課程' })
  }
})

//老師文章
router.get("/:teacherId/articles", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 1. 先找到該老師對應的 user_id
    const [teacherRows] = await pool.execute(
      "SELECT user_id FROM teachers WHERE id = ?",
      [teacherId]
    );

    if (teacherRows.length === 0) {
      return res.status(404).json({ error: "找不到該老師" });
    }

    const userId = teacherRows[0].user_id;

    // 2. 用 user_id 查詢該老師的 nickname
    const [userRows] = await pool.execute(
      "SELECT nickname FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "找不到該用戶" });
    }

    const authorName = userRows[0].nickname;

    // 3. 用 user_id 查詢該老師的文章數
    const [articleRows] = await pool.execute(
      "SELECT COUNT(*) AS articleCount FROM article WHERE user_id = ?",
      [userId]
    );

    res.json({
      user_id: userId,
      author_name: authorName,
      articleCount: articleRows[0].articleCount
    });

  } catch (error) {
    console.error("無法獲取文章數:", error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});



export default router
