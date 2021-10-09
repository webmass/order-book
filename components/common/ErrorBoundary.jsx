import React from 'react';
import { css } from '@emotion/css';
import StyledButton from './StyledButton';

const containerClass = css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    color: white;
    flex-direction: column;
`;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.log(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={containerClass}>
                    😑 Ops, Something went wrong
                    <StyledButton style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>Reload</StyledButton>
                </div>
            )
        }

        return this.props.children;
    }
}

export default ErrorBoundary