// 伺服器的總入口，負責：
// 1.啟動 Express 伺服器
// 2.掛載 API 路由
// 3.定義首頁 /
// 4.全域設定 (如 CORS、解析 JSON)
// 5.監聽特定的 PORT，讓伺服器運行

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import coursesRouter from "./routes/courses.js";

// 讀取 .env 設定
dotenv.config();

const app = express();

app.use(cors()); // 允許跨域請求
app.use(express.json()); // 解析 JSON 格式的請求

// 設定 API 路由
app.get("/", (req, res) => {
  res.send("API 運行中...");
});

app.use("/api/courses", coursesRouter);

// 設定伺服器監聽埠號
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
});
