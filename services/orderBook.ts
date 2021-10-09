import { FeedTypes, OnProductMessage, OnProductMessageError, OrderBookData, OrderBookPriceLevels, PriceLevel, PriceLevelArray, PriceLevelWithTotal, ProductMessage } from '../types/orderbook';

const toPriceLevelsObjectArray = (priceSizeArr: PriceLevelArray[]): PriceLevel[] => {
    if (!priceSizeArr) return [];
    return priceSizeArr.map(([price, size]) => ({ price, size }));
}

export const unsubscribeToProduct = (socket: WebSocket, productId: string): void => {
    if(socket.readyState !== socket.OPEN) { return }
    socket.send(JSON.stringify({
        "event": "unsubscribe",
        "feed": "book_ui_1",
        "product_ids": [productId]
    }));
}

const isMessageWithOrderBookData = (data): boolean => {
    return data.feed?.startsWith(FeedTypes.delta) && data.event !== 'subscribed';
}
export const subscribeToProduct = (productId: string, handleMessage: OnProductMessage, handleError: OnProductMessageError): WebSocket => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_ORDER_BOOK_WSS);

    ws.addEventListener('open', () => {
        ws.send(
            JSON.stringify({
                "event": "subscribe",
                "feed": "book_ui_1",
                "product_ids": [productId],
            })
        );
    });

    ws.addEventListener('error', (event: Event) => {
        handleError(event);
    });

    ws.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        if (isMessageWithOrderBookData(data)) {
            handleMessage({
                isSnapshot: data.feed === FeedTypes.snapshot,
                product_id: data.product_id,
                numLevels: data.numLevels,
                asks: toPriceLevelsObjectArray(data.asks),
                bids: toPriceLevelsObjectArray(data.bids),
            }, ws);
        }
    });
    return ws;
}

// update PriceLevels with the Delta data
const updateLevels = (currentLevels: PriceLevel[], deltaLevels: PriceLevel[], isAsk: boolean): PriceLevel[] => {
    const newLevels = [...currentLevels];

    deltaLevels.forEach(delta => {
        const existingLevelIndex = newLevels.findIndex((c) => c.price === delta.price);
        if (existingLevelIndex !== -1) {
            newLevels[existingLevelIndex] = { ...delta };
        } else if (delta.size !== 0) {
            newLevels.push(delta);
        }
    });

    return newLevels
        .filter(level => level.size !== 0)
        .sort((a, b) => isAsk ? a.price - b.price : b.price - a.price);
}

export const updateOrderBook = (currentData: OrderBookPriceLevels, incomingData: ProductMessage): OrderBookPriceLevels => {
    if (incomingData.isSnapshot) {
        return { asks: incomingData.asks, bids: incomingData.bids };
    } else {
        const newAsks = updateLevels(currentData.asks, incomingData.asks, true);
        const newBids = updateLevels(currentData.bids, incomingData.bids, false);
        return { asks: newAsks, bids: newBids };
    }
}

export const getPriceLevelsWithTotal = (levels: PriceLevel[]): PriceLevelWithTotal[] => {
    const priceLevelsWithTotal: PriceLevelWithTotal[] = [];
    levels.forEach((level, idx) => {
        priceLevelsWithTotal.push({
            ...level,
            total: idx > 0 ? level.size + (priceLevelsWithTotal[idx - 1].total || 0) : level.size,
        })
    });
    return priceLevelsWithTotal;
}

export const getOrderBookWithDepth = (asks: PriceLevelWithTotal[], bids: PriceLevelWithTotal[]): OrderBookData => {
    const bottomAsk = asks[asks.length - 1];
    const bottomBid = bids[bids.length - 1];
    const highestTotal = Math.max(bottomAsk?.total, bottomBid?.total);
    const asksWithDepth = asks.map(level => ({ ...level, depth: level.total / highestTotal * 100 }));
    const bidsWithDepth = bids.map(level => ({ ...level, depth: level.total / highestTotal * 100 }));
    return { asks: asksWithDepth, bids: bidsWithDepth };
}

export const getFullOrderBookData = (asks: PriceLevel[], bids: PriceLevel[]): OrderBookData => {
    const withTotals = { asks: getPriceLevelsWithTotal(asks), bids: getPriceLevelsWithTotal(bids) };
    return getOrderBookWithDepth(withTotals.asks, withTotals.bids);
}