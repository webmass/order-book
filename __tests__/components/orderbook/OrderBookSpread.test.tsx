/**
 * @jest-environment jsdom
 */

import React from 'react';
import OrderBookSpread from '../../../components/orderbook/OrderBookSpread';
import { render, screen } from '@testing-library/react'
import { TestIds } from '../../../types/common';

describe('OrderBookSpread', () => {
    it('renders a spread', () => {
        const topAsk = 10;
        const topBid = 8;

        render(<OrderBookSpread topAsk={topAsk} topBid={topBid} />);
  
        const el = screen.getByTestId(TestIds.orderBookSpread);
        const spread = topAsk - topBid;
        
        expect(el).toBeInTheDocument();
        expect(el.innerHTML).toBe(`Spread ${Number(spread).toFixed(1)} (${((spread) / topAsk * 100).toFixed(2)}%)`);
    })
})
