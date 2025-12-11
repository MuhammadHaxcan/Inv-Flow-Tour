import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Optionally send error to logging service
        // logErrorToService(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom error UI
            return (
                <div className="content-wrapper">
                    <div className="card shadow">
                        <div className="card-body text-center py-5">
                            <div className="d-flex justify-content-center mb-4">
                                <div className="bg-danger bg-opacity-10 p-4 rounded-circle">
                                    <AlertTriangle size={48} className="text-danger" />
                                </div>
                            </div>

                            <h4 className="text-danger mb-3">Something went wrong</h4>

                            <p className="text-muted mb-4">
                                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                            </p>

                            <div className="d-flex justify-content-center gap-2">
                                <button
                                    onClick={this.handleRetry}
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                >
                                    <RefreshCw size={16} />
                                    Try Again
                                </button>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                >
                                    <RefreshCw size={16} />
                                    Refresh Page
                                </button>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4 text-start">
                                    <summary className="btn btn-sm btn-outline-info mb-2">
                                        Show Error Details (Development Only)
                                    </summary>
                                    <div className="alert alert-warning text-start small">
                                        <strong>Error:</strong> {this.state.error.toString()}
                                        {this.state.errorInfo && (
                                            <pre className="mt-2" style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
