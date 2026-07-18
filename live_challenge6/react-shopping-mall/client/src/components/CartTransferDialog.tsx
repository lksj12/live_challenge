import type { CartItem } from '../types/cart';
import './CartTransferDialog.css';

interface CartTransferDialogProps {
    guestItems: CartItem[];
    userItems: CartItem[];
    onMerge: () => void;
    onOverwrite: () => void;
}

function countItems(items: CartItem[]): number {
    return items.reduce(
        (total, item) => total + item.quantity,
        0,
    );
}

export default function CartTransferDialog({
    guestItems,
    userItems,
    onMerge,
    onOverwrite,
}: CartTransferDialogProps) {
    return (
        <div
            className="cart-transfer-backdrop"
            role="presentation"
        >
            <section
                className="cart-transfer-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-transfer-title"
            >
                <p className="cart-transfer-eyebrow">
                    장바구니 확인
                </p>

                <h2 id="cart-transfer-title">
                    어떤 장바구니를 사용할까요?
                </h2>

                <p className="cart-transfer-description">
                    로그인 계정과 비회원 장바구니에 모두 상품이
                    있습니다. 원하는 처리 방법을 선택해 주세요.
                </p>

                <div className="cart-transfer-summary">
                    <div>
                        <span>기존 계정 장바구니</span>
                        <strong>
                            {userItems.length}종 · {countItems(userItems)}개
                        </strong>
                    </div>

                    <div>
                        <span>비회원 장바구니</span>
                        <strong>
                            {guestItems.length}종 · {countItems(guestItems)}개
                        </strong>
                    </div>
                </div>

                <div className="cart-transfer-actions">
                    <button
                        type="button"
                        className="cart-transfer-merge"
                        onClick={onMerge}
                    >
                        두 장바구니 병합
                    </button>

                    <button
                        type="button"
                        className="cart-transfer-overwrite"
                        onClick={onOverwrite}
                    >
                        비회원 장바구니로 덮어쓰기
                    </button>
                </div>

                <p className="cart-transfer-warning">
                    덮어쓰기를 선택하면 기존 계정 장바구니는
                    비회원 장바구니 내용으로 교체됩니다.
                </p>
            </section>
        </div>
    );
}
