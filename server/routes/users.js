import express, { json } from "express";
import moment from "moment";
import multer from "multer";
import cors from "cors";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import db from "../db.js";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
const portNum = 3005;



const whiteList = ["http://localhost:5500", "http://localhost:8000", "http://localhost:3000"];
const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("不允許連線"));
    }
  },
};



const secretKey = process.env.JWT_SECRET_KEY;
const OTP_DB = {}; // 暫存 OTP（正式應存入 DB）
const USERS = {}; // 假設的使用者資料

const router = express.Router();
// router.use(cors(corsOptions));
// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));


router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM `users`");
    res.status(200).json({
      status: "success",
      data: rows,
      message: "取得資料成功"
    })
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
      message: err.message ? err.message : "取得資料失敗"
    })
  }
});

router.get("/search", async (req, res) => {
  const { q } = req.query;
  try {
    if (!q) throw new Error("請提供查詢字串");

    const sql = "SELECT * FROM `users` WHERE account LIKE ?";
    const [rows] = await db.execute(sql, [`%${q}%`]);

    res.status(200).json({
      status: "success",
      data: rows,
      message: `搜尋成功, 條件: ${q}`
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
      message: err.message ? err.message : "搜尋失敗"
    })
  }
});



router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) throw new Error("請提供查詢字串");

    // 只取 nickname、head，你也可以改成取更多欄位
    const [rows] = await db.execute("SELECT nickname, name, head FROM `users` WHERE id = ?", [id]);
    if (rows.length === 0) throw new Error("找不到使用者");

    res.status(200).json({
      status: "success",
      data: rows[0],
      message: `獲取特定 ID 的使用者: ${id}`
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "error",
      message: err.message ? err.message : "搜尋失敗"
    });
  }
});

const uploadDir = path.join(process.cwd(), "../client/public/uploads"); // ✅ 指定 Next.js 的 `public/`
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// `multer` 設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ 新增上傳圖片 API
router.post("/upload", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) throw new Error("請選擇圖片");

    // 取得當前登入使用者帳號
    const { account } = req.body;
    if (!account) throw new Error("缺少使用者帳號");

    const filePath = `/uploads/${req.file.filename}`; // 存相對路徑
    const sql = "UPDATE users SET head = ? WHERE account = ?";
    await db.execute(sql, [filePath, account]);

    res.status(200).json({
      status: "success",
      message: "頭像上傳成功！",
      imageUrl: filePath,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "error",
      message: error.message || "上傳失敗",
    });
  }
});



// ✅ 註冊 API（允許上傳圖片）
router.post("/", upload.single("avatar"), async (req, res) => {
  try {
    let { account, name, nickname, mail, password, gender } = req.body;
    const avatar = req.file ? req.file.filename : "users.webp"; // 若沒上傳圖片，使用預設圖片

    if (!account || !name || !nickname || !mail || !password || !gender) {
      return res.status(400).json({ status: "error", message: "請提供完整的使用者資訊！" });
    }

    // 檢查帳號是否已存在
    const checkUserSQL = "SELECT id FROM users WHERE account = ?";
    const [existingUser] = await db.execute(checkUserSQL, [account]);

    if (existingUser.length > 0) {
      return res.status(400).json({ status: "error", message: "此帳號已被註冊，請使用其他帳號。" });
    }

    // 轉換性別為 `0`（先生）或 `1`（女士）
    gender = gender === "先生" ? 0 : gender === "女士" ? 1 : null;
    if (gender === null) return res.status(400).json({ status: "error", message: "性別格式錯誤" });

    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const hashedPassword = await bcrypt.hash(password, 10);

    // 設定 `head` 為上傳的圖片路徑
    const head = `/uploads/${avatar}`;

    const sql = "INSERT INTO `users` (account, password, name, nickname, mail, head, gender, birthday, created_at, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await db.execute(sql, [account, hashedPassword, name, nickname, mail, head, gender, null, createdAt, 0]);

    res.status(201).json({ status: "success", message: "帳號註冊成功！", avatarUrl: head });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "註冊失敗，請稍後再試。" });
  }
});

