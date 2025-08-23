import { useEffect, useMemo, useState } from 'react';
import type { ContractTemplate } from '~/types/contract/contract.types';
import { routePrivate } from '~/config/routes.config';
import { useNavigate } from 'react-router-dom';
import styles from './TemplateListPage.module.scss';
import { templateService } from '~/services/api/template.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faSearch, 
    faFilter, 
    faEdit, 
    faCopy, 
    faDownload, 
    faEye, 
    faTrash,
    faCheckCircle,
    faClock,
    faArchive
} from '@fortawesome/free-solid-svg-icons';

const TemplateListPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<ContractTemplate[]>([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState<'basic' | 'editor' | ''>('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

    const filtered = useMemo(() => {
        let result = items;
        
        if (search) {
            result = result.filter(item => 
                item.name?.toLowerCase().includes(search.toLowerCase()) ||
                item.description?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (type) {
            result = result.filter(item => (item as any).mode === type);
        }
        
        if (category) {
            result = result.filter(item => item.category === category);
        }
        
        if (status !== 'all') {
            result = result.filter(item => (item as any).status === status);
        }
        
        return result;
    }, [items, search, type, category, status]);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await templateService.listTemplates({
                search: search || undefined,
                type: (type as any) || undefined,
                category: category || undefined,
            });
            const data = (res.data as any)?.data || res.data || [];
            setItems(data as ContractTemplate[]);
        } catch (e) {
            setError('Không thể tải template');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClone = async (id: string) => {
        const name = prompt('Tên template mới');
        if (!name) return;
        try {
            const res = await templateService.clone(id as any, name);
            navigate(routePrivate.templateDetail((res.data as any).id));
        } catch (error) {
            alert('Không thể nhân bản template');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa template này?')) return;
        try {
            await templateService.delete(id as any);
            await load();
        } catch (error) {
            alert('Không thể xóa template');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published':
                return <FontAwesomeIcon icon={faCheckCircle} className={styles.statusPublished} />;
            case 'draft':
                return <FontAwesomeIcon icon={faClock} className={styles.statusDraft} />;
            case 'archived':
                return <FontAwesomeIcon icon={faArchive} className={styles.statusArchived} />;
            default:
                return <FontAwesomeIcon icon={faClock} className={styles.statusDraft} />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'published':
                return 'Đã xuất bản';
            case 'draft':
                return 'Bản nháp';
            case 'archived':
                return 'Đã lưu trữ';
            default:
                return 'Bản nháp';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Quản lý Template</h1>
                    <p className={styles.subtitle}>Tạo và quản lý các mẫu hợp đồng</p>
                </div>
                <div className={styles.actions}>
                    <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={() => navigate(routePrivate.templateDetail('new'))}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Tạo Template
                    </button>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm kiếm template..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className={styles.filterGroup}>
                    <select className={styles.select} value={type} onChange={(e) => setType(e.target.value as any)}>
                        <option value="">Tất cả loại</option>
                        <option value="basic">Form</option>
                        <option value="editor">Editor</option>
                    </select>
                    
                    <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="draft">Bản nháp</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="archived">Đã lưu trữ</option>
                    </select>
                    
                    <input
                        className={styles.input}
                        placeholder="Danh mục"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                    
                    <button className={styles.filterButton} onClick={load}>
                        <FontAwesomeIcon icon={faFilter} />
                        Lọc
                    </button>
                </div>
            </div>

            {loading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>Đang tải template...</span>
                </div>
            )}
            
            {error && (
                <div className={styles.error}>
                    <span>{error}</span>
                    <button onClick={load} className={styles.retryButton}>Thử lại</button>
                </div>
            )}

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>{items.length}</span>
                    <span className={styles.statLabel}>Tổng template</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>
                        {items.filter(item => (item as any).status === 'published').length}
                    </span>
                    <span className={styles.statLabel}>Đã xuất bản</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statNumber}>
                        {items.filter(item => (item as any).status === 'draft').length}
                    </span>
                    <span className={styles.statLabel}>Bản nháp</span>
                </div>
            </div>

            <div className={styles.grid}>
                {filtered.map((template) => (
                    <div key={template.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{template.name}</div>
                            <div className={styles.cardStatus}>
                                {getStatusIcon((template as any).status || 'draft')}
                                <span>{getStatusText((template as any).status || 'draft')}</span>
                            </div>
                        </div>
                        
                        <div className={styles.cardDesc}>{template.description}</div>
                        
                        <div className={styles.meta}>
                            <span className={`${styles.tag} ${styles.tagBlue}`}>
                                {(template as any).mode || 'editor'}
                            </span>
                            {template.category && (
                                <span className={styles.tag}>{template.category}</span>
                            )}
                            {Array.isArray((template as any).tags) &&
                                (template as any).tags?.slice(0, 2).map((tag: string) => (
                                    <span key={tag} className={styles.tag}>
                                        {tag}
                                    </span>
                                ))}
                        </div>
                        
                        <div className={styles.cardFooter}>
                            <div className={styles.cardInfo}>
                                <span>Phiên bản: {(template as any).version || '1.0'}</span>
                                <span>Cập nhật: {new Date((template as any).updatedAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                            </div>
                            
                            <div className={styles.cardActions}>
                                <button
                                    className={styles.actionButton}
                                    title="Xem"
                                    onClick={() => navigate(routePrivate.templateDetail(template.id))}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button
                                    className={styles.actionButton}
                                    title="Chỉnh sửa"
                                    onClick={() => navigate(routePrivate.templateDetail(template.id))}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                    className={styles.actionButton}
                                    title="Nhân bản"
                                    onClick={() => handleClone(template.id)}
                                >
                                    <FontAwesomeIcon icon={faCopy} />
                                </button>
                                <button
                                    className={styles.actionButton}
                                    title="Xuất"
                                >
                                    <FontAwesomeIcon icon={faDownload} />
                                </button>
                                <button
                                    className={`${styles.actionButton} ${styles.actionDanger}`}
                                    title="Xóa"
                                    onClick={() => handleDelete(template.id)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && filtered.length === 0 && (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📄</div>
                    <h3>Chưa có template nào</h3>
                    <p>Tạo template đầu tiên để bắt đầu quản lý hợp đồng</p>
                    <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={() => navigate(routePrivate.templateDetail('new'))}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Tạo Template
                    </button>
                </div>
            )}
        </div>
    );
};

export default TemplateListPage;
