import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArrowUpDown,
  FileText,
  Lightbulb,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
} from 'lucide-react';

import { DeleteNoteDialog } from '../notes/DeleteNoteDialog';
import { NoteCard } from '../notes/NoteCard';
import { NoteEditor } from '../notes/NoteEditor';
import { NotesLoading } from '../notes/NotesLoading';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser, returnToLogin } from '../../store/authSlice';
import {
  fetchMemberNotes,
  setActiveStatus,
  setActiveTag,
  setGuestNotes,
  setQuery,
  setSortBy,
  updateGuestNote,
  updateMemberNote,
} from '../../store/notesSlice';
import { fetchMemberTags } from '../../store/tagsSlice';
import { loadGuestNotes } from '../../storage/guestNotesStorage';
import type { Note, NoteSort } from '../../types/note';
import { compareNotes } from '../../utils/noteSorting';

export function WorkspaceShell() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const notes = useAppSelector((state) => state.notes);
  const tags = useAppSelector((state) => state.tags);
  const [editingNote, setEditingNote] = useState<Note | null | undefined>();
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const isGuest = auth.status === 'guest';

  useEffect(() => {
    if (isGuest) {
      dispatch(setGuestNotes(loadGuestNotes()));
    } else if (auth.user?.role === 'user') {
      void dispatch(fetchMemberNotes(notes.activeStatus));
      void dispatch(fetchMemberTags());
    }
  }, [
    auth.user?.id,
    auth.user?.role,
    dispatch,
    isGuest,
    notes.activeStatus,
  ]);

  const visibleNotes = useMemo(() => {
    const normalizedQuery = notes.query.trim().toLowerCase();
    const sourceNotes = isGuest ? notes.guestItems : notes.items;
    const queriedNotes =
      normalizedQuery === ''
        ? sourceNotes
        : sourceNotes.filter(
            (note) =>
              note.title.toLowerCase().includes(normalizedQuery) ||
              note.content.toLowerCase().includes(normalizedQuery),
          );
    const filtered =
      notes.activeTag === null
        ? queriedNotes
        : queriedNotes.filter((note) =>
            note.tags.includes(notes.activeTag!),
          );

    return [...filtered].sort((left, right) =>
      compareNotes(left, right, notes.sortBy),
    );
  }, [
    isGuest,
    notes.activeTag,
    notes.guestItems,
    notes.items,
    notes.query,
    notes.sortBy,
  ]);
  const pinnedNotes =
    notes.activeStatus === 'active'
      ? visibleNotes.filter((note) => note.isPinned)
      : [];
  const regularNotes =
    notes.activeStatus === 'active'
      ? visibleNotes.filter((note) => !note.isPinned)
      : visibleNotes;

  const handleTogglePin = (note: Note) => {
    if (isGuest) {
      dispatch(
        updateGuestNote({
          ...note,
          isPinned: !note.isPinned,
          updatedAt: new Date().toISOString(),
        }),
      );
      return;
    }

    void dispatch(
      updateMemberNote({
        noteId: note.id,
        input: { isPinned: !note.isPinned },
      }),
    );
  };

  const moveMemberNote = (note: Note, status: Note['status']) => {
    void dispatch(
      updateMemberNote({
        noteId: note.id,
        input: { status },
      }),
    );
  };

  return (
    <main className="workspace">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon" aria-hidden="true">
            <FileText size={22} />
          </span>
          <span>Keeply</span>
        </div>

        <nav aria-label="노트 메뉴">
          <button
            type="button"
            aria-label="노트 목록"
            aria-current={
              notes.activeStatus === 'active' ? 'page' : undefined
            }
            className={`nav-item${notes.activeStatus === 'active' ? ' is-active' : ''}`}
            onClick={() => dispatch(setActiveStatus('active'))}
          >
            <Lightbulb size={19} aria-hidden="true" />
            <span>노트</span>
          </button>
          <div className="nav-item" aria-disabled="true">
            <Tags size={19} aria-hidden="true" />
            <span>태그</span>
          </div>
          <button
            type="button"
            aria-label="보관함"
            aria-current={
              notes.activeStatus === 'archived' ? 'page' : undefined
            }
            className={`nav-item${notes.activeStatus === 'archived' ? ' is-active' : ''}`}
            disabled={isGuest}
            onClick={() => dispatch(setActiveStatus('archived'))}
          >
            <Archive size={19} aria-hidden="true" />
            <span>보관함</span>
          </button>
          <button
            type="button"
            aria-label="휴지통"
            aria-current={
              notes.activeStatus === 'trashed' ? 'page' : undefined
            }
            className={`nav-item${notes.activeStatus === 'trashed' ? ' is-active' : ''}`}
            disabled={isGuest}
            onClick={() => dispatch(setActiveStatus('trashed'))}
          >
            <Trash2 size={19} aria-hidden="true" />
            <span>휴지통</span>
          </button>
        </nav>

        <div className="sidebar-account">
          <span className="account-avatar" aria-hidden="true">
            {(auth.user?.displayName ?? 'G').slice(0, 1).toUpperCase()}
          </span>
          <span className="account-copy">
            <strong>{auth.user?.displayName ?? '비회원'}</strong>
            <small>{auth.user?.email ?? '브라우저 세션'}</small>
          </span>
        </div>
      </aside>

      <section className="workspace-main">
        <header className="workspace-header">
          <h1>{getWorkspaceTitle(notes.activeStatus)}</h1>
          <div className="workspace-header-actions">
            <ThemeToggle />
            {notes.activeStatus === 'active' &&
              (isGuest || auth.user?.role === 'user') && (
              <button
                type="button"
                className="new-note-button"
                onClick={() => setEditingNote(null)}
              >
                <Plus size={19} aria-hidden="true" />
                새 노트
              </button>
            )}
            <button
              type="button"
              className="header-action"
              disabled={auth.isSubmitting}
              onClick={() => {
                if (isGuest) {
                  dispatch(returnToLogin());
                } else {
                  void dispatch(logoutUser());
                }
              }}
            >
              {isGuest ? (
                <LogIn size={18} aria-hidden="true" />
              ) : (
                <LogOut size={18} aria-hidden="true" />
              )}
              {isGuest
                ? '로그인'
                : auth.isSubmitting
                  ? '로그아웃 중'
                  : '로그아웃'}
            </button>
          </div>
        </header>

        <label className="notes-toolbar">
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">노트 검색</span>
          <input
            type="search"
            value={notes.query}
            onChange={(event) => dispatch(setQuery(event.target.value))}
            placeholder="노트 검색"
          />
        </label>

        {!isGuest && tags.items.length > 0 && (
          <div className="tag-filter-bar" aria-label="태그 필터">
            <button
              type="button"
              className={notes.activeTag === null ? 'is-active' : ''}
              onClick={() => dispatch(setActiveTag(null))}
            >
              전체
            </button>
            {tags.items.map((tag) => (
              <button
                type="button"
                key={tag.id}
                className={notes.activeTag === tag.name ? 'is-active' : ''}
                onClick={() => dispatch(setActiveTag(tag.name))}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        <div className="sort-control">
          <ArrowUpDown size={16} aria-hidden="true" />
          <label htmlFor="note-sort">정렬</label>
          <select
            id="note-sort"
            value={notes.sortBy}
            onChange={(event) =>
              dispatch(setSortBy(event.target.value as NoteSort))
            }
          >
            <option value="updated-desc">최근 수정순</option>
            <option value="created-desc">최근 생성순</option>
            <option value="priority-desc">우선순위 높은순</option>
            <option value="priority-asc">우선순위 낮은순</option>
          </select>
        </div>

        {(auth.error ?? notes.error ?? tags.error) !== null && (
          <div className="workspace-error-row" role="alert">
            <p className="workspace-error">
              {auth.error ?? notes.error ?? tags.error}
            </p>
            {notes.loadState === 'failed' && !isGuest && (
              <button
                type="button"
                className="retry-button"
                onClick={() =>
                  void dispatch(fetchMemberNotes(notes.activeStatus))
                }
              >
                <RefreshCw size={16} />
                다시 시도
              </button>
            )}
          </div>
        )}

        {!isGuest && notes.loadState === 'loading' && notes.items.length === 0 ? (
          <NotesLoading />
        ) : visibleNotes.length > 0 ? (
          <div className="notes-board">
            {pinnedNotes.length > 0 && (
              <NoteSection
                title={`고정된 노트 (${pinnedNotes.length})`}
                notes={pinnedNotes}
                onEdit={setEditingNote}
                onArchive={(note) => moveMemberNote(note, 'archived')}
                onRestore={(note) => moveMemberNote(note, 'active')}
                onTogglePin={handleTogglePin}
                onTrash={setDeletingNote}
              />
            )}
            {regularNotes.length > 0 && (
              <NoteSection
                title={pinnedNotes.length > 0 ? '모든 노트' : '노트 목록'}
                notes={regularNotes}
                onEdit={setEditingNote}
                onArchive={(note) => moveMemberNote(note, 'archived')}
                onRestore={(note) => moveMemberNote(note, 'active')}
                onTogglePin={handleTogglePin}
                onTrash={setDeletingNote}
              />
            )}
          </div>
        ) : (
          <section className="empty-notes">
            <span className="empty-icon" aria-hidden="true">
              <Lightbulb size={31} />
            </span>
            <h2>
              {notes.query.trim() === '' && notes.activeTag === null
                ? getEmptyTitle(notes.activeStatus)
                : '검색 결과가 없어요'}
            </h2>
            <p>
              {isGuest
                ? '새 노트를 눌러 기록해 보세요. 비회원 노트는 현재 브라우저 세션에만 보관됩니다.'
                : notes.query.trim() === ''
                  ? getEmptyDescription(notes.activeStatus)
                  : '다른 검색어를 입력해 보세요.'}
            </p>
          </section>
        )}
      </section>

      {editingNote !== undefined && (
        <NoteEditor
          note={editingNote}
          isGuest={isGuest}
          onClose={() => setEditingNote(undefined)}
        />
      )}
      {deletingNote !== null && (
        <DeleteNoteDialog
          note={deletingNote}
          isGuest={isGuest}
          isPermanent={!isGuest && notes.activeStatus === 'trashed'}
          onClose={() => setDeletingNote(null)}
        />
      )}
    </main>
  );
}

interface NoteSectionProps {
  title: string;
  notes: Note[];
  onEdit: (note: Note) => void;
  onArchive: (note: Note) => void;
  onRestore: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onTrash: (note: Note) => void;
}

function NoteSection({
  title,
  notes,
  onEdit,
  onArchive,
  onRestore,
  onTogglePin,
  onTrash,
}: NoteSectionProps) {
  return (
    <section className="note-section" aria-label={title}>
      <h2>{title}</h2>
      <div className="notes-grid">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
            onTogglePin={onTogglePin}
            onTrash={onTrash}
          />
        ))}
      </div>
    </section>
  );
}

function getWorkspaceTitle(status: Note['status']): string {
  if (status === 'archived') {
    return '보관함';
  }
  if (status === 'trashed') {
    return '휴지통';
  }
  return '노트';
}

function getEmptyTitle(status: Note['status']): string {
  if (status === 'archived') {
    return '보관된 노트가 없어요';
  }
  if (status === 'trashed') {
    return '휴지통이 비어 있어요';
  }
  return '아직 작성한 노트가 없어요';
}

function getEmptyDescription(status: Note['status']): string {
  if (status === 'archived') {
    return '자주 보지 않는 노트를 보관해 두세요.';
  }
  if (status === 'trashed') {
    return '삭제한 노트가 이곳에 표시됩니다.';
  }
  return '새 노트를 눌러 첫 번째 생각을 기록해 보세요.';
}
