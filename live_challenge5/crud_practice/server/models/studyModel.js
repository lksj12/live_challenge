const db = require("../db");

function findStudiesByUserId(userId) {
    return db
        .prepare(
            `
            SELECT
                id,
                title,
                study_minutes AS studyMinutes,
                understanding,
                memo,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM studies
            WHERE user_id = ?
            ORDER BY id DESC
            `,
        )
        .all(userId);
}

function createStudy(userId, studyData) {
    const { title, studyMinutes, understanding, memo } = studyData;

    const result = db
        .prepare(
            `
            INSERT INTO studies (
                user_id,
                title,
                study_minutes,
                understanding,
                memo
            )
            VALUES (?, ?, ?, ?, ?)
            `,
        )
        .run(
            userId,
            title.trim(),
            studyMinutes,
            understanding || "보통",
            memo || "",
        );

    return findStudyByIdAndUserId(result.lastInsertRowid, userId);
}

function findStudyByIdAndUserId(id, userId) {
    return db
        .prepare(
            `
            SELECT
                id,
                title,
                study_minutes AS studyMinutes,
                understanding,
                memo,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM studies
            WHERE id = ?
            AND user_id = ?
            `,
        )
        .get(id, userId);
}

function updateStudy(id, userId, studyData) {
    const { title, studyMinutes, understanding, memo } = studyData;

    db.prepare(
        `
        UPDATE studies
        SET
            title = ?,
            study_minutes = ?,
            understanding = ?,
            memo = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        AND user_id = ?
        `,
    ).run(
        title.trim(),
        studyMinutes,
        understanding || "보통",
        memo || "",
        id,
        userId,
    );

    return findStudyByIdAndUserId(id, userId);
}

function deleteStudy(id, userId) {
    return db
        .prepare(
            `
            DELETE FROM studies
            WHERE id = ?
            AND user_id = ?
            `,
        )
        .run(id, userId);
}

module.exports = {
    findStudiesByUserId,
    createStudy,
    findStudyByIdAndUserId,
    updateStudy,
    deleteStudy,
};