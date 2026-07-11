import { request } from "./http";

export function getUsers() {
    return request(
        "/api/admin/users",
        {},
        "사용자 목록을 불러오지 못했습니다.",
    );
}

export function deleteUser(id) {
    return request(
        `/api/admin/users/${id}`,
        {
            method: "DELETE",
        },
        "사용자 계정을 삭제하지 못했습니다.",
    );
}