import { useState } from "react";

function AuthForm({
    mode,
    onSubmit,
    onModeChange,
    isSubmitting = false,
    errorMessage = "",
}) {
    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");

    const isSignup = mode === "signup";

    function handleSubmit(event) {
        event.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedNickname = nickname.trim();

        if (normalizedEmail === "") {
            alert("이메일을 입력해주세요.");
            return;
        }

        if (isSignup && normalizedNickname === "") {
            alert("닉네임을 입력해주세요.");
            return;
        }

        if (
            isSignup &&
            normalizedNickname.toLowerCase() === "admin"
        ) {
            alert("Admin 닉네임은 사용할 수 없습니다.");
            return;
        }

        if (password.length < 6) {
            alert("비밀번호는 6자 이상이어야 합니다.");
            return;
        }

        onSubmit({
            email: normalizedEmail,
            password,
            nickname: isSignup ? normalizedNickname : undefined,
        });
    }

    function handleModeChange() {
        setEmail("");
        setPassword("");
        setNickname("");

        onModeChange(isSignup ? "login" : "signup");
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h1>{isSignup ? "회원가입" : "로그인"}</h1>

            <p>
                {isSignup
                    ? "일반 사용자 계정을 생성합니다."
                    : "계정 정보를 입력해주세요."}
            </p>

            <label>
                이메일
                <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    placeholder="user@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                />
            </label>

            {isSignup && (
                <label>
                    닉네임
                    <input
                        type="text"
                        value={nickname}
                        onChange={(event) =>
                            setNickname(event.target.value)
                        }
                        placeholder="사용할 닉네임"
                        autoComplete="nickname"
                        disabled={isSubmitting}
                    />
                </label>
            )}

            <label>
                비밀번호
                <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    placeholder="6자 이상 입력"
                    autoComplete={
                        isSignup
                            ? "new-password"
                            : "current-password"
                    }
                    disabled={isSubmitting}
                />
            </label>

            {errorMessage && (
                <p className="error-message">
                    {errorMessage}
                </p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? "처리 중..."
                    : isSignup
                      ? "회원가입"
                      : "로그인"}
            </button>

            <button
                type="button"
                className="auth-mode-button"
                onClick={handleModeChange}
                disabled={isSubmitting}
            >
                {isSignup
                    ? "이미 계정이 있나요? 로그인"
                    : "계정이 없나요? 회원가입"}
            </button>
        </form>
    );
}

export default AuthForm;