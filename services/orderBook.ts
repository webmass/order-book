import { FeedEvents, FeedTypes, OnProductMessage, OnProductMessageError, OrderBookData, OrderBookMessage, OrderBookPriceLevels, PriceLevel, PriceLevelArray, PriceLevelWithTotal, ProductMessage } from '../types/orderbook';

export const toPriceLevelsObjectArray = (priceSizeArr: PriceLevelArray[]): PriceLevel[] => {
    if (!priceSizeArr) return [];
    return priceSizeArr.map(([price, size]) => ({ price, size }));
}

const getFeedMessageToSend = (eventName: FeedEvents.subscribe | FeedEvents.unsubscribe, productId: string) => {
    return JSON.stringify({
        "event": eventName,
        "feed": "book_ui_1",
        "product_ids": [productId]
    })
}

export const unsubscribeToProduct = (socket: WebSocket, productId: string): void => {
    socket.send(getFeedMessageToSend(FeedEvents.unsubscribe, productId));
}
export const subscribeToProduct = (socket: WebSocket, productId: string): void => {
    socket.send(getFeedMessageToSend(FeedEvents.subscribe, productId));
}

const isMessageWithOrderBookData = (data: OrderBookMessage): boolean => {
    return !!data?.feed?.startsWith(FeedTypes.delta) && !data?.event;
}

export const initProductFeed = (
    productId: string,
    handleMessage: OnProductMessage,
    handleUnsubscribed: () => void,
    handleSubscribed: (pid: string) => void,
    handleErrOrClose: OnProductMessageError,
): WebSocket => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_ORDER_BOOK_WSS!);

    ws.addEventListener('open', () => {
        subscribeToProduct(ws, productId);
    });

    ws.addEventListener('error', handleErrOrClose);
    ws.addEventListener('close', handleErrOrClose);

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
        } else if(data.event === FeedEvents.subscribed) {
            handleSubscribed(data.product_ids[0]);
        }
        else if(data.event === FeedEvents.unsubscribed) {
            handleUnsubscribed();
        }
    });
    return ws;
}

// update PriceLevels with the Delta data
export const updateLevels = (currentLevels: PriceLevel[], deltaLevels: PriceLevel[], isAsk: boolean): PriceLevel[] => {
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

export const getProductLabel = (productId: string) => {
    return productId.replace('PI_', '').replace(/USD$/, '-USD').replace('XBT-', 'BTC-');
}