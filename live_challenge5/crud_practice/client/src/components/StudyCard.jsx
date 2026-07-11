import { formatStudyTime } from "../utils/studyUtils";
import { formatDateTime } from "../utils/dateUtils";

function StudyCard({ study, onEdit, onDelete }) {
    return (
        <li className="study-card">
            <div className="study-card-header">
                <h3>{study.title}</h3>

                <div className="card-button-group">
                    <button
                        type="button"
                        className="edit-button"
                        onClick={() => onEdit(study)}
                    >
                        수정
                    </button>

                    <button
                        type="button"
                        className="delete-button"
                        onClick={() => onDelete(study.id)}
                    >
                        삭제
                    </button>
                </div>
            </div>

            <p>학습 시간: {formatStudyTime(study.studyMinutes)}</p>
            <p>이해도: {study.understanding}</p>
            <p>{study.memo}</p>
            <small>작성일: {formatDateTime(study.createdAt)}</small>
        </li>
    );
}

export default StudyCard;