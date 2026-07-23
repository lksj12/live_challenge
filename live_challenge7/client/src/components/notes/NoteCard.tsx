import {
  Archive,
  ArchiveRestore,
  Pencil,
  Pin,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import type { CSSProperties } from 'react';

import type { Note } from '../../types/note';
import { MarkdownContent } from './MarkdownContent';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onArchive: (note: Note) => void;
  onRestore: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onTrash: (note: Note) => void;
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function NoteCard({
  note,
  onEdit,
  onArchive,
  onRestore,
  onTogglePin,
  onTrash,
}: NoteCardProps) {
  return (
    <article
      className="note-card"
      style={{ '--note-color': note.color } as CSSProperties}
      onDoubleClick={() => {
        if (note.status === 'active') {
          onEdit(note);
        }
      }}
    >
      <div className="note-card-heading">
        <h3>{note.title}</h3>
        <span className={`priority priority-${note.priority}`}>
          {getPriorityLabel(note.priority)}
        </span>
      </div>
      <div className="note-card-content">
        <MarkdownContent source={note.content} compact />
      </div>
      {note.tags.length > 0 && (
        <div className="note-card-tags" aria-label="노트 태그">
          {note.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      <footer className="note-card-footer">
        <time dateTime={note.updatedAt}>
          {dateFormatter.format(new Date(note.updatedAt))}
        </time>
        <span className="note-card-actions">
          {note.status === 'active' ? (
            <>
              <button
                type="button"
                className={`icon-button${note.isPinned ? ' is-pinned' : ''}`}
                aria-label={`${note.title} ${note.isPinned ? '고정 해제' : '고정'}`}
                title={note.isPinned ? '고정 해제' : '상단에 고정'}
                onClick={() => onTogglePin(note)}
              >
                <Pin
                  size={17}
                  fill={note.isPinned ? 'currentColor' : 'none'}
                />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={`${note.title} 수정`}
                title="노트 수정"
                onClick={() => onEdit(note)}
              >
                <Pencil size={17} />
              </button>
              {note.ownerId !== null && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`${note.title} 보관`}
                  title="보관함으로 이동"
                  onClick={() => onArchive(note)}
                >
                  <Archive size={17} />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className="icon-button"
              aria-label={`${note.title} 복원`}
              title="노트로 복원"
              onClick={() => onRestore(note)}
            >
              {note.status === 'archived' ? (
                <ArchiveRestore size={17} />
              ) : (
                <RotateCcw size={17} />
              )}
            </button>
          )}
          <button
            type="button"
            className="icon-button"
            aria-label={`${note.title} ${
              note.status === 'trashed' ? '영구 삭제' : '휴지통으로 이동'
            }`}
            title={
              note.status === 'trashed'
                ? '영구 삭제'
                : '휴지통으로 이동'
            }
            onClick={() => onTrash(note)}
          >
            <Trash2 size={17} />
          </button>
        </span>
      </footer>
    </article>
  );
}

function getPriorityLabel(priority: Note['priority']): string {
  if (priority === 'high') {
    return '높음';
  }
  if (priority === 'low') {
    return '낮음';
  }
  return '보통';
}
