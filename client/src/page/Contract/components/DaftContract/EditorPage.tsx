import classNames from 'classnames/bind';
import styles from './EditorPage.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCopy, faUpDownLeftRight, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '~/components/Editor/Editor';
import { useEffect } from 'react';
import { useEditorStore } from '~/store/editor-store';
import { useContractDraftStore } from '~/store/contract-draft-store';

const cx = classNames.bind(styles);

const EditorPage = () => {
	const { editor } = useEditorStore();
	const { currentDraft } = useContractDraftStore();

	useEffect(() => {
		if (!editor) return;
		const html = editor.getHTML()?.trim();
		if (!html || html === '<p></p>') {
			const type = (currentDraft?.contractData as any)?.contractType || 'service';
			const baseHeader = `<h1 style="text-align:center">HỢP ĐỒNG</h1>`;
			const parties = `<h2>Thông tin các bên</h2><p>Bên A: ...</p><p>Bên B: ...</p>`;
			let skeleton = `${baseHeader}${parties}<h2>Điều khoản</h2><p>...</p><h2>Thanh toán</h2><p>...</p><h2>Chữ ký</h2><p>...</p>`;
			if (type === 'service') {
				skeleton = `${baseHeader}<h2>Phạm vi dịch vụ</h2><p>...</p>${parties}<h2>Thanh toán</h2><p>...</p><h2>Bảo mật</h2><p>...</p><h2>Chữ ký</h2><p>...</p>`;
			}
			if (type === 'employment') {
				skeleton = `${baseHeader}<h2>Chức danh và mô tả công việc</h2><p>...</p><h2>Thời hạn hợp đồng</h2><p>...</p>${parties}<h2>Tiền lương và phúc lợi</h2><p>...</p><h2>Chữ ký</h2><p>...</p>`;
			}
			editor.commands.setContent(skeleton, false);
		}
	}, [editor, currentDraft?.contractData]);

	return (
		<>
			{/* Tag Page */}
			<div className={cx('editor-control-group')}>
				<div className={cx('page-tag')}>Page 1</div>
				<div className={cx('page-control')}>
					<div className={cx('page-control_box', 'box_left')}>
						<FontAwesomeIcon icon={faCirclePlus} />
					</div>
					<div className={cx('page-control_box')}>
						<FontAwesomeIcon icon={faCopy} />
					</div>
					<div className={cx('page-control_box')}>
						<FontAwesomeIcon icon={faUpDownLeftRight} />
					</div>
					<div className={cx('page-control_box', 'box_right')}>
						<FontAwesomeIcon icon={faTrashCan} />
					</div>
				</div>
			</div>
			<div className={cx('page-wrapper')}>
				<Editor />
			</div>
		</>
	);
};

export default EditorPage;
