import {
    useEffect,
    useState,
} from 'react';
import {
    Navigate,
    Route,
    Routes,
    useLocation,
} from 'react-router';

import {
    useAppDispatch,
    useAppSelector,
} from './app/hooks';
import CartNotification from './components/CartNotification';
import CartTransferDialog from './components/CartTransferDialog';
import RestockNotification from './components/RestockNotification';
import SiteHeader from './components/SiteHeader';
import {
    selectAuthInitialized,
    selectCurrentUser,
} from './features/auth/authSlice';
import {
    replaceCartItems,
    selectCartInitialized,
    selectCartItems,
    selectCartOwnerId,
} from './features/cart/cartSlice';
import {
    loadCartItems,
    mergeCartItems,
    removeCartItems,
    saveCartItems,
} from './features/cart/cartStorage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductPage from './pages/ProductPage';
import type { CartItem } from './types/cart';
import './App.css';

const testUserId = 2;

interface PendingCartTransfer {
    userId: number;
    userItems: CartItem[];
    guestItems: CartItem[];
}

export default function App() {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const authInitialized = useAppSelector(
        selectAuthInitialized,
    );

    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const cartInitialized = useAppSelector(
        selectCartInitialized,
    );

    const cartOwnerId = useAppSelector(
        selectCartOwnerId,
    );

    const cartItems = useAppSelector(
        selectCartItems,
    );

    const [
        pendingCartTransfer,
        setPendingCartTransfer,
    ] = useState<PendingCartTransfer | null>(null);

    const currentUserId = currentUser?.id ?? null;
    const isAdmin = currentUser?.role === 'admin';

    useEffect(() => {
        if (!authInitialized) {
            return;
        }

        /*
         * 관리자는 쇼핑 기능을 사용하지 않는다.
         *
         * 관리자 또는 비회원 장바구니에 상품이 남아 있으면
         * 테스트 사용자(ID 2)의 장바구니로 병합한 뒤
         * 관리자 장바구니를 비운다.
         */
        if (isAdmin && currentUserId !== null) {
            const adminItems = cartInitialized
                && cartOwnerId === currentUserId
                    ? cartItems
                    : loadCartItems(currentUserId);

            const guestItems = cartInitialized
                && cartOwnerId === null
                    ? cartItems
                    : loadCartItems(null);

            const itemsToMove = mergeCartItems(
                adminItems,
                guestItems,
            );

            if (itemsToMove.length > 0) {
                const testUserItems =
                    loadCartItems(testUserId);

                saveCartItems(
                    testUserId,
                    mergeCartItems(
                        testUserItems,
                        itemsToMove,
                    ),
                );
            }

            removeCartItems(currentUserId);
            removeCartItems(null);
            setPendingCartTransfer(null);

            if (
                !cartInitialized
                || cartOwnerId !== currentUserId
                || cartItems.length > 0
            ) {
                dispatch(
                    replaceCartItems({
                        ownerId: currentUserId,
                        items: [],
                    }),
                );
            }

            return;
        }

        if (
            pendingCartTransfer
            && pendingCartTransfer.userId === currentUserId
        ) {
            return;
        }

        /*
         * 앱을 처음 시작했을 때 현재 로그인 상태에 맞는
         * 장바구니를 불러온다.
         */
        if (!cartInitialized) {
            if (currentUserId === null) {
                dispatch(
                    replaceCartItems({
                        ownerId: null,
                        items: loadCartItems(null),
                    }),
                );

                return;
            }

            const userItems =
                loadCartItems(currentUserId);

            const guestItems =
                loadCartItems(null);

            if (guestItems.length === 0) {
                dispatch(
                    replaceCartItems({
                        ownerId: currentUserId,
                        items: userItems,
                    }),
                );

                return;
            }

            if (userItems.length === 0) {
                saveCartItems(
                    currentUserId,
                    guestItems,
                );

                removeCartItems(null);

                dispatch(
                    replaceCartItems({
                        ownerId: currentUserId,
                        items: guestItems,
                    }),
                );

                return;
            }

            setPendingCartTransfer({
                userId: currentUserId,
                userItems,
                guestItems,
            });

            dispatch(
                replaceCartItems({
                    ownerId: currentUserId,
                    items: userItems,
                }),
            );

            return;
        }

        if (cartOwnerId === currentUserId) {
            return;
        }

        /*
         * 로그인·로그아웃·사용자 전환 전에 현재 장바구니를
         * 기존 소유자의 저장 공간에 보관한다.
         */
        saveCartItems(
            cartOwnerId,
            cartItems,
        );

        /*
         * 로그아웃하면 별도로 저장된 비회원 장바구니를
         * 다시 불러온다.
         */
        if (currentUserId === null) {
            dispatch(
                replaceCartItems({
                    ownerId: null,
                    items: loadCartItems(null),
                }),
            );

            return;
        }

        const userItems =
            loadCartItems(currentUserId);

        const guestItems =
            cartOwnerId === null
                ? cartItems
                : loadCartItems(null);

        if (guestItems.length === 0) {
            dispatch(
                replaceCartItems({
                    ownerId: currentUserId,
                    items: userItems,
                }),
            );

            return;
        }

        /*
         * 새 계정처럼 기존 장바구니가 비어 있으면
         * 비회원 장바구니를 자동으로 이전한다.
         */
        if (userItems.length === 0) {
            saveCartItems(
                currentUserId,
                guestItems,
            );

            removeCartItems(null);

            dispatch(
                replaceCartItems({
                    ownerId: currentUserId,
                    items: guestItems,
                }),
            );

            return;
        }

        /*
         * 로그인 계정과 비회원 장바구니가 모두 있으면
         * 사용자가 병합 또는 덮어쓰기를 선택할 때까지
         * 기존 계정 장바구니를 표시한다.
         */
        setPendingCartTransfer({
            userId: currentUserId,
            userItems,
            guestItems,
        });

        dispatch(
            replaceCartItems({
                ownerId: currentUserId,
                items: userItems,
            }),
        );
    }, [
        authInitialized,
        cartInitialized,
        cartItems,
        cartOwnerId,
        currentUserId,
        dispatch,
        isAdmin,
        pendingCartTransfer,
    ]);

    function mergePendingCart(): void {
        if (!pendingCartTransfer) {
            return;
        }

        const mergedItems = mergeCartItems(
            pendingCartTransfer.userItems,
            pendingCartTransfer.guestItems,
        );

        saveCartItems(
            pendingCartTransfer.userId,
            mergedItems,
        );

        removeCartItems(null);

        dispatch(
            replaceCartItems({
                ownerId: pendingCartTransfer.userId,
                items: mergedItems,
            }),
        );

        setPendingCartTransfer(null);
    }

    function overwritePendingCart(): void {
        if (!pendingCartTransfer) {
            return;
        }

        saveCartItems(
            pendingCartTransfer.userId,
            pendingCartTransfer.guestItems,
        );

        removeCartItems(null);

        dispatch(
            replaceCartItems({
                ownerId: pendingCartTransfer.userId,
                items: pendingCartTransfer.guestItems,
            }),
        );

        setPendingCartTransfer(null);
    }

    if (!authInitialized || !cartInitialized) {
        return (
            <main className="initial-loading">
                <div
                    className="loading-spinner"
                    aria-hidden="true"
                />

                <p>
                    로그인 상태와 장바구니를 확인하고 있습니다.
                </p>
            </main>
        );
    }

    if (
        currentUser?.mustChangePassword
        && location.pathname !== '/account'
    ) {
        return (
            <Navigate
                to="/account"
                replace
            />
        );
    }

    /*
     * 관리자 계정은 사용자 관리 화면만 사용할 수 있다.
     */
    if (
        isAdmin
        && location.pathname !== '/admin'
    ) {
        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }

    return (
        <div className="app-shell">
            <SiteHeader />

            <Routes>
                <Route
                    path="/"
                    element={<ProductPage />}
                />

                <Route
                    path="/products/:productId"
                    element={<ProductDetailPage />}
                />

                <Route
                    path="/cart"
                    element={<CartPage />}
                />

                <Route
                    path="/orders"
                    element={
                        currentUser
                            ? <OrdersPage />
                            : (
                                <Navigate
                                    to="/auth"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/account"
                    element={
                        currentUser
                            ? <AccountPage />
                            : (
                                <Navigate
                                    to="/auth"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/admin"
                    element={
                        currentUser?.role === 'admin'
                            ? <AdminPage />
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/auth"
                    element={<AuthPage />}
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Routes>

            <CartNotification />
            <RestockNotification />

            {pendingCartTransfer && (
                <CartTransferDialog
                    userItems={
                        pendingCartTransfer.userItems
                    }
                    guestItems={
                        pendingCartTransfer.guestItems
                    }
                    onMerge={mergePendingCart}
                    onOverwrite={overwritePendingCart}
                />
            )}
        </div>
    );
}
