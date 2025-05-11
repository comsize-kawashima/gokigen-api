const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateIdenticon = require("../utils/generateIdenticon"); // 追加

const prisma = new PrismaClient();

//新規ユーザ―登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generateIdenticon(email); // 修正: 関数を使用

  //パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("ハッシュ化されたパスワード:", hashedPassword);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: "はじめまして",
          profileImageUrl: defaultIconImage,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return res.json({ user });
});

//ユーザーログインAPI
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("受信したリクエストボディ:", req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    console.log("データベースから取得したユーザー:", user);

    if (!user) {
      return res
        .status(401)
        .json({ error: "メールアドレスかパスワードが間違っています" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "パスワードが間違っています" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.SECRET_KEY || "default_secret",
      {
        expiresIn: "1d",
      }
    );

    return res.json({ token });
  } catch (err) {
    console.error("エラーが発生しました:", err);
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
});

// パスワードリセットAPI（ダミー実装）
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  // 本来はここでメール送信処理を行う
  // 例: トークン生成→メール送信→DBにリセットトークン保存など
  // 今回はダミーで成功レスポンスのみ返す
  if (!email) {
    return res.status(400).json({ error: "メールアドレスが必要です" });
  }
  // ユーザーが存在するかチェック
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(200).json({ message: "リセットメール送信完了（※このメールアドレスは登録されていません）" });
  }
  // 本来はここでメール送信処理
  return res.status(200).json({ message: "リセットメール送信完了" });
});

module.exports = router;
