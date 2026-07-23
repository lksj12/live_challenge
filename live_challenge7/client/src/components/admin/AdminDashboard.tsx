import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Database,
  FileText,
  KeyRound,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import { logoutUser } from '../../store/authSlice';
import {
  deleteAdminUser,
  fetchAdminUsers,
  resetAdminUserPassword,
} from '../../store/adminSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { ManagedUser } from '../../types/admin';
import { ThemeToggle } from '../common/ThemeToggle';
import { useDialogFocus } from '../../hooks/useDialogFocus';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function AdminDashboard() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const admin = useAppSelector((state) => state.admin);
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  useEffect(() => {
    void dispatch(fetchAdminUsers());
  }, [dispatch]);

  const totals = useMemo(
    () =>
      admin.users.reduce(
        (result, user) => ({
          notes: result.notes + user.noteCount,
          bytes: result.bytes + user.storageBytes,
        }),
        { notes: 0, bytes: 0 },
      ),
    [admin.users],
  );

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="sidebar-brand-icon" aria-hidden="true">
            <ShieldCheck size={22} />
          </span>
          <span>
            <strong>Keeply 관리자</strong>
            <small>{auth.user?.email}</small>
          </span>
        </div>
        <div className="admin-header-actions">
          <ThemeToggle />
          <button
            type="button"
            className="header-action"
            disabled={auth.isSubmitting}
            onClick={() => void dispatch(logoutUser())}
          >
            <LogOut size={18} />
            {auth.isSubmitting ? '로그아웃 중' : '로그아웃'}
          </button>
        </div>
      </header>

      <section className="admin-main">
        <div className="admin-title-row">
          <div>
            <h1>사용자 관리</h1>
            <p>일반 사용자 계정과 노트 사용량을 관리합니다.</p>
          </div>
          <button
            type="button"
            className="secondary-button"
            disabled={admin.loadState === 'loading'}
            onClick={() => void dispatch(fetchAdminUsers())}
          >
            <RefreshCw size={16} />
            새로고침
          </button>
        </div>

        <div className="admin-metrics" aria-label="전체 사용 현황">
          <div>
            <Users size={20} aria-hidden="true" />
            <span>일반 사용자</span>
            <strong>{admin.users.length.toLocaleString('ko-KR')}명</strong>
          </div>
          <div>
            <FileText size={20} aria-hidden="true" />
            <span>전체 노트</span>
            <strong>{totals.notes.toLocaleString('ko-KR')}개</strong>
          </div>
          <div>
            <Database size={20} aria-hidden="true" />
            <span>전체 용량</span>
            <strong>{formatBytes(totals.bytes)}</strong>
          </div>
        </div>

        {admin.error !== null && (
          <p className="workspace-error admin-error" role="alert">
            {admin.error}
          </p>
        )}

        <section className="admin-table-section" aria-labelledby="users-title">
          <div className="admin-table-heading">
            <h2 id="users-title">일반 사용자</h2>
            <span>{admin.users.length}명</span>
          </div>

          {admin.loadState === 'loading' && admin.users.length === 0 ? (
            <p className="admin-table-state">사용자를 불러오는 중...</p>
          ) : admin.users.length === 0 ? (
            <p className="admin-table-state">등록된 일반 사용자가 없습니다.</p>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">사용자</th>
                    <th scope="col">노트</th>
                    <th scope="col">용량</th>
                    <th scope="col">최근 로그인</th>
                    <th scope="col">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {admin.users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.displayName}</strong>
                        <small>{user.email}</small>
                      </td>
                      <td>{user.noteCount.toLocaleString('ko-KR')}개</td>
                      <td>{formatBytes(user.storageBytes)}</td>
                      <td>
                        {user.lastLoginAt === null
                          ? '로그인 기록 없음'
                          : dateFormatter.format(
                              new Date(user.lastLoginAt),
                            )}
                      </td>
                      <td>
                        <span className="admin-row-actions">
                          <button
                            type="button"
                            className="icon-button"
                            title="비밀번호 초기화"
                            aria-label={`${user.displayName} 비밀번호 초기화`}
                            onClick={() => setResetTarget(user)}
                          >
                            <KeyRound size={17} />
                          </button>
                          <button
                            type="button"
                            className="icon-button admin-delete-icon"
                            title="사용자 삭제"
                            aria-label={`${user.displayName} 사용자 삭제`}
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {resetTarget !== null && (
        <PasswordResetDialog
          user={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
      {deleteTarget !== null && (
        <UserDeleteDialog
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}

function PasswordResetDialog({
  user,
  onClose,
}: {
  user: ManagedUser;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const isResetting = useAppSelector(
    (state) => state.admin.mutationState === 'resetting',
  );
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useDialogFocus<HTMLElement>(
    true,
    isResetting ? undefined : onClose,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 10) {
      setError('새 비밀번호는 10자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmation) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      await dispatch(
        resetAdminUserPassword({
          userId: user.id,
          newPassword: password,
        }),
      ).unwrap();
      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : '비밀번호를 초기화하지 못했습니다.',
      );
    }
  };

  return (
    <div className="dialog-backdrop">
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-reset-title"
      >
        <header className="dialog-header">
          <h2 id="password-reset-title">비밀번호 초기화</h2>
          <button
            type="button"
            className="icon-button"
            title="닫기"
            aria-label="비밀번호 초기화 닫기"
            disabled={isResetting}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>
        <form className="admin-dialog-form" onSubmit={handleSubmit}>
          <p>
            <strong>{user.displayName}</strong>의 새 비밀번호를 설정합니다.
            기존 로그인 세션은 모두 해제됩니다.
          </p>
          <label className="field">
            <span>새 비밀번호</span>
            <input
              data-autofocus
              type="password"
              aria-invalid={error !== null}
              aria-describedby={
                error === null ? undefined : 'password-reset-error'
              }
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              minLength={10}
              required
            />
          </label>
          <label className="field">
            <span>새 비밀번호 확인</span>
            <input
              type="password"
              aria-invalid={error !== null}
              aria-describedby={
                error === null ? undefined : 'password-reset-error'
              }
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setError(null);
              }}
              minLength={10}
              required
            />
          </label>
          {error !== null && (
            <p
              id="password-reset-error"
              className="form-error"
              role="alert"
            >
              {error}
            </p>
          )}
          <footer className="dialog-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={isResetting}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="primary-button dialog-primary"
              disabled={isResetting}
            >
              <KeyRound size={18} />
              {isResetting ? '초기화 중...' : '비밀번호 초기화'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function UserDeleteDialog({
  user,
  onClose,
}: {
  user: ManagedUser;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const isDeleting = useAppSelector(
    (state) => state.admin.mutationState === 'deleting',
  );
  const dialogRef = useDialogFocus<HTMLElement>(
    true,
    isDeleting ? undefined : onClose,
  );

  const handleDelete = async () => {
    try {
      await dispatch(deleteAdminUser(user.id)).unwrap();
      onClose();
    } catch {
      // The dashboard error banner reports the failed request.
    }
  };

  return (
    <div className="dialog-backdrop">
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="user-delete-title"
      >
        <header className="dialog-header">
          <h2 id="user-delete-title">사용자를 삭제할까요?</h2>
          <button
            data-autofocus
            type="button"
            className="icon-button"
            title="닫기"
            aria-label="사용자 삭제 닫기"
            disabled={isDeleting}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>
        <p>
          <strong>{user.displayName}</strong>의 로그인 정보와 노트{' '}
          {user.noteCount}개가 모두 영구 삭제됩니다.
        </p>
        <footer className="dialog-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={isDeleting}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="danger-button"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            <Trash2 size={18} />
            {isDeleting ? '삭제 중...' : '사용자 삭제'}
          </button>
        </footer>
      </section>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1_024) {
    return `${bytes.toLocaleString('ko-KR')} B`;
  }
  if (bytes < 1_048_576) {
    return `${(bytes / 1_024).toFixed(1)} KB`;
  }
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}
