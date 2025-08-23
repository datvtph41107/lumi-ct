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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, 
    faEye, 
    faUpload, 
    faDownload, 
    faUndo, 
    faRedo,
    faCog,
    faHistory,
    faFileAlt,
    faPuzzlePiece,
    faCogs,
    faEyeSlash,
    faCheckCircle,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

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
        status: 'draft'
    } as any);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
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
        setShowPreview(true);
    }, [id, template]);

    const handlePublish = useCallback(async () => {
        try {
            await templateService.publish(id as string, {});
            await load();
            alert('Đã publish template thành công!');
        } catch (error) {
            alert('Không thể publish template');
        }
    }, [id]);

    const getTabIcon = (tabKey: TabKey) => {
        switch (tabKey) {
            case 'overview':
                return faFileAlt;
            case 'editor':
                return faFileAlt;
            case 'builder':
                return faPuzzlePiece;
            case 'fields':
                return faCogs;
            case 'preview':
                return faEye;
            case 'versions':
                return faHistory;
            case 'settings':
                return faCog;
            default:
                return faFileAlt;
        }
    };

    const getTabLabel = (tabKey: TabKey) => {
        switch (tabKey) {
            case 'overview':
                return 'Tổng quan';
            case 'editor':
                return 'Soạn thảo';
            case 'builder':
                return 'Builder';
            case 'fields':
                return 'Trường dữ liệu';
            case 'preview':
                return 'Xem trước';
            case 'versions':
                return 'Phiên bản';
            case 'settings':
                return 'Cài đặt';
            default:
                return tabKey;
        }
    };

    return (
        <div className={styles.container}>
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

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <button 
                        className={styles.backButton}
                        onClick={() => navigate('/templates')}
                    >
                        ← Quay lại
                    </button>
                    <div className={styles.titleSection}>
                        <input
                            className={styles.titleInput}
                            placeholder="Tên template"
                            value={template.name || ''}
                            onChange={(e) => handleMetaChange({ name: e.target.value })}
                            onBlur={() => save()}
                        />
                        <div className={styles.metaInfo}>
                            <span className={styles.status}>
                                <FontAwesomeIcon 
                                    icon={(template as any).status === 'published' ? faCheckCircle : faEyeSlash} 
                                    className={styles.statusIcon}
                                />
                                {(template as any).status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>
                            {saving && <span className={styles.saving}>Đang lưu...</span>}
                        </div>
                    </div>
                </div>
                
                <div className={styles.headerActions}>
                    <button className={styles.actionButton} onClick={handlePreview}>
                        <FontAwesomeIcon icon={faEye} />
                        Xem trước
                    </button>
                    {!isNew && (
                        <button 
                            className={`${styles.actionButton} ${styles.publishButton}`}
                            onClick={handlePublish}
                            disabled={(template as any).status === 'published'}
                        >
                            <FontAwesomeIcon icon={faUpload} />
                            Publish
                        </button>
                    )}
                    <button className={styles.actionButton}>
                        <FontAwesomeIcon icon={faDownload} />
                        Xuất
                    </button>
                </div>
            </div>

            {/* Meta Info */}
            <div className={styles.metaBar}>
                <div className={styles.metaGroup}>
                    <input
                        className={styles.metaInput}
                        placeholder="Mô tả template"
                        value={template.description || ''}
                        onChange={(e) => handleMetaChange({ description: e.target.value })}
                        onBlur={() => save()}
                    />
                </div>
                
                <div className={styles.metaGroup}>
                    <select
                        className={styles.metaSelect}
                        value={(template as any).mode || 'editor'}
                        onChange={(e) => {
                            handleMetaChange({ mode: e.target.value as any });
                            void save({ mode: e.target.value as any });
                        }}
                    >
                        <option value="basic">Form</option>
                        <option value="editor">Editor</option>
                    </select>
                    
                    <select
                        className={styles.metaSelect}
                        value={template.category || ''}
                        onChange={(e) => {
                            handleMetaChange({ category: e.target.value });
                            void save({ category: e.target.value });
                        }}
                    >
                        <option value="">Chọn danh mục</option>
                        <option value="employment">Lao động</option>
                        <option value="service">Dịch vụ</option>
                        <option value="nda">NDA</option>
                        <option value="partnership">Hợp tác</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {(['overview', 'editor', 'builder', 'fields', 'preview', 'versions', 'settings'] as TabKey[]).map(
                    (tabKey) => (
                        <button
                            key={tabKey}
                            onClick={() => setTab(tabKey)}
                            className={`${styles.tabButton} ${tab === tabKey ? styles.tabActive : ''}`}
                        >
                            <FontAwesomeIcon icon={getTabIcon(tabKey)} />
                            {getTabLabel(tabKey)}
                        </button>
                    ),
                )}
            </div>

            {/* Content */}
            <div className={styles.content}>
                {tab === 'overview' && (
                    <div className={styles.overview}>
                        <div className={styles.overviewCard}>
                            <h3>Thông tin template</h3>
                            <div className={styles.overviewInfo}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Tên:</span>
                                    <span className={styles.infoValue}>{template.name || 'Chưa đặt tên'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Loại:</span>
                                    <span className={styles.infoValue}>{(template as any).mode || 'editor'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Danh mục:</span>
                                    <span className={styles.infoValue}>{template.category || 'Chưa phân loại'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Trạng thái:</span>
                                    <span className={styles.infoValue}>
                                        {(template as any).status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'editor' && (
                    <div className={styles.editorContainer}>
                        <TemplateEditor value={String(editorValue || '')} onChange={onEditorChange} />
                    </div>
                )}

                {tab === 'builder' && (
                    <div className={styles.builderContainer}>
                        <TemplateBuilder />
                    </div>
                )}
                
                {tab === 'fields' && (
                    <div className={styles.fieldsContainer}>
                        <FieldsDesigner
                            value={((template as any)?.fields as any[]) || []}
                            onChange={async (fields) => {
                                setTemplate((prev: any) => ({ ...prev, fields }));
                                await templateService.updateTemplate(id as string, { fields } as any);
                            }}
                        />
                    </div>
                )}
                
                {tab === 'versions' && id && (
                    <div className={styles.versionsContainer}>
                        <TemplateVersions id={id} />
                    </div>
                )}
                
                {tab === 'preview' && (
                    <div className={styles.previewContainer}>
                        {showPreview ? (
                            <div className={styles.previewFrame}>
                                <div className={styles.previewHeader}>
                                    <h3>Xem trước template</h3>
                                    <button 
                                        className={styles.closeButton}
                                        onClick={() => setShowPreview(false)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <iframe 
                                    title="preview" 
                                    className={styles.previewIframe}
                                    srcDoc={previewHtml} 
                                />
                            </div>
                        ) : (
                            <div className={styles.previewPlaceholder}>
                                <FontAwesomeIcon icon={faEye} className={styles.previewIcon} />
                                <h3>Xem trước template</h3>
                                <p>Nhấn "Xem trước" để hiển thị template</p>
                                <button className={styles.previewButton} onClick={handlePreview}>
                                    <FontAwesomeIcon icon={faEye} />
                                    Xem trước
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {tab === 'settings' && (
                    <div className={styles.settingsContainer}>
                        <div className={styles.settingsCard}>
                            <h3>Cài đặt template</h3>
                            <p>Các tùy chọn cài đặt sẽ được thêm vào đây...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateDetailPage;
