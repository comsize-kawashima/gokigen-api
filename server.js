require('dotenv').config();
console.log("PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("SECRET_KEY:", process.env.SECRET_KEY);
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const authRouter = require("./router/auth");
const userRouter = require("./router/user");
const postsRouter = require("./router/posts");
const moodRouter = require("./router/mood");

const app = express();

// プロキシ設定を追加
app.set('trust proxy', 1);

// セキュリティミドルウェア
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS設定
app.use(cors({
  origin: true, // すべてのオリジンを許可
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// レート制限設定
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15分
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // リクエスト数
});
app.use(limiter);

// ログ設定
app.use(morgan('dev'));

// ボディパーサー
app.use(express.json());

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// ルートのマウント
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/posts", postsRouter);
app.use("/api/mood", moodRouter);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
