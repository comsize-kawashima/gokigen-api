const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

// 機嫌データの登録
router.post("/", isAuthenticated, async (req, res) => {
  const { value, date } = req.body;
  const userId = req.userID;

  // 入力値のバリデーション
  if (typeof value !== "number" || !date) {
    return res.status(400).json({ error: "値と日付が必要です" });
  }

  try {
    // 日付の形式を確認
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "無効な日付形式です" });
    }

    // 同じ日付のデータがあれば上書き、なければ新規作成
    const mood = await prisma.mood.upsert({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
      update: { value },
      create: { value, date: dateObj, userId },
    });
    res.status(200).json(mood);
  } catch (err) {
    console.error("機嫌データ登録エラー:", err);
    if (err.code === "P2002") {
      return res.status(400).json({ error: "この日付のデータは既に存在します" });
    }
    res.status(500).json({ error: "登録に失敗しました", details: err.message });
  }
});

// 機嫌データの取得（ログインユーザーの全データ）
router.get("/", isAuthenticated, async (req, res) => {
  const userId = req.userID;
  try {
    const moods = await prisma.mood.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
    res.status(200).json(moods);
  } catch (err) {
    console.error("機嫌データ取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました", details: err.message });
  }
});

module.exports = router; 