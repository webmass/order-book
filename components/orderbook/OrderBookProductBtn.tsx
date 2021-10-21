import StyledButton from '../common/StyledButton';
import cls from 'classnames';
import { MainProducts, TestIds } from '../../types/common';
import { css } from '@emotion/css';
import React from 'react';

const btnClass = css`
    margin: 0.5rem 1rem;
    background: transparent;
    border-radius: 0;
    :hover {
        background-color: #ffffff09;
    }
    &.active {
        border-bottom: 1px solid white;
    }
`;

type Props = {
    children: React.ReactChild;
    productId: MainProducts;
    isActive: boolean;
    isDisabled: boolean;
    onClick: (productId: string) => void;
}

const OrderBookProductBtn = ({ children, productId, isActive, isDisabled, onClick } : Props) => {
    return (
        <StyledButton
            onClick={() => onClick(productId)}
            className={cls(btnClass, { active: isActive })}
            disabled={isDisabled}
            data-testid={`${TestIds.orderBookProductBtn}-${productId}`}>
            {children}
        </StyledButton>
    )
}

export default OrderBookProductBtn;