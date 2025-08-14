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
    faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import styles from './SidebarLeft.module.scss';
import classNames from 'classnames/bind';

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

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Simulate API calls
            await new Promise(resolve => setTimeout(resolve, 500));
            
            switch (activeTab) {
                case 'suggestions':
                    setSuggestions([
                        {
                            id: '1',
                            title: 'Thêm phần mở đầu',
                            description: 'Nên có phần giới thiệu về hợp đồng',
                            type: 'structure',
                            priority: 'high'
                        },
                        {
                            id: '2',
                            title: 'Bổ sung điều khoản bảo mật',
                            description: 'Cần thêm điều khoản về bảo mật thông tin',
                            type: 'legal',
                            priority: 'medium'
                        },
                        {
                            id: '3',
                            title: 'Định dạng lại bảng',
                            description: 'Bảng thông tin cần được định dạng rõ ràng hơn',
                            type: 'format',
                            priority: 'low'
                        }
                    ]);
                    break;
                case 'structure':
                    setStructure([
                        {
                            id: '1',
                            title: 'Phần mở đầu',
                            expanded: true,
                            items: ['Tiêu đề hợp đồng', 'Thông tin các bên', 'Cơ sở pháp lý']
                        },
                        {
                            id: '2',
                            title: 'Nội dung chính',
                            expanded: false,
                            items: ['Điều khoản chung', 'Quyền và nghĩa vụ', 'Điều khoản thanh toán']
                        },
                        {
                            id: '3',
                            title: 'Phần kết thúc',
                            expanded: false,
                            items: ['Điều khoản thi hành', 'Chữ ký các bên', 'Phụ lục']
                        }
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
                            usageCount: 1250
                        },
                        {
                            id: '2',
                            name: 'Hợp đồng dịch vụ',
                            description: 'Template cho hợp đồng cung cấp dịch vụ',
                            category: 'service',
                            rating: 4.2,
                            usageCount: 890
                        },
                        {
                            id: '3',
                            name: 'Hợp đồng thuê mướn',
                            description: 'Template cho hợp đồng thuê tài sản',
                            category: 'rental',
                            rating: 4.0,
                            usageCount: 567
                        }
                    ]);
                    break;
                case 'history':
                    setHistory([
                        {
                            id: '1',
                            action: 'Tạo hợp đồng',
                            description: 'Đã tạo hợp đồng mới',
                            timestamp: '2024-01-15 10:30',
                            user: 'Nguyễn Văn A'
                        },
                        {
                            id: '2',
                            action: 'Chỉnh sửa nội dung',
                            description: 'Cập nhật điều khoản thanh toán',
                            timestamp: '2024-01-15 11:45',
                            user: 'Nguyễn Văn A'
                        },
                        {
                            id: '3',
                            action: 'Thêm collaborator',
                            description: 'Đã thêm Nguyễn Thị B vào dự án',
                            timestamp: '2024-01-15 14:20',
                            user: 'Nguyễn Văn A'
                        }
                    ]);
                    break;
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        // Handle suggestion click
        console.log('Suggestion clicked:', suggestion);
    };

    const toggleStructureSection = (sectionId: string) => {
        setStructure(prev => prev.map(section => 
            section.id === sectionId 
                ? { ...section, expanded: !section.expanded }
                : section
        ));
    };

    const handleTemplateUse = (template: Template) => {
        // Handle template use
        console.log('Template used:', template);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#e74c3c';
            case 'medium': return '#f39c12';
            case 'low': return '#27ae60';
            default: return '#6c757d';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'structure': return faSitemap;
            case 'content': return faFileAlt;
            case 'legal': return faExclamationTriangle;
            case 'format': return faInfoCircle;
            default: return faLightbulb;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'structure': return '#3498db';
            case 'content': return '#27ae60';
            case 'legal': return '#e74c3c';
            case 'format': return '#f39c12';
            default: return '#6c757d';
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
                                                    style={{ backgroundColor: getTypeColor(suggestion.type) + '20', color: getTypeColor(suggestion.type) }}
                                                >
                                                    <FontAwesomeIcon icon={getTypeIcon(suggestion.type)} />
                                                </div>
                                                <div className={cx('suggestion-content')}>
                                                    <h4>{suggestion.title}</h4>
                                                    <p>{suggestion.description}</p>
                                                    <div style={{ 
                                                        width: '8px', 
                                                        height: '8px', 
                                                        borderRadius: '50%', 
                                                        backgroundColor: getPriorityColor(suggestion.priority),
                                                        marginTop: '4px'
                                                    }} />
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
                                                        <div key={index} className={cx('structure-item')}>
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
                                </div>
                            </div>
                        )}

                        {/* Templates Tab */}
                        {activeTab === 'templates' && (
                            <div className={cx('templates-tab')}>
                                <div className={cx('templates-list')}>
                                    {templates.map((template) => (
                                        <div key={template.id} className={cx('template-item')}>
                                            <div className={cx('template-header')}>
                                                <h4>{template.name}</h4>
                                                <div className={cx('template-rating')}>
                                                    <FontAwesomeIcon icon={faStar} />
                                                    {template.rating}
                                                </div>
                                            </div>
                                            <div className={cx('template-description')}>
                                                {template.description}
                                            </div>
                                            <div className={cx('template-stats')}>
                                                {template.usageCount} lượt sử dụng
                                            </div>
                                            <button
                                                className={cx('use-template-btn')}
                                                onClick={() => handleTemplateUse(template)}
                                            >
                                                Sử dụng template này
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className={cx('template-tips')}>
                                    <h4>Về template</h4>
                                    <ul>
                                        <li>Template được tạo bởi chuyên gia pháp lý</li>
                                        <li>Có thể tùy chỉnh theo nhu cầu</li>
                                        <li>Đảm bảo tuân thủ quy định pháp luật</li>
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
                                            <div 
                                                className={cx('history-icon')}
                                                style={{ backgroundColor: '#3498db20', color: '#3498db' }}
                                            >
                                                <FontAwesomeIcon icon={faHistory} />
                                            </div>
                                            <div className={cx('history-content')}>
                                                <p>
                                                    <strong>{item.action}</strong>: {item.description}
                                                </p>
                                                <small>{item.timestamp} - {item.user}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={cx('history-tips')}>
                                    <h4>Về lịch sử</h4>
                                    <ul>
                                        <li>Ghi lại mọi thay đổi trong hợp đồng</li>
                                        <li>Dễ dàng theo dõi và khôi phục</li>
                                        <li>Đảm bảo tính minh bạch</li>
                                    </ul>
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
