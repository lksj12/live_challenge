import { mockProducts } from '../data/mockProducts';
import type {
    Product,
    ProductLoadResult,
    ProductRating,
} from '../types/product';

const productEndpoint =
    'https://fakestoreapi.com/products';

const requestTimeoutMilliseconds = 8000;

export class ProductApiError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'ProductApiError';
    }
}

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function parseRating(value: unknown): ProductRating {
    if (!isRecord(value)) {
        return {
            rate: 0,
            count: 0,
        };
    }

    const rate =
        typeof value.rate === 'number'
        && Number.isFinite(value.rate)
            ? value.rate
            : 0;

    const count =
        typeof value.count === 'number'
        && Number.isFinite(value.count)
            ? value.count
            : 0;

    return {
        rate,
        count,
    };
}

function parseProduct(value: unknown): Product {
    if (!isRecord(value)) {
        throw new ProductApiError(
            '상품 데이터 형식이 올바르지 않습니다.',
        );
    }

    const {
        id,
        title,
        price,
        description,
        category,
        image,
        rating,
    } = value;

    if (
        typeof id !== 'number'
        || !Number.isInteger(id)
        || typeof title !== 'string'
        || typeof price !== 'number'
        || !Number.isFinite(price)
        || typeof description !== 'string'
        || typeof category !== 'string'
        || typeof image !== 'string'
    ) {
        throw new ProductApiError(
            '필수 상품 정보가 누락되었거나 올바르지 않습니다.',
        );
    }

    return {
        id,
        title: title.trim(),
        price,
        description: description.trim(),
        category: category.trim(),
        image: image.trim(),
        rating: parseRating(rating),
    };
}

export async function fetchProductsFromApi(): Promise<
    Product[]
> {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
        controller.abort();
    }, requestTimeoutMilliseconds);

    try {
        const response = await fetch(productEndpoint, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new ProductApiError(
                `상품 요청에 실패했습니다. 상태 코드: ${response.status}`,
            );
        }

        const responseData: unknown = await response.json();

        if (!Array.isArray(responseData)) {
            throw new ProductApiError(
                '상품 목록 응답이 배열 형식이 아닙니다.',
            );
        }

        return responseData.map(parseProduct);
    } catch (error) {
        if (error instanceof ProductApiError) {
            throw error;
        }

        if (
            error instanceof DOMException
            && error.name === 'AbortError'
        ) {
            throw new ProductApiError(
                '상품 요청 시간이 초과되었습니다.',
            );
        }

        throw new ProductApiError(
            '상품 서버에 연결하지 못했습니다.',
        );
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export async function loadProducts(): Promise<
    ProductLoadResult
> {
    try {
        const products = await fetchProductsFromApi();

        return {
            products,
            source: 'api',
            warning: null,
        };
    } catch (error) {
        const reason =
            error instanceof Error
                ? error.message
                : '상품을 불러오지 못했습니다.';

        return {
            products: mockProducts,
            source: 'mock',
            warning:
                `${reason} 로컬 임시 상품을 표시합니다.`,
        };
    }
}
