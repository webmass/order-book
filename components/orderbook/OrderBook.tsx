import { css } from '@emotion/css';
import cls from 'classnames';
import { useMemo } from 'react';
import { getFullOrderBookData } from '../../services/orderBook';
import { TestIds } from '../../types/common';
import { PriceLevel } from '../../types/orderbook';
import StyledButton from '../common/StyledButton';
import OrderBookLevels from './OrderBookLevels';
import OrderBookSpread from './OrderBookSpread';

const orderBookClass = css`
    height: 100%;
    overflow-y: hidden;
    position: relative;
    color: white;
    font-size: 12px;
    position: relative;
`;

const disconnectedClass = css`
    div {
        opacity: 0.7;
    }
`;

const headerClass = css`
    position: relative;
    height: 30px;
    display: flex;
    align-items: center;

    .ob-title {
        padding-left: 1rem;
    }

    .ob-spread-container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        @media only screen and (max-width: 768px) {
            display: none;
        }
    }
`;

const bodyClass = css`
    display: flex;
    flex-direction: row;
    .ob-spread-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 30px;
        @media only screen and (min-width: 768px) {
            display:none;
        }
    }
    @media only screen and (max-width: 768px) {
        flex-direction: column-reverse;
        height: 100%;
    }
`;

const floatingCenteredClass = css`
    position: absolute;
    text-align: center;
    width: 150px;
    height: 30px;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    z-index: 1;
`;

const OrderBook = ({
    asks,
    bids,
    hasFeedDisconnected,
    isLoading,
    onReconnectFeed,
}: {
    asks: PriceLevel[],
    bids: PriceLevel[],
    hasFeedDisconnected: boolean,
    isLoading: boolean,
    onReconnectFeed: () => void,
}) => {
    const containerClasses = useMemo(() => cls(orderBookClass, { [disconnectedClass]: hasFeedDisconnected }), [hasFeedDisconnected]);
    const askPrice = asks[0]?.price;
    const bidPrice = bids[0]?.price;
    const orderBookData = getFullOrderBookData(asks, bids);

    const Spread = () => <div className="ob-spread-container">
        <OrderBookSpread topAsk={askPrice} topBid={bidPrice} />
    </div>;

    return (
        <div className={containerClasses}>
            {
                isLoading ?
                    <span data-testid={TestIds.orderBookLoadingMessage} className={floatingCenteredClass}>Loading...</span>
                    :
                    hasFeedDisconnected ?
                        <StyledButton className={floatingCenteredClass} onClick={onReconnectFeed}>Reconnect Feed</StyledButton>
                        :
                        null
            }
            <div className={headerClass} data-testid={TestIds.orderBookHeaderTitle}>
                <span className="ob-title">Order Book</span>
                <Spread />
            </div>
            <div className={bodyClass}>
                <OrderBookLevels levels={orderBookData.bids} isAsk={false} />
                <Spread />
                <OrderBookLevels levels={orderBookData.asks} isAsk={true} />
            </div>
        </div>
    );
}

export default OrderBook;