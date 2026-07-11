import UserList from "../components/UserList";
import useUsers from "../hooks/useUsers";

function AdminPage({ currentUser }) {
    const {
        users,
        isLoading,
        errorMessage,
        handleDeleteUser,
    } = useUsers();

    return (
        <>
            <section className="app-header">
                <h1>관리자 페이지</h1>
                <p>등록된 사용자 계정을 조회하고 삭제할 수 있습니다.</p>
            </section>

            <UserList
                users={users}
                currentUserId={currentUser.id}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onDelete={handleDeleteUser}
            />
        </>
    );
}

export default AdminPage;