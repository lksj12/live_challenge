const { verifyToken } = require("../utils/token");
const {
    isTokenRevoked,
    deleteExpiredRevokedTokens,
} = require("../models/tokenModel");

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "로그인이 필요합니다.",
        });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            message: "인증 형식이 올바르지 않습니다.",
        });
    }

    try {
        const decoded = verifyToken(token);

        if (!decoded.jti) {
            return res.status(401).json({
                message: "기존 토큰입니다. 다시 로그인해주세요.",
            });
        }

        deleteExpiredRevokedTokens();

        if (isTokenRevoked(decoded.jti)) {
            return res.status(401).json({
                message: "로그아웃된 토큰입니다. 다시 로그인해주세요.",
            });
        }

        req.user = {
            id: decoded.userId,
            email: decoded.email,
            nickname: decoded.nickname,
            role: decoded.role,
        };

        req.auth = {
            jti: decoded.jti,
            expiresAt: decoded.exp,
        };

        next();
    } catch {
        return res.status(401).json({
            message: "유효하지 않은 토큰입니다.",
        });
    }
}

module.exports = requireAuth;