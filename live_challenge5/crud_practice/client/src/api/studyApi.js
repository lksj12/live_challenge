import { request } from "./http";

export function getStudies() {
    return request(
        "/api/studies",
        {},
        "학습 기록 목록을 불러오지 못했습니다.",
    );
}

export function createStudy(studyData) {
    return request(
        "/api/studies",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(studyData),
        },
        "학습 기록을 추가하지 못했습니다.",
    );
}

export function updateStudy(id, studyData) {
    return request(
        `/api/studies/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(studyData),
        },
        "학습 기록을 수정하지 못했습니다.",
    );
}

export function deleteStudy(id) {
    return request(
        `/api/studies/${id}`,
        {
            method: "DELETE",
        },
        "학습 기록을 삭제하지 못했습니다.",
    );
}