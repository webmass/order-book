/**
 * @jest-environment jsdom
 */

import { updateLevels, toPriceLevelsObjectArray, getPriceLevelsWithTotal, getFullOrderBookData } from '../../services/orderBook'
import { PriceLevel, PriceLevelArray } from '../../types/orderbook';

const EXAMPLE_PRICE_LEVELS_RAW: PriceLevelArray[] = [
    [1000, 100],
    [1005, 20],
    [1010, 60],
]

const EXAMPLE_ASK_PRICE_LEVELS: PriceLevel[] = [
    { price: 1000, size: 100 },
    { price: 1005, size: 20 },
    { price: 1010, size: 60 },
];

const EXAMPLE_BID_PRICE_LEVELS: PriceLevel[] = [
    { price: 950, size: 100 },
    { price: 920, size: 20 },
    { price: 900, size: 200 },
];

describe('orderBook service', () => {
    it('should convert PriceLevelArray[] to PriceLevels[]', () => {
        const newData = toPriceLevelsObjectArray(EXAMPLE_PRICE_LEVELS_RAW);
        expect(newData).toMatchObject(EXAMPLE_ASK_PRICE_LEVELS);
    })

    it('should remove zero sizes', () => {
        const priceRemoved = 1005;
        const newData = updateLevels(EXAMPLE_ASK_PRICE_LEVELS, [{ price: priceRemoved, size: 0 }], true);
        expect(newData.findIndex(d => d.price === priceRemoved)).toBe(-1);
    })

    it('should update price size', () => {
        const priceUpdated = 1005;
        const sizeUpdated = 1;
        const newData = updateLevels(EXAMPLE_ASK_PRICE_LEVELS, [{ price: priceUpdated, size: sizeUpdated }], true);
        const priceLevel = newData.find(d => d.price === priceUpdated);
        expect(priceLevel?.size).toBe(sizeUpdated);
    })

    it('should add new price levels in the right order', () => {
        const addedPriceLevels = [{ price: 900, size: 1 }, { price: 1002, size: 1 } ,{ price: 1110, size: 1 }];
        const newData = updateLevels(EXAMPLE_ASK_PRICE_LEVELS, addedPriceLevels, true);
        expect(newData).toMatchObject([
            addedPriceLevels[0],
            EXAMPLE_ASK_PRICE_LEVELS[0],
            addedPriceLevels[1],
            EXAMPLE_ASK_PRICE_LEVELS[1],
            EXAMPLE_ASK_PRICE_LEVELS[2],
            addedPriceLevels[2],
        ]);
    })

    it('should add correct totals and depths', () => {
        const newData = getPriceLevelsWithTotal(EXAMPLE_ASK_PRICE_LEVELS);
        expect(newData[0]?.total).toBe(EXAMPLE_ASK_PRICE_LEVELS[0].size);
        expect(newData[1]?.total).toBe(EXAMPLE_ASK_PRICE_LEVELS[0].size + EXAMPLE_ASK_PRICE_LEVELS[1].size);
        expect(newData[2]?.total).toBe(EXAMPLE_ASK_PRICE_LEVELS[0].size + EXAMPLE_ASK_PRICE_LEVELS[1].size + EXAMPLE_ASK_PRICE_LEVELS[2].size);
    })

    it('should add correct depths', () => {
        const newData = getFullOrderBookData(EXAMPLE_ASK_PRICE_LEVELS, EXAMPLE_BID_PRICE_LEVELS);
        const highestTotal = Math.max(newData.asks[newData.asks.length - 1]?.total, newData.bids[newData.bids.length - 1]?.total);
        newData.bids.forEach(bid => expect(bid.depth).toBe(bid.total / highestTotal * 100));
        newData.asks.forEach(ask => expect(ask.depth).toBe(ask.total / highestTotal * 100));
    })
})
