import { useState } from "react";

function getInitialForm(editingStudy) {
    const totalMinutes = Number(editingStudy?.studyMinutes) || 0;

    return {
        title: editingStudy?.title || "",
        studyHours: editingStudy ? Math.floor(totalMinutes / 60) : 1,
        studyMinutesInput: editingStudy ? totalMinutes % 60 : 0,
        understanding: editingStudy?.understanding || "보통",
        memo: editingStudy?.memo || "",
    };
}

function StudyForm({ onCreate, onUpdate, editingStudy, onCancelEdit }) {
    const initialForm = getInitialForm(editingStudy);

    const [title, setTitle] = useState(initialForm.title);
    const [studyHours, setStudyHours] = useState(initialForm.studyHours);
    const [studyMinutesInput, setStudyMinutesInput] = useState(
        initialForm.studyMinutesInput,
    );
    const [understanding, setUnderstanding] = useState(
        initialForm.understanding,
    );
    const [memo, setMemo] = useState(initialForm.memo);

    function resetForm() {
        setTitle("");
        setStudyHours(1);
        setStudyMinutesInput(0);
        setUnderstanding("보통");
        setMemo("");
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (title.trim() === "") {
            alert("학습 주제를 입력해주세요.");
            return;
        }

        const hours = Number(studyHours) || 0;
        const minutes = Number(studyMinutesInput) || 0;

        if (hours < 0 || minutes < 0 || minutes > 59) {
            alert("학습 시간은 0 이상, 분은 0~59 사이로 입력해주세요.");
            return;
        }

        const studyData = {
            title,
            studyMinutes: hours * 60 + minutes,
            understanding,
            memo,
        };

        if (editingStudy) {
            onUpdate(editingStudy.id, studyData);
        } else {
            onCreate(studyData);
            resetForm();
        }
    }

    function handleCancel() {
        resetForm();
        onCancelEdit();
    }

    return (
        <form className="study-form" onSubmit={handleSubmit}>
            <h2>{editingStudy ? "학습 기록 수정" : "학습 기록 추가"}</h2>

            <label>
                학습 주제
                <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="예: React Create 기능 구현"
                />
            </label>

            <div className="time-input-group">
                <label>
                    학습 시간
                    <input
                        type="number"
                        min="0"
                        value={studyHours}
                        onChange={(event) => setStudyHours(event.target.value)}
                    />
                    <span>시간</span>
                </label>

                <label>
                    학습 분
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={studyMinutesInput}
                        onChange={(event) =>
                            setStudyMinutesInput(event.target.value)
                        }
                    />
                    <span>분</span>
                </label>
            </div>

            <label>
                이해도
                <select
                    value={understanding}
                    onChange={(event) => setUnderstanding(event.target.value)}
                >
                    <option value="어려움">어려움</option>
                    <option value="보통">보통</option>
                    <option value="이해함">이해함</option>
                </select>
            </label>

            <label>
                메모
                <textarea
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                    placeholder="학습 내용을 간단히 작성하세요."
                />
            </label>

            <div className="form-button-group">
                <button type="submit">
                    {editingStudy ? "수정 완료" : "추가"}
                </button>

                {editingStudy && (
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={handleCancel}
                    >
                        취소
                    </button>
                )}
            </div>
        </form>
    );
}

export default StudyForm;