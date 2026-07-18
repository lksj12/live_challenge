import {
    Link,
    useNavigate,
} from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import {
    addToCart,
} from '../features/cart/cartSlice';
import {
    selectProductStockMap,
} from '../features/inventory/inventorySlice';
import {
    isProductLowStock,
    isProductSoldOut,
} from '../features/products/productStock';
import {
    useRestockSubscription,
} from '../hooks/useRestockSubscription';
import type {
    Product,
} from '../types/product';
import {
    formatPrice,
} from '../utils/formatPrice';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({
    product,
}: ProductCardProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const stockByProductId = useAppSelector(
        selectProductStockMap,
    );

    const stock =
        stockByProductId[product.id] ?? 0;

    const soldOut =
        isProductSoldOut(stock);

    const lowStock =
        isProductLowStock(stock);

    const {
        currentUser,
        subscribed,
        toggleSubscription,
    } = useRestockSubscription(product.id);

    function handleRestockSubscription(): void {
        if (!currentUser) {
            window.alert(
                '재입고 알림을 받으려면 로그인이 필요합니다.',
            );

            navigate(
                '/auth',
                {
                    state: {
                        from:
                            `/products/${product.id}`,
                    },
                },
            );

            return;
        }

        toggleSubscription();
    }

    return (
        <article
            className={
                soldOut
                    ? 'product-card sold-out'
                    : 'product-card'
            }
        >
            <Link
                to={`/products/${product.id}`}
                className="product-image-link"
                aria-label={`${product.title} 상세 보기`}
            >
                <div className="product-image-area">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="product-image"
                        loading="lazy"
                        onError={(event) => {
                            const image =
                                event.currentTarget;

                            image.onerror = null;

                            image.src =
                                `${import.meta.env.BASE_URL}product-placeholder.svg`;
                        }}
                    />

                    {soldOut && (
                        <span className="sold-out-overlay">
                            품절
                        </span>
                    )}

                    {lowStock && (
                        <span className="low-stock-badge">
                            재고 {stock}개
                        </span>
                    )}
                </div>
            </Link>

            <div className="product-card-content">
                <p className="product-category">
                    {product.category}
                </p>

                <h2 className="product-title">
                    <Link
                        to={`/products/${product.id}`}
                        className="product-title-link"
                    >
                        {product.title}
                    </Link>
                </h2>

                <p className="product-description">
                    {product.description}
                </p>

                <div className="product-rating">
                    <span
                        aria-label={
                            `평점 ${product.rating.rate}`
                        }
                    >
                        ★ {product.rating.rate.toFixed(1)}
                    </span>

                    <span>
                        리뷰{' '}
                        {product.rating.count.toLocaleString()}
                        개
                    </span>
                </div>

                {lowStock && (
                    <p className="product-stock-message low">
                        현재 {stock}개 남았습니다.
                    </p>
                )}

                {soldOut && (
                    <p className="product-stock-message sold-out">
                        현재 품절된 상품입니다.
                    </p>
                )}

                <div className="product-card-footer">
                    <strong className="product-price">
                        {formatPrice(product.price)}
                    </strong>

                    <button
                        type="button"
                        className="add-cart-button"
                        disabled={soldOut}
                        onClick={() => {
                            if (!soldOut) {
                                dispatch(
                                    addToCart(product),
                                );
                            }
                        }}
                    >
                        {soldOut
                            ? '품절'
                            : '장바구니 담기'}
                    </button>
                </div>

                {soldOut && (
                    <>
                        <button
                            type="button"
                            className={
                                subscribed
                                    ? 'restock-button subscribed'
                                    : 'restock-button'
                            }
                            aria-pressed={subscribed}
                            onClick={
                                handleRestockSubscription
                            }
                        >
                            {subscribed
                                ? '✓ 재입고 알림 신청됨'
                                : '🔔 재입고 알림 받기'}
                        </button>

                        {subscribed && (
                            <p className="restock-saved-message">
                                재입고되면 사이트에서
                                알려드릴게요.
                            </p>
                        )}
                    </>
                )}

                <Link
                    to={`/products/${product.id}`}
                    className="product-detail-link"
                >
                    상품 자세히 보기
                </Link>
            </div>
        </article>
    );
}
