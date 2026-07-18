import {
    useEffect,
    useState,
} from 'react';

import { useAppSelector } from '../app/hooks';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
    addRestockSubscription,
    hasRestockSubscription,
    removeRestockSubscription,
} from '../features/restock/restockStorage';

export function useRestockSubscription(
    productId: number,
) {
    const currentUser = useAppSelector(
        selectCurrentUser,
    );

    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        if (!currentUser || productId <= 0) {
            setSubscribed(false);
            return;
        }

        setSubscribed(
            hasRestockSubscription(
                currentUser.id,
                productId,
            ),
        );
    }, [
        currentUser,
        productId,
    ]);

    const toggleSubscription = () => {
        if (!currentUser || productId <= 0) {
            return false;
        }

        if (subscribed) {
            removeRestockSubscription(
                currentUser.id,
                productId,
            );
            setSubscribed(false);
            return true;
        }

        addRestockSubscription(
            currentUser.id,
            productId,
        );
        setSubscribed(true);

        return true;
    };

    return {
        currentUser,
        subscribed,
        toggleSubscription,
    };
}