//address
router.post('/addresses', checkToken, async (req, res) => {
  // 此處假設 JWT 已經在前面的中間件中解析，並將解碼的用戶資訊附加到了 req.user 上
  const user_id = req.decoded.id;

  const { address } = req.body;

  // 驗證必填欄位
  if (!address) {
    return res.status(400).json({
      status: 'error',
      message: '請提供地址',
    });
  }

  try {
    // 將地址插入到資料庫
    const [result] = await db.execute(
      `INSERT INTO addresses (user_id, address, created_at) VALUES (?, ?, ?)`,
      [user_id, address, new Date()]
    );

    const newAddress = {
      id: result.insertId,
      user_id,
      address,
      created_at: new Date(),
    };

    res.status(201).json({
      status: 'success',
      data: newAddress,
    });
  } catch (error) {
    console.error('無法新增地址:', error);
    res.status(500).json({
      status: 'error',
      message: '無法新增地址，請稍後再試。',
    });
  }
});

// **取得所有地址**
router.get('/addresses/me', checkToken, async (req, res) => {
  try {
    const user_id = req.decoded.id; // ✅ 直接使用 JWT 解析的 `id`
    console.log("🔹 取得用戶 ID:", user_id); // 確保 `user_id` 有值

    if (!user_id) {
      return res.status(401).json({
        status: 'error',
        message: '無法識別用戶，請重新登入',
      });
    }

    // ✅ 查詢資料庫，獲取該用戶的所有住址，按 `created_at` 降序排列
    const [rows] = await db.execute(
      'SELECT id, address, created_at FROM addresses WHERE user_id = ? ORDER BY created_at ASC',
      [user_id]
    );

    

    res.status(200).json({
      status: 'success',
      data: rows, // ✅ 返回所有住址
      message: rows.length > 0 ? '獲取地址成功' : '該用戶沒有地址紀錄'
    });
  } catch (error) {
    console.error('❌ 獲取所有住址失敗:', error);
    res.status(500).json({
      status: 'error',
      message: '無法獲取所有住址，請稍後再試',
    });
  }
});


// **編輯地址**
router.put('/addresses/:id', checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { address } = req.body;
    const user_id = req.decoded.id; // ✅ 確保 JWT 解析出 user_id

    if (!address) {
      return res.status(400).json({
        status: 'error',
        message: '請提供地址',
      });
    }

    // 🔍 檢查該地址是否存在，且屬於當前用戶
    const [existingAddress] = await db.execute(
      `SELECT * FROM addresses WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (existingAddress.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該地址，或您無權修改此地址',
      });
    }

    // ✅ 更新地址
    await db.execute(
      `UPDATE addresses SET address = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      [address, id, user_id]
    );

    res.status(200).json({
      status: 'success',
      message: '地址更新成功',
      data: { id, address },
    });
  } catch (error) {
    console.error('❌ 更新地址失敗:', error);
    res.status(500).json({
      status: 'error',
      message: '無法更新地址，請稍後再試',
    });
  }
});

//刪除住址
router.delete('/addresses/:id', checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.decoded.id; // ✅ 確保 JWT 解析出 user_id

    // 🔍 檢查該地址是否存在，且屬於當前用戶
    const [existingAddress] = await db.execute(
      `SELECT * FROM addresses WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (existingAddress.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該地址，或您無權刪除此地址',
      });
    }

    // ✅ 從資料庫刪除地址
    await db.execute(
      `DELETE FROM addresses WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    res.status(200).json({
      status: 'success',
      message: '地址刪除成功',
      data: { id },
    });
  } catch (error) {
    console.error('❌ 刪除地址失敗:', error);
    res.status(500).json({
      status: 'error',
      message: '無法刪除地址，請稍後再試',
    });
  }
});

//address end--/



