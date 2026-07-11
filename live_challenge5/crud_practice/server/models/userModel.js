const db = require("../db");

function findUserByEmail(email) {
    return db
        .prepare(
            `
            SELECT
                id,
                email,
                password_hash AS passwordHash,
                nickname,
                role,
                created_at AS createdAt
            FROM users
            WHERE email = ?
            `,
        )
        .get(email);
}

function findUserById(id) {
    return db
        .prepare(
            `
            SELECT
                id,
                email,
                nickname,
                role,
                created_at AS createdAt
            FROM users
            WHERE id = ?
            `,
        )
        .get(id);
}

function createUser(email, passwordHash, nickname, role = "user") {
    const savedNickname =
        role === "admin" ? "Admin" : nickname.trim();

    const result = db
        .prepare(
            `
            INSERT INTO users (
                email,
                password_hash,
                nickname,
                role
            )
            VALUES (?, ?, ?, ?)
            `,
        )
        .run(
            email,
            passwordHash,
            savedNickname,
            role,
        );

    return {
        id: result.lastInsertRowid,
        email,
        nickname: savedNickname,
        role,
    };
}

function findAllUsers() {
    return db
        .prepare(
            `
            SELECT
                id,
                email,
                nickname,
                role,
                created_at AS createdAt
            FROM users
            ORDER BY id ASC
            `,
        )
        .all();
}

function deleteUserById(id) {
    return db
        .prepare(
            `
            DELETE FROM users
            WHERE id = ?
            `,
        )
        .run(id);
}

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    findAllUsers,
    deleteUserById,
};