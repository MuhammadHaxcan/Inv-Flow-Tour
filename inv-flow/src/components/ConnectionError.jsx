import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ConnectionError = ({ onRetry, message }) => {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="card-body p-5 text-center">
                    <AlertCircle size={48} className="text-danger mb-3" />
                    <h4 className="mb-3">Connection Error</h4>
                    <p className="text-muted mb-4">
                        {message || 'Cannot connect to the server. Please ensure the backend is running.'}
                    </p>
                    <div className="d-flex flex-column gap-2">
                        <button
                            className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                            onClick={onRetry}
                        >
                            <RefreshCw size={18} />
                            Retry Connection
                        </button>
                        <small className="text-muted">
                            Make sure the backend is running on <code>http://localhost:5104</code> or <code>https://localhost:7291</code>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionError;

