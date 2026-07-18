import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';

import App from './App';
import { store } from './app/store';
import { restoreSession } from './features/auth/authSlice';
import { saveCartItems } from './features/cart/cartStorage';
import './index.css';

let previousCartItems = store.getState().cart.items;
let previousCartOwnerId = store.getState().cart.ownerId;

store.subscribe(() => {
    const cartState = store.getState().cart;

    if (!cartState.initialized) {
        return;
    }

    const cartChanged =
        cartState.items !== previousCartItems
        || cartState.ownerId !== previousCartOwnerId;

    if (!cartChanged) {
        return;
    }

    previousCartItems = cartState.items;
    previousCartOwnerId = cartState.ownerId;

    saveCartItems(
        cartState.ownerId,
        cartState.items,
    );
});

void store.dispatch(restoreSession());

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </StrictMode>,
);
