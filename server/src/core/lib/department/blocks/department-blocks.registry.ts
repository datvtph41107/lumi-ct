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
		code: 'HC.DOCUMENTATION',
		department: 'HC',
		title: 'Hồ sơ & Văn thư',
		description: 'Quản lý văn bản, phát hành, lưu trữ',
		defaultAssignee: 'manager',
		defaultTasks: [
			{ name: 'Soạn công văn phát hành', description: 'Chuẩn bị công văn gửi các bên' },
			{ name: 'Đóng dấu & phát hành', description: 'Phát hành văn bản theo quy trình' },
			{ name: 'Lưu trữ hồ sơ', description: 'Số hóa, phân loại và lưu trữ' },
		],
		fields: [
			{ id: 'dispatch_no', label: 'Số công văn', type: 'text' },
			{ id: 'archive_code', label: 'Mã lưu trữ', type: 'text' },
		]
	},
	{
		code: 'HC.SEAL_SIGNATURE',
		department: 'HC',
		title: 'Đóng dấu & Chữ ký',
		description: 'Phối hợp đóng dấu, xin chữ ký',
		defaultAssignee: 'manager',
		defaultTasks: [
			{ name: 'Trình ký', description: 'Chuẩn bị bản in, trình ký' },
			{ name: 'Đóng dấu', description: 'Đóng dấu pháp nhân' },
		],
		fields: [
			{ id: 'sign_deadline', label: 'Hạn trình ký', type: 'date' },
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
			{ name: 'Biên bản nghiệm thu', description: 'Lập BBNT với chữ ký đầy đủ' },
		],
		fields: [
			{ id: 'acceptance_date', label: 'Ngày nghiệm thu', type: 'date', required: true },
			{ id: 'acceptance_type', label: 'Loại nghiệm thu', type: 'select', options: [
				{ value: 'partial', label: 'Nghiệm thu từng phần' },
				{ value: 'final', label: 'Nghiệm thu hoàn thành' },
			] },
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
			{ name: 'Đối chiếu công nợ', description: 'Kiểm tra số liệu và chứng từ' },
			{ name: 'Thực hiện thanh toán', description: 'Chuyển khoản/Ghi sổ' },
		],
		fields: [
			{ id: 'payment_terms', label: 'Điều khoản thanh toán', type: 'textarea' },
			{ id: 'payment_due', label: 'Ngày hạn thanh toán', type: 'date' },
			{ id: 'payment_method', label: 'Phương thức', type: 'select', options: [
				{ value: 'bank', label: 'Chuyển khoản' },
				{ value: 'cash', label: 'Tiền mặt' },
			] },
		]
	},
	{
		code: 'KT.INVOICE',
		department: 'KT',
		title: 'Hóa đơn & Thuế',
		description: 'Xử lý hóa đơn, khấu trừ thuế',
		defaultAssignee: 'manager',
		defaultTasks: [
			{ name: 'Nhận & kiểm tra hóa đơn', description: 'Đối chiếu thông tin hóa đơn' },
			{ name: 'Hạch toán hóa đơn', description: 'Ghi nhận kế toán' },
			{ name: 'Kê khai thuế', description: 'Đưa vào kê khai kỳ thuế' },
		],
		fields: [
			{ id: 'invoice_no', label: 'Số hóa đơn', type: 'text' },
			{ id: 'invoice_date', label: 'Ngày hóa đơn', type: 'date' },
		]
	},
];

export function listDepartmentBlocks(onlyDepartments?: string[]): DepartmentBlockDefinition[] {
	const depts = (onlyDepartments || []).map((d) => d.toUpperCase());
	if (depts.length === 0) return BLOCKS;
	return BLOCKS.filter((b) => depts.includes(b.department.toUpperCase()));
}

export function listDepartmentItems(departmentCode: string) {
	return BLOCKS.filter((b) => b.department.toUpperCase() === String(departmentCode).toUpperCase());
}