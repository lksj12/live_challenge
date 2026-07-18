import {
    useState,
    type FormEvent,
} from 'react';
import {
    Navigate,
    useLocation,
    useNavigate,
} from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import {
    clearAuthError,
    clearRegistrationMessage,
    loginAccount,
    registerAccount,
    selectAuthError,
    selectAuthStatus,
    selectCurrentUser,
    selectRegistrationMessage,
} from '../features/auth/authSlice';
import type {
    AuthUser,
} from '../types/auth';
import './AuthPage.css';

type AuthMode =
    | 'login'
    | 'register';

interface AuthLocationState {
    from?: string;
}

function getRequestedPath(
    state: AuthLocationState | null,
): string {
    const requestedPath = state?.from;

    if (
        typeof requestedPath !== 'string'
        || !requestedPath.startsWith('/')
        || requestedPath === '/auth'
    ) {
        return '/';
    }

    return requestedPath;
}

function getPostAuthPath(
    user: AuthUser,
    requestedPath: string,
): string {
    if (user.mustChangePassword) {
        return '/account';
    }

    if (user.role === 'admin') {
        return '/admin';
    }

    return requestedPath;
}

export default function AuthPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const authStatus = useAppSelector(
        selectAuthStatus,
    );

    const authError = useAppSelector(
        selectAuthError,
    );

    const registrationMessage = useAppSelector(
        selectRegistrationMessage,
    );

    const [mode, setMode] =
        useState<AuthMode>('login');

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [nickname, setNickname] =
        useState('');

    const isLoading =
        authStatus === 'loading';

    const isLoginMode =
        mode === 'login';

    const locationState =
        location.state as AuthLocationState | null;

    const requestedPath =
        getRequestedPath(locationState);

    /*
     * 이미 로그인된 상태에서 /auth로 접근하거나
     * 로그인 직후 Redux 상태가 변경되면 알맞은 페이지로 이동한다.
     */
    if (currentUser) {
        return (
            <Navigate
                to={getPostAuthPath(
                    currentUser,
                    requestedPath,
                )}
                replace
            />
        );
    }

    function changeMode(
        nextMode: AuthMode,
    ): void {
        setMode(nextMode);
        setPassword('');

        dispatch(clearAuthError());

        if (nextMode === 'register') {
            dispatch(
                clearRegistrationMessage(),
            );
        }
    }

    async function handleLogin(): Promise<void> {
        dispatch(
            clearRegistrationMessage(),
        );

        const response = await dispatch(
            loginAccount({
                email,
                password,
            }),
        ).unwrap();

        navigate(
            getPostAuthPath(
                response.user,
                requestedPath,
            ),
            {
                replace: true,
            },
        );
    }

    async function handleRegister(): Promise<void> {
        /*
         * 회원가입 완료 후 같은 이메일과 비밀번호로
         * 자동 로그인한다.
         *
         * 이후 App의 장바구니 소유자 변경 로직이
         * 비회원 장바구니를 새 계정으로 이전한다.
         */
        await dispatch(
            registerAccount({
                email,
                password,
                nickname,
            }),
        ).unwrap();

        const loginResponse = await dispatch(
            loginAccount({
                email,
                password,
            }),
        ).unwrap();

        navigate(
            getPostAuthPath(
                loginResponse.user,
                requestedPath,
            ),
            {
                replace: true,
            },
        );
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();

        dispatch(clearAuthError());

        try {
            if (isLoginMode) {
                await handleLogin();
                return;
            }

            await handleRegister();
        } catch {
            /*
             * 오류 메시지는 authSlice에 저장되어
             * 아래 authError 영역에 표시된다.
             */
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-heading">
                    <p className="auth-eyebrow">
                        React Shopping Mall
                    </p>

                    <h1>
                        {isLoginMode
                            ? '로그인'
                            : '회원가입'}
                    </h1>

                    <p>
                        {isLoginMode
                            ? '등록한 계정으로 로그인해 주세요.'
                            : '쇼핑몰에서 사용할 계정을 만들어 주세요.'}
                    </p>
                </div>

                <div
                    className="auth-tabs"
                    role="tablist"
                    aria-label="인증 방식"
                >
                    <button
                        type="button"
                        className={
                            isLoginMode
                                ? 'auth-tab active'
                                : 'auth-tab'
                        }
                        aria-pressed={isLoginMode}
                        disabled={isLoading}
                        onClick={() => {
                            changeMode('login');
                        }}
                    >
                        로그인
                    </button>

                    <button
                        type="button"
                        className={
                            !isLoginMode
                                ? 'auth-tab active'
                                : 'auth-tab'
                        }
                        aria-pressed={!isLoginMode}
                        disabled={isLoading}
                        onClick={() => {
                            changeMode('register');
                        }}
                    >
                        회원가입
                    </button>
                </div>

                {registrationMessage
                    && isLoginMode
                    && (
                        <p
                            className="auth-message success"
                            role="status"
                        >
                            {registrationMessage}
                        </p>
                    )}

                {authError && (
                    <p
                        className="auth-message error"
                        role="alert"
                    >
                        {authError}
                    </p>
                )}

                <form
                    className="auth-form"
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                >
                    {!isLoginMode && (
                        <label className="auth-field">
                            <span>닉네임</span>

                            <input
                                type="text"
                                value={nickname}
                                minLength={2}
                                maxLength={20}
                                autoComplete="nickname"
                                placeholder="2자 이상 20자 이하"
                                disabled={isLoading}
                                required
                                onChange={(event) => {
                                    setNickname(
                                        event.target.value,
                                    );
                                }}
                            />
                        </label>
                    )}

                    <label className="auth-field">
                        <span>이메일</span>

                        <input
                            type="email"
                            value={email}
                            autoComplete="email"
                            placeholder="test@example.com"
                            disabled={isLoading}
                            required
                            onChange={(event) => {
                                setEmail(
                                    event.target.value,
                                );
                            }}
                        />
                    </label>

                    <label className="auth-field">
                        <span>비밀번호</span>

                        <input
                            type="password"
                            value={password}
                            minLength={8}
                            autoComplete={
                                isLoginMode
                                    ? 'current-password'
                                    : 'new-password'
                            }
                            placeholder="8자 이상 입력"
                            disabled={isLoading}
                            required
                            onChange={(event) => {
                                setPassword(
                                    event.target.value,
                                );
                            }}
                        />
                    </label>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? '처리 중...'
                            : isLoginMode
                                ? '로그인'
                                : '회원가입'}
                    </button>
                </form>
            </section>
        </main>
    );
}
