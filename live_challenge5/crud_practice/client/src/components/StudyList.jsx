import StudyCard from "./StudyCard";

function StudyList({
    studies,
    isLoading,
    errorMessage,
    onEdit,
    onDelete,
}) {
    return (
        <section className="study-section">
            <h2>학습 기록 목록</h2>

            {isLoading && <p>학습 기록을 불러오는 중입니다...</p>}

            {errorMessage && (
                <p className="error-message">{errorMessage}</p>
            )}

            {!isLoading && !errorMessage && studies.length === 0 && (
                <p>아직 등록된 학습 기록이 없습니다.</p>
            )}

            {!isLoading && !errorMessage && studies.length > 0 && (
                <ul className="study-list">
                    {studies.map((study) => (
                        <StudyCard
                            key={study.id}
                            study={study}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

export default StudyList;