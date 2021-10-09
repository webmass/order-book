import { css } from '@emotion/css'
import React, { useRef } from 'react';
import { OrderBookLevel } from '../../types/orderbook'

const ROW_HEIGHT = 15;

const containerClass = css`
    width: 100%;
    overflow-y: hidden;
`;

const commonCSS = css`
    display: grid;
    justify-items: center;
    align-items: center;
    position: relative;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-flow: dense;

    .ob-size {
        grid-column: 2;
    }
`;

const headerClass = css`
    position: relative;
    text-transform: uppercase;
    color: #cccccc;
    font-weight: bold;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    height: 30px;
`;

const bodyClass = css`
    overflow-y: hidden;
    font-weight: bold;
    height: 100%;
    grid-template-rows: repeat(auto-fill, ${ROW_HEIGHT}px);
    background-color: transparent;
`;

const askCSS = css`
    &.ob-body {
        .ob-price {
            color: #A12C2F;
        }
        .ob-depth {
            background-color: #3E1E28;
        }
    }
    .ob-total {
        grid-column: 3;
    }
`

const bidCSS = css`
    &.ob-body {
        .ob-price {
            color: #01835C;
        }
        .ob-depth {
            background-color: #113534;
        }
    }
    @media only screen and (max-width: 768px) {
        &.ob-header {
            display: none;
        }
        .ob-price {
            grid-column: 1;
        }
        .ob-total {
            grid-column: 3;
        }
        .ob-depth {
            left: 0 !important;
        }
    }
`

const depthClass = css`
    position: absolute;
    height: ${ROW_HEIGHT}px;
    z-index: -1;
`;

const Row = ({ children }: { children: React.ReactNodeArray }) => {
    return <>{children}</>
}

const OrderBookLevels = ({ levels, isAsk }: { levels: OrderBookLevel[], isAsk?: boolean }) => {
    const containerRef = useRef(null);    

    const rows = levels?.map((level, idx) => {
        const depthStyle = { width: `${level.depth}%`, top: (ROW_HEIGHT * idx) + 'px', left: !isAsk ? `${100-level.depth}%` : 0 };
        return <Row key={idx}>
            <div className={`${depthClass} ob-depth`} style={depthStyle}></div>
            <span className={`ob-total`}>{level.total}</span>
            <span className={`ob-size`}>{level.size}</span>
            <span className={`ob-price`}>{level.price.toFixed(2)}</span>
        </Row>
    })
    return (
        <div className={containerClass} ref={containerRef}>
            <div className={`ob-header ${headerClass} ${commonCSS} ${isAsk ? askCSS : bidCSS}`}>
                <span className={`ob-total`}>Total</span>
                <span className={`ob-size`}>Size</span>
                <span className={`ob-price`}>Price</span>
            </div>
            <div className={`ob-body ${commonCSS} ${bodyClass} ${isAsk ? askCSS : bidCSS}`}>
                {rows}
            </div>
        </div>
    )
}

export default OrderBookLevels;