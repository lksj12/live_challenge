import { useEffect, useState } from "react";
import {
    deleteMyAccount,
    getMe,
    logout,
} from "../api/authApi";
import {
    getToken,
    removeToken,
} from "../utils/tokenStorage";

function useAuth() {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        async function restoreUser() {
            const token = getToken();

            if (!token) {
                setIsAuthLoading(false);
                return;
            }

            try {
                const data = await getMe();
                setUser(data.user);
            } catch {
                removeToken();
                setUser(null);
            } finally {
                setIsAuthLoading(false);
            }
        }

        restoreUser();
    }, []);

    function handleAuthenticated(authenticatedUser) {
        setUser(authenticatedUser);
    }

    async function handleLogout() {
    try {
        await logout();
        removeToken();
        setUser(null);
    } catch (error) {
        alert(error.message);
    }
}

    async function handleDeleteAccount() {
        const isConfirmed = window.confirm(
            "회원 탈퇴 시 모든 학습 기록이 삭제됩니다. 정말 탈퇴하시겠습니까?",
        );

        if (!isConfirmed) {
            return false;
        }

        try {
            await deleteMyAccount();

            removeToken();
            setUser(null);

            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    return {
        user,
        isAuthLoading,
        handleAuthenticated,
        handleLogout,
        handleDeleteAccount,
    };
}

export default useAuth;