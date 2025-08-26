import classNames from 'classnames/bind';
import style from './TemplateManager.module.scss';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import SearchInput from '~/components/Search/Search';
import Dropdown from '~/page/Contract/components/Dropdown/Dropdown';
import DateRangePicker, { type DateRange } from '~/components/DateRangePicker/DateRangePicker';
import { useState, useMemo } from 'react';
import { Clock, FileText, Plus, User } from 'lucide-react';
import type { Template } from '~/store/template-store';
import { useNavigate } from 'react-router-dom';
import { routePrivate } from '~/config/routes.config';

const cx = classNames.bind(style);

const mockTemplates: Template[] = [
    {
        id: '1',
        name: 'Hợp đồng lao động',
        description: 'Mẫu hợp đồng lao động chuẩn theo quy định pháp luật Việt Nam',
        category: 'Lao động',
        status: 'published',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        createdBy: 'Admin',
        version: 'v2.1',
        elements: [],
        isDefault: true,
    },
    {
        id: '2',
        name: 'Hợp đồng dịch vụ',
        description: 'Mẫu hợp đồng cung cấp dịch vụ chuyên nghiệp',
        category: 'Dịch vụ',
        status: 'published',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        createdBy: 'Manager',
        version: 'v1.3',
        elements: [],
    },
    {
        id: '3',
        name: 'Hợp đồng thuê nhà',
        description: 'Mẫu hợp đồng thuê nhà ở dân cư',
        category: 'Bất động sản',
        status: 'draft',
        createdAt: '2024-01-22',
        updatedAt: '2024-01-22',
        createdBy: 'Legal Team',
        version: 'v1.0',
        elements: [],
    },
];

const categoriesOption = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Lao động', label: 'Lao động' },
    { value: 'Dịch vụ', label: 'Dịch vụ' },
    { value: 'Bất động sản', label: 'Bất động sản' },
    { value: 'Tài chính', label: 'Tài chính' },
];

const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

function TemplateManager() {
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [search, setSearch] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
    const navigate = useNavigate();

    const handleTemplateBuilder = (id?: string) => {
        if (!id) {
            navigate(routePrivate.templateBuilder);
        } else {
            navigate(routePrivate.templateBuilderDetail(id));
        }
    };

    // Filter logic
    const filteredTemplates = useMemo(() => {
        return mockTemplates.filter((tpl) => {
            const matchCategory = categoryFilter === 'all' || tpl.category === categoryFilter;
            const matchStatus = statusFilter === 'all' || tpl.status === statusFilter;

            const matchSearch =
                search.trim() === '' ||
                tpl.name.toLowerCase().includes(search.toLowerCase()) ||
                tpl.description.toLowerCase().includes(search.toLowerCase());

            const tplDate = new Date(tpl.createdAt);
            const matchDate =
                (!dateRange.startDate || tplDate >= dateRange.startDate) &&
                (!dateRange.endDate || tplDate <= dateRange.endDate);

            return matchCategory && matchStatus && matchSearch && matchDate;
        });
    }, [categoryFilter, statusFilter, search, dateRange]);

    return (
        <div className={cx('template-manager')}>
            <div className={cx('template-header')}>
                <div className={cx('template-header-group')}>
                    <div className={cx('th-gr')}>
                        <h1 className={cx('th-gr-1')}>Quản lý mẫu hợp đồng</h1>
                        <p className={cx('th-gr-p')}>Thiết lập mẫu hợp đồng mới</p>
                    </div>
                    <div className={cx('th-btn')}>
                        <Button
                            onClick={() => handleTemplateBuilder()}
                            primary
                            medium
                            leftIcon={<FontAwesomeIcon icon={faPlus} />}
                        >
                            Thêm mẫu hợp đồng
                        </Button>
                    </div>
                </div>
                <div className={cx('template-header-filter')}>
                    <div>
                        <SearchInput className={cx('search-filter')} value={search} onChange={setSearch} />
                    </div>
                    <div className={cx('template-header-filter-right')}>
                        <Dropdown
                            className={cx('dropdown-filter')}
                            value={categoryFilter}
                            onChange={(val) => setCategoryFilter(val)}
                            options={categoriesOption}
                        />
                        <Dropdown
                            className={cx('dropdown-filter')}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            options={statusOptions}
                        />
                        <DateRangePicker value={dateRange} onChange={setDateRange} />
                    </div>
                </div>
            </div>

            {filteredTemplates.length > 0 ? (
                <div className={cx('template-list')}>
                    {filteredTemplates.map((template) => (
                        <div className={cx('template-card')} onClick={() => handleTemplateBuilder(template.id)}>
                            <div className={cx('card-header')}>
                                <FileText size={20} />
                                {template.isDefault && <span className={cx('default-badge')}>Default</span>}
                            </div>

                            <div className={cx('card-body')}>
                                <h3 className={cx('title')}>{template.name}</h3>
                                <p className={cx('description')}>{template.description}</p>
                                <div className={cx('tags')}>
                                    <span className={cx('tag')}>{template.category}</span>
                                    <span className={cx('status', template.status)}>{template.status}</span>
                                    <span className={cx('version')}>{template.version}</span>
                                </div>
                            </div>

                            <div className={cx('card-footer')}>
                                <div className={cx('footer-item')}>
                                    <User size={14} /> {template.createdBy}
                                </div>
                                <div className={cx('footer-item')}>
                                    <Clock size={14} /> {template.updatedAt}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={cx('empty')}>
                    <FileText className={cx('empty-icon')} />
                    <h3 className={cx('empty-title')}>Không tìm thấy mẫu nào</h3>
                    <p className={cx('empty-description')}>
                        {search || categoryFilter !== 'All' || statusFilter !== 'All'
                            ? 'Hãy thử thay đổi tìm kiếm hoặc bộ lọc'
                            : 'Tạo mẫu đầu tiên của bạn để bắt đầu'}
                    </p>
                    <Button
                        onClick={() => handleTemplateBuilder()}
                        small
                        outline
                        leftIcon={<Plus className={cx('btn-icon')} />}
                    >
                        Tạo Mẫu
                    </Button>
                </div>
            )}
        </div>
    );
}

export default TemplateManager;
