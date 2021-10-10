import { css } from '@emotion/css';
import { TestIds } from '../../types/common';

const spreadClass = css`
    color: #ccc;
`

const OrderBookSpread = ({ topAsk, topBid, ...props }: { topAsk: number, topBid: number }) => {
    const isValid = topAsk && topBid;
    const spread = Number(isValid ? topAsk - topBid : 0).toFixed(1);
    const spreadPercentage = (isValid ? ((topAsk - topBid) / topAsk * 100) : 0).toFixed(2);
    return (
        <span data-testid={TestIds.orderBookSpread} className={spreadClass} {...props}>
            Spread {spread} ({spreadPercentage}%)
        </span>
    )
}

export default OrderBookSpread;