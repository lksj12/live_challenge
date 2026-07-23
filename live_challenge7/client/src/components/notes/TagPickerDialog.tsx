import { type FormEvent, useState } from 'react';
import { Plus, Tag, X } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createMemberTag } from '../../store/tagsSlice';
import { useDialogFocus } from '../../hooks/useDialogFocus';

interface TagPickerDialogProps {
  selectedTagIds: string[];
  onApply: (tagIds: string[]) => void;
  onClose: () => void;
}

export function TagPickerDialog({
  selectedTagIds,
  onApply,
  onClose,
}: TagPickerDialogProps) {
  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.tags);
  const [selection, setSelection] = useState(selectedTagIds);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isCreating = tags.mutationState === 'saving';
  const dialogRef = useDialogFocus<HTMLElement>(true, onClose);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName === '') {
      setError('태그 이름을 입력해 주세요.');
      return;
    }

    try {
      const tag = await dispatch(createMemberTag(trimmedName)).unwrap();
      setSelection((current) => [...current, tag.id]);
      setName('');
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : '태그를 만들지 못했습니다.',
      );
    }
  };

  const toggleTag = (tagId: string) => {
    setSelection((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  };

  return (
    <div className="dialog-backdrop nested-dialog-backdrop">
      <section
        ref={dialogRef}
        className="tag-picker-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-picker-title"
      >
        <header className="dialog-header">
          <h2 id="tag-picker-title">태그 선택</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="태그 선택 닫기"
            title="닫기"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>

        <form className="tag-create-form" onSubmit={handleCreate}>
          <label className="field">
            <span>새 태그</span>
            <span className="tag-create-control">
              <input
                data-autofocus
                value={name}
                maxLength={30}
                aria-invalid={error !== null}
                aria-describedby={
                  error === null ? undefined : 'tag-picker-error'
                }
                placeholder="태그 이름"
                onChange={(event) => {
                  setName(event.target.value);
                  setError(null);
                }}
              />
              <button
                type="submit"
                className="icon-submit-button"
                title="태그 만들기"
                aria-label="태그 만들기"
                disabled={isCreating}
              >
                <Plus size={19} />
              </button>
            </span>
          </label>
        </form>

        {error !== null && (
          <p id="tag-picker-error" className="tag-picker-error" role="alert">
            {error}
          </p>
        )}

        <div className="tag-option-list">
          {tags.items.length === 0 ? (
            <p className="tag-empty-state">아직 만든 태그가 없습니다.</p>
          ) : (
            tags.items.map((tag) => (
              <label className="tag-option" key={tag.id}>
                <input
                  type="checkbox"
                  checked={selection.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                <Tag size={16} aria-hidden="true" />
                <span>{tag.name}</span>
              </label>
            ))
          )}
        </div>

        <footer className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="primary-button dialog-primary"
            onClick={() => onApply(selection)}
          >
            적용
          </button>
        </footer>
      </section>
    </div>
  );
}
