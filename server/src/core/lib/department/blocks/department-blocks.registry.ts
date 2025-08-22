import type { DepartmentBlockDefinition } from './department-blocks.types';

const BLOCKS: DepartmentBlockDefinition[] = [
	{
		code: 'HC.DRAFTING',
		department: 'HC',
		title: 'Soạn thảo hợp đồng',
		description: 'Khối soạn thảo do Phòng Hành chính phụ trách',
		defaultAssignee: 'manager',
		defaultTasks: [
			{ name: 'Soạn thảo nội dung', description: 'Chuẩn bị nội dung tổng thể hợp đồng' },
			{ name: 'Rà soát nội bộ', description: 'Kiểm tra thông tin và tính nhất quán' },
		],
		fields: [
			{ id: 'draft_due', label: 'Hạn soạn thảo', type: 'date', required: true },
		]
	},
	{
		code: 'KT.ACCEPTANCE',
		department: 'KT',
		title: 'Nghiệm thu',
		description: 'Khối nghiệm thu theo điều kiện tài chính',
		defaultAssignee: 'manager',
		defaultTasks: [
			{ name: 'Kiểm tra hạng mục', description: 'Kiểm tra khối lượng và chất lượng' },
		],
		fields: [
			{ id: 'acceptance_date', label: 'Ngày nghiệm thu', type: 'date', required: true },
		]
	},
	{
		code: 'KT.PAYMENT',
		department: 'KT',
		title: 'Thanh toán',
		description: 'Khối thanh toán theo lịch và điều khoản',
		defaultAssignee: 'manager',
		defaultTasks: [
			{ name: 'Lập đề nghị thanh toán', description: 'Chuẩn bị hồ sơ thanh toán' },
			{ name: 'Thực hiện thanh toán', description: 'Chuyển khoản/Ghi sổ' },
		],
		fields: [
			{ id: 'payment_terms', label: 'Điều khoản thanh toán', type: 'textarea' },
			{ id: 'payment_due', label: 'Ngày hạn thanh toán', type: 'date' },
		]
	},
];

export function listDepartmentBlocks(onlyDepartments?: string[]): DepartmentBlockDefinition[] {
	const depts = (onlyDepartments || []).map((d) => d.toUpperCase());
	if (depts.length === 0) return BLOCKS;
	return BLOCKS.filter((b) => depts.includes(b.department.toUpperCase()));
}