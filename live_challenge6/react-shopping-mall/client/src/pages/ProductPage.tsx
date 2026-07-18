import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useAppDispatch,
    useAppSelector,
} from '../app/hooks';
import ProductCard from '../components/ProductCard';
import {
    loadProductInventory,
    selectInventoryError,
    selectInventoryStatus,
} from '../features/inventory/inventorySlice';
import {
    loadProductCatalog,
    selectProductError,
    selectProducts,
    selectProductStatus,
    selectProductWarning,
} from '../features/products/productSlice';
import './ProductPage.css';

const allCategoriesValue = 'all';

export default function ProductPage() {
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectProducts);
    const status = useAppSelector(selectProductStatus);
    const warning = useAppSelector(selectProductWarning);
    const error = useAppSelector(selectProductError);

    const inventoryStatus = useAppSelector(
        selectInventoryStatus,
    );

    const inventoryError = useAppSelector(
        selectInventoryError,
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(
        allCategoriesValue,
    );

    const categories = useMemo(() => {
        return Array.from(
            new Set(
                products
                    .map((product) => product.category.trim())
                    .filter((category) => category.length > 0),
            ),
        ).sort((firstCategory, secondCategory) =>
            firstCategory.localeCompare(secondCategory),
        );
    }, [products]);

    const filteredProducts = useMemo(() => {
        const normalizedSearchTerm = searchTerm
            .trim()
            .toLocaleLowerCase();

        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === allCategoriesValue
                || product.category === selectedCategory;

            if (!matchesCategory) {
                return false;
            }

            if (!normalizedSearchTerm) {
                return true;
            }

            const searchableText = [
                product.title,
                product.description,
                product.category,
            ]
                .join(' ')
                .toLocaleLowerCase();

            return searchableText.includes(
                normalizedSearchTerm,
            );
        });
    }, [
        products,
        searchTerm,
        selectedCategory,
    ]);

    const hasActiveFilter =
        searchTerm.trim().length > 0
        || selectedCategory !== allCategoriesValue;

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

    function resetFilters(): void {
        setSearchTerm('');
        setSelectedCategory(allCategoriesValue);
    }

    if (
        status === 'idle'
        || status === 'loading'
        || inventoryStatus === 'idle'
        || inventoryStatus === 'loading'
    ) {
        return (
            <main className="product-page">
                <section className="catalog-state">
                    <div
                        className="catalog-spinner"
                        aria-hidden="true"
                    />

                    <h1>상품을 불러오고 있습니다.</h1>

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
            <main className="product-page">
                <section className="catalog-state error">
                    <h1>상품을 불러오지 못했습니다.</h1>

                    <p>
                        {error
                            ?? inventoryError
                            ?? '잠시 후 다시 시도해 주세요.'}
                    </p>

                    <button
                        type="button"
                        className="catalog-retry-button"
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
                </section>
            </main>
        );
    }

    return (
        <main className="product-page">
            <section className="product-hero">
                <p className="product-hero-eyebrow">
                    React Shopping Mall
                </p>

                <h1>오늘의 상품</h1>

            </section>

            <section
                className="product-catalog"
                aria-labelledby="product-catalog-title"
            >
                <div className="catalog-heading">
                    <div>
                        <h2 id="product-catalog-title">
                            전체 상품
                        </h2>

                        <p>
                            총 {products.length}개의 상품
                        </p>
                    </div>

                </div>

                <section
                    className="catalog-controls"
                    aria-label="상품 검색 및 필터"
                >
                    <label className="catalog-filter-field">
                        <span>상품 검색</span>

                        <input
                            type="search"
                            value={searchTerm}
                            placeholder="상품명 또는 설명 검색"
                            onChange={(event) => {
                                setSearchTerm(
                                    event.target.value,
                                );
                            }}
                        />
                    </label>

                    <label className="catalog-filter-field">
                        <span>카테고리</span>

                        <select
                            value={selectedCategory}
                            onChange={(event) => {
                                setSelectedCategory(
                                    event.target.value,
                                );
                            }}
                        >
                            <option value={allCategoriesValue}>
                                전체 카테고리
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>
                </section>

                <div className="catalog-result-bar">
                    <p
                        className="catalog-result-summary"
                        role="status"
                    >
                        전체 {products.length}개 중{' '}
                        <strong>
                            {filteredProducts.length}개
                        </strong>
                        를 표시하고 있습니다.
                    </p>

                    {hasActiveFilter && (
                        <button
                            type="button"
                            className="clear-filters-button"
                            onClick={resetFilters}
                        >
                            필터 초기화
                        </button>
                    )}
                </div>

                {warning && (
                    <div
                        className="catalog-warning"
                        role="status"
                    >
                        <div>
                            <strong>
                                실제 상품 API를 사용할 수 없습니다.
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
                            다시 시도
                        </button>
                    </div>
                )}

                {products.length === 0 ? (
                    <div className="catalog-empty">
                        <h3>표시할 상품이 없습니다.</h3>

                        <p>
                            새로운 상품이 등록되면 이곳에
                            표시됩니다.
                        </p>

                        <button
                            type="button"
                            className="catalog-retry-button"
                            onClick={() => {
                                void dispatch(
                                    loadProductCatalog(),
                                );
                            }}
                        >
                            새로고침
                        </button>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="filtered-empty">
                        <h3>
                            검색 조건에 맞는 상품이 없습니다.
                        </h3>

                        <p>
                            검색어 또는 카테고리를 변경해 주세요.
                        </p>

                        <button
                            type="button"
                            className="catalog-retry-button"
                            onClick={resetFilters}
                        >
                            모든 상품 보기
                        </button>
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
