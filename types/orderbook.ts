export enum FeedTypes {
    snapshot = 'book_ui_1_snapshot',
    delta = 'book_ui_1',
}

export type PriceLevelArray = [number, number];

export interface PriceLevel {
    size: number;
    price: number;
}

export interface PriceLevelWithTotal extends PriceLevel {
    total: number;
}

export interface OrderBookLevel extends PriceLevelWithTotal {
    depth: number;
}

export type OrderBookPriceLevels = {
    asks: PriceLevel[];
    bids: PriceLevel[];
}

export type OrderBookData = {
    asks: OrderBookLevel[];
    bids: OrderBookLevel[];
}

export interface ProductMessage {
    isSnapshot: boolean;
    product_id: string;
    asks: PriceLevel[];
    bids: PriceLevel[];
    numLevels?: number;
}

export type OnProductMessage = (message: ProductMessage, ws: WebSocket) => void;
export type OnProductMessageError = (event: Event) => void;