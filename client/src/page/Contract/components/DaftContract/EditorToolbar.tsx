import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBold,
	faItalic,
	faUnderline,
	faListUl,
	faListOl,
	faQuoteLeft,
	faCode,
	faLink,
	faUnlink,
	faImage,
	faTable,
	faUndo,
	faRedo,
	faSave,
	faPrint,
	faDownload,
	faMagicWandSparkles,
} from '@fortawesome/free-solid-svg-icons';

interface EditorToolbarProps {
	editor: any;
	onSave?: () => void;
	onPrint?: () => void;
	onExport?: (format: string) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onSave, onPrint, onExport }) => {
	const [prompt, setPrompt] = useState('');

	if (!editor) return null;

	const applyPrompt = () => {
		if (!prompt.trim()) return;
		// Simple AI prompt emulation: insert a highlighted paragraph
		editor.commands.insertContent(`<p><em>${prompt}</em></p>`);
		setPrompt('');
	};

	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #eee', background: '#fafafa' }}>
			{/* Formatting */}
			<button title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faBold} />
			</button>
			<button title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faItalic} />
			</button>
			<button title="Underline" onClick={() => editor.chain().focus().toggleUnderline?.().run?.()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faUnderline} />
			</button>
			<button title="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faListUl} />
			</button>
			<button title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faListOl} />
			</button>
			<button title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faQuoteLeft} />
			</button>
			<button title="Code" onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faCode} />
			</button>
			<button title="Insert link" onClick={() => {
				const url = window.prompt('Nhập URL');
				if (url) editor.chain().focus().setLink({ href: url }).run();
			}} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faLink} />
			</button>
			<button title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faUnlink} />
			</button>
			<button title="Insert image" onClick={() => {
				const url = window.prompt('Nhập URL hình ảnh');
				if (url) editor.chain().focus().setImage({ src: url }).run();
			}} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faImage} />
			</button>
			<button title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faTable} />
			</button>

			{/* History */}
			<button title="Undo" onClick={() => editor.chain().focus().undo().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faUndo} />
			</button>
			<button title="Redo" onClick={() => editor.chain().focus().redo().run()} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faRedo} />
			</button>

			{/* Actions */}
			<button title="Save (Ctrl/Cmd+S)" onClick={onSave} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faSave} />
			</button>
			<button title="Preview/Print (Ctrl/Cmd+P)" onClick={onPrint} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faPrint} />
			</button>
			<button title="Export" onClick={() => onExport?.('docx')} style={{ padding: 6 }}>
				<FontAwesomeIcon icon={faDownload} />
			</button>

			{/* AI prompt */}
			<div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
				<input
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Gợi ý/nhập prompt AI (VD: Tạo điều khoản bảo mật)"
					style={{ minWidth: 320, padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6 }}
				/>
				<button onClick={applyPrompt} title="Áp dụng" style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, background: '#fff' }}>
					<FontAwesomeIcon icon={faMagicWandSparkles} />
				</button>
			</div>
		</div>
	);
};

export default EditorToolbar;