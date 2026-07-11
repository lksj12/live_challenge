require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studyRoutes = require("./routes/studyRoutes");

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const clientDistPath = path.join(__dirname, "..", "client", "dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

app.use(
    cors({
        origin: process.env.CLIENT_URL,
    }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/studies", studyRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Express 서버가 정상 실행 중입니다.",
    });
});

app.use(express.static(clientDistPath));

app.use((req, res) => {
    if (req.path.startsWith("/api")) {
        return res.status(404).json({
            message: "API 경로를 찾을 수 없습니다.",
        });
    }

    if (!fs.existsSync(clientIndexPath)) {
        return res.status(200).send(
            "React build 파일이 아직 없습니다. 개발 중에는 client 폴더에서 npm run dev를 실행하세요.",
        );
    }

    res.sendFile(clientIndexPath);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});