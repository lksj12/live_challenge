import {
    type FormEvent,
    useState,
} from 'react';
import {
    Navigate,
    useNavigate,
} from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import {
    logout,
    markPasswordChangeCompleted,
    selectAuthToken,
    selectCurrentUser,
} from '../features/auth/authSlice';
import {
    ApiRequestError,
    changeUserPassword,
    deleteUserAccount,
} from '../services/authApi';
import './AccountPage.css';

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return '요청 처리 중 알 수 없는 오류가 발생했습니다.';
}

export default function AccountPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const token = useAppSelector(
        selectAuthToken,
    );

    const [currentPassword, setCurrentPassword] =
        useState('');

    const [newPassword, setNewPassword] =
        useState('');

    const [
        newPasswordConfirmation,
        setNewPasswordConfirmation,
    ] = useState('');

    const [deletePassword, setDeletePassword] =
        useState('');

    const [passwordMessage, setPasswordMessage] =
        useState<string | null>(null);

    const [passwordError, setPasswordError] =
        useState<string | null>(null);

    const [deleteError, setDeleteError] =
        useState<string | null>(null);

    const [isChangingPassword, setIsChangingPassword] =
        useState(false);

    const [isDeletingAccount, setIsDeletingAccount] =
        useState(false);

    if (!currentUser || !token) {
        return (
            <Navigate
                to="/auth"
                replace
            />
        );
    }

    const authenticatedUser = currentUser;
    const authToken = token;

    async function handlePasswordSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setPasswordMessage(null);
        setPasswordError(null);

        if (newPassword.length < 8) {
            setPasswordError(
                '새 비밀번호는 8자 이상이어야 합니다.',
            );
            return;
        }

        if (newPassword !== newPasswordConfirmation) {
            setPasswordError(
                '새 비밀번호 확인이 일치하지 않습니다.',
            );
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
            );
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await changeUserPassword(
                authToken,
                {
                    currentPassword,
                    newPassword,
                },
            );

            dispatch(
                markPasswordChangeCompleted(),
            );

            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirmation('');
            setPasswordMessage(response.message);
        } catch (error) {
            setPasswordError(
                getErrorMessage(error),
            );
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleDeleteAccount(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setDeleteError(null);

        if (authenticatedUser.role === 'admin') {
            setDeleteError(
                '관리자 계정은 이 화면에서 탈퇴할 수 없습니다.',
            );
            return;
        }

        if (!deletePassword) {
            setDeleteError(
                '현재 비밀번호를 입력해 주세요.',
            );
            return;
        }

        const confirmed = window.confirm(
            '회원 탈퇴 시 계정과 구매 내역이 모두 삭제됩니다. 계속하시겠습니까?',
        );

        if (!confirmed) {
            return;
        }

        setIsDeletingAccount(true);

        try {
            const response = await deleteUserAccount(
                authToken,
                {
                    password: deletePassword,
                },
            );

            window.alert(response.message);

            dispatch(logout());

            navigate(
                '/',
                {
                    replace: true,
                },
            );
        } catch (error) {
            setDeleteError(
                getErrorMessage(error),
            );
        } finally {
            setIsDeletingAccount(false);
        }
    }

    return (
        <main className="account-page">
            <div className="account-page-inner">
                <header className="account-page-header">
                    <p className="account-page-eyebrow">
                        MY ACCOUNT
                    </p>

                    <h1>계정 관리</h1>

                    <p>
                        사용자 정보와 비밀번호를 관리할 수 있습니다.
                    </p>
                </header>

                {currentUser.mustChangePassword && (
                    <section
                        className="forced-password-notice"
                        role="alert"
                    >
                        <strong>
                            비밀번호 변경이 필요합니다.
                        </strong>

                        <p>
                            관리자가 발급한 임시 비밀번호로
                            로그인했습니다. 아래에서 새 비밀번호를
                            설정해 주세요.
                        </p>
                    </section>
                )}

                <section className="account-card">
                    <h2>사용자 정보</h2>

                    <dl className="account-information">
                        <div>
                            <dt>닉네임</dt>
                            <dd>{currentUser.nickname}</dd>
                        </div>

                        <div>
                            <dt>이메일</dt>
                            <dd>{currentUser.email}</dd>
                        </div>

                        <div>
                            <dt>계정 유형</dt>
                            <dd>
                                {currentUser.role === 'admin'
                                    ? '관리자'
                                    : '일반 사용자'}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="account-card">
                    <h2>비밀번호 변경</h2>

                    <form
                        className="account-form"
                        onSubmit={handlePasswordSubmit}
                    >
                        <label>
                            현재 비밀번호

                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) => {
                                    setCurrentPassword(
                                        event.target.value,
                                    );
                                }}
                                autoComplete="current-password"
                                required
                            />
                        </label>

                        <label>
                            새 비밀번호

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) => {
                                    setNewPassword(
                                        event.target.value,
                                    );
                                }}
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />
                        </label>

                        <label>
                            새 비밀번호 확인

                            <input
                                type="password"
                                value={newPasswordConfirmation}
                                onChange={(event) => {
                                    setNewPasswordConfirmation(
                                        event.target.value,
                                    );
                                }}
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />
                        </label>

                        {passwordError && (
                            <p
                                className="account-form-error"
                                role="alert"
                            >
                                {passwordError}
                            </p>
                        )}

                        {passwordMessage && (
                            <p
                                className="account-form-success"
                                role="status"
                            >
                                {passwordMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="account-primary-button"
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword
                                ? '변경 중...'
                                : '비밀번호 변경'}
                        </button>
                    </form>
                </section>

                <section className="account-card account-danger-card">
                    <h2>회원 탈퇴</h2>

                    {currentUser.role === 'admin' ? (
                        <p className="account-danger-description">
                            관리자 계정은 일반 회원 탈퇴 기능으로
                            삭제할 수 없습니다.
                        </p>
                    ) : (
                        <form
                            className="account-form"
                            onSubmit={handleDeleteAccount}
                        >
                            <p className="account-danger-description">
                                탈퇴하면 계정과 구매 내역이 모두
                                삭제되며 복구할 수 없습니다.
                            </p>

                            <label>
                                현재 비밀번호

                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(event) => {
                                        setDeletePassword(
                                            event.target.value,
                                        );
                                    }}
                                    autoComplete="current-password"
                                    required
                                />
                            </label>

                            {deleteError && (
                                <p
                                    className="account-form-error"
                                    role="alert"
                                >
                                    {deleteError}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="account-danger-button"
                                disabled={isDeletingAccount}
                            >
                                {isDeletingAccount
                                    ? '탈퇴 처리 중...'
                                    : '회원 탈퇴'}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
}
