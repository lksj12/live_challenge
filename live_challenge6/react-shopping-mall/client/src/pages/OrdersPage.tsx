import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    Link,
    Navigate,
} from 'react-router';

import {
    useAppSelector,
} from '../app/hooks';
import {
    selectAuthToken,
    selectCurrentUser,
} from '../features/auth/authSlice';
import {
    ApiRequestError,
} from '../services/authApi';
import {
    fetchMyOrders,
} from '../services/orderApi';
import {
    fetchProductsFromApi,
} from '../services/productApi';
import type {
    Order,
    PaymentStatus,
    ShippingStatus,
} from '../types/order';
import {
    formatPrice,
} from '../utils/formatPrice';
import './OrdersPage.css';

const placeholderProductImage =
    `${import.meta.env.BASE_URL}product-placeholder.svg`;

interface OrderProductImageProps {
    title: string;
    storedImage: string;
    apiImage?: string;
}

function OrderProductImage({
    title,
    storedImage,
    apiImage,
}: OrderProductImageProps) {
    const imageSources = useMemo(() => {
        const candidates = [
            apiImage?.trim(),
            storedImage.trim(),
            placeholderProductImage,
        ].filter(
            (value): value is string =>
                typeof value === 'string'
                && value.length > 0,
        );

        return Array.from(
            new Set(candidates),
        );
    }, [
        apiImage,
        storedImage,
    ]);

    const [sourceIndex, setSourceIndex] =
        useState(0);

    useEffect(() => {
        setSourceIndex(0);
    }, [
        apiImage,
        storedImage,
    ]);

    const currentSource =
        imageSources[sourceIndex]
        ?? placeholderProductImage;

    function handleImageError(): void {
        setSourceIndex((currentIndex) => {
            const nextIndex = currentIndex + 1;

            if (nextIndex >= imageSources.length) {
                return currentIndex;
            }

            return nextIndex;
        });
    }

    return (
        <img
            src={currentSource}
            alt={title}
            className="order-item-image"
            onError={handleImageError}
        />
    );
}

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return '구매 내역을 불러오는 중 오류가 발생했습니다.';
}

function formatOrderDate(
    value: string,
): string {
    /*
     * SQLite CURRENT_TIMESTAMP는 UTC 기준이며
     * "YYYY-MM-DD HH:mm:ss" 형태에는 시간대 정보가 없다.
     * 끝에 Z를 추가하여 UTC로 해석한 뒤 한국 시간으로 변환한다.
     */
    const normalizedValue = value.includes('T')
        ? value
        : value.replace(' ', 'T');

    const utcValue =
        /(?:Z|[+-]\d{2}:\d{2})$/.test(
            normalizedValue,
        )
            ? normalizedValue
            : `${normalizedValue}Z`;

    const date = new Date(utcValue);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        'ko-KR',
        {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        },
    ).format(date);
}

function getShippingStatusLabel(
    status: ShippingStatus,
): string {
    switch (status) {
        case 'preparing':
            return '상품 준비 중';

        case 'shipping':
            return '배송 중';

        case 'delivered':
            return '배송 완료';

        default:
            return status;
    }
}

function getPaymentStatusLabel(
    status: PaymentStatus,
): string {
    switch (status) {
        case 'paid':
            return '결제 완료';

        case 'cancelled':
            return '결제 취소';

        default:
            return status;
    }
}

