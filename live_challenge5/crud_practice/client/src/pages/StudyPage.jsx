import StudyForm from "../components/StudyForm";
import StudyList from "../components/StudyList";
import useStudies from "../hooks/useStudies";

function StudyPage() {
    const {
        studies,
        isLoading,
        errorMessage,
        editingStudy,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleEdit,
        handleCancelEdit,
    } = useStudies();

    return (
        <>
            <section className="app-header">
                <h1>학습 기록 관리 앱</h1>
                <p>React + Express + SQLite 기반 CRUD 실습</p>
            </section>

            <section className="study-section">
                <StudyForm
                    key={
                        editingStudy
                            ? `edit-${editingStudy.id}`
                            : "create"
                    }
                    onCreate={handleCreate}
                    onUpdate={handleUpdate}
                    editingStudy={editingStudy}
                    onCancelEdit={handleCancelEdit}
                />
            </section>

            <StudyList
                studies={studies}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </>
    );
}

export default StudyPage;