import express from 'express'
import pool from '../db.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// 會員認證(回傳Token含式)
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, error: '未授權，請先登入' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.user = decoded
    next()
  } catch (error) {
    console.error('JWT 驗證失敗:', error.name, error.message)
    return res.status(403).json({ success: false, error: '無效的 Token' })
  }
}

// 📌 **統一 API - 獲取商品資料 & 篩選選項**
router.get('/', async (req, res) => {
  try {
    const { query, category, advanced, brands } = req.query

    // ✅ **用途篩選邏輯 (動態映射)**
    const categoryMapping = {
      日常攝影: {
        hashtags: ['輕便', '4K錄影', '超廣角', '多功能'],
        types: ['APS-C相機', '標準變焦鏡頭', '廣角定焦鏡頭', '腳架', '麥克風'],
      },
      專業攝影: {
        hashtags: ['高畫質', '旗艦', '高階款', '專業級', '人像'],
        types: [
          '全幅相機',
          '標準定焦鏡頭',
          '望遠變焦鏡頭',
          '廣角定焦鏡頭',
          '閃光燈',
          '轉接環',
        ],
      },
      影像創作: {
        hashtags: ['Vlog', '4K錄影', '8K錄影', '音訊', '防手震'],
        types: [
          'APS-C相機',
          '全幅相機',
          '標準變焦鏡頭',
          '廣角變焦鏡頭',
          '麥克風',
          '腳架',
        ],
      },
      戶外運動: {
        hashtags: ['高速快門', '連拍', '自動對焦', '防手震', '超望遠'],
        types: ['全幅相機', '望遠變焦鏡頭', '望遠定焦鏡頭', '腳架', '閃光燈'],
      },
      旅遊拍攝: {
        hashtags: ['旅行', '輕便', '熱靴', '多功能', '大光圈'],
        types: [
          'APS-C相機',
          '全幅相機',
          '廣角變焦鏡頭',
          '標準變焦鏡頭',
          '腳架',
          '麥克風',
        ],
      },
      產品攝影: {
        hashtags: ['微距', '大光圈', '高階款', '專業級'],
        types: [
          '全幅相機',
          '微距鏡頭',
          '標準定焦鏡頭',
          '廣角定焦鏡頭',
          '轉接環',
          '閃光燈',
          '腳架',
        ],
      },
    }

    // ✅ **用 "全部" 作為預設選項，並動態添加 categoryMapping 中的用途分類**
    const categoryOptions = ['全部', ...Object.keys(categoryMapping)]

    // ✅ **組織商品查詢語句**
    let rentalQuery = `
      SELECT 
        r.*, 
        GROUP_CONCAT(DISTINCT ri.url ORDER BY COALESCE(ri.sequence, 999) ASC) AS images,
        GROUP_CONCAT(DISTINCT t.tags) AS hashtags
      FROM rental r
      LEFT JOIN rent_image ri ON r.id = ri.rent_id
      LEFT JOIN rent_hashtag rh ON r.id = rh.rent_id
      LEFT JOIN rent_tags t ON rh.rent_tags_id = t.id
      WHERE 1=1
    `

    let queryParams = []

    // 🔍 **搜尋功能 (支援名稱、摘要、標籤模糊搜尋)**
    if (query) {
      rentalQuery += ` AND (r.name LIKE ? OR r.summary LIKE ? OR t.tags LIKE ?) `
      queryParams.push(`%${query}%`, `%${query}%`, `%${query}%`)
    }

    // ✅ **用途 & 進階篩選邏輯 (允許交叉篩選，但不相互干擾)**
    if (category && category !== '全部' && categoryMapping[category]) {
      const { hashtags, types } = categoryMapping[category]

      let orConditions = []

      // 🟢 **Hashtag 篩選 (允許 OR 查詢)**
      if (hashtags.length > 0) {
        const hashtagCondition = `(${hashtags
          .map(() => 't.tags LIKE ?')
          .join(' OR ')})`
        orConditions.push(hashtagCondition)
        queryParams.push(...hashtags.map((tag) => `%${tag}%`))
      }

      // 🟢 **設備類型篩選 (允許 OR 查詢)**
      if (types.length > 0) {
        const typeCondition = `
          (r.cam_kind IN (${types.map(() => '?').join(',')}) OR 
          r.len_kind IN (${types.map(() => '?').join(',')}) OR 
          r.acc_kind IN (${types.map(() => '?').join(',')}))`
        orConditions.push(typeCondition)
        queryParams.push(...types, ...types, ...types)
      }

      // 🟢 **將 Hashtags 和 Types 的條件用 OR 連接**
      if (orConditions.length > 0) {
        rentalQuery += ` AND (${orConditions.join(' OR ')})`
      }
    }

    // ✅ **設備篩選 (進階篩選)**
    if (advanced) {
      const advancedList = Array.isArray(advanced) ? advanced : [advanced]
      rentalQuery += ` AND (
        r.cam_kind IN (${advancedList.map(() => '?').join(',')}) OR 
        r.len_kind IN (${advancedList.map(() => '?').join(',')}) OR 
        r.acc_kind IN (${advancedList.map(() => '?').join(',')})
      ) `
      queryParams.push(...advancedList, ...advancedList, ...advancedList)
    }

    // ✅ **品牌篩選（支援 "其他" 選項）**
    if (brands) {
      const brandList = Array.isArray(brands) ? brands : [brands]

      if (brandList.length === 1 && brandList[0] === '其他') {
        rentalQuery += ` AND r.brand IS NULL `
      } else if (brandList.includes('其他')) {
        rentalQuery += ` AND (r.brand IN (${brandList
          .filter((b) => b !== '其他')
          .map(() => '?')
          .join(',')}) OR r.brand IS NULL) `
        queryParams.push(...brandList.filter((b) => b !== '其他'))
      } else {
        rentalQuery += ` AND r.brand IN (${brandList
          .map(() => '?')
          .join(',')}) `
        queryParams.push(...brandList)
      }
    }

    rentalQuery += ` GROUP BY r.id`

    const [rentals] = await pool.query(rentalQuery, queryParams)
    rentals.forEach((rental) => {
      rental.images = rental.images ? rental.images.split(',') : []
      rental.hashtags = rental.hashtags ? rental.hashtags.split(',') : []
    })

    // 取得所有標籤
    const [tags] = await pool.query(
      `SELECT id, tags FROM rent_tags ORDER BY sequence ASC`
    )

    // ✅ **完整的回傳資料，包括所有前端所需的篩選選項**
    res.json({
      success: true,
      rentals,
      tags: tags || [],
      categories: categoryOptions,
      equipment: [
        '全幅相機',
        'APS-C相機',
        '廣角變焦鏡頭',
        '標準變焦鏡頭',
        '望遠變焦鏡頭',
        '廣角定焦鏡頭',
        '標準定焦鏡頭',
        '望遠定焦鏡頭',
        '轉接環',
        '閃光燈',
        '麥克風',
        '腳架',
      ],
      brands: ['Canon', 'Sony', 'Nikon', 'Leica', '其他'],
    })
  } catch (error) {
    console.error('❌ 錯誤:', error)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
})

// 獲取單一租借商品詳細資訊（包含圖片與 Hashtag）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 取得商品詳細資訊
    const [rental] = await pool.query(
      `
      SELECT 
          r.*, 
          GROUP_CONCAT(DISTINCT ri.url ORDER BY ri.sequence ASC) AS images,
          GROUP_CONCAT(DISTINCT t.tags) AS hashtags
      FROM rental r
      LEFT JOIN rent_image ri ON r.id = ri.rent_id
      LEFT JOIN rent_hashtag rh ON r.id = rh.rent_id
      LEFT JOIN rent_tags t ON rh.rent_tags_id = t.id
      WHERE r.id = ?
      GROUP BY r.id
      `,
      [id]
    )

    if (rental.length === 0) {
      return res.status(404).json({ success: false, error: '找不到該商品' })
    }

    // 轉換 images 和 hashtags 格式
    rental[0].images = rental[0].images ? rental[0].images.split(',') : []
    rental[0].hashtags = rental[0].hashtags ? rental[0].hashtags.split(',') : []

    // **獲取推薦商品（基於 `rent_recommend`）**
    const [recommendations] = await pool.query(
      `
      SELECT 
          r.*, 
          GROUP_CONCAT(DISTINCT ri.url ORDER BY ri.sequence ASC) AS images,
          GROUP_CONCAT(DISTINCT t.tags) AS hashtags
      FROM rent_recommend rr
      INNER JOIN rental r ON rr.recommend_id = r.id
      LEFT JOIN rent_image ri ON r.id = ri.rent_id
      LEFT JOIN rent_hashtag rh ON r.id = rh.rent_id
      LEFT JOIN rent_tags t ON rh.rent_tags_id = t.id
      WHERE rr.rent_id = ?
      GROUP BY r.id
      ORDER BY rr.sequence ASC -- 確保推薦順序
      `,
      [id]
    )

    recommendations.forEach((rental) => {
      rental.images = rental.images ? rental.images.split(',') : []
      rental.hashtags = rental.hashtags ? rental.hashtags.split(',') : []
    })

    // **回傳完整數據**
    res.json({ success: true, data: rental[0], recommendations })
  } catch (error) {
    console.error('❌ 資料庫錯誤:', error)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
})

