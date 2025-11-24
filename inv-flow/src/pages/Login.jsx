import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Invalid username or password');
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow" style={{ width: '400px' }}>
                <div className="card-body p-5">
                    <h2 className="card-title text-center mb-4">Inv-Flow</h2>
                    <h4 className="text-center mb-4 text-secondary">Sign In</h4>
                    
                    {error && (
                        <div className={`alert ${error.includes('Cannot connect') ? 'alert-warning' : 'alert-danger'}`} role="alert">
                            <div className="d-flex align-items-center gap-2">
                                <AlertCircle size={18} />
                                <div>
                                    <strong>{error.includes('Cannot connect') ? 'Connection Error' : 'Login Failed'}</strong>
                                    <div className="small mt-1">{error}</div>
                                    {error.includes('Cannot connect') && (
                                        <div className="small mt-2">
                                            <strong>To fix this:</strong>
                                            <ol className="mb-0 mt-2 text-start">
                                                <li>Open a terminal in the <code>inv-flow-backend</code> folder</li>
                                                <li>Run: <code>dotnet run</code></li>
                                                <li>Wait for "Now listening on: http://localhost:5104"</li>
                                                <li>Refresh this page and try again</li>
                                            </ol>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-3 text-center text-muted small">
                        <p>Default credentials: admin / admin123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

