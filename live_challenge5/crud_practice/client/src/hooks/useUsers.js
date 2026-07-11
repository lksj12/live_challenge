import { useEffect, useState } from "react";
import { deleteUser, getUsers } from "../api/adminApi";

function useUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadUsers() {
            try {
                setErrorMessage("");

                const data = await getUsers();

                setUsers(data);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadUsers();
    }, []);

    async function handleDeleteUser(id) {
        const targetUser = users.find((user) => user.id === id);

        const isConfirmed = window.confirm(
            `${targetUser?.email || "해당 사용자"} 계정을 삭제하시겠습니까?`,
        );

        if (!isConfirmed) {
            return;
        }

        try {
            await deleteUser(id);

            setUsers((prevUsers) =>
                prevUsers.filter((user) => user.id !== id),
            );
        } catch (error) {
            alert(error.message);
        }
    }

    return {
        users,
        isLoading,
        errorMessage,
        handleDeleteUser,
    };
}

export default useUsers;