// ✅ 新增收藏 (允許多商品收藏)
router.post('/collection', auth, async (req, res) => {
  try {
    const { rent_id } = req.body
    const user_id = req.user.id

    if (!rent_id) {
      return res.status(400).json({ success: false, error: 'rent_id 為必填項目' })
    }

    await pool.query(
      'INSERT INTO collection (user_id, rent_id, created_at) VALUES (?, ?, NOW())',
      [user_id, rent_id]
    )

    res.json({ success: true, message: '已成功收藏租借商品' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: '該商品已經收藏' })
    }
    console.error('新增收藏錯誤:', error)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
})

// ✅ 取消收藏
router.delete('/collection', auth, async (req, res) => {
  try {
    const { rent_id } = req.body
    const user_id = req.user.id

    if (!rent_id) {
      return res.status(400).json({ success: false, error: 'rent_id 為必填項目' })
    }

    const [result] = await pool.query(
      'DELETE FROM collection WHERE user_id = ? AND rent_id = ?',
      [user_id, rent_id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: '收藏記錄不存在' })
    }

    res.json({ success: true, message: '成功取消收藏' })
  } catch (error) {
    console.error('取消收藏錯誤:', error)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
})

// ✅ 檢查是否已收藏
router.get('/collection/:rent_id', auth, async (req, res) => {
  try {
    const { rent_id } = req.params
    const user_id = req.user.id

    const [result] = await pool.query(
      'SELECT * FROM collection WHERE user_id = ? AND rent_id = ?',
      [user_id, rent_id]
    )

    res.json({ success: true, isFavorite: result.length > 0 })
  } catch (error) {
    console.error('檢查收藏狀態錯誤:', error)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
})

export default router