export default function OrdersPage() {
    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const token = useAppSelector(
        selectAuthToken,
    );

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [productImages, setProductImages] =
        useState<Record<number, string>>({});

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const loadOrders = useCallback(
        async (authToken: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const response =
                    await fetchMyOrders(authToken);

                setOrders(response.orders);
            } catch (requestError) {
                setError(
                    getErrorMessage(requestError),
                );
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        let isCancelled = false;

        async function loadProductImages(): Promise<void> {
            try {
                const products =
                    await fetchProductsFromApi();

                if (isCancelled) {
                    return;
                }

                const nextProductImages =
                    products.reduce<Record<number, string>>(
                        (imageMap, product) => {
                            if (product.image.trim()) {
                                imageMap[product.id] =
                                    product.image.trim();
                            }

                            return imageMap;
                        },
                        {},
                    );

                setProductImages(nextProductImages);
            } catch {
                /*
                 * Fake Store API를 사용할 수 없는 경우에는
                 * 주문 DB에 저장된 이미지가 자동 사용된다.
                 */
                if (!isCancelled) {
                    setProductImages({});
                }
            }
        }

        void loadProductImages();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!token) {
            return;
        }

        void loadOrders(token);
    }, [
        loadOrders,
        token,
    ]);

    if (!currentUser || !token) {
        return (
            <Navigate
                to="/auth"
                replace
            />
        );
    }

    const authToken = token;

    return (
        <main className="orders-page">
            <div className="orders-page-inner">
                <header className="orders-page-header">
                    <div>
                        <p className="orders-page-eyebrow">
                            ORDER HISTORY
                        </p>

                        <h1>구매 내역</h1>

                        <p>
                            결제한 상품과 현재 배송 상태를
                            확인할 수 있습니다.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="orders-refresh-button"
                        disabled={isLoading}
                        onClick={() => {
                            void loadOrders(authToken);
                        }}
                    >
                        {isLoading
                            ? '불러오는 중...'
                            : '새로고침'}
                    </button>
                </header>

                {error && (
                    <section
                        className="orders-error"
                        role="alert"
                    >
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => {
                                void loadOrders(authToken);
                            }}
                        >
                            다시 시도
                        </button>
                    </section>
                )}

                {!error && isLoading && (
                    <section
                        className="orders-loading"
                        aria-live="polite"
                    >
                        구매 내역을 불러오고 있습니다.
                    </section>
                )}

                {!error
                    && !isLoading
                    && orders.length === 0
                    && (
                        <section className="orders-empty">
                            <div
                                className="orders-empty-icon"
                                aria-hidden="true"
                            >
                                📦
                            </div>

                            <h2>
                                아직 구매한 상품이 없습니다.
                            </h2>

                            <p>
                                상품을 장바구니에 담고 결제를
                                진행해 보세요.
                            </p>

                            <Link to="/">
                                상품 둘러보기
                            </Link>
                        </section>
                    )}

                {!error
                    && !isLoading
                    && orders.length > 0
                    && (
                        <section
                            className="orders-list"
                            aria-label="구매 내역 목록"
                        >
                            {orders.map((order) => (
                                <article
                                    key={order.id}
                                    className="order-card"
                                >
                                    <header className="order-card-header">
                                        <div>
                                            <p className="order-number">
                                                주문 번호 #{order.id}
                                            </p>

                                            <time
                                                dateTime={order.createdAt}
                                            >
                                                {formatOrderDate(
                                                    order.createdAt,
                                                )}
                                            </time>
                                        </div>

                                        <div className="order-summary">
                                            <span
                                                className={
                                                    order.paymentStatus
                                                    === 'paid'
                                                        ? 'payment-status paid'
                                                        : 'payment-status cancelled'
                                                }
                                            >
                                                {getPaymentStatusLabel(
                                                    order.paymentStatus,
                                                )}
                                            </span>

                                            <strong>
                                                {formatPrice(
                                                    order.totalAmount,
                                                )}
                                            </strong>
                                        </div>
                                    </header>

                                    <div className="order-item-list">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="order-item"
                                            >
                                                <Link
                                                    to={`/products/${item.productId}`}
                                                    className="order-item-image-link"
                                                >
                                                    <OrderProductImage
                                                        title={
                                                            item.title
                                                        }
                                                        storedImage={
                                                            item.image
                                                        }
                                                        apiImage={
                                                            productImages[
                                                                item.productId
                                                            ]
                                                        }
                                                    />
                                                </Link>

                                                <div className="order-item-information">
                                                    <p className="order-item-category">
                                                        {item.category}
                                                    </p>

                                                    <h2>
                                                        <Link
                                                            to={`/products/${item.productId}`}
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    </h2>

                                                    <p className="order-item-price">
                                                        {formatPrice(
                                                            item.price,
                                                        )}
                                                        {' × '}
                                                        {item.quantity}개
                                                    </p>
                                                </div>

                                                <div className="order-item-status-area">
                                                    <span
                                                        className={`shipping-status ${item.shippingStatus}`}
                                                    >
                                                        {getShippingStatusLabel(
                                                            item.shippingStatus,
                                                        )}
                                                    </span>

                                                    <strong>
                                                        {formatPrice(
                                                            item.price
                                                            * item.quantity,
                                                        )}
                                                    </strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </section>
                    )}
            </div>
        </main>
    );
}
