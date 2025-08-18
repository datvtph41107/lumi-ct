import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import Form from '~/components/Form';
import Input from '~/components/Input';
import type { LoginRequest as LoginFormValues } from '~/types/auth/auth.types';
import { useAppDispatch } from '~/redux/hooks';
import { login } from '~/redux/slices/auth.slice';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const handleSubmit = async (data: LoginFormValues) => {
        try {
            await dispatch(login(data as any)).unwrap();
            navigate('/dashboard');
        } catch (e) {
            console.error('Login failed', e);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('logo')}>_contractjob-mng</h1>
            </div>

            <div className={cx('login-container')}>
                {/* <h1 className={cx("title")}>Chào mừng bạn trở lại!</h1> */}
                <Form<LoginFormValues>
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
