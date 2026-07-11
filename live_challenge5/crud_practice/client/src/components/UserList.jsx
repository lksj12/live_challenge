import UserCard from "./UserCard";

function UserList({
    users,
    currentUserId,
    isLoading,
    errorMessage,
    onDelete,
}) {
    return (
        <section className="study-section">
            <h2>사용자 계정 목록</h2>

            {isLoading && <p>사용자 목록을 불러오는 중입니다...</p>}

            {errorMessage && (
                <p className="error-message">{errorMessage}</p>
            )}

            {!isLoading && !errorMessage && users.length === 0 && (
                <p>등록된 사용자가 없습니다.</p>
            )}

            {!isLoading && !errorMessage && users.length > 0 && (
                <ul className="user-list">
                    {users.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            currentUserId={currentUserId}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

export default UserList;