import pool from '../db.js'
import express from 'express'
import authenticate from '../middlewares.js'

const router = express.Router()

router.get("/collection", authenticate, async (req, res) => {
  console.log("✅ 收到 /api/courses/collection 請求");
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "未授權，請先登入" });
    }

    const userId = req.userId;

    const [favorites] = await pool.query(
      `SELECT 
        c.id, 
        c.title, 
        c.image_url, 
        t.name AS teacher_name, 
        c.sale_price, 
        COALESCE(AVG(com.rating), 0) AS rating
      FROM collection AS col
      JOIN courses AS c ON col.course_id = c.id
      JOIN teachers AS t ON c.teacher_id = t.id
      LEFT JOIN comments AS com ON c.id = com.course_id
      WHERE col.user_id = ?
      GROUP BY c.id, c.title, c.image_url, t.name, c.sale_price;`,
      [userId]
    );

    console.log("🔍 查詢結果:", favorites);

    if (!favorites || favorites.length === 0) {
      return res.json({ favorites: [] }); // ✅ 修改：回傳空陣列，而不是 `404`
    }

    res.json({ favorites });
  } catch (error) {
    console.error("❌ 取得所有收藏課程失敗:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});


// ✅ 取得所有分類（從 courses 表中取得不同的 `category`）
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM courses'
    )

    // console.log('📢 查詢到的分類:', categories)

    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: '找不到分類' })
    }

    res.json(categories.map((cat) => ({ name: cat.category })))
  } catch (error) {
    console.error('❌ 無法取得分類:', error.message)
    res.json({ error: '伺服器錯誤' })
  }
})

// ✅ 取得所有課程（支援搜尋 & 排序 & 分類）
router.get('/', async (req, res) => {
  try {
    // console.log('🌍 API 收到請求：', req.query)

    let { search, sort, category } = req.query
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
    `

    let filters = []
    let params = []

    if (search) {
      filters.push(`(c.title LIKE ? OR t.name LIKE ?)`)
      params.push(`%${search}%`, `%${search}%`)
    }

    if (category) {
      filters.push(`c.category = ?`)
      params.push(category)
    }

    if (filters.length) {
      query += ` WHERE ` + filters.join(' AND ')
    }

    query += ` GROUP BY c.id, t.id`

    if (sort) {
      if (sort === 'popular') query += ` ORDER BY c.student_count DESC`
      if (sort === 'new') query += ` ORDER BY c.created_at DESC`
      if (sort === 'low-price') query += ` ORDER BY c.sale_price ASC`
      if (sort === 'high-price') query += ` ORDER BY c.sale_price DESC`
    }

    const result = await pool.query(query, params)
    const courses = result[0]

    res.json(courses)
  } catch (error) {
    console.error('❌ 取得課程失敗:', error.stack)
    res.json({ error: '無法取得課程資料', details: error.message })
  }
})

// ✅ 取得單一課程
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      SELECT 
          c.*,  
          t.name AS teacher_name, 
          t.image AS teacher_image,
          IFNULL(AVG(cm.rating), 0) AS rating, 
          COUNT(cm.id) AS comment_count
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN comments cm ON c.id = cm.course_id
      WHERE c.id = ?
      GROUP BY c.id, t.id;
    `
    const [rows] = await pool.execute(sql, [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到該課程' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('❌ 無法獲取課程:', error)
    res.json({ error: '無法獲取課程' })
  }
})

// ✅ 取得特定課程的所有評論
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT 
        cm.* ,
        u.name AS user_name, 
        u.head AS user_head 
      FROM comments cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.course_id = ?  
      ORDER BY cm.created_at DESC; 
    `;

    const [comments] = await pool.execute(sql, [id]);

    res.json(comments);
  } catch (error) {
    console.error('❌ 無法獲取課程評論:', error);
    res.status(200).json({ error: '無法獲取課程評論' });
  }
});


// ✅ 取得同分類課程
router.get('/related/:category', async (req, res) => {
  const category = req.params.category

  try {
    const sql = `
      SELECT c.id, c.title, c.image_url, c.sale_price, c.student_count, 
       COALESCE(AVG(cm.rating), 0) AS rating, 
       t.name AS teacher_name
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN comments cm ON c.id = cm.course_id
      WHERE c.category = ?  
      GROUP BY c.id, t.name
      ORDER BY RAND()
      LIMIT 5;
    `
    // LIMIT 5 確保過濾掉當前課程後，仍然有 4 筆可用

    const [rows] = await pool.execute(sql, [category])

    res.json(rows)
  } catch (error) {
    console.error('❌ 無法獲取相關課程:', error)
    res.json({ error: '無法獲取相關課程' })
  }
})

// 更新課程
router.put('/:id', authenticate, async (req, res) => {
  const courseId = req.params.id
  const userId = req.userId // 從 `authenticate` middleware 取得

  try {
    // **檢查課程是否存在**
    const [existingCourse] = await pool.query(
      'SELECT id FROM courses WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE user_id = ?)',
      [courseId, userId]
    )

    console.log('📌 查詢結果:', existingCourse)

    if (existingCourse.length === 0) {
      console.log('❌ 找不到課程或無權限:', { courseId, userId })
      return res.status(404).json({ error: '❌ 找不到該課程或權限不足' })
    }

    // **執行更新**
    const {
      title,
      description,
      status,
      original_price,
      sale_price,
      category,
      content,
      image_url,
    } = req.body

    const sql = `
      UPDATE courses 
      SET title = ?, description = ?, status = ?, original_price = ?, sale_price = ?, category = ?, content = ?, image_url = ?
      WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE user_id = ?)
    `

    await pool.query(sql, [
      title,
      description,
      status,
      original_price,
      sale_price,
      category,
      content,
      image_url,
      courseId,
      userId,
    ])

    res.json({ message: '✅ 課程更新成功！' })
  } catch (error) {
    console.error('❌ 更新課程失敗:', error)
    res.json({ error: '無法更新課程' })
  }
})

// 新增課程資訊
router.post('/', authenticate, async (req, res) => {
  const {
    title,
    description,
    category,
    original_price,
    sale_price,
    image_url,
    content,
    status,
  } = req.body
  const userId = req.userId // 從 `authenticate` middleware 獲取 userId

  try {
    // 確認使用者是老師
    const [teacherRows] = await pool.query(
      'SELECT id FROM teachers WHERE user_id = ?',
      [userId]
    )

    if (teacherRows.length === 0) {
      return res.status(403).json({ error: '權限不足，非講師帳號' })
    }

    const teacherId = teacherRows[0].id

    // 插入新課程
    const sql = `
      INSERT INTO courses (title, description, category, original_price, sale_price, image_url, content, status, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const [result] = await pool.query(sql, [
      title,
      description,
      category,
      original_price,
      sale_price,
      image_url,
      content,
      status,
      teacherId,
    ])

    res.json({ message: '✅ 課程新增成功！', courseId: result.insertId })
  } catch (error) {
    console.error('❌ 新增課程失敗:', error)
    res.json({ error: '無法新增課程' })
  }
})




