import { formatDateTime } from "../utils/dateUtils";

function UserCard({
    user,
    currentUserId,
    onDelete,
}) {
    const isCurrentUser = user.id === currentUserId;
    const roleLabel =
        user.role === "admin" ? "관리자" : "일반 사용자";

    return (
        <li className="user-card">
            <div className="user-card-info">
                <strong>{user.nickname}</strong>

                <span>이메일: {user.email}</span>
                <span>사용자 ID: {user.id}</span>
                <span>권한: {roleLabel}</span>
                <span>
                    가입일: {formatDateTime(user.createdAt)}
                </span>
            </div>

            <button
                type="button"
                className="user-delete-button"
                onClick={() => onDelete(user.id)}
                disabled={isCurrentUser}
            >
                {isCurrentUser
                    ? "현재 계정"
                    : "계정 삭제"}
            </button>
        </li>
    );
}

export default UserCard;