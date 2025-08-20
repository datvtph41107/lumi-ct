import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import Form from '~/components/Form';
import Input from '~/components/Input';
import { useAppDispatch } from '~/redux/hooks';
import { login } from '~/redux/slices/auth.slice';
import { unwrapResult } from '@reduxjs/toolkit';
import { useLocation, useNavigate } from 'react-router-dom';
import { routePrivate } from '~/config/routes.config';
import type { LoginRequest } from '~/types/auth/auth.types';

const cx = classNames.bind(styles);

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = (data: LoginRequest) => {
        const payload = { ...data, is_manager_login: false } as LoginRequest & { is_manager_login: boolean };
        dispatch(login(payload))
            .then(unwrapResult)
            .then(() => {
                const from = location.state?.from?.pathname || routePrivate.dashboard;
                navigate(from, { replace: true });
            })
            .catch((err) => {
                console.error('Đăng nhập thất bại:', err);
            });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('logo')}>_contractjob-mng</h1>
            </div>

            <div className={cx('login-container')}>
                {/* <h1 className={cx("title")}>Chào mừng bạn trở lại!</h1> */}
                <Form<LoginRequest>
                    onSubmit={handleSubmit}
                    defaultValues={{ username: '', password: '' }}
                    className={cx('form')}
                >
                    <Input
                        name="username"
                        type="email"
                        label="Tên đăng nhập"
                        placeholder="nathan.dias@iclo"
                        required="Vui lòng nhập tên đăng nhập"
                    />

                    <Input
                        name="password"
                        type="password"
                        label="Mật khẩu"
                        placeholder="your pasword"
                        required="Không được để trống mật khẩu"
                        minLength={{ value: 6, message: 'Ít nhất 6 ký tự' }}
                    />

                    <a href="/forgot-password" className={cx('forgot-password')}>
                        Quên mật khẩu
                    </a>

                    <button type="submit" className={cx('submit-button')}>
                        Đăng nhập
                    </button>
                </Form>
                {/* <form className={cx("form")}>
                    <div className={cx("form-group")}>
                        <label className={cx("label")}>Tên đăng nhập</label>
                        <input type="email" className={cx("input")} placeholder="nathan.dias@iclo" />
                    </div>

                    <div className={cx("form-group")}>
                        <label className={cx("label")}>Mật khẩu</label>
                        <input type="password" className={cx("input")} placeholder="your password..." />
                    </div>

                    <a href="/forgot-password" className={cx("forgot-password")}>
                        Quên mật khẩu
                    </a>

                    <button type="submit" className={cx("submit-button")}>
                        Đăng nhập
                    </button>
                </form> */}
            </div>
        </div>
    );
};

export default Login;
