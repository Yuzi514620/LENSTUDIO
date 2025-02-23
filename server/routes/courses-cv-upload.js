//課程圖片上傳

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";


const router = express.Router();
const uploadDir = path.join(process.cwd(), "/public/uploads/images/course-cover"); // ✅ 絕對路徑

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.access(uploadDir); // 確保目錄可讀取
      console.log("✅ 目錄已存在:", uploadDir);
    } catch {
      console.log("📂 目錄不存在，嘗試創建...");
      await fs.mkdir(uploadDir, { recursive: true });
      console.log("✅ 目錄創建成功:", uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now(); 
    const fileExt = path.extname(file.originalname); 
    const originalName = path.basename(file.originalname, fileExt); 
    const filename = `${timestamp}-${originalName}${fileExt}`; 
    cb(null, filename);
  },
});


const upload = multer({ storage });

// **圖片上傳 API**
router.post("/", upload.single("upload"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "上傳失敗" });
  }

  console.log("📂 檔案存入:", req.file.path); 

  const fileUrl = `/uploads/images/course-cover/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

export default router;
