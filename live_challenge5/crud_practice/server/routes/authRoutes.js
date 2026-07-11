const express = require("express");
const bcrypt = require("bcryptjs");
const { createToken } = require("../utils/token");
const requireAuth = require("../middleware/requireAuth");
const {
    createUser,
    findUserByEmail,
    deleteUserById,
} = require("../models/userModel");
const { revokeToken } = require("../models/tokenModel");

const router = express.Router();

router.post("/signup", async (req, res) => {
    const { email, password, nickname } = req.body;

    if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
            message: "이메일을 입력해주세요.",
        });
    }

    if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
            message: "비밀번호는 6자 이상이어야 합니다.",
        });
    }

    if (typeof nickname !== "string" || nickname.trim() === "") {
        return res.status(400).json({
            message: "닉네임을 입력해주세요.",
        });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNickname = nickname.trim();

    if (normalizedNickname.toLowerCase() === "admin") {
        return res.status(400).json({
            message: "Admin 닉네임은 사용할 수 없습니다.",
        });
    }

    const existingUser = findUserByEmail(normalizedEmail);

    if (existingUser) {
        return res.status(409).json({
            message: "이미 가입된 이메일입니다.",
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = createUser(
        normalizedEmail,
        passwordHash,
        normalizedNickname,
        "user",
    );

    const token = createToken(user);

    res.status(201).json({
        message: "회원가입이 완료되었습니다.",
        token,
        user,
    });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
            message: "이메일을 입력해주세요.",
        });
    }

    if (typeof password !== "string" || password.trim() === "") {
        return res.status(400).json({
            message: "비밀번호를 입력해주세요.",
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userRow = findUserByEmail(normalizedEmail);

    if (!userRow) {
        return res.status(401).json({
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        });
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        userRow.passwordHash,
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        });
    }

    const user = {
        id: userRow.id,
        email: userRow.email,
        nickname: userRow.nickname,
        role: userRow.role,
    };

    const token = createToken(user);

    res.json({
        message: "로그인이 완료되었습니다.",
        token,
        user,
    });
});

router.get("/me", requireAuth, (req, res) => {
    res.json({
        user: req.user,
    });
});

router.post("/logout", requireAuth, (req, res) => {
    revokeToken(req.auth.jti, req.auth.expiresAt);

    res.json({
        message: "로그아웃되었습니다.",
    });
});

router.delete("/me", requireAuth, (req, res) => {
    const result = deleteUserById(req.user.id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "삭제할 계정을 찾을 수 없습니다.",
        });
    }

    revokeToken(req.auth.jti, req.auth.expiresAt);

    res.json({
        message: "회원 탈퇴가 완료되었습니다.",
        deletedUserId: req.user.id,
    });
});

module.exports = router;