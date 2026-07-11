function requireUser(req, res, next) {
    if (!req.user || req.user.role !== "user") {
        return res.status(403).json({
            message: "일반 사용자만 학습 기록을 관리할 수 있습니다.",
        });
    }

    next();
}

module.exports = requireUser;