import {
  type FormEvent,
  type KeyboardEvent,
  useState,
} from 'react';
import {
  Eye,
  EyeOff,
  FileText,
  LogIn,
  UserRound,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  continueAsGuest,
  dismissAuthError,
  loginUser,
  registerUser,
} from '../../store/authSlice';
import { ThemeToggle } from '../common/ThemeToggle';

type AuthMode = 'login' | 'register';

export function AuthScreen() {
  const dispatch = useAppDispatch();
  const { error, isSubmitting } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    dispatch(dismissAuthError());
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const nextMode = mode === 'login' ? 'register' : 'login';
    changeMode(nextMode);
    window.requestAnimationFrame(() => {
      document.getElementById(`auth-${nextMode}-tab`)?.focus();
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'login') {
      void dispatch(loginUser({ email, password }));
      return;
    }

    void dispatch(registerUser({ email, displayName, password }));
  };

  return (
    <main className="auth-screen">
      <ThemeToggle className="auth-theme-toggle" />
      <section className="auth-brand-panel" aria-label="Keeply">
        <div className="auth-brand">
          <span className="auth-brand-icon" aria-hidden="true">
            <FileText size={27} strokeWidth={2.2} />
          </span>
          <span>Keeply</span>
        </div>
        <div className="note-motif" aria-hidden="true">
          <span className="note-motif-card note-motif-card-blue" />
          <span className="note-motif-card note-motif-card-yellow" />
          <span className="note-motif-card note-motif-card-coral" />
        </div>
        <p className="auth-brand-copy">
          <span>생각을 놓치지 않는</span>
          <span>가장 조용한 공간</span>
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <p className="auth-kicker">
              {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </p>
            <h1>{mode === 'login' ? '다시 만나 반가워요' : '계정을 만들어요'}</h1>
            <p>
              {mode === 'login'
                ? '계속하려면 계정에 로그인하세요.'
                : '노트를 안전하게 보관할 계정을 만드세요.'}
            </p>
          </div>

          <div
            className="auth-tabs"
            role="tablist"
            aria-label="인증 방식"
            onKeyDown={handleTabKeyDown}
          >
            <button
              id="auth-login-tab"
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              tabIndex={mode === 'login' ? 0 : -1}
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => changeMode('login')}
            >
              로그인
            </button>
            <button
              id="auth-register-tab"
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              tabIndex={mode === 'register' ? 0 : -1}
              className={mode === 'register' ? 'is-active' : ''}
              onClick={() => changeMode('register')}
            >
              회원가입
            </button>
          </div>

          <form
            className="auth-form"
            aria-busy={isSubmitting}
            aria-describedby={error === null ? undefined : 'auth-error'}
            onSubmit={handleSubmit}
          >
            {mode === 'register' && (
              <label className="field">
                <span>이름</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="name"
                  minLength={2}
                  maxLength={50}
                  placeholder="노트에 표시할 이름"
                  required
                />
              </label>
            )}

            <label className="field">
              <span>이메일</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                maxLength={254}
                placeholder="name@example.com"
                required
              />
            </label>

            <label className="field">
              <span>비밀번호</span>
              <span className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  minLength={mode === 'register' ? 10 : 1}
                  maxLength={128}
                  placeholder={
                    mode === 'register' ? '10자 이상 입력' : '비밀번호 입력'
                  }
                  required
                />
                <button
                  type="button"
                  className="icon-button password-toggle"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </label>

            {error !== null && (
              <p id="auth-error" className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              <LogIn size={18} aria-hidden="true" />
              {isSubmitting
                ? '처리 중...'
                : mode === 'login'
                  ? '로그인'
                  : '계정 만들기'}
            </button>
          </form>

          <div className="auth-divider">
            <span>또는</span>
          </div>

          <button
            type="button"
            className="guest-button"
            onClick={() => dispatch(continueAsGuest())}
          >
            <UserRound size={18} aria-hidden="true" />
            비회원으로 시작
          </button>
        </div>
      </section>
    </main>
  );
}
