import { request } from "./http";

export function signup(email, password, nickname) {
    return request(
        "/api/auth/signup",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                nickname,
            }),
        },
        "회원가입을 처리하지 못했습니다.",
    );
}

export function login(email, password) {
    return request(
        "/api/auth/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        },
        "로그인하지 못했습니다.",
    );
}

export function getMe() {
    return request(
        "/api/auth/me",
        {},
        "사용자 정보를 불러오지 못했습니다.",
    );
}

export function logout() {
    return request(
        "/api/auth/logout",
        {
            method: "POST",
        },
        "로그아웃을 처리하지 못했습니다.",
    );
}

export function deleteMyAccount() {
    return request(
        "/api/auth/me",
        {
            method: "DELETE",
        },
        "회원 탈퇴를 처리하지 못했습니다.",
    );
}