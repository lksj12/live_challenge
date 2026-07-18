import { useEffect } from 'react';
import { Link } from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import {
    dismissCartNotification,
    selectCartNotification,
} from '../features/cart/cartSlice';
import './CartNotification.css';

const notificationDurationMilliseconds = 3000;

export default function CartNotification() {
    const dispatch = useAppDispatch();

    const notification = useAppSelector(
        selectCartNotification,
    );

    useEffect(() => {
        if (!notification) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            dispatch(dismissCartNotification());
        }, notificationDurationMilliseconds);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [
        dispatch,
        notification,
    ]);

    if (!notification) {
        return null;
    }

    return (
        <aside
            key={notification.id}
            className="cart-notification"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div
                className="cart-notification-icon"
                aria-hidden="true"
            >
                ✓
            </div>

            <div className="cart-notification-content">
                <strong>
                    장바구니에 담았습니다.
                </strong>

                <p className="cart-notification-product">
                    {notification.productTitle}
                </p>

                <p className="cart-notification-quantity">
                    현재 수량 {notification.quantity}개
                </p>

                <Link
                    to="/cart"
                    className="cart-notification-link"
                    onClick={() => {
                        dispatch(dismissCartNotification());
                    }}
                >
                    장바구니 보기
                </Link>
            </div>

            <button
                type="button"
                className="cart-notification-close"
                aria-label="장바구니 알림 닫기"
                onClick={() => {
                    dispatch(dismissCartNotification());
                }}
            >
                ×
            </button>
        </aside>
    );
}
