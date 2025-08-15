import React from 'react';

interface EditorSidebarProps {
	onInsertSection: (sectionType: string) => void;
	onInsertTemplate: (html: string) => void;
	template?: any;
}

const presets: Array<{ key: string; title: string; html: string }> = [
	{
		key: 'header',
		title: 'Tiêu đề hợp đồng',
		html: `<h1 style="text-align:center">HỢP ĐỒNG</h1><p style="text-align:center">Số: _________ | Ngày ký: ${new Date().toLocaleDateString('vi-VN')}</p>`,
	},
	{
		key: 'parties',
		title: 'Thông tin các bên',
		html: `<h2>THÔNG TIN CÁC BÊN</h2><h3>BÊN A</h3><p>Tên công ty: __________</p><p>Địa chỉ: __________</p><h3>BÊN B</h3><p>Họ và tên: __________</p><p>CMND/CCCD: __________</p>`,
	},
	{
		key: 'clauses',
		title: 'Điều khoản chính',
		html: `<h2>ĐIỀU KHOẢN CHÍNH</h2><h3>Điều 1: Phạm vi</h3><p>...</p><h3>Điều 2: Thời hạn</h3><p>...</p><h3>Điều 3: Thanh toán</h3><p>...</p>`,
	},
	{
		key: 'signature',
		title: 'Chữ ký',
		html: `<h2>CHỮ KÝ</h2><div style="display:flex;justify-content:space-between;margin-top:40px"><div style="text-align:center"><p><strong>BÊN A</strong></p><p>(Ký, ghi rõ họ tên)</p></div><div style="text-align:center"><p><strong>BÊN B</strong></p><p>(Ký, ghi rõ họ tên)</p></div></div>`,
	},
];

const EditorSidebar: React.FC<EditorSidebarProps> = ({ onInsertSection, onInsertTemplate, template }) => {
	return (
		<div style={{ width: 280, borderLeft: '1px solid #eee', background: '#fff', padding: 12 }}>
			<h4 style={{ margin: '8px 0 12px' }}>Thư viện</h4>
			<div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Preset cấu trúc hợp đồng</div>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				{presets.map((p) => (
					<button
						key={p.key}
						onClick={() => onInsertTemplate(p.html)}
						style={{ textAlign: 'left', padding: '8px 10px', border: '1px solid #ddd', background: '#fafafa', borderRadius: 8 }}
					>
						{p.title}
					</button>
				))}
			</div>

			{template?.editorContent && (
				<>
					<div style={{ margin: '16px 0 8px', fontSize: 12, color: '#666' }}>Template hiện tại</div>
					<button
						onClick={() => onInsertTemplate(template.editorContent)}
						style={{ textAlign: 'left', padding: '8px 10px', border: '1px solid #ddd', background: '#f5faff', borderRadius: 8 }}
					>
						Chèn nội dung template
					</button>
				</>
			)}
		</div>
	);
};

export default EditorSidebar;