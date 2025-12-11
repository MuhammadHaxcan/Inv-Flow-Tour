import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { sanitizeCredentials } from '../utils/sanitize';
import 'bootstrap/dist/css/bootstrap.min.css';

const schema = yup.object({
    username: yup.string().trim().required('Username is required').max(100, 'Username is too long'),
    password: yup.string().required('Password is required').max(128, 'Password is too long'),
}).required();

const Login = () => {
    const [submitError, setSubmitError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onBlur',
        defaultValues: { username: '', password: '' }
    });

    const onSubmit = async (values) => {
        setSubmitError('');
        const safeValues = sanitizeCredentials(values);

        const result = await login(safeValues.username, safeValues.password);

        if (result.success) {
            navigate('/');
        } else {
            const message = result.error || 'Invalid username or password';
            setSubmitError(message);
            // Push error into form for accessibility
            setError('root.server', { type: 'server', message });
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow" style={{ width: '400px' }}>
                <div className="card-body p-5">
                    <h2 className="card-title text-center mb-4">Inv-Flow</h2>
                    <h4 className="text-center mb-4 text-secondary">Sign In</h4>
                    
                    {(submitError || errors.root?.server) && (
                        <div
                            className={`alert ${submitError?.includes('Cannot connect') ? 'alert-warning' : 'alert-danger'}`}
                            role="alert"
                            aria-live="assertive"
                        >
                            <div className="d-flex align-items-center gap-2">
                                <AlertCircle size={18} aria-hidden="true" />
                                <div>
                                    <strong>{submitError?.includes('Cannot connect') ? 'Connection Error' : 'Login Failed'}</strong>
                                    <div className="small mt-1">{submitError || errors.root?.server?.message}</div>
                                    {submitError?.includes('Cannot connect') && (
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

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input
                                type="text"
                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                id="username"
                                autoComplete="username"
                                aria-invalid={!!errors.username}
                                aria-describedby={errors.username ? 'username-error' : undefined}
                                {...register('username')}
                                autoFocus
                            />
                            {errors.username && (
                                <div id="username-error" className="invalid-feedback">
                                    {errors.username.message}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                id="password"
                                autoComplete="current-password"
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                                {...register('password')}
                            />
                            {errors.password && (
                                <div id="password-error" className="invalid-feedback">
                                    {errors.password.message}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-3 text-center text-muted small" aria-live="polite">
                        <p>Default credentials: admin / admin123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

