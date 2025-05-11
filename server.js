require('dotenv').config();
console.log("PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const express = require("express");
const cors = require("cors");
const authRouter = require("./router/auth");
const userRouter = require("./router/user");
const postsRouter = require("./router/posts");
const moodRouter = require("./router/mood");

const app = express();
app.use(cors());
app.use(express.json());

// ルートのマウント
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/posts", postsRouter);
app.use("/api/mood", moodRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