router.get('/collection/:courseId', authenticate, async (req, res) => {
  try {
    // console.log("🛠 API 端點收到 req.userId:", req.userId);

    if (!req.userId) {
      console.error("❌ req.userId 未定義");
      return res.status(401).json({ message: "未授權，請先登入 (req.userId 無效)" });
    }

    const userId = req.userId; // ✅ 取得 `user_id`
    const { courseId } = req.params; // ✅ 取得 `course_id`

    // console.log(` 取得用戶 ${userId} 的收藏狀態，課程 ID: ${courseId}`);

    // 查詢該用戶是否收藏了該課程
    const [result] = await pool.query(
      'SELECT id FROM collection WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    res.json({ isFavorite: result.length > 0 }); // ✅ 回傳布林值
  } catch (error) {
    console.error('❌ 取得課程收藏狀態失敗:', error);
    res.json({ message: '伺服器錯誤' });
  }
});


// 新增收藏
router.post('/collection', authenticate, async (req, res) => {
  try {
    console.log("🔍 接收的 `req.body`:", req.body);
    console.log("🔍 req.user:", req.user);

    if (!req.user || !req.user.id) {
      console.error("❌ req.user.id 未定義");
      return res.status(401).json({ message: "未授權，請先登入 (req.user.id 無效)" });
    }

    const userId = req.user.id;
    const { course_id } = req.body;

    // ✅ 檢查 `course_id` 是否為 `undefined` 或 `null`
    if (!course_id) {
      console.error("❌ course_id 未提供或為無效值:", course_id);
      return res.status(400).json({ message: "請提供有效的 course_id" });
    }

    console.log(`✅ 新增收藏 - 用戶 ID: ${userId}, 課程 ID: ${course_id}`);

    const [result] = await pool.query(
      'INSERT INTO collection (user_id, course_id) VALUES (?, ?)',
      [userId, course_id]
    );

    res.json({ message: "收藏成功", insertId: result.insertId });
  } catch (error) {
    console.error('❌ 收藏失敗:', error);
    res.status(200).json({ message: '伺服器錯誤' });
  }
});


// 移除收藏
router.delete('/collection/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;


    // 檢查 `courseId` 是否有效
    if (!courseId) {
      console.error("❌ courseId 無效:", courseId);
      return res.status(400).json({ message: "請提供有效的 courseId" });
    }

    // 確保該用戶有收藏該課程
    const [check] = await pool.query(
      "SELECT id FROM collection WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (check.length === 0) {
      console.warn("⚠️ 該用戶未收藏此課程，無法刪除");
      return res.status(404).json({ message: "找不到收藏紀錄" });
    }

    // 刪除收藏
    const [result] = await pool.query(
      "DELETE FROM collection WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    console.log("✅ 刪除成功，影響行數:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "找不到對應的收藏紀錄" });
    }

    res.json({ message: "已取消收藏" });
  } catch (error) {
    console.error("❌ 取消收藏失敗:", error);
    res.status(200).json({ message: "伺服器錯誤" });
  }
});


export default router
