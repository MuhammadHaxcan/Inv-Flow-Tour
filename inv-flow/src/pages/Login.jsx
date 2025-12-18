import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { sanitizeCredentials } from '../utils/sanitize';
import logo from '../assets/SiyyadKhanLogo.png';
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

    const goldColor = '#c9a227';

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecef 100%)' }}>
            <div className="card shadow-lg border-0" style={{ width: '420px', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Header with logo */}
                <div className="text-center py-4 px-4" style={{ backgroundColor: goldColor }}>
                    <img 
                        src={logo} 
                        alt="Siyyad Khan Tourism" 
                        style={{ height: '50px', width: 'auto' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>

                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h4 className="mb-0 fw-semibold">Sign In</h4>
                        <p className="text-muted small mt-2 mb-0">Enter your credentials to continue</p>
                    </div>
                    
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
                        <div className="mb-4">
                            <label htmlFor="username" className="form-label fw-medium">Username</label>
                            <input
                                type="text"
                                className={`form-control form-control-lg ${errors.username ? 'is-invalid' : ''}`}
                                id="username"
                                autoComplete="username"
                                aria-invalid={!!errors.username}
                                aria-describedby={errors.username ? 'username-error' : undefined}
                                {...register('username')}
                                autoFocus
                                placeholder="Enter your username"
                            />
                            {errors.username && (
                                <div id="username-error" className="invalid-feedback">
                                    {errors.username.message}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label fw-medium">Password</label>
                            <input
                                type="password"
                                className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                                id="password"
                                autoComplete="current-password"
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                                {...register('password')}
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <div id="password-error" className="invalid-feedback">
                                    {errors.password.message}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn w-100 fw-semibold"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                            style={{ 
                                backgroundColor: goldColor, 
                                borderColor: goldColor, 
                                color: 'white',
                                padding: '10px',
                                fontSize: '16px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#b8941f';
                                e.target.style.borderColor = '#b8941f';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = goldColor;
                                e.target.style.borderColor = goldColor;
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-4 pt-3 border-top text-center">
                        <p className="text-muted small mb-0">
                            <strong>Need help?</strong> Contact your system administrator
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

