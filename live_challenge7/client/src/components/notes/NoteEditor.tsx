import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  CheckCircle2,
  Cloud,
  Eye,
  FilePenLine,
  LoaderCircle,
  LogIn,
  Save,
  Tag,
  X,
} from 'lucide-react';

import {
  addGuestNote,
  createMemberNote,
  setMemberNoteTags,
  updateGuestNote,
  updateMemberNote,
} from '../../store/notesSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { Note, NotePriority } from '../../types/note';
import { TagPickerDialog } from './TagPickerDialog';
import { MarkdownContent } from './MarkdownContent';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { normalizeHexColor } from '../../utils/color';

const NOTE_COLORS = [
  { value: '#f7d774', label: '노랑' },
  { value: '#bcd8f4', label: '파랑' },
  { value: '#efb8ac', label: '코랄' },
  { value: '#cbe6c3', label: '초록' },
  { value: '#ead3f2', label: '보라' },
] as const;

type AutoSaveState = 'idle' | 'saving' | 'saved' | 'failed';

function getDraftSnapshot(
  title: string,
  content: string,
  color: string,
  priority: NotePriority,
  tagIds: string[],
): string {
  return JSON.stringify({
    title: title.trim(),
    content,
    color,
    priority,
    tagIds: [...tagIds].sort(),
  });
}

interface NoteEditorProps {
  note: Note | null;
  isGuest: boolean;
  onClose: () => void;
}