router.put("/:account", checkToken, upload.none(), async (req, res) => {
  const { account } = req.params;
  console.log(account);

  const { name, nickname, password, head, birthday, currentPassword } = req.body;

  try {
    if (account != req.decoded.account) throw new Error("沒有修改權限");

    const updateFields = [];
    const value = [];

    if (name) {
      updateFields.push("`name` = ?");
      value.push(name);
    }
    if (nickname) {
      // 🔥 **檢查 nickname 是否已被使用**
      const [existingNicknames] = await db.execute(
        "SELECT id FROM users WHERE nickname = ? AND account != ?",
        [nickname, account]
      );
    
      if (existingNicknames.length > 0) {
        throw new Error("此暱稱已被使用，請選擇其他暱稱");
      }
    
      updateFields.push("`nickname` = ?");
      value.push(nickname);
    }
    if (head) {
      updateFields.push("`head` = ?");
      value.push(head);
    }
    if (password) {
      // 更新密碼前，必須提供並驗證原密碼
      if (!currentPassword) throw new Error("必須提供原密碼以更新新密碼");

      // 取得目前使用者的密碼 hash
      const [rows] = await db.execute("SELECT password FROM users WHERE account = ?", [account]);
      if (rows.length === 0) throw new Error("找不到使用者");
      const userHash = rows[0].password;

      // 驗證原密碼是否正確
      const isMatch = await bcrypt.compare(currentPassword, userHash);
      if (!isMatch) throw new Error("目前密碼不正確，請再重新輸入");

      // 驗證通過後，更新新密碼（先 hash）
      updateFields.push("`password` = ?");
      const hashedPassword = await bcrypt.hash(password, 10);
      value.push(hashedPassword);
    }

    let formattedBirthday = "";

    if (birthday) {
      const formattedBirthday = typeof birthday === 'string'
        ? birthday.split('T')[0]  // 如果是字串，去掉時間部分
        : new Date(birthday).toISOString().split('T')[0]; // 如果是日期物件，轉成 YYYY-MM-DD
      updateFields.push("`birthday` = ?");
      value.push(formattedBirthday);
    }
    value.push(account);
    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE account = ?;`;
    const [result] = await db.execute(sql, value);

    if (result.affectedRows == 0) throw new Error("更新失敗");


    // 🔥 **步驟 1：更新後，重新從資料庫取得最新的 user 資料**
    const getUserSql = "SELECT id, account, name, nickname, mail, head, level, DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday FROM `users` WHERE account = ?;";
    const [userRows] = await db.execute(getUserSql, [account]);

    if (userRows.length === 0) throw new Error("找不到更新後的使用者");

    const updatedUser = userRows[0]; // ✅ 確保拿到最新的 `user` 資料
    console.log("📌 更新後的最新 user 資料:", updatedUser);

    // 🔥 **步驟 2：產生新的 Token，確保使用 `updatedUser` 的最新資料**

    // **🔹 產生新的 Token**

    const newToken = jwt.sign(
      {
        id: updatedUser.id,
        account: updatedUser.account,
        name: updatedUser.name,
        nickname: updatedUser.nickname,
        mail: updatedUser.mail,
        head: updatedUser.head,
        level: updatedUser.level,
        birthday: updatedUser.birthday
      },
      secretKey,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      message: `更新成功: ${account}`,
      token: newToken, // ✅ 回傳最新的 Token
    });

  } catch (err) {
    console.error("❌ 更新錯誤:", err.message);
    res.status(400).json({
      status: "error",
      message: err.message || "修改失敗",
    });
  }
});

router.delete("/:account", checkToken, async (req, res) => {
  const { account } = req.params;
  try {
    if (account != req.decoded.account) throw new Error("沒有修改權限");

    const sql = `DELETE FROM users WHERE account = ?`;
    const [result] = await db.execute(sql, [account]);

    if (result.affectedRows == 0) throw new Error("刪除失敗!");

    res.status(200).json({
      status: "success",
      message: `刪除使用者 ${account} 成功`
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
      message: err.message ? err.message : "刪除失敗"
    })
  }
});

router.post("/login", upload.none(), async (req, res) => {
  const { account, password } = req.body;
  console.log("Debugging: ", account, password);
  console.log(req.body)
  try {
    if (!account || !password) throw new Error("請提供帳號和密碼")

    const sql = "SELECT * FROM `users` WHERE account = ?;"
    const [rows] = await db.execute(sql, [account]);

    if (rows.length == 0) throw new Error("找不到使用者");

    const user = rows[0]
    console.log(user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("帳號或密碼錯誤");

    console.log("JWT Secret Key:", secretKey); // 檢查是否有讀取到 Secret Key

    const token = jwt.sign(
      {
        id: user.id,
        account: user.account,
        name: user.name,
        nickname: user.nickname || "",
        mail: user.mail,
        head: user.head,
        level: user.level,
        birthday: user.birthday
          ? (() => {
            const date = new Date(user.birthday);
            date.setDate(date.getDate() + 1); // ✅ 加一天
            return date.toISOString().split("T")[0]; // ✅ 轉回 `YYYY-MM-DD`
          })()
          : "",
      },
      secretKey,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      status: "success",
      data: { token },
      message: "登入成功"
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
      message: err.message ? err.message : "登入失敗"
    });
  }
});

router.post("/logout", checkToken, (req, res) => {
  res.clearCookie("token"); // 清除 JWT Token（如果儲存在 cookie）
  res.json({
    status: "success",
    message: "登出成功，所有資料已清除",
  });
});


router.get("/users/me", checkToken, async (req, res) => {
  try {
    const sql = `
      SELECT account, name, nickname, mail, head, 
      DATE_FORMAT(birthday, '%Y-%m-%d') AS birthday
      FROM users WHERE account = ?;
    `;
    const [rows] = await db.execute(sql, [req.decoded.account]);

    if (rows.length === 0) throw new Error("找不到使用者");

    res.status(200).json({
      status: "success",
      data: rows[0], // ✅ birthday 已經是 `YYYY-MM-DD`
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "error",
      message: error.message || "無法獲取使用者資訊",
    });
  }
});



router.post("/status", checkToken, (req, res) => {
  const { decoded } = req;
  const token = jwt.sign(
    {
      id: decoded.id,
      account: decoded.account,
      name: decoded.name,
      nickname: decoded.nickname,
      mail: decoded.mail,
      head: decoded.head,
    },
    secretKey,
    { expiresIn: "7d" }
  );
  res.json({
    status: "success",
    data: { token },
    message: "狀態: 登入中",
  });
});




//address end //


// async function getRandomAvatar(){
//   const api = "https://randomuser.me/api";
//   try{
//     const res = await fetch(api);
//     if(!res.ok) throw new Error("伺服器掛了T_T");
//     const result = await res.json();
//     return result.results[0].picture.large;
//   }catch(err){
//     console.log("取得隨機照片失敗", err.message);
//     return "https://randomuser.me/api/portraits/men/7.jpg";
//   }
// }


//collect 


// ✅ 透過 JWT 獲取 `user_id`，查詢用戶的收藏產品
router.get("/favorites/me", checkToken, async (req, res) => {
  try {
    const connection = await db.getConnection(); // ✅ 取得資料庫連線
    const userId = req.decoded.id; // ✅ 直接從 JWT 解析 `user_id`

    console.log(`取得收藏資料，使用者 ID: ${userId}`);

    // 查詢用戶收藏的商品
    const [products] = await connection.query(
      `SELECT 
        c.id AS collection_id,
        p.id AS product_id,
        p.name, 
        p.short_introduce,
        p.price,
        b.brand_name,
        CONCAT('/images/product/', COALESCE(i.image_url, 'default.jpg')) AS image_url
      FROM collection c
      JOIN product p ON c.product_id = p.id
      LEFT JOIN brand b ON p.brand_id = b.brand_id
      LEFT JOIN image i ON p.id = i.product_id AND i.is_main = 1
      WHERE c.user_id = ?`,
      [userId]
    );

    // 查詢用戶收藏的課程
    const [courses] = await connection.query(
      `SELECT 
        c.id AS collection_id,
        cs.id AS course_id,
        cs.title AS course_title,
        cs.teacher_id AS instructor,
        t.name AS instructor_name,  -- ✅ 講師名稱
        t.image AS instructor_image,  -- ✅ 講師頭像
        t.bio AS instructor_bio,  -- ✅ 講師簡介
        t.facebook AS instructor_facebook,  -- ✅ 講師 Facebook
        t.instagram AS instructor_instagram,  -- ✅ 講師 Instagram
        t.youtube AS instructor_youtube,  -- ✅ 講師 YouTube
        cs.sale_price AS price, 
        CONCAT('', COALESCE(cs.image_url, 'default.jpg')) AS image_url 
      FROM collection c
      JOIN courses cs ON c.course_id = cs.id
      LEFT JOIN teachers t ON cs.teacher_id = t.id 
      WHERE c.user_id = ? AND c.course_id IS NOT NULL;`,
      [userId]
    );

    // 查詢用戶收藏的租賃 
    const [rents] = await connection.query(
      `SELECT 
    c.id AS collection_id,
    r.id AS rent_id,
    r.name AS rent_name,
    r.brand AS brand,
    r.fee AS price,  -- 租賃費用
    r.stock,
    CONCAT('/images/rental/', COALESCE(ri.url, 'default'), '.png') AS image_url
  FROM collection c  
  JOIN rental r ON c.rent_id = r.id
  LEFT JOIN rent_image ri ON r.id = ri.rent_id AND ri.sequence = 1  
  WHERE c.user_id = ? AND c.rent_id IS NOT NULL;`,
      [userId]
    );
    

    // 查詢用戶收藏的文章
    const [articles] = await connection.query(
      `SELECT 
        c.id AS collection_id,
        a.id AS article_id,
        a.title,
        a.subtitle,
        a.content,
        a.like_count,
        a.created_at,
        a.update_time,
        a.image_path AS image_url  -- 直接使用文章的圖片 URL
      FROM collection c
      JOIN article a ON c.article_id = a.id
      WHERE c.user_id = ? AND c.article_id IS NOT NULL;`,
      [userId]
    );

    connection.release(); // ✅ 釋放連線

    // ✅ 如果沒有任何收藏
    if (products.length === 0 && courses.length === 0 && rents.length === 0 && articles.length === 0) {
      return res.json({ products: [], courses: [], rents: [], articles: [] });
    }
    

    res.json({ products, courses, rents, articles });
  } catch (error) {
    console.error("獲取收藏錯誤:", error);
    res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
});

//collect end //

//user rent//
router.get("/rent", checkToken, async (req, res) => {
  try {
    const connection = await db.getConnection();
    const userId = req.decoded.id;

    console.log(`🔍 取得租賃資料，使用者 ID: ${userId}`);

    // SQL 查詢用戶的租賃訂單，包含商品名稱與圖片
    const [products] = await connection.query(
      `SELECT rentals.id, rentals.rent_id, rentals.rent_fee, rentals.start_date, rentals.end_date, rentals.status, 
              rentals.rating, rentals.comment, rentals.comment_at, users.name AS user_name, 
              products.product_name, products.image_url 
       FROM rentals 
       JOIN users ON rentals.user_id = users.id
       LEFT JOIN products ON rentals.rent_id = products.id
       WHERE rentals.user_id = ?
       ORDER BY rentals.start_date DESC`,
      [userId]
    );

    connection.release(); // ✅ 釋放連線

    if (products.length === 0) {
      return res.json({ products: [] });
    }

    res.json({ products });
  } catch (error) {
    console.error("🚨 取得租賃訂單錯誤:", error);
    res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
});

//user end //

//忘記密碼OTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 環境變數存放密碼
  }
});

// 📌 產生 OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// 📌 模擬資料庫


// 📌 1️⃣ 發送 OTP
router.post('/send-otp/me', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: '請提供 Email' });

  const otp = generateOTP();
  OTP_DB[email] = otp; // 儲存 OTP

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '您的 OTP 驗證碼',
    text: `您的 OTP 是 ${otp}，5 分鐘內有效。`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP 已發送' });
  } catch (error) {
    console.error('OTP 發送失敗:', error);
    res.status(500).json({ success: false, message: 'OTP 發送失敗' });
  }
});

// 📌 2️⃣ 驗證 OTP 並產生 JWT Token
router.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: '請提供 Email 和 OTP' });

  if (OTP_DB[email] === otp) {
    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '15m' });
    delete OTP_DB[email]; // ✅ OTP 驗證後立即刪除，避免重用
    res.json({ success: true, token });
  } else {
    res.status(400).json({ success: false, message: 'OTP 錯誤或已過期' });
  }
});

// 📌 3️⃣ 使用 JWT 來重設密碼
router.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, message: '請提供 Token 和新密碼' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const email = decoded.email;

    // 加密密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    USERS[email] = hashedPassword; // ✅ 更新用戶密碼

    res.json({ success: true, message: '密碼已重設' });
  } catch (error) {
    console.error('Token 錯誤:', error);
    res.status(401).json({ success: false, message: '無效或過期的 Token' });
  }
});


//忘記密碼END
function checkToken(req, res, next) {
  let token = req.get("Authorization");
  if (!token) return res.status(401).json({
    status: "error",
    message: "無驗證資料, 請重新登入",
  })
  if (!token.startsWith("Bearer ")) return res.status(401).json({
    status: "error",
    message: "驗證資料錯誤, 請重新登入",
  })
  token = token.slice(7);
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).json({
      status: "error",
      message: "驗證資料失效, 請重新登入",
    })
    req.decoded = decoded;
    console.log(req.decoded)
    next();
  });
}

export default router;