import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    Link,
} from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import {
    selectCurrentUser,
} from '../features/auth/authSlice';
import {
    loadProductInventory,
    selectInventoryStatus,
    selectProductStockMap,
} from '../features/inventory/inventorySlice';
import {
    selectProducts,
} from '../features/products/productSlice';
import {
    loadRestockSubscriptions,
    removeRestockSubscription,
} from '../features/restock/restockStorage';
import './RestockNotification.css';

export default function RestockNotification() {
    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const products = useAppSelector(
        selectProducts,
    );

    const inventoryStatus = useAppSelector(
        selectInventoryStatus,
    );

    const stockByProductId = useAppSelector(
        selectProductStockMap,
    );

    const [
        restockedProductId,
        setRestockedProductId,
    ] = useState<number | null>(null);

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

    useEffect(() => {
        if (
            !currentUser
            || inventoryStatus !== 'succeeded'
        ) {
            setRestockedProductId(null);
            return;
        }

        const subscriptions =
            loadRestockSubscriptions(
                currentUser.id,
            );

        const availableProductId =
            subscriptions.find((productId) => {
                return (
                    stockByProductId[productId]
                    ?? 0
                ) > 0;
            });

        setRestockedProductId(
            availableProductId ?? null,
        );
    }, [
        currentUser,
        inventoryStatus,
        stockByProductId,
    ]);

    const product = useMemo(
        () => products.find(
            (item) =>
                item.id === restockedProductId,
        ),
        [
            products,
            restockedProductId,
        ],
    );

    if (
        !currentUser
        || restockedProductId === null
    ) {
        return null;
    }

    /*
     * 이벤트 함수가 나중에 실행되더라도 null이 아닌 값을
     * 사용하도록 현재 값을 지역 상수에 고정한다.
     */
    const authenticatedUserId =
        currentUser.id;

    const notifiedProductId =
        restockedProductId;

    function completeNotification(): void {
        removeRestockSubscription(
            authenticatedUserId,
            notifiedProductId,
        );

        setRestockedProductId(null);
    }

    return (
        <aside
            className="restock-notification"
            role="status"
            aria-live="polite"
        >
            <div
                className="restock-notification-icon"
                aria-hidden="true"
            >
                🔔
            </div>

            <div className="restock-notification-content">
                <strong>
                    요청하신 상품이 재입고되었습니다.
                </strong>

                <p>
                    {product?.title
                        ?? '재입고 알림 신청 상품'}
                </p>

                <Link
                    to={`/products/${restockedProductId}`}
                    onClick={completeNotification}
                >
                    상품 확인하기
                </Link>
            </div>

            <button
                type="button"
                aria-label="재입고 알림 닫기"
                onClick={completeNotification}
            >
                ×
            </button>
        </aside>
    );
}