export function NoteEditor({
  note,
  isGuest,
  onClose,
}: NoteEditorProps) {
  const dispatch = useAppDispatch();
  const mutationState = useAppSelector(
    (state) => state.notes.mutationState,
  );
  const availableTags = useAppSelector((state) => state.tags.items);
  const titleRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const autoSaveRequestRef = useRef(0);
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color, setColor] = useState(note?.color ?? '#f7d774');
  const [colorCode, setColorCode] = useState(
    (note?.color ?? '#f7d774').toUpperCase(),
  );
  const [colorError, setColorError] = useState<string | null>(null);
  const [priority, setPriority] = useState<NotePriority>(
    note?.priority ?? 'medium',
  );
  const [contentMode, setContentMode] = useState<'write' | 'preview'>(
    'write',
  );
  const [error, setError] = useState<string | null>(null);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [showTagNotice, setShowTagNotice] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState(() =>
    availableTags
      .filter((tag) => note?.tags.includes(tag.name) ?? false)
      .map((tag) => tag.id),
  );
  const [workingNoteId, setWorkingNoteId] = useState<string | null>(
    note?.id ?? null,
  );
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() =>
    getDraftSnapshot(
      note?.title ?? '',
      note?.content ?? '',
      note?.color ?? '#f7d774',
      note?.priority ?? 'medium',
      selectedTagIds,
    ),
  );
  const [autoSaveState, setAutoSaveState] =
    useState<AutoSaveState>('idle');
  const [isManualSaving, setIsManualSaving] = useState(false);
  const isSaving = !isGuest && mutationState === 'saving';
  const currentSnapshot = getDraftSnapshot(
    title,
    content,
    color,
    priority,
    selectedTagIds,
  );
  const hasNestedDialog =
    showGuestWarning || showTagNotice || showTagPicker;
  const editorDialogRef = useDialogFocus<HTMLElement>(!hasNestedDialog);
  const guestWarningRef = useDialogFocus<HTMLElement>(showGuestWarning);
  const tagNoticeRef = useDialogFocus<HTMLElement>(showTagNotice);

  useEffect(() => {
    titleRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        if (showGuestWarning) {
          setShowGuestWarning(false);
        } else if (showTagNotice) {
          setShowTagNotice(false);
        } else if (showTagPicker) {
          setShowTagPicker(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [
    isSaving,
    onClose,
    showGuestWarning,
    showTagNotice,
    showTagPicker,
  ]);

  const buildGuestNote = (
    trimmedTitle: string,
    selectedColor = color,
  ): Note => {
    const now = new Date().toISOString();

    return {
      id: note?.id ?? crypto.randomUUID(),
      ownerId: null,
      title: trimmedTitle,
      content,
      color: selectedColor,
      priority,
      status: 'active',
      isPinned: note?.isPinned ?? false,
      tags: [],
      sizeBytes: new TextEncoder().encode(trimmedTitle + content).byteLength,
      createdAt: note?.createdAt ?? now,
      updatedAt: now,
    };
  };

  useEffect(() => {
    if (
      isManualSaving ||
      title.trim() === '' ||
      currentSnapshot === lastSavedSnapshot ||
      (isGuest && note === null)
    ) {
      return;
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      const requestId = ++autoSaveRequestRef.current;
      setAutoSaveState('saving');

      if (isGuest) {
        if (note === null) {
          return;
        }
        const now = new Date().toISOString();
        dispatch(
          updateGuestNote({
            ...note,
            title: title.trim(),
            content,
            color,
            priority,
            sizeBytes: new TextEncoder().encode(title.trim() + content)
              .byteLength,
            updatedAt: now,
          }),
        );
        setLastSavedSnapshot(currentSnapshot);
        setAutoSaveState('saved');
        return;
      }

      void (async () => {
        try {
          const savedNote =
            workingNoteId === null
              ? await dispatch(
                  createMemberNote({
                    title: title.trim(),
                    content,
                    color,
                    priority,
                  }),
                ).unwrap()
              : await dispatch(
                  updateMemberNote({
                    noteId: workingNoteId,
                    input: {
                      title: title.trim(),
                      content,
                      color,
                      priority,
                    },
                  }),
                ).unwrap();

          if (requestId === autoSaveRequestRef.current) {
            await dispatch(
              setMemberNoteTags({
                noteId: savedNote.id,
                tagIds: selectedTagIds,
              }),
            ).unwrap();
            setWorkingNoteId(savedNote.id);
            setLastSavedSnapshot(currentSnapshot);
            setAutoSaveState('saved');
            setError(null);
          }
        } catch (caughtError) {
          if (requestId === autoSaveRequestRef.current) {
            setAutoSaveState('failed');
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : '자동 저장하지 못했습니다.',
            );
          }
        }
      })();
    }, 900);

    return () => {
      if (autoSaveTimerRef.current !== null) {
        window.clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [
    color,
    content,
    currentSnapshot,
    dispatch,
    isGuest,
    isManualSaving,
    lastSavedSnapshot,
    note,
    priority,
    selectedTagIds,
    title,
    workingNoteId,
  ]);

  const saveNewGuestNote = () => {
    dispatch(addGuestNote(buildGuestNote(title.trim())));
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const normalizedColor = normalizeHexColor(colorCode);

    if (trimmedTitle === '') {
      setError('제목을 입력해 주세요.');
      titleRef.current?.focus();
      return;
    }
    if (normalizedColor === null) {
      setColorError('HEX 색상 코드를 다시 확인해 주세요.');
      return;
    }
    setColor(normalizedColor);
    setColorCode(normalizedColor);

    if (autoSaveTimerRef.current !== null) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    autoSaveRequestRef.current += 1;
    setIsManualSaving(true);

    if (isGuest) {
      if (note === null) {
        setIsManualSaving(false);
        setShowGuestWarning(true);
      } else {
        dispatch(
          updateGuestNote(buildGuestNote(trimmedTitle, normalizedColor)),
        );
        setLastSavedSnapshot(currentSnapshot);
        setAutoSaveState('saved');
        setIsManualSaving(false);
        onClose();
      }
      return;
    }

    try {
      let savedNote: Note;
      if (workingNoteId === null) {
        savedNote = await dispatch(
          createMemberNote({
            title: trimmedTitle,
            content,
            color: normalizedColor,
            priority,
          }),
        ).unwrap();
      } else {
        savedNote = await dispatch(
          updateMemberNote({
            noteId: workingNoteId,
            input: {
              title: trimmedTitle,
              content,
              color: normalizedColor,
              priority,
            },
          }),
        ).unwrap();
      }

      await dispatch(
        setMemberNoteTags({
          noteId: savedNote.id,
          tagIds: selectedTagIds,
        }),
      ).unwrap();
      setWorkingNoteId(savedNote.id);
      setLastSavedSnapshot(currentSnapshot);
      setAutoSaveState('saved');
      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : '노트를 저장하지 못했습니다.',
      );
    } finally {
      setIsManualSaving(false);
    }
  };

  const handleMarkdownTabKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const nextMode = contentMode === 'write' ? 'preview' : 'write';
    setContentMode(nextMode);
    window.requestAnimationFrame(() => {
      document.getElementById(`markdown-${nextMode}-tab`)?.focus();
    });
  };

  return (
    <div className="dialog-backdrop">
      <section
        ref={editorDialogRef}
        tabIndex={-1}
        className="note-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-editor-title"
      >
        <header className="dialog-header">
          <h2 id="note-editor-title">
            {note === null ? '새 노트' : '노트 수정'}
          </h2>
          <button
            type="button"
            className="icon-button"
            aria-label="편집기 닫기"
            title="닫기"
            disabled={isSaving}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>

        <form className="note-editor-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>제목</span>
            <input
              data-autofocus
              ref={titleRef}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError(null);
              }}
              maxLength={200}
              aria-invalid={error !== null}
              aria-describedby={
                error === null ? undefined : 'note-editor-error'
              }
              placeholder="노트 제목"
              required
            />
          </label>

          <div className="note-options-row">
            <fieldset className="note-option-group">
              <legend>색상</legend>
              <div className="color-swatches">
                {NOTE_COLORS.map((option) => (
                  <label
                    key={option.value}
                    className={color === option.value ? 'is-selected' : ''}
                    title={option.label}
                  >
                    <input
                      type="radio"
                      name="note-color"
                      value={option.value}
                      checked={
                        color.toUpperCase() === option.value.toUpperCase()
                      }
                      onChange={() => {
                        setColor(option.value);
                        setColorCode(option.value.toUpperCase());
                        setColorError(null);
                      }}
                    />
                    <span
                      style={{ backgroundColor: option.value }}
                      aria-hidden="true"
                    />
                    <span className="sr-only">{option.label}</span>
                  </label>
                ))}
              </div>
              <div className="custom-color-control">
                <label className="color-picker-button" title="색상 팔레트 열기">
                  <input
                    type="color"
                    value={color}
                    aria-label="색상 팔레트"
                    onChange={(event) => {
                      const nextColor = event.target.value.toUpperCase();
                      setColor(nextColor);
                      setColorCode(nextColor);
                      setColorError(null);
                    }}
                  />
                  <span style={{ backgroundColor: color }} aria-hidden="true" />
                </label>
                <label className="color-code-field">
                  <span className="sr-only">HEX 색상 코드</span>
                  <input
                    type="text"
                    value={colorCode}
                    maxLength={7}
                    pattern="#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?"
                    spellCheck={false}
                    aria-label="HEX 색상 코드"
                    aria-invalid={colorError !== null}
                    aria-describedby={
                      colorError === null ? undefined : 'color-code-error'
                    }
                    placeholder="#RRGGBB"
                    onChange={(event) => {
                      const nextCode = event.target.value.toUpperCase();
                      setColorCode(nextCode);
                      setColorError(null);
                      if (/^#?[0-9A-F]{6}$/.test(nextCode)) {
                        setColor(normalizeHexColor(nextCode)!);
                      }
                    }}
                    onBlur={() => {
                      const nextColor = normalizeHexColor(colorCode);
                      if (nextColor === null) {
                        setColorError(
                          'HEX 색상 코드를 다시 확인해 주세요.',
                        );
                      } else {
                        setColor(nextColor);
                        setColorCode(nextColor);
                        setColorError(null);
                      }
                    }}
                  />
                </label>
              </div>
              {colorError !== null && (
                <p
                  id="color-code-error"
                  className="option-error"
                  role="alert"
                >
                  {colorError}
                </p>
              )}
            </fieldset>

            <fieldset className="note-option-group">
              <legend>우선순위</legend>
              <div className="priority-control">
                {(
                  [
                    ['low', '낮음'],
                    ['medium', '보통'],
                    ['high', '높음'],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={priority === value ? 'is-selected' : ''}
                  >
                    <input
                      type="radio"
                      name="note-priority"
                      checked={priority === value}
                      onChange={() => setPriority(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="markdown-editor">
            <div className="markdown-editor-heading">
              <span>내용</span>
              <div
                className="markdown-mode-tabs"
                role="tablist"
                aria-label="내용 보기 방식"
                onKeyDown={handleMarkdownTabKeyDown}
              >
                <button
                  id="markdown-write-tab"
                  type="button"
                  role="tab"
                  tabIndex={contentMode === 'write' ? 0 : -1}
                  aria-selected={contentMode === 'write'}
                  aria-controls="markdown-write-panel"
                  className={contentMode === 'write' ? 'is-active' : ''}
                  onClick={() => setContentMode('write')}
                >
                  <FilePenLine size={15} />
                  작성
                </button>
                <button
                  id="markdown-preview-tab"
                  type="button"
                  role="tab"
                  tabIndex={contentMode === 'preview' ? 0 : -1}
                  aria-selected={contentMode === 'preview'}
                  aria-controls="markdown-preview-panel"
                  className={contentMode === 'preview' ? 'is-active' : ''}
                  onClick={() => setContentMode('preview')}
                >
                  <Eye size={15} />
                  미리보기
                </button>
              </div>
            </div>
            {contentMode === 'write' ? (
              <div
                id="markdown-write-panel"
                role="tabpanel"
                aria-labelledby="markdown-write-tab"
              >
                <label className="sr-only" htmlFor="note-content">
                  Markdown 내용
                </label>
                <textarea
                  id="note-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={50_000}
                  rows={11}
                  placeholder="Markdown으로 생각을 적어보세요."
                />
              </div>
            ) : (
              <div
                id="markdown-preview-panel"
                className="markdown-preview"
                role="tabpanel"
                aria-labelledby="markdown-preview-tab"
                tabIndex={0}
              >
                <MarkdownContent source={content} />
              </div>
            )}
          </div>

          {error !== null && (
            <p id="note-editor-error" className="form-error" role="alert">
              {error}
            </p>
          )}

          <footer className="editor-footer">
            <div className="editor-footer-meta">
              <button
                type="button"
                className="tag-access-button"
                onClick={() => {
                  if (isGuest) {
                    setShowTagNotice(true);
                  } else {
                    setShowTagPicker(true);
                  }
                }}
              >
                <Tag size={17} />
                태그
                {!isGuest && selectedTagIds.length > 0 && (
                  <span className="tag-count">{selectedTagIds.length}</span>
                )}
              </button>
              {(note !== null || !isGuest) && (
                <AutoSaveStatus state={autoSaveState} />
              )}
            </div>
            <span className="dialog-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={isSaving || isManualSaving}
                onClick={onClose}
              >
                취소
              </button>
              <button
                type="submit"
                className="primary-button dialog-primary"
                disabled={isSaving || isManualSaving}
              >
                <Save size={18} />
                {isSaving || isManualSaving ? '저장 중...' : '저장'}
              </button>
            </span>
          </footer>
        </form>
      </section>

      {showGuestWarning && (
        <div className="dialog-backdrop nested-dialog-backdrop">
          <section
            ref={guestWarningRef}
            tabIndex={-1}
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="guest-warning-title"
            aria-describedby="guest-warning-description"
          >
            <header className="dialog-header">
              <h2 id="guest-warning-title">비회원 노트 저장</h2>
              <button
                data-autofocus
                type="button"
                className="icon-button"
                aria-label="저장 안내 닫기"
                title="닫기"
                onClick={() => setShowGuestWarning(false)}
              >
                <X size={21} />
              </button>
            </header>
            <p id="guest-warning-description">
              비회원으로 작성한 노트는 현재 브라우저 탭에만 저장되며,
              탭이나 브라우저를 닫으면 삭제될 수 있습니다.
            </p>
            <footer className="dialog-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowGuestWarning(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="primary-button dialog-primary"
                onClick={saveNewGuestNote}
              >
                <Save size={18} />
                확인하고 저장
              </button>
            </footer>
          </section>
        </div>
      )}

      {showTagNotice && (
        <div className="dialog-backdrop nested-dialog-backdrop">
          <section
            ref={tagNoticeRef}
            tabIndex={-1}
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tag-notice-title"
            aria-describedby="tag-notice-description"
          >
            <header className="dialog-header">
              <h2 id="tag-notice-title">로그인이 필요해요</h2>
              <button
                data-autofocus
                type="button"
                className="icon-button"
                aria-label="태그 안내 닫기"
                title="닫기"
                onClick={() => setShowTagNotice(false)}
              >
                <X size={21} />
              </button>
            </header>
            <p id="tag-notice-description">
              태그 기능은 로그인 후 사용할 수 있습니다.
            </p>
            <footer className="dialog-actions">
              <button
                type="button"
                className="primary-button dialog-primary"
                onClick={() => setShowTagNotice(false)}
              >
                <LogIn size={18} />
                확인
              </button>
            </footer>
          </section>
        </div>
      )}

      {showTagPicker && (
        <TagPickerDialog
          selectedTagIds={selectedTagIds}
          onClose={() => setShowTagPicker(false)}
          onApply={(tagIds) => {
            setSelectedTagIds(tagIds);
            setShowTagPicker(false);
          }}
        />
      )}
    </div>
  );
}

function AutoSaveStatus({ state }: { state: AutoSaveState }) {
  if (state === 'saving') {
    return (
      <span className="autosave-status is-saving" role="status">
        <LoaderCircle size={15} aria-hidden="true" />
        자동 저장 중
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="autosave-status is-saved" role="status">
        <CheckCircle2 size={15} aria-hidden="true" />
        자동 저장됨
      </span>
    );
  }
  if (state === 'failed') {
    return (
      <span className="autosave-status is-failed" role="status">
        <Cloud size={15} aria-hidden="true" />
        자동 저장 실패
      </span>
    );
  }
  return (
    <span className="autosave-status" aria-live="polite">
      <Cloud size={15} aria-hidden="true" />
      자동 저장
    </span>
  );
}
