import "./App.css";
import UserHeader from "./components/UserHeader";
import useAuth from "./hooks/useAuth";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import StudyPage from "./pages/StudyPage";

function App() {
    const {
        user,
        isAuthLoading,
        handleAuthenticated,
        handleLogout,
        handleDeleteAccount,
    } = useAuth();

    if (isAuthLoading) {
        return (
            <main className="app">
                <section className="app-header">
                    <p>로그인 정보를 확인하는 중입니다...</p>
                </section>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="app">
                <AuthPage
                    onAuthenticated={handleAuthenticated}
                />
            </main>
        );
    }

    return (
        <main className="app">
            <UserHeader
                user={user}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
            />

            {user.role === "admin" ? (
                <AdminPage currentUser={user} />
            ) : (
                <StudyPage />
            )}
        </main>
    );
}

export default App;