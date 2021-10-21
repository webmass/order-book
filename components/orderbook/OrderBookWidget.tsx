import { MainProducts, TestIds } from '../../types/common';
import { OrderBookPriceLevels, ProductMessage } from '../../types/orderbook';
import { useState, useRef, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { getProductLabel, initProductFeed, subscribeToProduct, unsubscribeToProduct, updateOrderBook } from '../../services/orderBook';
import { throttleTime } from 'rxjs/operators';
import OrderBook from './OrderBook';
import { css } from '@emotion/css';
import { estimateDevicePerfLatency } from '../../utils/device';
import OrderBookProductBtn from './OrderBookProductBtn';

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

const productsContainerClass = css`
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
    const [activeProductId, setActiveProductId] = useState('');
    const [hasFeedDisconnected, setHasFeedDisconnected] = useState(false);
    const [priceLevels, setPriceLevels] = useState<OrderBookPriceLevels>(empty);
    const priceLevelsFlow = useRef(new BehaviorSubject<OrderBookPriceLevels>(empty));
    const wsRef = useRef<WebSocket | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const handleUnsubscribed = () => {
        setPriceLevels(empty);
        priceLevelsFlow.current.next(empty);
        setActiveProductId('');
    }

    const handleSubscribed = (newlySubscribedProductId: string) => {
        setHasFeedDisconnected(false);
        setActiveProductId(newlySubscribedProductId);
    }

    const disconnect = () => {
        setHasFeedDisconnected(true);
        setActiveProductId('');
        if(wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }

    const handleProductMessage = (data: ProductMessage, socket: WebSocket) => {
        // user switched to another browser tab => avoid useless ws consumption
        if (document.hidden) {
            disconnect();
            return;
        }
        const updatedPriceLevels = updateOrderBook(priceLevelsFlow.current.getValue(), data);
        priceLevelsFlow.current.next(updatedPriceLevels);
    }

    const initFeed = (pid: string) => {
        wsRef.current = initProductFeed(pid, handleProductMessage, handleUnsubscribed, handleSubscribed, () => disconnect);
    }

    const connect = () => {
        if(!navigator.onLine) { return }
        setHasFeedDisconnected(false);
        initFeed(productId);
    }

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                unsubscribeToProduct(wsRef.current, productId);
            }
        }
    }, [productId]);

    useEffect(() => {
        setIsLoading(activeProductId !== productId && !hasFeedDisconnected);
        if(activeProductId === '' && wsRef.current && wsRef.current?.readyState === wsRef.current?.OPEN) {
            subscribeToProduct(wsRef.current, productId);
        }
    }, [productId, activeProductId, hasFeedDisconnected]);

    useEffect(() => {
        const perf = estimateDevicePerfLatency();
        const timeToThrottle = perf <= 1.5 ? 100 : Math.min(Math.round(perf * 200), 1000);

        const sub = priceLevelsFlow.current
            .pipe(
                // throttle rerendering relatively to device perf
                throttleTime(timeToThrottle)
            )
            .subscribe((value) => setPriceLevels(value));

        window.addEventListener('offline', () => {
            disconnect();
        });

        connect();

        return () => {
            sub.unsubscribe();
        }
    }, []);

    const productBtns = [MainProducts.btcusd, MainProducts.ethusd]
    .map(pid => {
        return <OrderBookProductBtn
        key={pid}
        onClick={() => setProductId(pid)}
        productId={pid}
        isActive={productId === pid} 
        isDisabled={hasFeedDisconnected || isLoading}
        >
            {getProductLabel(pid)}
        </OrderBookProductBtn>
    })

    return (
        <div className={containerClass}>
            <OrderBook {...priceLevels} hasFeedDisconnected={hasFeedDisconnected} onReconnectFeed={connect} isLoading={isLoading} />
            <div className={productsContainerClass}>
                {productBtns}
            </div>
            <input type="hidden" value={activeProductId} data-testid={TestIds.orderBookActiveProductId} />
        </div>
    )
}

export default OrderBookWidget;