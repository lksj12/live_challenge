import { getToken } from "../utils/tokenStorage";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "";

export async function request(
    path,
    options = {},
    fallbackMessage = "요청을 처리하지 못했습니다.",
) {
    const token = getToken();

    const headers = {
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || fallbackMessage);
    }

    return data;
}