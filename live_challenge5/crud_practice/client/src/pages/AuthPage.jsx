import { useState } from "react";
import { login, signup } from "../api/authApi";
import AuthForm from "../components/AuthForm";
import { saveToken } from "../utils/tokenStorage";

function AuthPage({ onAuthenticated }) {
    const [mode, setMode] = useState("login");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit({
        email,
        password,
        nickname,
    }) {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const data =
                mode === "signup"
                    ? await signup(
                          email,
                          password,
                          nickname,
                      )
                    : await login(email, password);

            if (!data?.token || !data?.user) {
                throw new Error(
                    "인증 응답이 올바르지 않습니다.",
                );
            }

            saveToken(data.token);
            onAuthenticated(data.user);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleModeChange(nextMode) {
        setMode(nextMode);
        setErrorMessage("");
    }

    return (
        <>
        <section className="app-header">
            <h1>학습 기록 관리 앱</h1>
            <p>React + Express + SQLite 기반 CRUD 실습</p>
        </section>
        <section className="auth-section">
            <AuthForm
                mode={mode}
                onSubmit={handleSubmit}
                onModeChange={handleModeChange}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
            />
        </section>
        </>
    );
}

export default AuthPage;