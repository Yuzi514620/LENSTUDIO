// 伺服器的總入口，負責：
// 1.啟動 Express 伺服器
// 2.掛載 API 路由
// 3.定義首頁 /
// 4.全域設定 (如 CORS、解析 JSON)
// 5.監聽特定的 PORT，讓伺服器運行

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import coursesRouter from './routes/courses.js'
import teachersRouter from './routes/teachers.js'
import authRouter from "./routes/auth.js";
import productRoutes from './routes/product.js'
import rentalRouter from './routes//rental.js'
import ecpayRouter from './routes/ecpay-test-only.js'
import articleRoutes from './routes/article.js'
import commentsRouter from './routes/comments.js'
import likesRouter from './routes/likes.js'
import users from './routes/users.js'
import ordersRouter from './routes/orders.js'
import linePayRouter from './routes/line-pay-test-only.js'
import courseCtUploadRouter from './routes/courses-ct-upload.js'
import courseCvUploadRouter from './routes/courses-cv-upload.js'

// 讀取 .env 設定
dotenv.config()

const app = express()
const whiteList = ['http://localhost:5500', 'http://localhost:3000']
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('不允許連線'))
    }
  },
}

app.use(cors(corsOptions)) // 允許跨域請求
app.use(express.json({ limit: '150mb' })) // 解析 JSON 格式的請求
app.use(express.urlencoded({ extended: true, limit: '150mb' }))

// 設定 API 路由
app.get('/', (req, res) => {
  res.send('API 運行中...')
})

app.use('/api/product', productRoutes)

app.use('/api/courses', coursesRouter)
app.use('/api/teachers', teachersRouter)
app.use("/api/auth", authRouter);
app.use("/api/course-ct-upload", courseCtUploadRouter);
app.use("/api/course-cv-upload", courseCvUploadRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "/public/uploads")));

app.use('/api/rental', rentalRouter)

app.use('/api/ecpay', ecpayRouter)
app.use('/api/linePay', linePayRouter)
app.use('/api/orders', ordersRouter)

app.use('/api/articles', articleRoutes)
app.use('/api/comments', commentsRouter)
app.use('/api/article_comments', commentsRouter)
app.use('/api/likes', likesRouter)

app.use('/api/users', users)


// 設定伺服器監聽埠號
const PORT = process.env.PORT || 8000
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME
const DB_PORT = process.env.DB_PORT
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`)
  console.log(`Database host: ${DB_HOST}`)
  console.log(`JWT secret key: ${JWT_SECRET_KEY}`)
})
