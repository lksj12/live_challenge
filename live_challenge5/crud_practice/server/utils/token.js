const crypto = require("crypto");
const jwt = require("jsonwebtoken");

function getJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET이 설정되지 않았습니다.");
    }

    return jwtSecret;
}

function createToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
        },
        getJwtSecret(),
        {
            expiresIn: "7d",
            jwtid: crypto.randomUUID(),
        },
    );
}

function verifyToken(token) {
    return jwt.verify(token, getJwtSecret());
}

module.exports = {
    createToken,
    verifyToken,
};