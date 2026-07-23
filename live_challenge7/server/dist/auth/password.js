import argon2 from 'argon2';
const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
};
export function hashPassword(password) {
    return argon2.hash(password, ARGON2_OPTIONS);
}
export async function verifyPassword(passwordHash, password) {
    try {
        return await argon2.verify(passwordHash, password);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=password.js.map