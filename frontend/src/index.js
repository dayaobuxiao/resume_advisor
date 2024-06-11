import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// 定义错误边界组件
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // 更新state使组件渲染错误信息
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // 这里添加错误日志上报逻辑
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 渲染错误信息展示给用户
            return (
                <div className={"app-error-boundary"}>
                    <h2>Something went wrong.</h2>
                    <p>Sorry, a problem just occurred, please try again later.</p>
                </div>
            );
        }

        return  this.props.children;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
