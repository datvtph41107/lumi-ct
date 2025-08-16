import { useEffect, useMemo, useState } from 'react';
import { adminUserService } from '~/services/api/admin-user.service';
import type { AdminUser, CreateAdminUserDto, UpdateAdminUserDto, UserRoleAssignment } from '~/types/admin/user-admin.types';

const UserManagement = () => {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState('');
	const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [total, setTotal] = useState(0);

	const [selected, setSelected] = useState<AdminUser | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [assignOpen, setAssignOpen] = useState(false);
	const [effectivePerms, setEffectivePerms] = useState<any[]>([]);

	const filters = useMemo(() => ({ search, role: roleFilter, departmentId, page, limit }), [search, roleFilter, departmentId, page, limit]);

	const load = async () => {
		setLoading(true);
		try {
			const res = await adminUserService.listUsers(filters);
			setUsers(res.data?.data || []);
			setTotal((res.data as any)?.total || 0);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { void load(); }, [filters]);

	const onCreate = async (data: CreateAdminUserDto) => {
		await adminUserService.createUser(data);
		setDrawerOpen(false);
		await load();
	};
	const onUpdate = async (data: UpdateAdminUserDto) => {
		if (!selected) return;
		await adminUserService.updateUser(selected.id, data);
		setDrawerOpen(false);
		await load();
	};
	const onDeactivate = async (user: AdminUser) => {
		if (!confirm(`Vô hiệu hóa tài khoản ${user.username}?`)) return;
		await adminUserService.deactivateUser(user.id);
		await load();
	};
	const openAssignRoles = async (user: AdminUser) => {
		setSelected(user);
		setAssignOpen(true);
		const res = await adminUserService.getEffectivePermissions(user.id);
		setEffectivePerms(res.data?.permissions || []);
	};
	const onAssign = async (assignments: UserRoleAssignment[]) => {
		if (!selected) return;
		await adminUserService.assignRoles(selected.id, assignments);
		setAssignOpen(false);
		await load();
	};

	return (
		<div style={{ padding: 24 }}>
			<h2>Quản lý người dùng</h2>
			<div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
				<input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
				<select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
					<option value="">Tất cả vai trò</option>
					<option value="ADMIN">ADMIN</option>
					<option value="MANAGER">MANAGER</option>
					<option value="STAFF">STAFF</option>
				</select>
				<input
					placeholder="Department ID"
					value={departmentId ?? ''}
					onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
					style={{ width: 140 }}
				/>
				<button onClick={() => setDrawerOpen(true)}>+ Tạo người dùng</button>
			</div>

			{loading ? (
				<p>Đang tải...</p>
			) : (
				<table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
					<thead>
						<tr style={{ textAlign: 'left' }}>
							<th>ID</th>
							<th>Username</th>
							<th>Email</th>
							<th>Role</th>
							<th>Department</th>
							<th>Trạng thái</th>
							<th>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
								<td>{u.id}</td>
								<td>{u.username}</td>
								<td>{u.email}</td>
								<td>{u.role}</td>
								<td>{u.departmentId ?? '-'}</td>
								<td>{u.isActive ? 'Active' : 'Inactive'}</td>
								<td style={{ display: 'flex', gap: 8 }}>
									<button onClick={() => { setSelected(u); setDrawerOpen(true); }}>Sửa</button>
									<button onClick={() => openAssignRoles(u)}>Gán vai trò</button>
									<button onClick={() => onDeactivate(u)} disabled={!u.isActive}>Vô hiệu hóa</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			<div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
				<button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trang trước</button>
				<span>
					Trang {page} / {Math.max(1, Math.ceil(total / limit))}
				</span>
				<button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}>Trang sau</button>
			</div>

			{drawerOpen && (
				<div style={{ position: 'fixed', inset: 0, background: '#0004' }} onClick={() => setDrawerOpen(false)}>
					<div style={{ width: 420, background: '#fff', padding: 16, position: 'absolute', right: 0, top: 0, height: '100%', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
						<h3>{selected ? 'Cập nhật người dùng' : 'Tạo người dùng'}</h3>
						<UserForm
							defaultValues={selected ? { email: selected.email, fullName: selected.fullName, departmentId: selected.departmentId, role: selected.role, isActive: selected.isActive } : undefined}
							onSubmit={(data) => selected ? onUpdate(data as UpdateAdminUserDto) : onCreate(data as CreateAdminUserDto)}
						/>
					</div>
				</div>
			)}

			{assignOpen && selected && (
				<div style={{ position: 'fixed', inset: 0, background: '#0004' }} onClick={() => setAssignOpen(false)}>
					<div style={{ width: 640, background: '#fff', padding: 16, position: 'absolute', right: 0, top: 0, height: '100%', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
						<h3>Gán vai trò cho {selected.username}</h3>
						<RoleAssign
							onSubmit={onAssign}
						/>
						<h4>Quyền hiệu lực</h4>
						<ul>
							{effectivePerms.map((p, i) => (
								<li key={i}>{p.resource}:{p.action}</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
};

const UserForm = ({ defaultValues, onSubmit }: { defaultValues?: any; onSubmit: (data: any) => void }) => {
	const [form, setForm] = useState<any>({
		username: '',
		email: '',
		password: '',
		fullName: '',
		departmentId: undefined,
		role: 'STAFF',
		isActive: true,
		...defaultValues,
	});
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(form);
			}}
			style={{ display: 'grid', gap: 8 }}
		>
			{!defaultValues && (
				<label>
					Username
					<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
				</label>
			)}
			<label>
				Email
				<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
			</label>
			{!defaultValues && (
				<label>
					Mật khẩu
					<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
				</label>
			)}
			<label>
				Họ tên
				<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
			</label>
			<label>
				Department ID
				<input value={form.departmentId ?? ''} onChange={(e) => setForm({ ...form, departmentId: e.target.value ? Number(e.target.value) : undefined })} />
			</label>
			<label>
				Vai trò
				<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
					<option value="ADMIN">ADMIN</option>
					<option value="MANAGER">MANAGER</option>
					<option value="STAFF">STAFF</option>
				</select>
			</label>
			<label>
				Kích hoạt
				<input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
			</label>
			<div style={{ display: 'flex', gap: 8 }}>
				<button type="submit">Lưu</button>
				<button type="button" onClick={() => history.back()}>Hủy</button>
			</div>
		</form>
	);
};

const RoleAssign = ({ onSubmit }: { onSubmit: (assignments: UserRoleAssignment[]) => void }) => {
	const [rows, setRows] = useState<UserRoleAssignment[]>([{ roleId: 'STAFF', scope: 'global' }]);
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			{rows.map((r, i) => (
				<div key={i} style={{ display: 'flex', gap: 8 }}>
					<input placeholder="Role ID" value={r.roleId} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, roleId: e.target.value } : x))} />
					<select value={r.scope} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, scope: e.target.value as any } : x))}>
						<option value="global">global</option>
						<option value="department">department</option>
						<option value="contract">contract</option>
					</select>
					<input placeholder="Scope ID" value={r.scopeId ?? ''} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, scopeId: e.target.value ? Number(e.target.value) : undefined } : x))} />
					<button onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>Xóa</button>
				</div>
			))}
			<div style={{ display: 'flex', gap: 8 }}>
				<button onClick={() => setRows([...rows, { roleId: 'STAFF', scope: 'global' }])}>+ Thêm dòng</button>
				<button onClick={() => onSubmit(rows)}>Lưu gán vai trò</button>
			</div>
		</div>
	);
};

export default UserManagement;
