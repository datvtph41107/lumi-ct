import { useEffect, useState } from 'react';
import { templateService } from '~/services/api/template.service';

export function TemplateVersions({ id }: { id: string }) {
    const [versions, setVersions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await templateService.listVersions(id);
            setVersions((res.data as any) || (res as any) || []);
        } catch (e) {
            setError('Không thể tải versions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [id]);

    return (
        <div style={{ display: 'grid', gap: 8 }}>
            {loading && <div>Đang tải...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div style={{ display: 'grid', gap: 8 }}>
                {versions.map((v: any) => (
                    <div
                        key={v.id}
                        style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <div style={{ fontWeight: 700 }}>v{v.version_number}</div>
                        <div style={{ color: '#64748b' }}>{v.changelog || '—'}</div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            <button
                                onClick={async () => {
                                    const target = prompt('Nhập versionId để diff với phiên bản này');
                                    if (!target) return;
                                    const diff = await templateService.diff(id, v.id, target);
                                    alert(JSON.stringify(diff.data || diff, null, 2));
                                }}
                            >
                                Diff
                            </button>
                            <button
                                onClick={async () => {
                                    if (!confirm(`Rollback về v${v.version_number}?`)) return;
                                    await templateService.rollback(id, v.id);
                                    await load();
                                    alert('Đã rollback và tạo version mới');
                                }}
                            >
                                Rollback
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
