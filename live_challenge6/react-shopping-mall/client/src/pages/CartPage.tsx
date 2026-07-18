import {
    useEffect,
    useState,
} from 'react';
import {
    Link,
    useNavigate,
} from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import {
    selectAuthToken,
    selectCurrentUser,
} from '../features/auth/authSlice';
import {
    clearCart,
    decreaseCartItemQuantity,
    increaseCartItemQuantity,
    removeCartItem,
    selectCartItems,
    selectCartSubtotal,
} from '../features/cart/cartSlice';
import {
    loadProductInventory,
    selectInventoryError,
    selectInventoryStatus,
    selectProductStockMap,
} from '../features/inventory/inventorySlice';
import {
    ApiRequestError,
} from '../services/authApi';
import {
    createOrder,
} from '../services/orderApi';
import {
    formatPrice,
} from '../utils/formatPrice';
import './CartPage.css';

export default function CartPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const token = useAppSelector(
        selectAuthToken,
    );

    const cartItems = useAppSelector(
        selectCartItems,
    );

    const subtotal = useAppSelector(
        selectCartSubtotal,
    );

    const inventoryStatus = useAppSelector(
        selectInventoryStatus,
    );

    const inventoryError = useAppSelector(
        selectInventoryError,
    );

    const stockByProductId = useAppSelector(
        selectProductStockMap,
    );

    const [isCheckingOut, setIsCheckingOut] =
        useState(false);

    useEffect(() => {
        if (inventoryStatus === 'idle') {
            void dispatch(
                loadProductInventory(),
            );
        }
    }, [
        dispatch,
        inventoryStatus,
    ]);

    const hasUnavailableItem =
        cartItems.some((item) => {
            const stock =
                stockByProductId[
                    item.productId
                ] ?? 0;

            return (
                stock === 0
                || item.quantity > stock
            );
        });

    const unavailableItemCount =
        cartItems.filter((item) => {
            const stock =
                stockByProductId[
                    item.productId
                ] ?? 0;

            return (
                stock === 0
                || item.quantity > stock
            );
        }).length;

    function handleClearCart(): void {
        const confirmed = window.confirm(
            '장바구니의 모든 상품을 삭제하시겠습니까?',
        );

        if (!confirmed) {
            return;
        }

        dispatch(clearCart());
    }

    async function handleCheckout(): Promise<void> {
        if (
            hasUnavailableItem
            || isCheckingOut
        ) {
            return;
        }

        if (!currentUser || !token) {
            window.alert(
                '결제를 진행하려면 로그인해 주세요.',
            );

            navigate(
                '/auth',
                {
                    state: {
                        from: '/cart',
                    },
                },
            );

            return;
        }

        setIsCheckingOut(true);

        try {
            const response =
                await createOrder(
                    token,
                    cartItems,
                );

            dispatch(clearCart());

            /*
             * 서버에서 결제 수량만큼 차감된
             * 최신 재고를 다시 불러온다.
             */
            await dispatch(
                loadProductInventory(),
            );

            window.alert(response.message);

            navigate(
                '/orders',
                {
                    replace: true,
                },
            );
        } catch (error) {
            /*
             * 결제 직전 재고가 변경되었을 수 있으므로
             * 실패한 경우에도 최신 재고를 불러온다.
             */
            await dispatch(
                loadProductInventory(),
            );

            const message =
                error instanceof ApiRequestError
                    ? error.message
                    : error instanceof Error
                        ? error.message
                        : '결제 처리 중 오류가 발생했습니다.';

            window.alert(message);
        } finally {
            setIsCheckingOut(false);
        }
    }

    if (
        inventoryStatus === 'idle'
        || inventoryStatus === 'loading'
    ) {
        return (
            <main className="cart-page">
                <section className="empty-cart">
                    <h1>
                        상품 재고를 확인하고 있습니다.
                    </h1>

                    <p>잠시만 기다려 주세요.</p>
                </section>
            </main>
        );
    }

    if (inventoryStatus === 'failed') {
        return (
            <main className="cart-page">
                <section className="empty-cart">
                    <h1>
                        상품 재고를 불러오지 못했습니다.
                    </h1>

                    <p>
                        {inventoryError
                            ?? '서버 연결 상태를 확인해 주세요.'}
                    </p>

                    <button
                        type="button"
                        className="empty-cart-link"
                        onClick={() => {
                            void dispatch(
                                loadProductInventory(),
                            );
                        }}
                    >
                        다시 시도
                    </button>
                </section>
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="cart-page">
                <section className="empty-cart">
                    <div
                        className="empty-cart-icon"
                        aria-hidden="true"
                    >
                        🛒
                    </div>

                    <h1>
                        장바구니가 비어 있습니다.
                    </h1>

                    <p>
                        상품을 둘러보고 원하는 상품을
                        장바구니에 담아보세요.
                    </p>

                    <Link
                        to="/"
                        className="empty-cart-link"
                    >
                        상품 둘러보기
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <section className="cart-container">
                <header className="cart-page-header">
                    <div>
                        <p className="cart-page-eyebrow">
                            SHOPPING CART
                        </p>

                        <h1>장바구니</h1>

                        <p>
                            총 {cartItems.length}종의 상품이
                            담겨 있습니다.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="clear-cart-button"
                        disabled={isCheckingOut}
                        onClick={handleClearCart}
                    >
                        전체 삭제
                    </button>
                </header>

                {hasUnavailableItem && (
                    <div
                        className="cart-stock-warning"
                        role="alert"
                    >
                        <div
                            className="cart-stock-warning-icon"
                            aria-hidden="true"
                        >
                            !
                        </div>

                        <div>
                            <strong>
                                구매할 수 없는 상품이 있습니다.
                            </strong>

                            <p>
                                품절 또는 재고가 부족한 상품
                                {' '}
                                {unavailableItemCount}개를
                                삭제하거나 수량을 조정해 주세요.
                            </p>
                        </div>
                    </div>
                )}

                <div className="cart-layout">
                    <section
                        className="cart-item-list"
                        aria-label="장바구니 상품 목록"
                    >
                        {cartItems.map((item) => {
                            const stock =
                                stockByProductId[
                                    item.productId
                                ] ?? 0;

                            const soldOut =
                                stock === 0;

                            const insufficientStock =
                                stock > 0
                                && item.quantity > stock;

                            const unavailable =
                                soldOut
                                || insufficientStock;

                            const canIncrease =
                                !isCheckingOut
                                && !soldOut
                                && item.quantity < stock;

                            const canDecrease =
                                !isCheckingOut
                                && !soldOut
                                && item.quantity > 1;

                            return (
                                <article
                                    key={item.productId}
                                    className={
                                        unavailable
                                            ? 'cart-item unavailable'
                                            : 'cart-item'
                                    }
                                >
                                    <Link
                                        to={`/products/${item.productId}`}
                                        className="cart-item-image-link"
                                        aria-label={`${item.title} 상세 보기`}
                                    >
                                        <div className="cart-item-image-area">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="cart-item-image"
                                                onError={(event) => {
                                                    const image =
                                                        event.currentTarget;

                                                    image.onerror =
                                                        null;

                                                    image.src =
                                                        `${import.meta.env.BASE_URL}product-placeholder.svg`;
                                                }}
                                            />

                                            {soldOut && (
                                                <span className="cart-sold-out-overlay">
                                                    품절
                                                </span>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="cart-item-information">
                                        <p className="cart-item-category">
                                            {item.category}
                                        </p>

                                        <h2>
                                            <Link
                                                to={`/products/${item.productId}`}
                                            >
                                                {item.title}
                                            </Link>
                                        </h2>

                                        <p className="cart-item-unit-price">
                                            개당{' '}
                                            {formatPrice(
                                                item.price,
                                            )}
                                        </p>

                                        {soldOut && (
                                            <div
                                                className="cart-item-stock-message sold-out"
                                                role="status"
                                            >
                                                <strong>
                                                    품절된 상품입니다.
                                                </strong>

                                                <span>
                                                    이 상품을 삭제해야
                                                    결제를 진행할 수
                                                    있습니다.
                                                </span>
                                            </div>
                                        )}

                                        {insufficientStock && (
                                            <div
                                                className="cart-item-stock-message insufficient"
                                                role="status"
                                            >
                                                <strong>
                                                    재고가 부족합니다.
                                                </strong>

                                                <span>
                                                    현재 구매 가능한
                                                    수량은 {stock}개입니다.
                                                </span>
                                            </div>
                                        )}

                                        {!unavailable
                                            && stock <= 10
                                            && (
                                                <p className="cart-item-low-stock">
                                                    현재 재고 {stock}개
                                                </p>
                                            )}

                                        <div className="cart-item-actions">
                                            <div
                                                className="cart-quantity-control"
                                                aria-label={`${item.title} 수량 변경`}
                                            >
                                                <button
                                                    type="button"
                                                    aria-label="수량 줄이기"
                                                    disabled={
                                                        !canDecrease
                                                    }
                                                    onClick={() => {
                                                        dispatch(
                                                            decreaseCartItemQuantity(
                                                                item.productId,
                                                            ),
                                                        );
                                                    }}
                                                >
                                                    −
                                                </button>

                                                <span
                                                    aria-label={`현재 수량 ${item.quantity}개`}
                                                >
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    aria-label="수량 늘리기"
                                                    disabled={
                                                        !canIncrease
                                                    }
                                                    onClick={() => {
                                                        dispatch(
                                                            increaseCartItemQuantity(
                                                                item.productId,
                                                            ),
                                                        );
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className="remove-cart-item-button"
                                                disabled={
                                                    isCheckingOut
                                                }
                                                onClick={() => {
                                                    dispatch(
                                                        removeCartItem(
                                                            item.productId,
                                                        ),
                                                    );
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-item-total">
                                        <span>상품 금액</span>

                                        <strong>
                                            {formatPrice(
                                                item.price
                                                * item.quantity,
                                            )}
                                        </strong>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <aside className="cart-summary">
                        <h2>주문 금액</h2>

                        <dl>
                            <div>
                                <dt>상품 금액</dt>

                                <dd>
                                    {formatPrice(subtotal)}
                                </dd>
                            </div>

                            <div>
                                <dt>배송비</dt>
                                <dd>무료</dd>
                            </div>

                            <div className="cart-summary-total">
                                <dt>총 결제 금액</dt>

                                <dd>
                                    {formatPrice(subtotal)}
                                </dd>
                            </div>
                        </dl>

                        {hasUnavailableItem && (
                            <p className="cart-summary-warning">
                                품절 또는 재고 부족 상품이 있어
                                결제를 진행할 수 없습니다.
                            </p>
                        )}

                        <button
                            type="button"
                            className="checkout-button"
                            disabled={
                                hasUnavailableItem
                                || isCheckingOut
                            }
                            onClick={() => {
                                void handleCheckout();
                            }}
                        >
                            {hasUnavailableItem
                                ? '장바구니 상품을 확인해 주세요'
                                : isCheckingOut
                                    ? '결제 처리 중...'
                                    : '결제하기'}
                        </button>

                        {!currentUser
                            && !hasUnavailableItem
                            && (
                                <p className="checkout-login-note">
                                    결제 시 로그인이 필요합니다.
                                </p>
                            )}

                        <Link
                            to="/"
                            className="continue-shopping-link"
                        >
                            쇼핑 계속하기
                        </Link>
                    </aside>
                </div>
            </section>
        </main>
    );
}
