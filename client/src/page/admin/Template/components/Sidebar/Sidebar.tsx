import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import {
    FileText,
    Layout,
    Palette,
    Plus,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    PenTool,
    Calendar,
    Users,
} from 'lucide-react';
import Section from './components/Section/Section';

const cx = classNames.bind(styles);

const SIDEBAR_TABS = [
    { id: 'add-section', label: 'Thêm mục', icon: Plus },
    { id: 'layout', label: 'Bố cục', icon: Layout },
    { id: 'template', label: 'Đổi mẫu', icon: FileText },
    { id: 'design', label: 'Thiết kế & Font', icon: Palette },
];

const AVAILABLE_SECTIONS = [
    {
        id: 'parties-info',
        title: 'Thông tin các bên',
        icon: Users,
        description: 'Thông tin chi tiết về các bên tham gia hợp đồng',
        template:
            'BÊN A: {{TenBenA}}\nĐịa chỉ: {{DiaChiBenA}}\nĐại diện: {{DaiDienBenA}}\n\nBÊN B: {{TenBenB}}\nĐịa chỉ: {{DiaChiBenB}}\nĐại diện: {{DaiDienBenB}}',
    },
    {
        id: 'clause',
        title: 'Điều khoản',
        icon: FileText,
        description: 'Điều khoản chi tiết của hợp đồng',
        template: 'Điều {{SoDieu}}: {{TieuDeDieu}}\n{{NoiDungDieu}}',
    },
    {
        id: 'payment-terms',
        title: 'Điều khoản thanh toán',
        icon: CreditCard,
        description: 'Quy định về thanh toán và chi phí',
        template:
            'Tổng giá trị hợp đồng: {{TongGiaTri}} VNĐ\nPhương thức thanh toán: {{PhuongThucThanhToan}}\nThời hạn thanh toán: {{ThoiHanThanhToan}}',
    },
    {
        id: 'signature',
        title: 'Chữ ký',
        icon: PenTool,
        description: 'Phần chữ ký của các bên',
        template: 'BÊN A\n(Ký và ghi rõ họ tên)\n\n\n\nBÊN B\n(Ký và ghi rõ họ tên)',
    },
    {
        id: 'date-place',
        title: 'Ngày tháng nơi ký',
        icon: Calendar,
        description: 'Thông tin về thời gian và địa điểm ký hợp đồng',
        template: '{{NoiKy}}, ngày {{Ngay}} tháng {{Thang}} năm {{Nam}}',
    },
];

const Sidebar = () => {
    const [activeSidebarTab, setActiveSidebarTab] = useState('add-section');
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const scrollAmount = 200;

    const updateArrowVisibility = () => {
        if (!containerRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    useEffect(() => {
        updateArrowVisibility();
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', updateArrowVisibility);
        window.addEventListener('resize', updateArrowVisibility);

        return () => {
            container.removeEventListener('scroll', updateArrowVisibility);
            window.removeEventListener('resize', updateArrowVisibility);
        };
    }, []);

    const handleNext = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const handleClickTab = (id: string) => {
        setActiveSidebarTab(id);
        const el = tabRefs.current[id];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    };

    return (
        <div className={cx('sidebar')}>
            {/* HEADER */}
            <div className={cx('sidebar-hd')}>
                <h2 className={cx('sidebar-hd-title')}>Trình soạn thảo hợp đồng</h2>
                <p className={cx('sidebar-hd-ds')}>Thiết kế template của bạn</p>
            </div>

            {/* TABS */}
            <div className={cx('sidebar-tab')}>
                <div className={cx('scroll-container')} ref={containerRef}>
                    <div className={cx('sidebar-tab-gr')}>
                        {SIDEBAR_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                ref={(el) => (tabRefs.current[tab.id] = el)}
                                onClick={() => handleClickTab(tab.id)}
                                className={cx('sidebar-tab-button', {
                                    active: activeSidebarTab === tab.id,
                                })}
                            >
                                <tab.icon className={cx('tab-icon')} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overlay gradient + Arrow */}
                {showLeft && (
                    <div className={cx('fade-left')}>
                        <button className={cx('arrow-btn')} onClick={handlePrev}>
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                )}
                {showRight && (
                    <div className={cx('fade-right')}>
                        <button className={cx('arrow-btn', 'fade-right')} onClick={handleNext}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className={cx('sidebar-contain')}>
                {activeSidebarTab === 'add-section' && <Section sections={AVAILABLE_SECTIONS} />}
                {activeSidebarTab === 'layout' && <div>👉 Nội dung bố cục</div>}
                {activeSidebarTab === 'template' && <div>👉 Nội dung đổi mẫu</div>}
                {activeSidebarTab === 'design' && <div>👉 Nội dung thiết kế & font</div>}
            </div>
        </div>
    );
};

export default Sidebar;
