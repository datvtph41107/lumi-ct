import Form from '~/components/Form';
import Input from '~/components/Input';
import classNames from 'classnames/bind';
import styles from './AdminLogin.module.scss';
// import { loginUser } from "~/redux/slices/auth.slice";
import { unwrapResult } from '@reduxjs/toolkit';
import { useAppDispatch } from '~/redux/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { routePrivate } from '~/config/routes.config';
import { login } from '~/redux/slices/auth.slice';
import type { LoginRequest } from '~/types/auth/auth.types';

const cx = classNames.bind(styles);

const AdminLogin = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = (data: LoginRequest) => {
        const dataMaster: LoginRequest & { is_manager_login: boolean } = {
            ...data,
            is_manager_login: true,
        };

        dispatch(login(dataMaster))
            .then(unwrapResult)
            .then((result) => {
                console.log('Admin/Manager login thành công', result);
                const from = location.state?.from?.pathname || routePrivate.dashboard;
                navigate(from, { replace: true });
            })
            .catch((err) => {
                console.error('Đăng nhập thất bại:', err);
            });
    };

    return (
        // 🔒 PublicRoute sẽ chặn không cho vào trang này nếu đã đăng nhập
        <div className={cx('wrapper')}>
            <div className={cx('form-box')}>
                <h1 className={cx('title')}>Quản trị hệ thống</h1>
                <p className={cx('subtitle')}>Dành cho Admin & Manager</p>

                <Form<LoginRequest>
                    onSubmit={handleSubmit}
                    defaultValues={{ username: '', password: '' }}
                    className={cx('form')}
                >
                    <Input
                        name="username"
                        type="text"
                        label="Tên đăng nhập"
                        placeholder="nathan.dias@iclo"
                        required="Vui lòng nhập tên đăng nhập"
                    />
                    <Input
                        name="password"
                        type="password"
                        label="Mật khẩu"
                        placeholder="your password"
                        required="Không được để trống mật khẩu"
                    />
                    <button type="submit" className={cx('submit-button')}>
                        Đăng nhập
                    </button>
                </Form>
            </div>
        </div>
    );
};

export default AdminLogin;
