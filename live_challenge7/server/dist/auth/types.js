export function toPublicUser(user) {
    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
    };
}
//# sourceMappingURL=types.js.map