export interface ProductRating {
    rate: number;
    count: number;
}

export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: ProductRating;
}

export type ProductDataSource = 'api' | 'mock';

export interface ProductLoadResult {
    products: Product[];
    source: ProductDataSource;
    warning: string | null;
}
