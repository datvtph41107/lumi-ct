import { useEffect, useState } from 'react';
import { adminRbacService } from '~/services/api/admin-rbac.service';
import type { RoleDto, PermissionBinding, PermissionCatalog } from '~/types/admin/rbac.types';

const RolePermissionManagement = () => {
	const [roles, setRoles] = useState<RoleDto[]>([]);
	const [selected, setSelected] = useState<RoleDto | null>(null);
	const [perms, setPerms] = useState<PermissionBinding[]>([]);
	const [filter, setFilter] = useState('');
	const [catalog, setCatalog] = useState<PermissionCatalog>({ resources: [], actions: [] });
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const load = async () => {
		setLoading(true);
		try {
			const [r, c] = await Promise.all([adminRbacService.listRoles(), adminRbacService.getPermissionCatalog()]);
			setRoles(r.data?.data || []);
			setCatalog(c.data || { resources: [], actions: [] });
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => { void load(); }, []);

	const filtered = roles.filter((r) => r.name.includes(filter) || (r.displayName || '').includes(filter));

	const onSaveRole = async () => {
		if (!selected) return;
		setSaving(true);
		try {
			if (selected.id) {
				await adminRbacService.updateRole(selected.id, selected);
			} else {
				const res = await adminRbacService.createRole(selected);
				setSelected(res.data as RoleDto);
			}
			await load();
			alert('Đã lưu role');
		} finally {
			setSaving(false);
		}
	};

	const onDeleteRole = async (role: RoleDto) => {
		if (!confirm(`Xóa role ${role.name}?`)) return;
		await adminRbacService.deleteRole(role.id);
		setSelected(null);
		await load();
	};

	const onSelectRole = async (role: RoleDto) => {
		setSelected(role);
		const res = await adminRbacService.getRolePermissions(role.id);
		setPerms(res.data?.permissions || []);
	};

	const onSavePerms = async () => {
		if (!selected) return;
		setSaving(true);
		try {
			await adminRbacService.setRolePermissions(selected.id, perms);
			alert('Đã lưu permissions');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div style={{ padding: 24 }}>
			<h2>Roles & Permissions</h2>
			<div style={{ display: 'flex', gap: 12 }}>
				<input placeholder="Tìm role..." value={filter} onChange={(e) => setFilter(e.target.value)} />
				<button onClick={() => setSelected({ id: '', name: '', displayName: '', description: '', priority: 1 })}>+ Tạo role</button>
			</div>

			{loading ? (
				<p>Đang tải...</p>
			) : (
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginTop: 16 }}>
					<div>
						<table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
							<thead><tr><th>Tên</th><th>Mô tả</th><th>Ưu tiên</th><th></th></tr></thead>
							<tbody>
								{filtered.map((r) => (
									<tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
										<td>{r.displayName || r.name}</td>
										<td>{r.description}</td>
										<td>{r.priority ?? '-'}</td>
										<td style={{ display: 'flex', gap: 8 }}>
											<button onClick={() => onSelectRole(r)}>Sửa</button>
											<button onClick={() => onDeleteRole(r)}>Xóa</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div>
						{selected ? (
							<div style={{ display: 'grid', gap: 12 }}>
								<h3>{selected.id ? 'Cập nhật role' : 'Tạo role'}</h3>
								<label>
									Tên hệ thống
									<input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} />
								</label>
								<label>
									Hiển thị
									<input value={selected.displayName ?? ''} onChange={(e) => setSelected({ ...selected, displayName: e.target.value })} />
								</label>
								<label>
									Mô tả
									<input value={selected.description ?? ''} onChange={(e) => setSelected({ ...selected, description: e.target.value })} />
								</label>
								<label>
									Ưu tiên
									<input type="number" value={selected.priority ?? 1} onChange={(e) => setSelected({ ...selected, priority: Number(e.target.value) })} />
								</label>
								<div style={{ display: 'flex', gap: 8 }}>
									<button disabled={saving} onClick={onSaveRole}>{saving ? 'Đang lưu...' : 'Lưu role'}</button>
									<button onClick={() => setSelected(null)}>Đóng</button>
								</div>

								<h3>Permissions</h3>
								<table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
									<thead><tr><th>Resource</th><th>Action</th><th>Conditions (JSON)</th><th></th></tr></thead>
									<tbody>
										{perms.map((p, i) => (
											<tr key={i} style={{ borderTop: '1px solid #eee' }}>
												<td>
													<select value={p.resource} onChange={(e) => setPerms(perms.map((x, idx) => idx === i ? { ...x, resource: e.target.value } : x))}>
														{catalog.resources.map((r) => <option key={r} value={r}>{r}</option>)}
													</select>
												</td>
												<td>
													<select value={p.action} onChange={(e) => setPerms(perms.map((x, idx) => idx === i ? { ...x, action: e.target.value } : x))}>
														{catalog.actions.map((a) => <option key={a} value={a}>{a}</option>)}
													</select>
												</td>
												<td>
													<input placeholder='{"department":"hr"}' value={p.conditions ? JSON.stringify(p.conditions) : ''} onChange={(e) => {
														try {
															const v = e.target.value ? JSON.parse(e.target.value) : undefined;
															setPerms(perms.map((x, idx) => idx === i ? { ...x, conditions: v } : x));
														} catch {}
													}} />
												</td>
												<td>
													<button onClick={() => setPerms(perms.filter((_, idx) => idx !== i))}>Xóa</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
									<button onClick={() => setPerms([...perms, { resource: catalog.resources[0] || 'contract', action: catalog.actions[0] || 'read' }])}>+ Thêm permission</button>
									<button disabled={saving} onClick={onSavePerms}>{saving ? 'Đang lưu...' : 'Lưu permissions'}</button>
								</div>
							</div>
						) : (
							<p>Chọn role để chỉnh sửa hoặc tạo role mới</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default RolePermissionManagement;
