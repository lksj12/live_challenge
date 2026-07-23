export function NotesLoading() {
  return (
    <section
      className="notes-loading"
      aria-busy="true"
    >
      <p className="sr-only" role="status">
        노트를 불러오는 중
      </p>
      {Array.from({ length: 3 }, (_, index) => (
        <span className="note-skeleton" key={index} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ))}
    </section>
  );
}
