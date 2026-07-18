import { Link } from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import {
    logout,
    selectCurrentUser,
} from '../features/auth/authSlice';
import {
    selectCartItemCount,
} from '../features/cart/cartSlice';
import './SiteHeader.css';

export default function SiteHeader() {
    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const cartItemCount = useAppSelector(
        selectCartItemCount,
    );

    const displayedCartCount =
        cartItemCount > 99
            ? '99+'
            : cartItemCount.toString();

    if (currentUser?.role === 'admin') {
        return (
            <header className="site-header">
                <div className="site-header-inner">
                    <Link
                        to="/admin"
                        className="site-logo"
                    >
                        React Shop Admin
                    </Link>

                    <nav
                        className="site-navigation"
                        aria-label="관리자 메뉴"
                    >
                        <Link
                            to="/admin"
                            className="header-admin-link"
                        >
                            관리자 메뉴
                        </Link>

                        <span className="header-user">
                            {currentUser.nickname}님
                        </span>

                        <button
                            type="button"
                            className="header-logout-button"
                            onClick={() => {
                                dispatch(logout());
                            }}
                        >
                            로그아웃
                        </button>
                    </nav>
                </div>
            </header>
        );
    }

    return (
        <header className="site-header">
            <div className="site-header-inner">
                <Link
                    to="/"
                    className="site-logo"
                >
                    React Shop
                </Link>

                <nav
                    className="site-navigation"
                    aria-label="주요 메뉴"
                >
                    <Link to="/">
                        상품
                    </Link>

                    <Link
                        to="/cart"
                        className="header-cart-link"
                    >
                        장바구니

                        {cartItemCount > 0 && (
                            <span
                                className="cart-count-badge"
                                aria-label={`장바구니 상품 ${cartItemCount}개`}
                            >
                                {displayedCartCount}
                            </span>
                        )}
                    </Link>

                    {currentUser ? (
                        <>
                            <Link
                                to="/orders"
                                className="header-orders-link"
                            >
                                구매 내역
                            </Link>

                            <Link
                                to="/account"
                                className="header-account-link"
                            >
                                계정 관리
                            </Link>

                            <span className="header-user">
                                {currentUser.nickname}님
                            </span>

                            <button
                                type="button"
                                className="header-logout-button"
                                onClick={() => {
                                    dispatch(logout());
                                }}
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/auth"
                            className="header-auth-link"
                        >
                            로그인 · 회원가입
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
