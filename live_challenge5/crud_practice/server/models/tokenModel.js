const db = require("../db");

function revokeToken(jti, expiresAt) {
    return db
        .prepare(
            `
            INSERT OR REPLACE INTO revoked_tokens (
                jti,
                expires_at
            )
            VALUES (?, ?)
            `,
        )
        .run(jti, expiresAt);
}

function isTokenRevoked(jti) {
    const row = db
        .prepare(
            `
            SELECT jti
            FROM revoked_tokens
            WHERE jti = ?
            `,
        )
        .get(jti);

    return Boolean(row);
}

function deleteExpiredRevokedTokens() {
    const currentTime = Math.floor(Date.now() / 1000);

    return db
        .prepare(
            `
            DELETE FROM revoked_tokens
            WHERE expires_at <= ?
            `,
        )
        .run(currentTime);
}

module.exports = {
    revokeToken,
    isTokenRevoked,
    deleteExpiredRevokedTokens,
};