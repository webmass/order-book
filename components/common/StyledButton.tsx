import { css } from '@emotion/css';
import cls from 'classnames';

const btnClass = css`
    cursor: pointer;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    background-color: #5741D9;
    color: white;
    :hover {
        background-color: #5741D9;
    }
`

const StyledButton = ({ children, className, ...props }: JSX.IntrinsicElements["button"]) => {
    const classes = cls(className, btnClass);
    return (
        <button {...props} className={classes}>
            {children}
        </button>
    )
}

export default StyledButton;