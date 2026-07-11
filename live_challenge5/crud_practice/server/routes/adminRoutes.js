const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");
const {
    findAllUsers,
    findUserById,
    deleteUserById,
} = require("../models/userModel");

const router = express.Router();

router.get("/users", requireAuth, requireAdmin, (req, res) => {
    const users = findAllUsers();

    res.json(users);
});

router.delete("/users/:id", requireAuth, requireAdmin, (req, res) => {
    const targetUserId = Number(req.params.id);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
        return res.status(400).json({
            message: "유효하지 않은 사용자 ID입니다.",
        });
    }

    if (targetUserId === req.user.id) {
        return res.status(400).json({
            message: "관리자 삭제 API로 본인 계정은 삭제할 수 없습니다.",
        });
    }

    const targetUser = findUserById(targetUserId);

    if (!targetUser) {
        return res.status(404).json({
            message: "삭제할 사용자를 찾을 수 없습니다.",
        });
    }

    const result = deleteUserById(targetUserId);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "삭제할 사용자를 찾을 수 없습니다.",
        });
    }

    res.json({
        message: "사용자 계정이 삭제되었습니다.",
        deletedUser: targetUser,
    });
});

module.exports = router;