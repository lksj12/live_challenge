import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
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
    deleteUserByAdmin,
    fetchAdminUsers,
    resetUserPassword,
} from '../services/adminApi';
import {
    ApiRequestError,
} from '../services/authApi';
import {
    fetchProductInventory,
    updateProductInventory,
} from '../services/inventoryApi';
import {
    loadProducts,
} from '../services/productApi';
import type {
    AdminUser,
} from '../types/admin';
import type {
    Product,
} from '../types/product';
import {
    formatPrice,
} from '../utils/formatPrice';
import './AdminPage.css';

type AdminTab =
    | 'users'
    | 'products';

interface TemporaryPasswordInformation {
    email: string;
    password: string;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return '요청 처리 중 알 수 없는 오류가 발생했습니다.';
}

function formatDate(value: string): string {
    const date = new Date(
        value.includes('T')
            ? value
            : `${value.replace(' ', 'T')}Z`,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        'ko-KR',
        {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        },
    ).format(date);
}

export default function AdminPage() {
    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const token = useAppSelector(
        selectAuthToken,
    );

    const [activeTab, setActiveTab] =
        useState<AdminTab>('users');

    const [users, setUsers] =
        useState<AdminUser[]>([]);

    const [isUserLoading, setIsUserLoading] =
        useState(true);

    const [processingUserId, setProcessingUserId] =
        useState<number | null>(null);

    const [userError, setUserError] =
        useState<string | null>(null);

    const [
        temporaryPasswordInformation,
        setTemporaryPasswordInformation,
    ] = useState<TemporaryPasswordInformation | null>(
        null,
    );

    const [products, setProducts] =
        useState<Product[]>([]);

    const [
        inventoryByProductId,
        setInventoryByProductId,
    ] = useState<Record<number, number>>({});

    const [
        draftStockByProductId,
        setDraftStockByProductId,
    ] = useState<Record<number, string>>({});

    const [isProductLoading, setIsProductLoading] =
        useState(false);

    const [savingProductId, setSavingProductId] =
        useState<number | null>(null);

    const [productError, setProductError] =
        useState<string | null>(null);

    const [productMessage, setProductMessage] =
        useState<string | null>(null);

    const [productWarning, setProductWarning] =
        useState<string | null>(null);

    const isAdmin =
        currentUser?.role === 'admin';

    const loadUsers = useCallback(
        async (authToken: string) => {
            setIsUserLoading(true);
            setUserError(null);

            try {
                const response =
                    await fetchAdminUsers(authToken);

                setUsers(response.users);
            } catch (requestError) {
                setUserError(
                    getErrorMessage(requestError),
                );
            } finally {
                setIsUserLoading(false);
            }
        },
        [],
    );

    const loadProductManagement =
        useCallback(async () => {
            setIsProductLoading(true);
            setProductError(null);
            setProductMessage(null);

            try {
                const [
                    productResult,
                    inventoryResponse,
                ] = await Promise.all([
                    loadProducts(),
                    fetchProductInventory(),
                ]);

                const nextInventory =
                    inventoryResponse.inventory.reduce<
                        Record<number, number>
                    >(
                        (stockMap, item) => {
                            stockMap[item.productId] =
                                item.stock;

                            return stockMap;
                        },
                        {},
                    );

                const nextDraftStock =
                    productResult.products.reduce<
                        Record<number, string>
                    >(
                        (stockMap, product) => {
                            stockMap[product.id] =
                                String(
                                    nextInventory[
                                        product.id
                                    ] ?? 0,
                                );

                            return stockMap;
                        },
                        {},
                    );

                setProducts(
                    productResult.products,
                );

                setInventoryByProductId(
                    nextInventory,
                );

                setDraftStockByProductId(
                    nextDraftStock,
                );

                setProductWarning(
                    productResult.warning,
                );
            } catch (requestError) {
                setProductError(
                    getErrorMessage(requestError),
                );
            } finally {
                setIsProductLoading(false);
            }
        }, []);

    useEffect(() => {
        if (!token || !isAdmin) {
            return;
        }

        void loadUsers(token);
    }, [
        isAdmin,
        loadUsers,
        token,
    ]);

    useEffect(() => {
        if (
            !isAdmin
            || activeTab !== 'products'
        ) {
            return;
        }

        void loadProductManagement();
    }, [
        activeTab,
        isAdmin,
        loadProductManagement,
    ]);

    const productStatistics = useMemo(() => {
        const soldOutCount =
            products.filter((product) => {
                return (
                    inventoryByProductId[
                        product.id
                    ] ?? 0
                ) === 0;
            }).length;

        const lowStockCount =
            products.filter((product) => {
                const stock =
                    inventoryByProductId[
                        product.id
                    ] ?? 0;

                return stock > 0 && stock <= 10;
            }).length;

        const totalStock =
            products.reduce(
                (total, product) => {
                    return total + (
                        inventoryByProductId[
                            product.id
                        ] ?? 0
                    );
                },
                0,
            );

        return {
            soldOutCount,
            lowStockCount,
            totalStock,
        };
    }, [
        inventoryByProductId,
        products,
    ]);

    if (!currentUser || !token) {
        return (
            <Navigate
                to="/auth"
                replace
            />
        );
    }

    if (!isAdmin) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    const authToken = token;

    async function handleResetPassword(
        user: AdminUser,
    ): Promise<void> {
        if (user.role === 'admin') {
            return;
        }

        const confirmed = window.confirm(
            `${user.nickname}(${user.email}) 사용자의 비밀번호를 초기화하시겠습니까?`,
        );

        if (!confirmed) {
            return;
        }

        setProcessingUserId(user.id);
        setUserError(null);
        setTemporaryPasswordInformation(null);

        try {
            const response =
                await resetUserPassword(
                    authToken,
                    user.id,
                );

            setTemporaryPasswordInformation({
                email: user.email,
                password:
                    response.temporaryPassword,
            });

            await loadUsers(authToken);
        } catch (requestError) {
            setUserError(
                getErrorMessage(requestError),
            );
        } finally {
            setProcessingUserId(null);
        }
    }

    async function handleDeleteUser(
        user: AdminUser,
    ): Promise<void> {
        if (user.role === 'admin') {
            return;
        }

        const confirmed = window.confirm(
            `${user.nickname}(${user.email}) 사용자를 삭제하시겠습니까?\n\n계정과 구매 내역이 모두 삭제되며 복구할 수 없습니다.`,
        );

        if (!confirmed) {
            return;
        }

        setProcessingUserId(user.id);
        setUserError(null);
        setTemporaryPasswordInformation(null);

        try {
            const response =
                await deleteUserByAdmin(
                    authToken,
                    user.id,
                );

            window.alert(response.message);

            await loadUsers(authToken);
        } catch (requestError) {
            setUserError(
                getErrorMessage(requestError),
            );
        } finally {
            setProcessingUserId(null);
        }
    }

    function handleStockInputChange(
        productId: number,
        value: string,
    ): void {
        const normalizedValue =
            value.replace(/\D/g, '').slice(0, 5);

        setDraftStockByProductId(
            (currentDraftStock) => ({
                ...currentDraftStock,
                [productId]: normalizedValue,
            }),
        );
    }

    async function handleSaveStock(
        product: Product,
    ): Promise<void> {
        const draftValue =
            draftStockByProductId[
                product.id
            ];

        const nextStock =
            Number(draftValue);

        if (
            draftValue === undefined
            || draftValue === ''
            || !Number.isInteger(nextStock)
            || nextStock < 0
            || nextStock > 99999
        ) {
            setProductError(
                '재고 수량은 0 이상 99,999 이하의 정수여야 합니다.',
            );
            return;
        }

        setSavingProductId(product.id);
        setProductError(null);
        setProductMessage(null);

        try {
            const response =
                await updateProductInventory(
                    authToken,
                    product.id,
                    nextStock,
                );

            setInventoryByProductId(
                (currentInventory) => ({
                    ...currentInventory,
                    [product.id]:
                        response.inventory.stock,
                }),
            );

            setDraftStockByProductId(
                (currentDraftStock) => ({
                    ...currentDraftStock,
                    [product.id]:
                        String(
                            response.inventory.stock,
                        ),
                }),
            );

            setProductMessage(
                `${product.title}: ${response.message}`,
            );
        } catch (requestError) {
            setProductError(
                getErrorMessage(requestError),
            );
        } finally {
            setSavingProductId(null);
        }
    }

    return (
        <main className="admin-page">
            <div className="admin-page-inner">
                <header className="admin-page-header">
                    <div>
                        <p className="admin-page-eyebrow">
                            ADMIN
                        </p>

                        <h1>관리자 메뉴</h1>

                        <p>
                            사용자 계정과 상품 재고를
                            관리합니다.
                        </p>
                    </div>
                </header>

                <nav
                    className="admin-tab-navigation"
                    aria-label="관리자 기능"
                >
                    <button
                        type="button"
                        className={
                            activeTab === 'users'
                                ? 'admin-tab active'
                                : 'admin-tab'
                        }
                        onClick={() => {
                            setActiveTab('users');
                        }}
                    >
                        사용자 관리
                    </button>

                    <button
                        type="button"
                        className={
                            activeTab === 'products'
                                ? 'admin-tab active'
                                : 'admin-tab'
                        }
                        onClick={() => {
                            setActiveTab('products');
                        }}
                    >
                        상품 관리
                    </button>
                </nav>

                {activeTab === 'users' && (
                    <>
                        <section className="admin-section-toolbar">
                            <div>
                                <h2>사용자 관리</h2>

                                <p>
                                    계정 삭제와 비밀번호
                                    초기화를 처리합니다.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-refresh-button"
                                onClick={() => {
                                    void loadUsers(
                                        authToken,
                                    );
                                }}
                                disabled={isUserLoading}
                            >
                                {isUserLoading
                                    ? '불러오는 중...'
                                    : '새로고침'}
                            </button>
                        </section>

                        {temporaryPasswordInformation && (
                            <section
                                className="temporary-password-card"
                                role="status"
                            >
                                <div>
                                    <strong>
                                        임시 비밀번호가
                                        발급되었습니다.
                                    </strong>

                                    <p>
                                        사용자에게 별도로
                                        전달해야 합니다. 로그인
                                        후 새 비밀번호로 변경해야
                                        합니다.
                                    </p>
                                </div>

                                <dl>
                                    <div>
                                        <dt>사용자</dt>
                                        <dd>
                                            {
                                                temporaryPasswordInformation.email
                                            }
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>임시 비밀번호</dt>
                                        <dd>
                                            <code>
                                                {
                                                    temporaryPasswordInformation.password
                                                }
                                            </code>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void navigator.clipboard.writeText(
                                                        temporaryPasswordInformation.password,
                                                    );
                                                }}
                                            >
                                                복사
                                            </button>
                                        </dd>
                                    </div>
                                </dl>

                                <button
                                    type="button"
                                    className="temporary-password-close"
                                    onClick={() => {
                                        setTemporaryPasswordInformation(
                                            null,
                                        );
                                    }}
                                >
                                    닫기
                                </button>
                            </section>
                        )}

                        {userError && (
                            <p
                                className="admin-error-message"
                                role="alert"
                            >
                                {userError}
                            </p>
                        )}

                        <section className="admin-users-card">
                            <div className="admin-users-summary">
                                <h2>등록 사용자</h2>

                                <span>
                                    총 {users.length}명
                                </span>
                            </div>

                            {isUserLoading ? (
                                <div className="admin-loading">
                                    사용자 목록을 불러오고
                                    있습니다.
                                </div>
                            ) : users.length === 0 ? (
                                <div className="admin-empty">
                                    등록된 사용자가 없습니다.
                                </div>
                            ) : (
                                <div className="admin-table-wrapper">
                                    <table className="admin-users-table">
                                        <thead>
                                            <tr>
                                                <th>사용자</th>
                                                <th>권한</th>
                                                <th>가입일</th>
                                                <th>주문</th>
                                                <th>
                                                    비밀번호 상태
                                                </th>
                                                <th>관리</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {users.map((user) => {
                                                const isProcessing =
                                                    processingUserId
                                                    === user.id;

                                                return (
                                                    <tr key={user.id}>
                                                        <td>
                                                            <strong>
                                                                {
                                                                    user.nickname
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    user.email
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    user.role
                                                                    === 'admin'
                                                                        ? 'admin-role-badge admin-role-badge-admin'
                                                                        : 'admin-role-badge'
                                                                }
                                                            >
                                                                {user.role
                                                                === 'admin'
                                                                    ? '관리자'
                                                                    : '일반 사용자'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {formatDate(
                                                                user.createdAt,
                                                            )}
                                                        </td>

                                                        <td>
                                                            {
                                                                user.orderCount
                                                            }
                                                            건
                                                        </td>

                                                        <td>
                                                            {user.mustChangePassword
                                                                ? (
                                                                    <span className="password-state-warning">
                                                                        변경 필요
                                                                    </span>
                                                                )
                                                                : (
                                                                    <span className="password-state-normal">
                                                                        정상
                                                                    </span>
                                                                )}
                                                        </td>

                                                        <td>
                                                            {user.role
                                                            === 'admin'
                                                                ? (
                                                                    <span className="admin-protected-text">
                                                                        보호 계정
                                                                    </span>
                                                                )
                                                                : (
                                                                    <div className="admin-action-buttons">
                                                                        <button
                                                                            type="button"
                                                                            className="admin-reset-button"
                                                                            disabled={
                                                                                isProcessing
                                                                            }
                                                                            onClick={() => {
                                                                                void handleResetPassword(
                                                                                    user,
                                                                                );
                                                                            }}
                                                                        >
                                                                            비밀번호 초기화
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="admin-delete-button"
                                                                            disabled={
                                                                                isProcessing
                                                                            }
                                                                            onClick={() => {
                                                                                void handleDeleteUser(
                                                                                    user,
                                                                                );
                                                                            }}
                                                                        >
                                                                            삭제
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {activeTab === 'products' && (
                    <>
                        <section className="admin-section-toolbar">
                            <div>
                                <h2>상품 관리</h2>

                                <p>
                                    상품별 재고 수량을 변경할 수
                                    있습니다. 재고가 0이면
                                    품절입니다.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-refresh-button"
                                onClick={() => {
                                    void loadProductManagement();
                                }}
                                disabled={isProductLoading}
                            >
                                {isProductLoading
                                    ? '불러오는 중...'
                                    : '새로고침'}
                            </button>
                        </section>

                        <section className="inventory-statistics">
                            <div>
                                <span>등록 상품</span>
                                <strong>
                                    {products.length}개
                                </strong>
                            </div>

                            <div>
                                <span>전체 재고</span>
                                <strong>
                                    {
                                        productStatistics.totalStock
                                    }
                                    개
                                </strong>
                            </div>

                            <div>
                                <span>재고 부족</span>
                                <strong>
                                    {
                                        productStatistics.lowStockCount
                                    }
                                    개
                                </strong>
                            </div>

                            <div>
                                <span>품절</span>
                                <strong>
                                    {
                                        productStatistics.soldOutCount
                                    }
                                    개
                                </strong>
                            </div>
                        </section>

                        {productWarning && (
                            <p className="admin-warning-message">
                                {productWarning}
                            </p>
                        )}

                        {productError && (
                            <p
                                className="admin-error-message"
                                role="alert"
                            >
                                {productError}
                            </p>
                        )}

                        {productMessage && (
                            <p
                                className="admin-success-message"
                                role="status"
                            >
                                {productMessage}
                            </p>
                        )}

                        {isProductLoading ? (
                            <section className="admin-product-loading">
                                상품과 재고 정보를 불러오고
                                있습니다.
                            </section>
                        ) : (
                            <section className="admin-product-list">
                                {products.map((product) => {
                                    const currentStock =
                                        inventoryByProductId[
                                            product.id
                                        ] ?? 0;

                                    const draftStock =
                                        draftStockByProductId[
                                            product.id
                                        ] ?? String(
                                            currentStock,
                                        );

                                    const hasChanged =
                                        draftStock
                                        !== String(
                                            currentStock,
                                        );

                                    const isSaving =
                                        savingProductId
                                        === product.id;

                                    return (
                                        <article
                                            key={product.id}
                                            className="admin-product-card"
                                        >
                                            <div className="admin-product-image-area">
                                                <img
                                                    src={
                                                        product.image
                                                    }
                                                    alt={
                                                        product.title
                                                    }
                                                    onError={(
                                                        event,
                                                    ) => {
                                                        const image =
                                                            event.currentTarget;

                                                        image.onerror =
                                                            null;

                                                        image.src =
                                                            `${import.meta.env.BASE_URL}product-placeholder.svg`;
                                                    }}
                                                />
                                            </div>

                                            <div className="admin-product-information">
                                                <p className="admin-product-category">
                                                    {
                                                        product.category
                                                    }
                                                </p>

                                                <h3>
                                                    {product.title}
                                                </h3>

                                                <p className="admin-product-meta">
                                                    상품 ID:
                                                    {' '}
                                                    {product.id}
                                                </p>

                                                <strong className="admin-product-price">
                                                    {formatPrice(
                                                        product.price,
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="admin-product-stock">
                                                <div className="admin-stock-current">
                                                    <span>
                                                        현재 상태
                                                    </span>

                                                    <strong
                                                        className={
                                                            currentStock
                                                            === 0
                                                                ? 'stock-status sold-out'
                                                                : currentStock
                                                                    <= 10
                                                                    ? 'stock-status low'
                                                                    : 'stock-status normal'
                                                        }
                                                    >
                                                        {currentStock
                                                        === 0
                                                            ? '품절'
                                                            : currentStock
                                                                <= 10
                                                                ? `재고 부족 · ${currentStock}개`
                                                                : `판매 가능 · ${currentStock}개`}
                                                    </strong>
                                                </div>

                                                <label className="admin-stock-field">
                                                    <span>
                                                        재고 수량
                                                    </span>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="99999"
                                                        step="1"
                                                        value={
                                                            draftStock
                                                        }
                                                        disabled={
                                                            isSaving
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) => {
                                                            handleStockInputChange(
                                                                product.id,
                                                                event.target.value,
                                                            );
                                                        }}
                                                    />
                                                </label>

                                                <button
                                                    type="button"
                                                    className="admin-stock-save-button"
                                                    disabled={
                                                        isSaving
                                                        || !hasChanged
                                                    }
                                                    onClick={() => {
                                                        void handleSaveStock(
                                                            product,
                                                        );
                                                    }}
                                                >
                                                    {isSaving
                                                        ? '저장 중...'
                                                        : hasChanged
                                                            ? '재고 저장'
                                                            : '저장됨'}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
