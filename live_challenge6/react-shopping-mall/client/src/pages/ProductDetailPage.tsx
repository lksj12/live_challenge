import {
    useEffect,
    useMemo,
} from 'react';
import {
    Link,
    useNavigate,
    useParams,
} from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import { addToCart } from '../features/cart/cartSlice';
import {
    loadProductInventory,
    selectInventoryError,
    selectInventoryStatus,
    selectProductStockMap,
} from '../features/inventory/inventorySlice';
import {
    loadProductCatalog,
    selectProductError,
    selectProducts,
    selectProductSource,
    selectProductStatus,
    selectProductWarning,
} from '../features/products/productSlice';
import {
    lowStockThreshold,
} from '../features/products/productStock';
import { useRestockSubscription } from '../hooks/useRestockSubscription';
import { formatPrice } from '../utils/formatPrice';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { productId } = useParams<'productId'>();

    const products = useAppSelector(selectProducts);
    const status = useAppSelector(selectProductStatus);
    const source = useAppSelector(selectProductSource);
    const warning = useAppSelector(selectProductWarning);
    const error = useAppSelector(selectProductError);

    const inventoryStatus = useAppSelector(
        selectInventoryStatus,
    );

    const inventoryError = useAppSelector(
        selectInventoryError,
    );

    const stockByProductId = useAppSelector(
        selectProductStockMap,
    );

    const numericProductId = Number(productId);

    const isValidProductId =
        productId !== undefined
        && Number.isInteger(numericProductId)
        && numericProductId > 0;

    const subscriptionProductId =
        isValidProductId
            ? numericProductId
            : -1;

    const {
        currentUser,
        subscribed,
        toggleSubscription,
    } = useRestockSubscription(subscriptionProductId);

    const product = useMemo(() => {
        if (!isValidProductId) {
            return undefined;
        }

        return products.find(
            (item) => item.id === numericProductId,
        );
    }, [
        isValidProductId,
        numericProductId,
        products,
    ]);

    useEffect(() => {
        if (status === 'idle') {
            void dispatch(loadProductCatalog());
        }
    }, [dispatch, status]);

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

    const handleRestockSubscription = () => {
        if (!currentUser) {
            window.alert(
                '재입고 알림을 받으려면 로그인이 필요합니다.',
            );
            navigate('/auth');
            return;
        }

        toggleSubscription();
    };

    if (
        status === 'idle'
        || status === 'loading'
        || inventoryStatus === 'idle'
        || inventoryStatus === 'loading'
    ) {
        return (
            <main className="product-detail-page">
                <section className="detail-state">
                    <div
                        className="detail-spinner"
                        aria-hidden="true"
                    />

                    <h1>상품 정보를 불러오고 있습니다.</h1>

                    <p>잠시만 기다려 주세요.</p>
                </section>
            </main>
        );
    }

    if (
        status === 'failed'
        || inventoryStatus === 'failed'
    ) {
        return (
            <main className="product-detail-page">
                <section className="detail-state error">
                    <h1>상품 정보를 불러오지 못했습니다.</h1>

                    <p>
                        {error
                            ?? inventoryError
                            ?? '잠시 후 다시 시도해 주세요.'}
                    </p>

                    <div className="detail-state-actions">
                        <button
                            type="button"
                            className="detail-retry-button"
                            onClick={() => {
                                void dispatch(
                                    loadProductCatalog(),
                                );

                                void dispatch(
                                    loadProductInventory(),
                                );
                            }}
                        >
                            다시 시도
                        </button>

                        <Link
                            to="/"
                            className="detail-home-link"
                        >
                            상품 목록으로
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    if (!isValidProductId || !product) {
        return (
            <main className="product-detail-page">
                <section className="detail-state">
                    <p className="detail-error-code">
                        404
                    </p>

                    <h1>상품을 찾을 수 없습니다.</h1>

                    <p>
                        존재하지 않거나 현재 판매하지 않는
                        상품입니다.
                    </p>

                    <Link
                        to="/"
                        className="detail-primary-link"
                    >
                        전체 상품 보기
                    </Link>
                </section>
            </main>
        );
    }

    const stock =
        stockByProductId[product.id] ?? 0;

    const soldOut =
        stock === 0;

    const lowStock =
        stock > 0
        && stock <= lowStockThreshold;

    return (
        <main className="product-detail-page">
            <section className="product-detail-container">
                <nav
                    className="product-breadcrumb"
                    aria-label="현재 위치"
                >
                    <Link to="/">
                        상품
                    </Link>

                    <span aria-hidden="true">
                        /
                    </span>

                    <span>
                        {product.category}
                    </span>
                </nav>

                {warning && (
                    <div
                        className="detail-warning"
                        role="status"
                    >
                        <div>
                            <strong>
                                로컬 임시 상품을 표시하고 있습니다.
                            </strong>

                            <p>{warning}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                void dispatch(
                                    loadProductCatalog(),
                                );
                            }}
                        >
                            API 다시 시도
                        </button>
                    </div>
                )}

                <article className="product-detail-card">
                    <div className="detail-image-section">
                        <div
                            className={
                                soldOut
                                    ? 'detail-image-area sold-out'
                                    : 'detail-image-area'
                            }
                        >
                            <img
                                src={product.image}
                                alt={product.title}
                                className="detail-product-image"
                            />

                            {soldOut && (
                                <span className="detail-sold-out-overlay">
                                    품절
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="detail-information">
                        <div className="detail-meta">
                            <span className="detail-category">
                                {product.category}
                            </span>

                            {source && (
                                <span
                                    className={
                                        `detail-source ${source}`
                                    }
                                >
                                    {source === 'api'
                                        ? 'API 상품'
                                        : '임시 상품'}
                                </span>
                            )}
                        </div>

                        <h1>{product.title}</h1>

                        <div className="detail-rating">
                            <strong>
                                ★ {product.rating.rate.toFixed(1)}
                            </strong>

                            <span>
                                리뷰{' '}
                                {product.rating.count.toLocaleString()}
                                개
                            </span>
                        </div>

                        <p className="detail-price">
                            {formatPrice(product.price)}
                        </p>

                        {soldOut && (
                            <p className="detail-stock-status sold-out">
                                현재 품절된 상품입니다.
                            </p>
                        )}

                        {lowStock && (
                            <p className="detail-stock-status low">
                                현재 {stock}개 남았습니다.
                            </p>
                        )}

                        {!soldOut && !lowStock && (
                            <p className="detail-stock-status available">
                                재고 있음
                            </p>
                        )}

                        <div className="detail-description">
                            <h2>상품 설명</h2>

                            <p>{product.description}</p>
                        </div>

                        <div
                            className={
                                soldOut
                                    ? 'detail-purchase-area sold-out'
                                    : 'detail-purchase-area'
                            }
                        >
                            {soldOut ? (
                                <button
                                    type="button"
                                    className={
                                        subscribed
                                            ? 'detail-restock-button subscribed'
                                            : 'detail-restock-button'
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
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="detail-add-cart-button"
                                        onClick={() => {
                                            dispatch(
                                                addToCart(product),
                                            );
                                        }}
                                    >
                                        장바구니 담기
                                    </button>

                                    <Link
                                        to="/cart"
                                        className="detail-cart-link"
                                    >
                                        장바구니 바로가기
                                    </Link>
                                </>
                            )}
                        </div>

                        {soldOut && subscribed && (
                            <p className="detail-restock-message">
                                재입고되면 사이트 알림으로
                                안내해 드립니다.
                            </p>
                        )}
                    </div>
                </article>

                <Link
                    to="/"
                    className="back-to-catalog-link"
                >
                    ← 상품 목록으로 돌아가기
                </Link>
            </section>
        </main>
    );
}
