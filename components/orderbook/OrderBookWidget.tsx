import { MainProducts } from '../../types/common';
import { OrderBookPriceLevels } from '../../types/orderbook';
import { useState, useRef, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { subscribeToProduct, unsubscribeToProduct, updateOrderBook } from '../../services/orderBook';
import { throttleTime } from 'rxjs/operators';
import OrderBook from './OrderBook';
import StyledButton from '../common/StyledButton';
import { css } from '@emotion/css';
import { estimateDevicePerfLatency } from '../../utils/device';

const containerClass = css`
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: #131723;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 0;
`;

const toggleFeedClass = css`
    margin: 0.5rem 0;
`;

const btnContainerClass = css`
    border-top: 2px solid #444;
    width: 100%;
    text-align: center;
    @media only screen and (max-width: 768px) {
        width: 100%;
    }
`;

const empty = { asks: [], bids: [] };

const OrderBookWidget = ({ defaultProductId = MainProducts.btcusd }) => {
    const [productId, setProductId] = useState(defaultProductId);
    const [hasFeedDisconnected, setHasFeedDisconnected] = useState(false);
    const [priceLevels, setPriceLevels] = useState<OrderBookPriceLevels>(empty);
    const priceLevelsFlow = useRef(new BehaviorSubject<OrderBookPriceLevels>(empty));

    const toggleFeed = () => {
        setProductId(productId === MainProducts.btcusd ? MainProducts.ethusd : MainProducts.btcusd);
    }

    const handleMessageError = (event: Event) => {
        setHasFeedDisconnected(true);
    }

    const initFeed = (pid: string) => {
        setHasFeedDisconnected(false);
        const ws = subscribeToProduct(pid, (data, socket) => {
            // user switched to another browser tab
            if (document.hidden) {
                unsubscribeToProduct(socket, pid);
                setHasFeedDisconnected(true);
                return;
            }
            const updatedPriceLevels = updateOrderBook(priceLevelsFlow.current.getValue(), data);
            priceLevelsFlow.current.next(updatedPriceLevels);
        }, handleMessageError);

        return ws;
    }

    const reconnectFeed = () => {
        initFeed(productId);
        setHasFeedDisconnected(false);
    };

    useEffect(() => {
        const ws = initFeed(productId);
        return () => {
            unsubscribeToProduct(ws, productId);
            priceLevelsFlow.current.next(empty);
        }
    }, [productId]);

    useEffect(() => {
        const perf = estimateDevicePerfLatency();
        const timeToThrottle = perf <= 1.5 ? 100 : Math.min(Math.round(perf * 200), 1000);

        const sub = priceLevelsFlow.current
            .pipe(
                // throttle rerendering relatively to device perf
                throttleTime(timeToThrottle)
            )
            .subscribe((value) => setPriceLevels(value));

        return () => {
            sub.unsubscribe();
        }
    }, []);

    return (
        <div className={containerClass}>
            <OrderBook {...priceLevels} hasFeedDisconnected={hasFeedDisconnected} onReconnectFeed={reconnectFeed} />
            <div className={btnContainerClass}>
                <StyledButton onClick={toggleFeed} className={toggleFeedClass}>Toggle Feed</StyledButton>
            </div>
        </div>
    )
}

export default OrderBookWidget;