import { useEffect, useState } from 'react';

interface RoleRow {
	id: string;
	name: string;
	displayName?: string;
	description?: string;
	priority?: number;
}

interface PermissionRow {
	resource: string;
	action: string;
	conditions?: string;
}

const mockResources = ['contract', 'template', 'dashboard', 'audit', 'user', 'notification'];
const mockActions = ['create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'manage', 'analytics', 'view'];

const RolePermissionManagement = () => {
	const [roles, setRoles] = useState<RoleRow[]>([]);
	const [selected, setSelected] = useState<RoleRow | null>(null);
	const [perms, setPerms] = useState<PermissionRow[]>([]);
	const [filter, setFilter] = useState('');

	useEffect(() => {
		// TODO: replace with API
		setRoles([
			{ id: 'admin', name: 'admin', displayName: 'Admin', description: 'Quản trị hệ thống', priority: 100 },
			{ id: 'manager', name: 'manager', displayName: 'Manager', description: 'Quản lý phòng ban', priority: 80 },
			{ id: 'staff', name: 'staff', displayName: 'Staff', description: 'Nhân viên', priority: 50 },
		]);
	}, []);

	const filtered = roles.filter((r) => r.name.includes(filter) || r.displayName?.includes(filter));

	return (
		<div style={{ padding: 24 }}>
			<h2>Roles & Permissions</h2>
			<div style={{ display: 'flex', gap: 12 }}>
				<input placeholder="Tìm role..." value={filter} onChange={(e) => setFilter(e.target.value)} />
				<button onClick={() => setSelected({ id: '', name: '', displayName: '', description: '', priority: 1 })}>+ Tạo role</button>
			</div>

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
									<td><button onClick={() => { setSelected(r); setPerms([]); }}>Sửa</button></td>
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
								<button onClick={() => alert('Lưu role (TODO API)')}>Lưu</button>
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
													{mockResources.map((r) => <option key={r} value={r}>{r}</option>)}
												</select>
											</td>
											<td>
												<select value={p.action} onChange={(e) => setPerms(perms.map((x, idx) => idx === i ? { ...x, action: e.target.value } : x))}>
													{mockActions.map((a) => <option key={a} value={a}>{a}</option>)}
												</select>
											</td>
											<td>
												<input placeholder='{"department":"hr"}' value={p.conditions ?? ''} onChange={(e) => setPerms(perms.map((x, idx) => idx === i ? { ...x, conditions: e.target.value } : x))} />
											</td>
											<td>
												<button onClick={() => setPerms(perms.filter((_, idx) => idx !== i))}>Xóa</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
								<button onClick={() => setPerms([...perms, { resource: 'contract', action: 'read' }])}>+ Thêm permission</button>
								<button onClick={() => alert('Lưu permissions (TODO API)')}>Lưu permissions</button>
							</div>
						</div>
					) : (
						<p>Chọn role để chỉnh sửa hoặc tạo role mới</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default RolePermissionManagement;
