function UserHeader({
    user,
    onLogout,
    onDeleteAccount,
}) {
    return (
        <section className="account-bar">
            <div className="account-info">
                <strong>{user.nickname}</strong>
                <span>{user.email}</span>
            </div>

            <div className="account-actions">
                <button
                    type="button"
                    className="logout-button"
                    onClick={onLogout}
                >
                    로그아웃
                </button>

                <button
                    type="button"
                    className="account-delete-button"
                    onClick={onDeleteAccount}
                >
                    회원 탈퇴
                </button>
            </div>
        </section>
    );
}

export default UserHeader;