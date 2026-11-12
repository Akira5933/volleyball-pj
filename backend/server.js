const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3000;

// ファイルの場所
const FRONTEND_DIR = path.join(__dirname, "../frontend");
const TEAMS_FILE = path.join(__dirname, "../data/teams.json");

// チーム一覧取得API
app.get("/api/teams", async (req, res) => {
    try {
        const json = await fs.readFile(TEAMS_FILE, "utf8");
        const teams = JSON.parse(json);

        if (!Array.isArray(teams)) {
            throw new Error("チームデータは配列である必要があります");
        }

        res.json(teams);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "チーム情報の取得に失敗しました"
        });
    }
});

// HTML・CSS・JavaScriptを配信
app.use(express.static(FRONTEND_DIR));

// ホーム画面
app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "home.html"));
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});