import type { Product } from '../types/product';

function createPlaceholderImage(
    label: string,
    background: string,
): string {
    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="600"
            height="600"
            viewBox="0 0 600 600"
        >
            <rect
                width="600"
                height="600"
                rx="32"
                fill="${background}"
            />
            <text
                x="300"
                y="300"
                fill="#ffffff"
                font-family="Arial, sans-serif"
                font-size="42"
                font-weight="700"
                text-anchor="middle"
                dominant-baseline="middle"
            >
                ${label}
            </text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const mockProducts: Product[] = [
    {
        id: 1001,
        title: '베이직 코튼 티셔츠',
        price: 24.9,
        description:
            '일상에서 편하게 입을 수 있는 기본형 코튼 티셔츠입니다.',
        category: 'clothing',
        image: createPlaceholderImage(
            'T-Shirt',
            '#4f68c7',
        ),
        rating: {
            rate: 4.4,
            count: 128,
        },
    },
    {
        id: 1002,
        title: '데일리 캔버스 백',
        price: 32.5,
        description:
            '노트북과 생활용품을 가볍게 수납할 수 있는 캔버스 백입니다.',
        category: 'accessories',
        image: createPlaceholderImage(
            'Canvas Bag',
            '#b36a49',
        ),
        rating: {
            rate: 4.2,
            count: 84,
        },
    },
    {
        id: 1003,
        title: '무선 미니 스피커',
        price: 49.0,
        description:
            '작은 크기로 휴대하기 편한 블루투스 무선 스피커입니다.',
        category: 'electronics',
        image: createPlaceholderImage(
            'Speaker',
            '#477d72',
        ),
        rating: {
            rate: 4.6,
            count: 203,
        },
    },
    {
        id: 1004,
        title: '심플 손목시계',
        price: 59.9,
        description:
            '깔끔한 디자인으로 다양한 스타일에 어울리는 손목시계입니다.',
        category: 'accessories',
        image: createPlaceholderImage(
            'Watch',
            '#66568e',
        ),
        rating: {
            rate: 4.1,
            count: 67,
        },
    },
];
