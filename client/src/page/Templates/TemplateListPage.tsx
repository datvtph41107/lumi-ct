import { useEffect, useMemo, useState } from 'react';
import { templateService } from '~/services/api/template.service';
import type { ContractTemplate } from '~/types/contract/contract.types';
import { routePrivate } from '~/config/routes.config';
import { useNavigate } from 'react-router-dom';

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
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input placeholder="Tìm kiếm" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="">Tất cả loại</option>
                    <option value="basic">Form</option>
                    <option value="editor">Editor</option>
                </select>
                <input placeholder="Danh mục" value={category} onChange={(e) => setCategory(e.target.value)} />
                <button onClick={load}>Lọc</button>
                <button onClick={() => navigate(routePrivate.templateDetail('new'))}>Tạo Template</button>
            </div>

            {loading && <div>Đang tải...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {filtered.map((t) => (
                    <div key={t.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div style={{ color: '#666', fontSize: 13 }}>{t.description}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => navigate(routePrivate.templateDetail(t.id))}>Mở</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateListPage;
