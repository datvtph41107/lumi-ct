import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateService } from '~/services/api/template.service';
import type { ContractTemplate } from '~/types/contract/contract.types';
import TemplateEditor from '~/page/Templates/components/TemplateEditor';
import TemplateBuilder from '~/page/Templates/components/TemplateBuilder';
import styles from './TemplateDetailPage.module.scss';
import { useCallback, useState as useReactState } from 'react';
import { FieldsDesigner } from './components/FieldsDesigner';
import { TemplateVersions } from './components/TemplateVersions';

type TabKey = 'overview' | 'editor' | 'builder' | 'fields' | 'preview' | 'versions' | 'settings';

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
                // optimistic concurrency: include current __etag
                const res = await templateService.updateTemplate(
                    id as string,
                    {
                        ...(payload || {}),
                        __etag: (template as any)?.__etag,
                    } as any,
                );
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

    const [previewHtml, setPreviewHtml] = useReactState<string>('');
    const handlePreview = useCallback(async () => {
        const res = await templateService.preview(id || 'new', {
            content: { editor_content: (template as any)?.editorContent || (template as any)?.content },
        } as any);
        setPreviewHtml((res.data as any)?.html || (res as any)?.html || '');
        setTab('preview');
    }, [id, template]);

    const handlePublish = useCallback(async () => {
        await templateService.publish(id as string, {});
        await load();
        alert('Đã publish template');
    }, [id]);

    return (
        <div className={styles.container}>
            {loading && <div>Đang tải...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            {/* Meta */}
            <div className={styles.toolbar}>
                <input
                    className={styles.input}
                    placeholder="Tên template"
                    value={template.name || ''}
                    onChange={(e) => handleMetaChange({ name: e.target.value })}
                    onBlur={() => save()}
                />
                <input
                    className={styles.input}
                    placeholder="Mô tả"
                    value={template.description || ''}
                    onChange={(e) => handleMetaChange({ description: e.target.value })}
                    onBlur={() => save()}
                />
                <select
                    className={styles.select}
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
            <div className={styles.tabs}>
                {(['overview', 'editor', 'builder', 'fields', 'preview', 'versions', 'settings'] as TabKey[]).map(
                    (k) => (
                        <button
                            key={k}
                            onClick={() => setTab(k)}
                            className={`${styles.tabButton} ${tab === k ? styles.tabActive : ''}`}
                        >
                            {k}
                        </button>
                    ),
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button className={styles.tabButton} onClick={handlePreview}>
                        Preview
                    </button>
                    {!isNew && (
                        <button className={styles.tabButton} onClick={handlePublish}>
                            Publish
                        </button>
                    )}
                </div>
            </div>

            {tab === 'editor' && <TemplateEditor value={String(editorValue || '')} onChange={onEditorChange} />}

            {tab === 'builder' && <TemplateBuilder />}
            {tab === 'fields' && (
                <FieldsDesigner
                    value={((template as any)?.fields as any[]) || []}
                    onChange={async (fields) => {
                        setTemplate((prev: any) => ({ ...prev, fields }));
                        await templateService.updateTemplate(id as string, { fields } as any);
                    }}
                />
            )}
            {tab === 'versions' && id && <TemplateVersions id={id} />}
            {tab === 'preview' && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                    <iframe title="preview" style={{ width: '100%', height: 800, border: 0 }} srcDoc={previewHtml} />
                </div>
            )}
        </div>
    );
};

export default TemplateDetailPage;
