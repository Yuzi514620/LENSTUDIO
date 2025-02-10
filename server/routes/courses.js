// 專門處理「課程 API」的檔案
// 1.定義 /api/courses 相關的 API
// 2.連接 MySQL，查詢/新增/修改/刪除課程

import pool from "../db.js";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  const [courses] = await pool.query("SELECT * FROM courses");
  res.json(courses);
});

router.get("/:id", async (req, res) => {
  const [course] = await pool.query("SELECT * FROM courses WHERE id = ?", [
    req.params.id,
  ]);
  res.json(course[0]);
});

export default router;
