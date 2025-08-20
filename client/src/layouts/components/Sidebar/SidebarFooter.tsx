// 📁 components/sidebar/SidebarFooter.tsx
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { useState } from 'react';
import { useAppDispatch } from '~/redux/hooks';
import { logout } from '~/redux/slices/auth.slice';

const cx = classNames.bind(styles);

type SidebarFooterProps = {
    collapsed: boolean;
};

const SidebarFooter = ({ collapsed }: SidebarFooterProps) => {
    const dispatch = useAppDispatch();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            await dispatch(logout()).unwrap();
        } catch (err: any) {
            setError(err?.message || 'Đăng xuất thất bại, vui lòng thử lại');
        } finally {
            setIsProcessing(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className={cx('footer')}>
            {!collapsed ? (
                <div className={cx('footer-ds')}>
                    <button
                        className={cx('btn-logout')}
                        onClick={() => setShowConfirm(true)}
                        disabled={isProcessing}
                        title="Đăng xuất khỏi hệ thống"
                    >
                        {isProcessing ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                    {error && <p className={cx('error-text')}>{error}</p>}
                </div>
            ) : (
                <button
                    className={cx('btn-logout', 'icon-only')}
                    onClick={() => setShowConfirm(true)}
                    disabled={isProcessing}
                    title="Đăng xuất"
                >
                    ⎋
                </button>
            )}

            {showConfirm && (
                <div className={cx('confirm-overlay')}>
                    <div className={cx('confirm-modal')}>
                        <h4>Bạn có chắc muốn đăng xuất?</h4>
                        <p>Mọi thay đổi chưa lưu sẽ bị mất.</p>
                        <div className={cx('confirm-actions')}>
                            <button onClick={() => setShowConfirm(false)} disabled={isProcessing}>
                                Hủy
                            </button>
                            <button onClick={handleLogout} disabled={isProcessing} className={cx('danger')}>
                                {isProcessing ? 'Đang đăng xuất...' : 'Đăng xuất'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SidebarFooter;
