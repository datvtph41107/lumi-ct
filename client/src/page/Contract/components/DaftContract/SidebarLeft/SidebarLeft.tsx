import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faLightbulb,
	faSitemap,
	faFileAlt,
	faHistory,
	faRefresh,
	faChevronDown,
	faChevronRight,
	faStar,
	faUsers,
	faCalendarAlt,
	faCheckCircle,
	faExclamationTriangle,
	faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SidebarLeft.module.scss';
import classNames from 'classnames/bind';
import { useEditorStore } from '~/store/editor-store';
import { useContractDraftStore } from '~/store/contract-draft-store';

const cx = classNames.bind(styles);

interface SidebarLeftProps {
	contractId?: string;
	userId?: number;
}

interface Suggestion {
	id: string;
	title: string;
	description: string;
	type: 'structure' | 'content' | 'legal' | 'format';
	priority: 'high' | 'medium' | 'low';
}

interface StructureSection {
	id: string;
	title: string;
	expanded: boolean;
	items: string[];
}

interface Template {
	id: string;
	name: string;
	description: string;
	category: string;
	rating: number;
	usageCount: number;
}

interface HistoryItem {
	id: string;
	action: string;
	description: string;
	timestamp: string;
	user: string;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ contractId, userId }) => {
	const [activeTab, setActiveTab] = useState<'suggestions' | 'structure' | 'templates' | 'history'>('suggestions');
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [structure, setStructure] = useState<StructureSection[]>([]);
	const [templates, setTemplates] = useState<Template[]>([]);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [loading, setLoading] = useState(false);

	const { editor } = useEditorStore();
	const { currentDraft, updateDraftData, setDirty } = useContractDraftStore();
	const currentType = (currentDraft?.contractData as { contractType?: string } | undefined)?.contractType || 'service';

	useEffect(() => {
		loadData();
	}, [activeTab]);

	const loadData = async () => {
		setLoading(true);
		try {
			// Simulate API calls
			await new Promise((resolve) => setTimeout(resolve, 500));

			switch (activeTab) {
				case 'suggestions':
					setSuggestions([
						{
							id: '1',
							title: 'Thêm phần mở đầu',
							description: 'Nên có phần giới thiệu về hợp đồng',
							type: 'structure',
							priority: 'high',
						},
						{
							id: '2',
							title: 'Bổ sung điều khoản bảo mật',
							description: 'Cần thêm điều khoản về bảo mật thông tin',
							type: 'legal',
							priority: 'medium',
						},
						{
							id: '3',
							title: 'Căn lề và giãn dòng chuẩn',
							description: 'Áp dụng căn lề đều (justify) và dòng 1.5',
							type: 'format',
							priority: 'low',
						},
					]);
					break;
				case 'structure':
					setStructure([
						{
							id: '1',
							title: 'Phần mở đầu',
							expanded: true,
							items: ['Tiêu đề hợp đồng', 'Thông tin các bên', 'Cơ sở pháp lý'],
						},
						{
							id: '2',
							title: 'Nội dung chính',
							expanded: false,
							items: ['Điều khoản dịch vụ', 'Quyền và nghĩa vụ', 'Điều khoản thanh toán'],
						},
						{
							id: '3',
							title: 'Phần kết thúc',
							expanded: false,
							items: ['Điều khoản thi hành', 'Chữ ký các bên', 'Phụ lục'],
						},
					]);
					break;
				case 'templates':
					setTemplates([
						{
							id: '1',
							name: 'Hợp đồng lao động chuẩn',
							description: 'Template cho hợp đồng lao động cơ bản',
							category: 'employment',
							rating: 4.5,
							usageCount: 1250,
						},
						{
							id: '2',
							name: 'Hợp đồng dịch vụ',
							description: 'Template cho hợp đồng cung cấp dịch vụ',
							category: 'service',
							rating: 4.2,
							usageCount: 890,
						},
						{
							id: '3',
							name: 'Hợp đồng thuê mướn',
							description: 'Template cho hợp đồng thuê tài sản',
							category: 'rental',
							rating: 4.0,
							usageCount: 567,
						},
					]);
					break;
				case 'history':
					setHistory([
						{
							id: '1',
							action: 'Tạo hợp đồng',
							description: 'Đã tạo hợp đồng mới',
							timestamp: '2024-01-15 10:30',
							user: 'Nguyễn Văn A',
						},
						{
							id: '2',
							action: 'Chỉnh sửa nội dung',
							description: 'Cập nhật điều khoản thanh toán',
							timestamp: '2024-01-15 11:45',
							user: 'Nguyễn Văn A',
						},
						{
							id: '3',
							action: 'Thêm collaborator',
							description: 'Đã thêm Nguyễn Thị B vào dự án',
							timestamp: '2024-01-15 14:20',
							user: 'Nguyễn Văn A',
						},
					]);
					break;
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setLoading(false);
		}
	};

	const applyStandardFormatting = () => {
		if (!editor) return;
		// Apply justify alignment and 1.5 line-height to whole document
		editor.chain().focus().selectAll().setTextAlign('justify').run();
		// Line-height is provided by custom extension
		// @ts-ignore custom command exists via LineHeightExtension
		editor.chain().focus().setLineHeight('1.5').run();
	};

	const insertSection = (title: string, placeholder?: string) => {
		if (!editor) return;
		const html = `<h2>${title}</h2><p>${placeholder || 'Nội dung ...'}</p>`;
		editor.chain().focus().insertContent(html).run();
		void updateDraftData('content_draft', {
			mode: 'editor',
			content: {
				mode: 'editor',
				editorContent: {
					content: editor.getHTML(),
					plainText: editor.getText(),
					metadata: {
						wordCount: editor.getText().trim().split(/\s+/).filter(Boolean).length,
						characterCount: editor.getText().length,
						lastEditedAt: new Date().toISOString(),
						version: (((currentDraft?.contractData as { content?: { editorContent?: { metadata?: { version?: number } } } })?.content?.editorContent?.metadata?.version) || 0) + 1,
					},
				},
			},
		});
		setDirty(true);
	};

	const insertStructureItem = (item: string) => {
		switch (item) {
			case 'Tiêu đề hợp đồng':
				insertSection('HỢP ĐỒNG ' + currentType.toUpperCase(), '');
				break;
			case 'Thông tin các bên':
				insertSection('Thông tin các bên', 'Bên A: ...\nBên B: ...');
				break;
			case 'Cơ sở pháp lý':
				insertSection('Cơ sở pháp lý', 'Căn cứ Bộ luật Dân sự ...');
				break;
			case 'Điều khoản dịch vụ':
				insertSection('Điều 1. Nội dung dịch vụ', 'Mô tả dịch vụ ...');
				break;
			case 'Quyền và nghĩa vụ':
				insertSection('Điều 2. Quyền và nghĩa vụ', 'Quyền và nghĩa vụ của các bên ...');
				break;
			case 'Điều khoản thanh toán':
				insertSection('Điều 3. Thanh toán', 'Giá trị, phương thức và tiến độ thanh toán ...');
				break;
			case 'Điều khoản thi hành':
				insertSection('Điều khoản thi hành', 'Hiệu lực, chấm dứt, sửa đổi bổ sung ...');
				break;
			case 'Chữ ký các bên':
				insertSection('Chữ ký', 'BÊN A: ....................   BÊN B: ....................');
				break;
			case 'Phụ lục':
				insertSection('Phụ lục', '...');
				break;
			default:
				insertSection(item, 'Nội dung ...');
		}
	};

	const buildTemplateSkeleton = (category: string): string => {
		const baseHeader = `<h1 style="text-align:center">HỢP ĐỒNG</h1>`;
		const parties = `<h2>Thông tin các bên</h2><p>Bên A: ...</p><p>Bên B: ...</p>`;
		switch (category) {
			case 'employment':
				return `${baseHeader}<h2>Chức danh và mô tả công việc</h2><p>...</p><h2>Thời hạn hợp đồng</h2><p>...</p>${parties}<h2>Tiền lương và phúc lợi</h2><p>...</p><h2>Kỷ luật và chấm dứt</h2><p>...</p><h2>Chữ ký</h2><p>Bên A ... Bên B ...</p>`;
			case 'service':
				return `${baseHeader}<h2>Phạm vi dịch vụ</h2><p>...</p><h2>Tiến độ thực hiện</h2><p>...</p>${parties}<h2>Thanh toán</h2><p>...</p><h2>Bảo mật</h2><p>...</p><h2>Chữ ký</h2><p>Bên A ... Bên B ...</p>`;
			case 'rental':
				return `${baseHeader}<h2>Tài sản thuê</h2><p>...</p><h2>Thời hạn thuê</h2><p>...</p>${parties}<h2>Giá thuê và đặt cọc</h2><p>...</p><h2>Bảo dưỡng và trách nhiệm</h2><p>...</p><h2>Chữ ký</h2><p>Bên A ... Bên B ...</p>`;
			default:
				return `${baseHeader}${parties}<h2>Điều khoản</h2><p>...</p><h2>Thanh toán</h2><p>...</p><h2>Chữ ký</h2><p>...</p>`;
		}
	};

	const handleSuggestionClick = (suggestion: Suggestion) => {
		if (!editor) return;
		switch (suggestion.type) {
			case 'structure':
				insertSection(suggestion.title);
				break;
			case 'legal':
				insertSection('Điều khoản bảo mật', 'Các bên cam kết giữ bí mật thông tin ...');
				break;
			case 'format':
				applyStandardFormatting();
				break;
			case 'content':
				insertSection(suggestion.title, suggestion.description);
				break;
			default:
				insertSection(suggestion.title);
		}
	};

	const toggleStructureSection = (sectionId: string) => {
		setStructure((prev) =>
			prev.map((section) => (section.id === sectionId ? { ...section, expanded: !section.expanded } : section)),
		);
	};

	const handleTemplateUse = (template: Template) => {
		if (!editor) return;
		const html = buildTemplateSkeleton(template.category || currentType);
		editor.chain().focus().setContent(html, false).run();
		void updateDraftData('content_draft', {
			mode: 'editor',
			content: {
				mode: 'editor',
				editorContent: {
					content: editor.getHTML(),
					plainText: editor.getText(),
					metadata: {
						wordCount: editor.getText().trim().split(/\s+/).filter(Boolean).length,
						characterCount: editor.getText().length,
						lastEditedAt: new Date().toISOString(),
						version: (((currentDraft?.contractData as { content?: { editorContent?: { metadata?: { version?: number } } } })?.content?.editorContent?.metadata?.version) || 0) + 1,
					},
				},
			},
		});
		setDirty(true);
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return '#e74c3c';
			case 'medium':
				return '#f39c12';
			case 'low':
				return '#27ae60';
			default:
				return '#6c757d';
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'structure':
				return faSitemap;
			case 'content':
				return faFileAlt;
			case 'legal':
				return faExclamationTriangle;
			case 'format':
				return faInfoCircle;
			default:
				return faLightbulb;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'structure':
				return '#3498db';
			case 'content':
				return '#27ae60';
			case 'legal':
				return '#e74c3c';
			case 'format':
				return '#f39c12';
			default:
				return '#6c757d';
		}
	};

	return (
		<div className={cx('sidebar-left')}>
			<div className={cx('tab-navigation')}>
				<button
					className={cx('tab-btn', { active: activeTab === 'suggestions' })}
					onClick={() => setActiveTab('suggestions')}
				>
					<FontAwesomeIcon icon={faLightbulb} />
					Gợi ý
				</button>
				<button
					className={cx('tab-btn', { active: activeTab === 'structure' })}
					onClick={() => setActiveTab('structure')}
				>
					<FontAwesomeIcon icon={faSitemap} />
					Cấu trúc
				</button>
				<button
					className={cx('tab-btn', { active: activeTab === 'templates' })}
					onClick={() => setActiveTab('templates')}
				>
					<FontAwesomeIcon icon={faFileAlt} />
					Template
				</button>
				<button
					className={cx('tab-btn', { active: activeTab === 'history' })}
					onClick={() => setActiveTab('history')}
				>
					<FontAwesomeIcon icon={faHistory} />
					Lịch sử
				</button>
			</div>

			<div className={cx('tab-content')}>
				<div className={cx('tab-header')}>
					<h3>
						{activeTab === 'suggestions' && <FontAwesomeIcon icon={faLightbulb} />}
						{activeTab === 'structure' && <FontAwesomeIcon icon={faSitemap} />}
						{activeTab === 'templates' && <FontAwesomeIcon icon={faFileAlt} />}
						{activeTab === 'history' && <FontAwesomeIcon icon={faHistory} />}
						{activeTab === 'suggestions' && 'Gợi ý thông minh'}
						{activeTab === 'structure' && 'Cấu trúc hợp đồng'}
						{activeTab === 'templates' && 'Template có sẵn'}
						{activeTab === 'history' && 'Lịch sử chỉnh sửa'}
					</h3>
					<button className={cx('refresh-btn')} onClick={loadData}>
						<FontAwesomeIcon icon={faRefresh} />
					</button>
				</div>

				{loading ? (
					<div className={cx('loading')}>Đang tải...</div>
				) : (
					<>
						{/* Suggestions Tab */}
						{activeTab === 'suggestions' && (
							<div className={cx('suggestions-tab')}>
								{suggestions.length > 0 ? (
									<div className={cx('suggestions-list')}>
										{suggestions.map((suggestion) => (
											<div
												key={suggestion.id}
												className={cx('suggestion-item')}
												onClick={() => handleSuggestionClick(suggestion)}
											>
												<div
													className={cx('suggestion-icon')}
													style={{
														backgroundColor: getTypeColor(suggestion.type) + '20',
														color: getTypeColor(suggestion.type),
													}}
												>
													<FontAwesomeIcon icon={getTypeIcon(suggestion.type)} />
												</div>
												<div className={cx('suggestion-content')}>
													<h4>{suggestion.title}</h4>
													<p>{suggestion.description}</p>
													<div
														style={{
															width: '8px',
															height: '8px',
															borderRadius: '50%',
															backgroundColor: getPriorityColor(suggestion.priority),
															marginTop: '4px',
														}}
													/>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className={cx('no-suggestions')}>
										<FontAwesomeIcon icon={faCheckCircle} />
										<p>Không có gợi ý nào</p>
										<small>Hệ thống sẽ phân tích và đưa ra gợi ý khi bạn soạn thảo</small>
									</div>
								)}

								<div className={cx('suggestions-tips')}>
									<h4>Mẹo sử dụng gợi ý</h4>
									<ul>
										<li>Gợi ý dựa trên nội dung bạn đang soạn thảo</li>
										<li>Click vào gợi ý để áp dụng tự động</li>
										<li>Hệ thống học từ cách bạn sử dụng</li>
									</ul>
								</div>
							</div>
						)}

						{/* Structure Tab */}
						{activeTab === 'structure' && (
							<div className={cx('structure-tab')}>
								<div className={cx('structure-list')}>
									{structure.map((section) => (
										<div key={section.id} className={cx('structure-section')}>
											<div
												className={cx('section-header')}
												onClick={() => toggleStructureSection(section.id)}
											>
												<FontAwesomeIcon icon={faSitemap} />
												<span>{section.title}</span>
												<FontAwesomeIcon
													icon={section.expanded ? faChevronDown : faChevronRight}
													className={cx('expand-icon')}
												/>
											</div>
											{section.expanded && (
												<div className={cx('section-items')}>
													{section.items.map((item, index) => (
														<div key={index} className={cx('structure-item')} onClick={() => insertStructureItem(item)}>
															<span className={cx('item-dot')}>•</span>
															{item}
														</div>
													))}
												</div>
											)}
										</div>
									))}
								</div>

								<div className={cx('structure-tips')}>
									<h4>Hướng dẫn cấu trúc</h4>
									<ul>
										<li>Tuân thủ cấu trúc chuẩn của hợp đồng</li>
										<li>Đảm bảo đầy đủ các phần bắt buộc</li>
										<li>Sắp xếp logic và dễ đọc</li>
									</ul>
									<button className={cx('refresh-btn')} onClick={applyStandardFormatting}>
										Áp dụng căn lề chuẩn
									</button>
								</div>
							</div>
						)}

						{/* Templates Tab */}
						{activeTab === 'templates' && (
							<div className={cx('templates-tab')}>
								<div className={cx('templates-list')}>
									{templates.map((template) => (
										<div key={template.id} className={cx('template-card')}>
											<div className={cx('template-header')}>
												<h4>{template.name}</h4>
												<div className={cx('template-meta')}>
													<span className={cx('rating')}>
														<FontAwesomeIcon icon={faStar} /> {template.rating}
													</span>
													<span className={cx('usage')}>{template.usageCount} lượt dùng</span>
												</div>
											</div>
											<p className={cx('template-description')}>{template.description}</p>
											<div className={cx('template-actions')}>
												<button className={cx('use-template-btn')} onClick={() => handleTemplateUse(template)}>
													Sử dụng template
												</button>
											</div>
										</div>
									))}
								</div>

								<div className={cx('templates-tips')}>
									<h4>Mẹo sử dụng template</h4>
									<ul>
										<li>Chọn template phù hợp với thể loại hợp đồng: {currentType}</li>
										<li>Có thể tùy chỉnh lại theo nhu cầu của bạn</li>
										<li>Lưu bản nháp thường xuyên để tránh mất dữ liệu</li>
									</ul>
								</div>
							</div>
						)}

						{/* History Tab */}
						{activeTab === 'history' && (
							<div className={cx('history-tab')}>
								<div className={cx('history-list')}>
									{history.map((item) => (
										<div key={item.id} className={cx('history-item')}>
											<div className={cx('history-icon')}>
												<FontAwesomeIcon icon={faHistory} />
											</div>
											<div className={cx('history-content')}>
												<h4>{item.action}</h4>
												<p>{item.description}</p>
												<small>{item.timestamp}</small>
												<span className={cx('history-user')}>{item.user}</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default SidebarLeft;
