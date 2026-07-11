const path = require("path");
const bcrypt = require("bcryptjs");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env"),
});

const {
    findUserByEmail,
    createUser,
} = require("../models/userModel");

async function createAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL
            ?.trim()
            .toLowerCase();

        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail) {
            throw new Error("ADMIN_EMAIL이 설정되지 않았습니다.");
        }

        if (!adminPassword || adminPassword.length < 6) {
            throw new Error(
                "ADMIN_PASSWORD는 6자 이상으로 설정해야 합니다.",
            );
        }

        const existingUser = findUserByEmail(adminEmail);

        if (existingUser) {
            if (existingUser.role === "admin") {
                console.log("이미 등록된 관리자 계정입니다.");
                return;
            }

            throw new Error(
                "해당 이메일은 이미 일반 사용자 계정으로 등록되어 있습니다.",
            );
        }

        const passwordHash = await bcrypt.hash(
            adminPassword,
            10,
        );

        const admin = createUser(
            adminEmail,
            passwordHash,
            "Admin",
            "admin",
        );

        console.log("관리자 계정이 생성되었습니다.");
        console.log({
            id: admin.id,
            email: admin.email,
            nickname: admin.nickname,
            role: admin.role,
        });
    } catch (error) {
        console.error("관리자 생성 실패:", error.message);
        process.exitCode = 1;
    }
}

createAdmin();