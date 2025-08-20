import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateService } from '~/services/api/template.service';
import type { ContractTemplate } from '~/types/contract/contract.types';
import TemplateEditor from '~/page/Templates/components/TemplateEditor';

type TabKey = 'overview' | 'editor' | 'fields' | 'preview' | 'versions' | 'settings';

const TemplateDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<TabKey>('editor');
    const [template, setTemplate] = useState<Partial<ContractTemplate>>({
        mode: 'editor',
        category: 'employment',
    } as any);
    const [saving, setSaving] = useState(false);
    const queuedSave = useRef<ReturnType<typeof setTimeout> | null>(null);

    const load = async () => {
        if (isNew) return;
        setLoading(true);
        setError(null);
        try {
            const res = await templateService.get<ContractTemplate>(`/contracts/templates/${id}` as any);
            const data = (res as any)?.data || (res as any);
            setTemplate(data as any);
        } catch (e) {
            setError('Không thể tải template');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleMetaChange = (patch: Partial<ContractTemplate>) => {
        setTemplate((prev) => ({ ...(prev as any), ...(patch as any) }));
    };

    const save = async (payload?: Partial<ContractTemplate>) => {
        setSaving(true);
        try {
            if (isNew) {
                const res = await templateService.createTemplate({ ...(template as any), ...(payload || {}) });
                setTemplate(res.data as any);
                navigate(`/templates/${(res.data as any).id}`);
            } else {
                const res = await templateService.updateTemplate(id as string, { ...(payload || {}) });
                setTemplate((prev) => ({ ...(prev as any), ...(res.data as any) }));
            }
        } finally {
            setSaving(false);
        }
    };

    const debouncedSave = (patch: Partial<ContractTemplate>) => {
        if (queuedSave.current) clearTimeout(queuedSave.current);
        queuedSave.current = setTimeout(() => void save(patch), 800);
    };

    const editorValue = useMemo(() => (template as any)?.editorContent || (template as any)?.content || '', [template]);
    const onEditorChange = (html: string, plainText: string) => {
        setTemplate((prev: any) => ({ ...prev, editorContent: html }));
        debouncedSave({ content: html } as any);
    };

    return (
        <div style={{ padding: 24 }}>
            {loading && <div>Đang tải...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {/* Meta */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <input
                    placeholder="Tên template"
                    style={{ minWidth: 280 }}
                    value={template.name || ''}
                    onChange={(e) => handleMetaChange({ name: e.target.value })}
                    onBlur={() => save()}
                />
                <input
                    placeholder="Mô tả"
                    value={template.description || ''}
                    onChange={(e) => handleMetaChange({ description: e.target.value })}
                    onBlur={() => save()}
                />
                <select
                    value={(template as any).mode || 'editor'}
                    onChange={(e) => {
                        handleMetaChange({ mode: e.target.value as any });
                        void save({ mode: e.target.value as any });
                    }}
                >
                    <option value="basic">Form</option>
                    <option value="editor">Editor</option>
                </select>
                {saving && <span>Đang lưu...</span>}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(['overview', 'editor', 'fields', 'preview', 'versions', 'settings'] as TabKey[]).map((k) => (
                    <button key={k} onClick={() => setTab(k)} style={{ fontWeight: tab === k ? 700 : 400 }}>
                        {k}
                    </button>
                ))}
            </div>

            {tab === 'editor' && <TemplateEditor value={String(editorValue || '')} onChange={onEditorChange} />}

            {tab === 'fields' && <div>Fields designer (coming soon)</div>}
            {tab === 'versions' && <div>History & diff (coming soon)</div>}
            {tab === 'preview' && <div>Preview panel (coming soon)</div>}
        </div>
    );
};

export default TemplateDetailPage;
