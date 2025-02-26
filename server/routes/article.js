import { Router } from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import checkToken from '../middlewares.js'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'admin',
  password: '12345',
  database: 'lenstudio',
})

//cors設定
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
}

const router = Router()
router.use(cors(corsOptions))

// 取得所有文章（僅撈出尚未刪除的文章）
router.get('/', async (req, res) => {
  const { year, month, category, search, tag, user_id } = req.query;

  let query = `
    SELECT
      a.*,
      c.name AS category_name,
      GROUP_CONCAT(t.tag_name SEPARATOR ',') AS tags,
      u.nickname,
      u.name AS author_name,
      CASE
        WHEN t.tag_name = ? THEN 1
        WHEN a.title LIKE ? THEN 2
        WHEN a.content LIKE ? THEN 3
        ELSE 4
      END AS relevance
    FROM article a
    LEFT JOIN article_category c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tag t ON at.tag_id = t.id
    JOIN users u ON a.user_id = u.id
  `;

  const conditions = ['a.is_deleted = 0'];
  const queryParams = [
    tag || '',
    `%${search || ''}%`,
    `%${search || ''}%`,
  ];

  if (year) {
    conditions.push('YEAR(a.created_at) = ?');
    queryParams.push(year);
  }
  if (month) {
    conditions.push('MONTH(a.created_at) = ?');
    queryParams.push(month);
  }
  if (category) {
    conditions.push('a.category_id = ?');
    queryParams.push(category);
  }
  if (user_id) {
    conditions.push('a.user_id = ?');
    queryParams.push(user_id); // 確保 user_id 被正確添加到查詢參數
  }

  if (search && !tag) {
    conditions.push('(t.tag_name LIKE ? OR a.title LIKE ? OR a.content LIKE ?)');
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  if (tag) {
    query += ' GROUP BY a.id HAVING FIND_IN_SET(?, tags)';
    queryParams.push(tag);
  } else {
    query += ' GROUP BY a.id';
  }

  query += ' ORDER BY relevance ASC, a.created_at DESC';

  try {
    const [rows] = await pool.query(query, queryParams);
    res.status(200).json({ status: 'success', data: rows });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || '取得文章失敗',
    });
  }
})

