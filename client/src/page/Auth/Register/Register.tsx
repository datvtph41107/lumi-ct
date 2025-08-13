import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, 
    faEnvelope, 
    faLock, 
    faEye, 
    faEyeSlash,
    faSpinner,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '~/contexts/AuthContext';
import type { RegisterData } from '~/types/auth/auth.types';
import styles from './Register.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuth();
    
    const [formData, setFormData] = useState<RegisterData>({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        full_name: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        clearError();
    }, [clearError]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.username.trim()) {
            errors.username = 'Tên đăng nhập là bắt buộc';
        } else if (formData.username.length < 3) {
            errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (!formData.full_name.trim()) {
            errors.full_name = 'Họ tên là bắt buộc';
        }

        if (!formData.password) {
            errors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirm_password) {
            errors.confirm_password = 'Xác nhận mật khẩu là bắt buộc';
        } else if (formData.password !== formData.confirm_password) {
            errors.confirm_password = 'Mật khẩu không khớp';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

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
            await register(formData);
            navigate('/');
        } catch (err) {
            // Error is handled by AuthContext
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className={cx('register-container')}>
            <div className={cx('register-card')}>
                <div className={cx('register-header')}>
                    <h1>Đăng ký</h1>
                    <p>Tạo tài khoản mới để bắt đầu</p>
                </div>

                {error && (
                    <div className={cx('error-message')}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={cx('register-form')}>
                    <div className={cx('form-group')}>
                        <label htmlFor="full_name">Họ tên</label>
                        <div className={cx('input-wrapper')}>
                            <FontAwesomeIcon icon={faUser} className={cx('input-icon')} />
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder="Nhập họ tên của bạn"
                                className={cx({ 'error': validationErrors.full_name })}
                                disabled={isLoading}
                            />
                        </div>
                        {validationErrors.full_name && (
                            <span className={cx('error-text')}>{validationErrors.full_name}</span>
                        )}
                    </div>

                    <div className={cx('form-group')}>
                        <label htmlFor="username">Tên đăng nhập</label>
                        <div className={cx('input-wrapper')}>
                            <FontAwesomeIcon icon={faUser} className={cx('input-icon')} />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Nhập tên đăng nhập"
                                className={cx({ 'error': validationErrors.username })}
                                disabled={isLoading}
                            />
                        </div>
                        {validationErrors.username && (
                            <span className={cx('error-text')}>{validationErrors.username}</span>
                        )}
                    </div>

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
                                placeholder="Nhập mật khẩu"
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

                    <div className={cx('form-group')}>
                        <label htmlFor="confirm_password">Xác nhận mật khẩu</label>
                        <div className={cx('input-wrapper')}>
                            <FontAwesomeIcon icon={faLock} className={cx('input-icon')} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirm_password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleInputChange}
                                placeholder="Nhập lại mật khẩu"
                                className={cx({ 'error': validationErrors.confirm_password })}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className={cx('password-toggle')}
                                onClick={toggleConfirmPasswordVisibility}
                                disabled={isLoading}
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {validationErrors.confirm_password && (
                            <span className={cx('error-text')}>{validationErrors.confirm_password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={cx('register-btn', { 'loading': isLoading })}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Đang đăng ký...
                            </>
                        ) : (
                            'Đăng ký'
                        )}
                    </button>
                </form>

                <div className={cx('register-footer')}>
                    <p>
                        Đã có tài khoản?{' '}
                        <Link to="/login" className={cx('login-link')}>
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;