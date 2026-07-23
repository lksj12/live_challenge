import { Trash2, X } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  deleteGuestNote,
  permanentlyDeleteMemberNote,
  trashMemberNote,
} from '../../store/notesSlice';
import type { Note } from '../../types/note';
import { useDialogFocus } from '../../hooks/useDialogFocus';

interface DeleteNoteDialogProps {
  note: Note;
  isGuest: boolean;
  isPermanent?: boolean;
  onClose: () => void;
}

export function DeleteNoteDialog({
  note,
  isGuest,
  isPermanent = false,
  onClose,
}: DeleteNoteDialogProps) {
  const dispatch = useAppDispatch();
  const isMemberDeleting = useAppSelector(
    (state) => state.notes.mutationState === 'deleting',
  );
  const isDeleting = !isGuest && isMemberDeleting;
  const dialogRef = useDialogFocus<HTMLElement>(
    true,
    isDeleting ? undefined : onClose,
  );

  const handleDelete = async () => {
    if (isGuest) {
      dispatch(deleteGuestNote(note.id));
      onClose();
      return;
    }

    try {
      if (isPermanent) {
        await dispatch(permanentlyDeleteMemberNote(note.id)).unwrap();
      } else {
        await dispatch(trashMemberNote(note.id)).unwrap();
      }
      onClose();
    } catch {
      // The shared workspace error message reports the failed request.
    }
  };

  return (
    <div className="dialog-backdrop">
      <section
        ref={dialogRef}
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <header className="dialog-header">
          <h2 id="delete-dialog-title">
            {isGuest || isPermanent
              ? '노트를 삭제할까요?'
              : '휴지통으로 이동할까요?'}
          </h2>
          <button
            type="button"
            className="icon-button"
            aria-label="삭제 확인 닫기"
            title="닫기"
            disabled={isDeleting}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>
        <p id="delete-dialog-description">
          <strong>{note.title}</strong> 노트를{' '}
          {isPermanent
            ? '영구 삭제합니다. 이 작업은 되돌릴 수 없습니다.'
            : isGuest
              ? '삭제합니다.'
              : '휴지통으로 이동합니다.'}
        </p>
        <footer className="dialog-actions">
          <button
            data-autofocus
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
            {isDeleting
              ? isPermanent
                ? '삭제 중...'
                : '이동 중...'
              : isPermanent
                ? '영구 삭제'
                : isGuest
                  ? '삭제'
                : '휴지통으로 이동'}
          </button>
        </footer>
      </section>
    </div>
  );
}