// 修改 /latest 路由
router.get('/latest', cors(corsOptions), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, c.name as category_name
      FROM article a
      LEFT JOIN article_category c ON a.category_id = c.id
      WHERE a.is_deleted = 0
      ORDER BY a.created_at DESC
      LIMIT 4
    `)
    res.json({ data: rows })
  } catch (error) {
    console.error('Error fetching latest articles:', error)
    res.status(500).json({ error: 'Error fetching latest articles' })
  }
})

// 取得所有文章分類
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM article_category')
    res.status(200).json({
      status: 'success',
      data: rows,
      message: '取得所有文章分類成功',
    })
  } catch (err) {
    console.error('Error getting categories:', err)
    res.status(500).json({
      status: 'error',
      message: err.message ? err.message : '取得文章分類失敗',
    })
  }
})

// 取得所有文章年份
router.get('/years', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT YEAR(created_at) as year FROM article ORDER BY year DESC'
    )
    res.status(200).json({
      status: 'success',
      data: rows,
      message: '取得所有年份成功',
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message ? err.message : '取得年份失敗',
    })
  }
})

// 取得文章的標籤
router.get('/:articleId/tags', async (req, res) => {
  const { articleId } = req.params
  console.log('Fetching tags for article:', articleId) // 加入除錯
  try {
    const [articleTags] = await pool.query(
      'SELECT tag_id FROM article_tags WHERE article_id = ?',
      [articleId]
    )
    console.log('articleTags:', articleTags)

    if (!articleTags.length) {
      return res.json([])
    }

    const tagIds = articleTags.map((articleTag) => articleTag.tag_id)
    console.log('tagIds:', tagIds)

    const [tags] = await pool.query(
      'SELECT id, tag_name FROM tag WHERE id IN (?)',
      [tagIds]
    )
    res.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    res.status(500).json({ message: 'Error fetching tags' })
  }
})


// 取得指定文章
router.get('/:id', async (req, res) => {
  try {
    // 修改 SQL 查詢，加入標籤查詢
    const [rows] = await pool.query(
      `
      SELECT 
        a.*,
        c.name AS category_name,
        u.head AS user_head,
        u.nickname AS user_nickname,
        u.name AS user_name,
        GROUP_CONCAT(t.tag_name) as hashtags
      FROM article a
      LEFT JOIN article_category c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN article_tags at ON a.id = at.article_id
      LEFT JOIN tag t ON at.tag_id = t.id
      WHERE a.id = ?
      GROUP BY a.id
      `,
      [req.params.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `找不到${req.params.id}文章`,
      })
    }

    const article = rows[0]

    // 整理回傳的使用者資料
    const userData = {
      head: article.user_head,
      nickname: article.user_nickname,
      name: article.user_name,
    }

    // 處理標籤資料
    const hashtags = article.hashtags ? article.hashtags.split(',') : []

    // 將使用者資料和標籤放入回傳的 data 中
    res.status(200).json({
      status: 'success',
      data: {
        ...article,
        category_name: article.category_name,
        user: userData,
        hashtags: hashtags
      },
      message: `取得${req.params.id}文章成功`,
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message ? err.message : '連結伺服器錯誤',
    })
  }
})

router.post('/related', cors(corsOptions), async (req, res) => {
  const { categoryId, title, content, articleId } = req.body
  const limit = 4 // 設定文章數量上限
  try {
    let query = `
      SELECT a.*, c.name as category_name
      FROM article a
      LEFT JOIN article_category c ON a.category_id = c.id
      WHERE a.is_deleted = 0
    `
    let params = []

    // ★ 在第一個查詢就排除當前文章
    if (articleId) {
      query += ` AND a.id != ?`
      params.push(parseInt(articleId, 10))
    }

    // 1. 關鍵字條件：如果有 title 或 content，額外搜尋標題與內文
    if (title || content) {
      query += ` AND (a.title LIKE ? OR a.content LIKE ?)`
      params.push(`%${title}%`)
      params.push(`%${content}%`)
    }

    let [rows] = await pool.query(query, params)

    // 2. 推送同類別文章
    if (rows.length < limit && categoryId) {
      let categoryQuery = `
        SELECT a.*, c.name as category_name
        FROM article a
        LEFT JOIN article_category c ON a.category_id = c.id
        WHERE a.is_deleted = 0 AND a.category_id = ?
      `
      let categoryParams = [categoryId]

      // ★ 同樣排除當前文章
      if (articleId) {
        categoryQuery += ` AND a.id != ?`
        categoryParams.push(parseInt(articleId, 10))
      }

      const [categoryRows] = await pool.query(categoryQuery, categoryParams)

      const combinedRows = [...rows]
      for (const categoryRow of categoryRows) {
        if (!combinedRows.find((row) => row.id === categoryRow.id)) {
          combinedRows.push(categoryRow)
        }
      }
      rows = combinedRows
    }

    // 3. 推送最新文章（只挑未刪除的）
    if (rows.length < limit) {
      let latestQuery = `
        SELECT a.*, c.name as category_name
        FROM article a
        LEFT JOIN article_category c ON a.category_id = c.id
        WHERE a.is_deleted = 0 AND a.id != ?
        ORDER BY a.created_at DESC
        LIMIT ?
      `
      let latestParams = [parseInt(articleId, 10), limit - rows.length]

      const [latestRows] = await pool.query(latestQuery, latestParams)

      const combinedRows = [...rows]
      for (const latestRow of latestRows) {
        if (!combinedRows.find((row) => row.id === latestRow.id)) {
          combinedRows.push(latestRow)
        }
      }
      rows = combinedRows
    }

    res.json({ data: rows.slice(0, limit) })
  } catch (error) {
    console.error('Error fetching related articles:', error)
    res.status(500).json({ error: 'Error fetching related articles' })
  }
})

router.post('/like', async (req, res) => {
  const { articleId, likeCount } = req.body
  try {
    const [result] = await pool.query(
      'UPDATE article SET like_count = ? WHERE id = ?',
      [likeCount, articleId]
    )
    // 可印出 result 來檢查影響的列數
    console.log('Update result:', result)
    res.status(200).json({ status: 'success', likeCount })
  } catch (err) {
    console.error('Error updating like count:', err)
    res.status(500).json({ status: 'error', message: err.message })
  }
})


// 新增文章
router.post('/', checkToken, async (req, res) => {
  const { category, title, subtitle, content, image_path, hashtags, user_id } = req.body
  const userId = req.decoded.id // 直接從 token 取得使用者 ID

  // 檢查圖片路徑格式（若有輸入才檢查）
  if (image_path && image_path.trim() && !image_path.startsWith('https://')) {
    return res.status(400).json({
      status: 'error',
      message: '圖片路徑必須以 https:// 開頭',
    })
  }

  let connection
  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()

    // 修改內容：設定背景顏色為透明
    const transparentContent = content.replace(
      /background-color:\s*rgb\(255,\s*255,\s*255\)/gi,
      'background-color: transparent'
    )

    // 新增文章資料，這裡新增 user_id 欄位（資料表必須有 user_id 欄位）
    const articleQuery = `
      INSERT INTO article (user_id, category_id, title, subtitle, content, image_path, created_at, update_time)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `
    const [articleResult] = await connection.query(articleQuery, [
      userId,
      category || null,
      title || null,
      subtitle || null,
      transparentContent || null,
      image_path || null,
    ])
    const articleId = articleResult.insertId

    // 處理 hashtags
    if (Array.isArray(hashtags) && hashtags.length) {
      for (const tagNameRaw of hashtags) {
        const tagName = tagNameRaw.trim()
        if (!tagName) continue

        // 檢查此 hashtag 是否已存在
        const [existingTags] = await connection.query(
          'SELECT id FROM tag WHERE tag_name = ?',
          [tagName]
        )

        let tagId
        if (existingTags.length) {
          tagId = existingTags[0].id
        } else {
          // 新增 hashtag 到 tag 資料表
          const [tagResult] = await connection.query(
            'INSERT INTO tag (tag_name) VALUES (?)',
            [tagName]
          )
          tagId = tagResult.insertId
        }

        // 將文章和 hashtag 關聯到 article_tags 資料表
        await connection.query(
          'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
          [articleId, tagId]
        )
      }
    }

    await connection.commit()

    res.status(201).json({
      status: 'success',
      message: '新增文章成功',
      articleId,
    })
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackErr) {
        console.error('Rollback 錯誤:', rollbackErr)
      }
    }
    console.error('Error adding article:', err)
    res.status(500).json({
      status: 'error',
      message: err.message ? err.message : '新增文章失敗',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// 更新指定文章
router.put('/:id', async (req, res) => {
  const { category, title, subtitle, content, image_path, hashtags, removedHashtags } = req.body
  const articleId = req.params.id
  let connection

  try {
    // 取得資料庫連線
    connection = await pool.getConnection()
    await connection.beginTransaction()

    // 修改 HTML 內容，將白色背景改為透明
    const transparentContent = content.replace(
      /background-color:\s*rgb\(255,\s*255,\s*255\)/gi,
      'background-color: transparent'
    )

    // 更新文章資料
    const updateQuery = `
      UPDATE article 
      SET 
        category_id = ?,
        title = ?,
        subtitle = ?,
        content = ?,
        image_path = ?,
        update_time = NOW()
      WHERE id = ?
    `
    await connection.query(updateQuery, [
      category || null,
      title || null,
      subtitle || null,
      transparentContent || null,
      image_path || null,
      articleId
    ])

    // 處理被刪除的標籤
    if (Array.isArray(removedHashtags) && removedHashtags.length > 0) {
      // 先找出要刪除的標籤的 ID
      const [tagsToRemove] = await connection.query(
        'SELECT id FROM tag WHERE tag_name IN (?)',
        [removedHashtags]
      )

      if (tagsToRemove.length > 0) {
        const tagIds = tagsToRemove.map(tag => tag.id)
        // 刪除文章和這些標籤的關聯
        await connection.query(
          'DELETE FROM article_tags WHERE article_id = ? AND tag_id IN (?)',
          [articleId, tagIds]
        )
      }
    }

    // 處理新的或保留的標籤
    if (Array.isArray(hashtags)) {
      for (const tagName of hashtags) {
        if (!tagName.trim()) continue

        // 檢查標籤是否存在
        const [existingTags] = await connection.query(
          'SELECT id FROM tag WHERE tag_name = ?',
          [tagName]
        )

        let tagId
        if (existingTags.length) {
          tagId = existingTags[0].id
        } else {
          // 不存在則新增標籤
          const [tagResult] = await connection.query(
            'INSERT INTO tag (tag_name) VALUES (?)',
            [tagName]
          )
          tagId = tagResult.insertId
        }

        // 檢查關聯是否已存在
        const [existingRelation] = await connection.query(
          'SELECT 1 FROM article_tags WHERE article_id = ? AND tag_id = ?',
          [articleId, tagId]
        )

        // 如果關聯不存在才新增
        if (!existingRelation.length) {
          await connection.query(
            'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
            [articleId, tagId]
          )
        }
      }
    }

    await connection.commit()

    res.status(200).json({
      status: 'success',
      message: `更新文章 ID: ${articleId} 成功`
    })

  } catch (err) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackErr) {
        console.error('回滾錯誤:', rollbackErr)
      }
    }
    console.error('更新文章錯誤:', err)
    res.status(500).json({
      status: 'error',
      message: err.message || '更新文章失敗'
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// 刪除指定文章（軟刪除：將 is_deleted 更新為 1）
router.delete('/:id', checkToken, async (req, res) => {
  const articleId = req.params.id;
  try {
    const [result] = await pool.query(
      "UPDATE article SET is_deleted = 1, update_time = NOW() WHERE id = ?",
      [articleId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "文章不存在" });
    }
    res.status(200).json({
      status: "success",
      message: `刪除文章ID: ${articleId} 成功`
    });
  } catch (err) {
    console.error('刪除文章錯誤:', err);
    res.status(500).json({
      status: "error",
      message: err.message || "刪除文章失敗"
    });
  }
});

router.delete('/:articleId/tags/:tagId', async (req, res) => {
  const { articleId, tagId } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM article_tags WHERE article_id = ? AND tag_id = ?',
      [articleId, tagId]
    );
    return res.json({ status: 'success', message: '刪除成功' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: '刪除失敗' });
  }
});

// 查詢文章收藏狀態
router.get('/collection/:articleId', checkToken, async (req, res) => {
  const { articleId } = req.params;
  const userId = req.decoded.id;

  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: '請先登入'
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT 1 FROM collection WHERE user_id = ? AND article_id = ?',
      [userId, articleId]
    );

    return res.status(200).json({
      status: 'success',
      isFavorite: rows.length > 0
    });
  } catch (error) {
    console.error('查詢收藏狀態錯誤:', error);
    return res.status(500).json({
      status: 'error',
      message: '查詢收藏狀態失敗'
    });
  }
});

// 新增文章收藏
router.post('/collection', checkToken, async (req, res) => {
  const { article_id } = req.body;
  const userId = req.decoded.id;

  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: '請先登入'
    });
  }

  if (!article_id) {
    return res.status(400).json({
      status: 'error',
      message: '文章ID不能為空'
    });
  }

  try {
    // 先檢查是否已經收藏，避免重複收藏
    const [existingRows] = await pool.query(
      'SELECT 1 FROM collection WHERE user_id = ? AND article_id = ?',
      [userId, article_id]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: '已經收藏過此文章'
      });
    }

    // 新增收藏記錄
    await pool.query(
      'INSERT INTO collection (user_id, article_id, created_at) VALUES (?, ?, NOW())',
      [userId, article_id]
    );

    return res.status(201).json({
      status: 'success',
      message: '成功加入收藏'
    });
  } catch (error) {
    console.error('文章收藏錯誤:', error);
    return res.status(500).json({
      status: 'error',
      message: '文章收藏失敗'
    });
  }
});

// 刪除文章收藏
router.delete('/collection/:articleId', checkToken, async (req, res) => {
  const { articleId } = req.params;
  const userId = req.decoded.id;

  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: '請先登入'
    });
  }

  try {
    await pool.query(
      'DELETE FROM collection WHERE user_id = ? AND article_id = ?',
      [userId, articleId]
    );

    return res.status(200).json({
      status: 'success',
      message: '成功取消收藏'
    });
  } catch (error) {
    console.error('取消收藏錯誤:', error);
    return res.status(500).json({
      status: 'error',
      message: '取消收藏失敗'
    });
  }
});

export default router
