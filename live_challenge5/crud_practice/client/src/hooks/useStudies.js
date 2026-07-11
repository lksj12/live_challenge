import { useEffect, useState } from "react";
import {
    createStudy,
    deleteStudy,
    getStudies,
    updateStudy,
} from "../api/studyApi";

function useStudies() {
    const [studies, setStudies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [editingStudy, setEditingStudy] = useState(null);

    useEffect(() => {
        async function loadStudies() {
            try {
                const data = await getStudies();
                setStudies(data);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadStudies();
    }, []);

    async function handleCreate(studyData) {
        try {
            const newStudy = await createStudy(studyData);

            setStudies((prevStudies) => [
                newStudy,
                ...prevStudies,
            ]);
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleDelete(id) {
        const isConfirmed = window.confirm(
            "이 학습 기록을 삭제하시겠습니까?",
        );

        if (!isConfirmed) {
            return;
        }

        try {
            await deleteStudy(id);

            setStudies((prevStudies) =>
                prevStudies.filter((study) => study.id !== id),
            );

            if (editingStudy?.id === id) {
                setEditingStudy(null);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleUpdate(id, studyData) {
        try {
            const updatedStudy = await updateStudy(id, studyData);

            setStudies((prevStudies) =>
                prevStudies.map((study) =>
                    study.id === id ? updatedStudy : study,
                ),
            );

            setEditingStudy(null);
        } catch (error) {
            alert(error.message);
        }
    }

    function handleEdit(study) {
        setEditingStudy(study);
    }

    function handleCancelEdit() {
        setEditingStudy(null);
    }

    return {
        studies,
        isLoading,
        errorMessage,
        editingStudy,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleEdit,
        handleCancelEdit,
    };
}

export default useStudies;