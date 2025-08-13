import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEnvelope, 
    faLock, 
    faEye, 
    faEyeSlash,
    faSpinner,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '~/contexts/AuthContext';
import type { LoginCredentials } from '~/types/auth/auth.types';
import styles from './Login.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, clearError } = useAuth();
    
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password: '',
        remember_me: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        // Clear any previous errors when component mounts
        clearError();
    }, [clearError]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.email.trim()) {
            errors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            errors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            await login(formData);
            navigate(from, { replace: true });
        } catch (err) {
            // Error is handled by AuthContext
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={cx('login-container')}>
            <div className={cx('login-card')}>
                <div className={cx('login-header')}>
                    <h1>Đăng nhập</h1>
                    <p>Chào mừng bạn quay trở lại!</p>
                </div>

                {error && (
                    <div className={cx('error-message')}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={cx('login-form')}>
                    <div className={cx('form-group')}>
                        <label htmlFor="email">Email</label>
                        <div className={cx('input-wrapper')}>
                            <FontAwesomeIcon icon={faEnvelope} className={cx('input-icon')} />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email của bạn"
                                className={cx({ 'error': validationErrors.email })}
                                disabled={isLoading}
                            />
                        </div>
                        {validationErrors.email && (
                            <span className={cx('error-text')}>{validationErrors.email}</span>
                        )}
                    </div>

                    <div className={cx('form-group')}>
                        <label htmlFor="password">Mật khẩu</label>
                        <div className={cx('input-wrapper')}>
                            <FontAwesomeIcon icon={faLock} className={cx('input-icon')} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu của bạn"
                                className={cx({ 'error': validationErrors.password })}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className={cx('password-toggle')}
                                onClick={togglePasswordVisibility}
                                disabled={isLoading}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {validationErrors.password && (
                            <span className={cx('error-text')}>{validationErrors.password}</span>
                        )}
                    </div>

                    <div className={cx('form-options')}>
                        <label className={cx('checkbox-wrapper')}>
                            <input
                                type="checkbox"
                                name="remember_me"
                                checked={formData.remember_me}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                            <span className={cx('checkmark')}></span>
                            Ghi nhớ đăng nhập
                        </label>
                        <Link to="/forgot-password" className={cx('forgot-password')}>
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className={cx('login-btn', { 'loading': isLoading })}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>

                <div className={cx('login-footer')}>
                    <p>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className={cx('register-link')}>
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;