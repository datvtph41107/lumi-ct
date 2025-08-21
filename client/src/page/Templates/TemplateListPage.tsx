import { useEffect, useMemo, useState } from 'react';
import { templateService } from '~/services/api/template.service';
import type { ContractTemplate } from '~/types/contract/contract.types';
import { routePrivate } from '~/config/routes.config';
import { useNavigate } from 'react-router-dom';
import styles from './TemplateListPage.module.scss';

const TemplateListPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<ContractTemplate[]>([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState<'basic' | 'editor' | ''>('');
    const [category, setCategory] = useState('');

    const filtered = useMemo(() => items, [items]);

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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>Quản lý Template</div>
                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={() => navigate(routePrivate.templateDetail('new'))}>
                        + Tạo Template
                    </button>
                </div>
            </div>

            <div className={styles.filters}>
                <input
                    className={styles.input}
                    placeholder="Tìm kiếm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className={styles.select} value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="">Tất cả loại</option>
                    <option value="basic">Form</option>
                    <option value="editor">Editor</option>
                </select>
                <input
                    className={styles.input}
                    placeholder="Danh mục"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <button className={styles.button} onClick={load}>
                    Lọc
                </button>
            </div>

            {loading && <div>Đang tải...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <div className={styles.grid}>
                {filtered.map((t) => (
                    <div key={t.id} className={styles.card}>
                        <div className={styles.cardTitle}>{t.name}</div>
                        <div className={styles.cardDesc}>{t.description}</div>
                        <div className={styles.meta}>
                            <span className={`${styles.tag} ${styles.tagBlue}`}>{(t as any).mode || 'editor'}</span>
                            {Array.isArray((t as any).tags) && (t as any).tags?.slice(0, 3).map((tag: string) => (
                                <span key={tag} className={styles.tag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className={styles.cardActions}>
                            <button className={styles.button} onClick={() => navigate(routePrivate.templateDetail(t.id))}>
                                Mở
                            </button>
                            <button className={styles.button}>Nhân bản</button>
                            <button className={styles.button}>Xuất</button>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && filtered.length === 0 && <div className={styles.empty}>Chưa có template nào.</div>}
        </div>
    );
};

export default TemplateListPage;
