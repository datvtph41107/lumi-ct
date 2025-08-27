import React, { useState } from 'react';
import { 
  FileText, 
  Building, 
  DollarSign, 
  Calendar, 
  User, 
  MapPin,
  FileSignature,
  Settings,
  Copy,
  Plus,
  Table
} from 'lucide-react';
import { DraggableBlockItem } from './DraggableBlockItem';
import './BlockTemplates.scss';

interface BlockTemplate {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'contract' | 'party' | 'financial' | 'legal' | 'custom';
  blocks: TemplateBlock[];
  usage: string;
  tags: string[];
}

interface TemplateBlock {
  type: string;
  attrs: any;
  content?: string;
}

const BlockTemplates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const templates: BlockTemplate[] = [
    // Contract Templates
    {
      id: 'contract-header',
      title: 'Header Hợp Đồng',
      description: 'Tiêu đề và thông tin cơ bản hợp đồng',
      icon: FileText,
      category: 'contract',
      usage: 'Sử dụng ở đầu mọi hợp đồng',
      tags: ['header', 'title', 'basic'],
      blocks: [
        { type: 'heading', attrs: { level: 1 }, content: 'HỢP ĐỒNG' },
        { type: 'inlineField', attrs: { fieldKey: 'contract_number', label: 'Số hợp đồng' } },
        { type: 'inlineField', attrs: { fieldKey: 'contract_date', label: 'Ngày ký' } },
        { type: 'inlineField', attrs: { fieldKey: 'contract_type', label: 'Loại hợp đồng' } }
      ]
    },

    {
      id: 'contract-parties',
      title: 'Thông Tin Các Bên',
      description: 'Thông tin chi tiết về các bên tham gia',
      icon: Building,
      category: 'party',
      usage: 'Sau header, mô tả các bên tham gia',
      tags: ['party', 'company', 'information'],
      blocks: [
        { type: 'heading', attrs: { level: 2 }, content: 'THÔNG TIN CÁC BÊN' },
        { type: 'heading', attrs: { level: 3 }, content: 'BÊN A (BÊN CUNG CẤP)' },
        { type: 'inlineField', attrs: { fieldKey: 'company_a_name', label: 'Tên công ty A' } },
        { type: 'inlineField', attrs: { fieldKey: 'company_a_address', label: 'Địa chỉ' } },
        { type: 'inlineField', attrs: { fieldKey: 'company_a_tax_code', label: 'Mã số thuế' } },
        { type: 'inlineField', attrs: { fieldKey: 'company_a_representative', label: 'Người đại diện' } },
        { type: 'heading', attrs: { level: 3 }, content: 'BÊN B (BÊN SỬ DỤNG)' },
        { type: 'inlineField', attrs: { fieldKey: 'company_b_name', label: 'Tên công ty B' } },
        { type: 'inlineField', attrs: { fieldKey: 'company_b_address', label: 'Địa chỉ' } },
        { type: 'inlineField', attrs: { fieldKey: 'company_b_tax_code', label: 'Mã số thuế' } },
        { type: 'inlineField', attrs: { fieldKey: 'company_b_representative', label: 'Người đại diện' } }
      ]
    },

    {
      id: 'contract-object',
      title: 'Đối Tượng Hợp Đồng',
      description: 'Mô tả đối tượng và phạm vi hợp đồng',
      icon: Settings,
      category: 'contract',
      usage: 'Mô tả rõ đối tượng hợp đồng',
      tags: ['object', 'scope', 'description'],
      blocks: [
        { type: 'heading', attrs: { level: 2 }, content: 'ĐỐI TƯỢNG HỢP ĐỒNG' },
        { type: 'clauseBlock', attrs: { title: 'Đối tượng hợp đồng' } },
        { type: 'blockField', attrs: { fieldKey: 'contract_object', label: 'Mô tả đối tượng', type: 'textarea' } },
        { type: 'clauseBlock', attrs: { title: 'Phạm vi thực hiện' } },
        { type: 'blockField', attrs: { fieldKey: 'contract_scope', label: 'Phạm vi', type: 'textarea' } }
      ]
    },

    {
      id: 'financial-terms',
      title: 'Điều Khoản Tài Chính',
      description: 'Các điều khoản về giá cả và thanh toán',
      icon: DollarSign,
      category: 'financial',
      usage: 'Quy định về giá và phương thức thanh toán',
      tags: ['financial', 'payment', 'price'],
      blocks: [
        { type: 'heading', attrs: { level: 2 }, content: 'ĐIỀU KHOẢN TÀI CHÍNH' },
        { type: 'clauseBlock', attrs: { title: 'Giá trị hợp đồng' } },
        { type: 'inlineField', attrs: { fieldKey: 'total_amount', label: 'Tổng giá trị', type: 'money' } },
        { type: 'clauseBlock', attrs: { title: 'Phương thức thanh toán' } },
        { type: 'blockField', attrs: { fieldKey: 'payment_terms', label: 'Điều khoản thanh toán', type: 'textarea' } },
        { type: 'clauseBlock', attrs: { title: 'Thời hạn thanh toán' } },
        { type: 'inlineField', attrs: { fieldKey: 'payment_deadline', label: 'Thời hạn', type: 'date' } }
      ]
    },

    {
      id: 'service-table',
      title: 'Bảng Dịch Vụ',
      description: 'Bảng liệt kê các dịch vụ và giá cả',
      icon: Table,
      category: 'financial',
      usage: 'Liệt kê chi tiết dịch vụ và giá',
      tags: ['table', 'service', 'price'],
      blocks: [
        { 
          type: 'tableBlock', 
          attrs: { 
            title: 'Bảng giá dịch vụ',
            headers: ['STT', 'Tên dịch vụ', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'],
            rows: 5,
            cols: 6,
            autoNumbering: true,
            showTotal: true
          } 
        }
      ]
    },

    {
      id: 'legal-clauses',
      title: 'Điều Khoản Pháp Lý',
      description: 'Các điều khoản pháp lý cơ bản',
      icon: FileText,
      category: 'legal',
      usage: 'Điều khoản pháp lý chuẩn',
      tags: ['legal', 'clauses', 'standard'],
      blocks: [
        { type: 'heading', attrs: { level: 2 }, content: 'ĐIỀU KHOẢN PHÁP LÝ' },
        { type: 'clauseBlock', attrs: { title: 'Thời hạn hợp đồng' } },
        { type: 'inlineField', attrs: { fieldKey: 'contract_duration', label: 'Thời hạn', type: 'text' } },
        { type: 'clauseBlock', attrs: { title: 'Điều khoản chấm dứt' } },
        { type: 'blockField', attrs: { fieldKey: 'termination_terms', label: 'Điều khoản chấm dứt', type: 'textarea' } },
        { type: 'clauseBlock', attrs: { title: 'Giải quyết tranh chấp' } },
        { type: 'blockField', attrs: { fieldKey: 'dispute_resolution', label: 'Giải quyết tranh chấp', type: 'textarea' } }
      ]
    },

    {
      id: 'signature-section',
      title: 'Phần Chữ Ký',
      description: 'Khối chữ ký cho các bên tham gia',
      icon: FileSignature,
      category: 'contract',
      usage: 'Cuối hợp đồng, phần chữ ký',
      tags: ['signature', 'parties', 'end'],
      blocks: [
        { type: 'heading', attrs: { level: 2 }, content: 'CHỮ KÝ CÁC BÊN' },
        { type: 'signatureBlock', attrs: { parties: ['A', 'B'] } }
      ]
    },

    {
      id: 'conditional-service',
      title: 'Điều Khoản Có Điều Kiện',
      description: 'Điều khoản chỉ hiển thị khi có điều kiện',
      icon: Settings,
      category: 'custom',
      usage: 'Điều khoản tùy chọn theo loại hợp đồng',
      tags: ['conditional', 'optional', 'dynamic'],
      blocks: [
        { 
          type: 'conditionalBlock', 
          attrs: { 
            type: 'if',
            conditions: [
              { fieldKey: 'contract_type', operator: 'equals', value: 'service' }
            ],
            description: 'Chỉ hiển thị cho hợp đồng dịch vụ'
          } 
        },
        { type: 'clauseBlock', attrs: { title: 'Điều khoản dịch vụ đặc biệt' } },
        { type: 'blockField', attrs: { fieldKey: 'special_service_terms', label: 'Điều khoản đặc biệt', type: 'textarea' } }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'Tất cả', icon: FileText },
    { id: 'contract', label: 'Hợp đồng', icon: FileText },
    { id: 'party', label: 'Các bên', icon: Building },
    { id: 'financial', label: 'Tài chính', icon: DollarSign },
    { id: 'legal', label: 'Pháp lý', icon: FileText },
    { id: 'custom', label: 'Tùy chỉnh', icon: Settings }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTemplateUse = (template: BlockTemplate) => {
    // Logic để sử dụng template
    console.log('Using template:', template);
  };

  const handleTemplateDuplicate = (template: BlockTemplate) => {
    // Logic để duplicate template
    console.log('Duplicating template:', template);
  };

  return (
    <div className="block-templates">
      <div className="block-templates__header">
        <h4 className="block-templates__title">Block Templates</h4>
        <p className="block-templates__subtitle">Templates có sẵn để tạo nhanh</p>
      </div>

      <div className="block-templates__search">
        <input
          type="text"
          placeholder="Tìm kiếm templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block-templates__search-input"
        />
      </div>

      <div className="block-templates__categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`block-templates__category ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <category.icon size={16} />
            {category.label}
          </button>
        ))}
      </div>

      <div className="block-templates__content">
        {filteredTemplates.length === 0 ? (
          <div className="block-templates__empty">
            <FileText size={48} />
            <p>Không tìm thấy template phù hợp</p>
          </div>
        ) : (
          <div className="block-templates__list">
            {filteredTemplates.map(template => (
              <div key={template.id} className="block-templates__item">
                <div className="block-templates__item-header">
                  <div className="block-templates__item-icon">
                    <template.icon size={20} />
                  </div>
                  <div className="block-templates__item-info">
                    <h5 className="block-templates__item-title">{template.title}</h5>
                    <p className="block-templates__item-description">{template.description}</p>
                  </div>
                </div>

                <div className="block-templates__item-tags">
                  {template.tags.map(tag => (
                    <span key={tag} className="block-templates__tag">{tag}</span>
                  ))}
                </div>

                <div className="block-templates__item-usage">
                  <p><strong>Sử dụng:</strong> {template.usage}</p>
                </div>

                <div className="block-templates__item-actions">
                  <button
                    className="block-templates__action-btn block-templates__action-btn--primary"
                    onClick={() => handleTemplateUse(template)}
                    title="Sử dụng template"
                  >
                    <Plus size={16} />
                    Sử dụng
                  </button>
                  <button
                    className="block-templates__action-btn"
                    onClick={() => handleTemplateDuplicate(template)}
                    title="Nhân bản template"
                  >
                    <Copy size={16} />
                    Nhân bản
                  </button>
                </div>

                <div className="block-templates__item-preview">
                  <h6>Preview:</h6>
                  <div className="block-templates__preview-content">
                    {template.blocks.slice(0, 3).map((block, index) => (
                      <div key={index} className="block-templates__preview-block">
                        <span className="block-templates__preview-type">{block.type}</span>
                        {block.content && (
                          <span className="block-templates__preview-text">{block.content}</span>
                        )}
                      </div>
                    ))}
                    {template.blocks.length > 3 && (
                      <span className="block-templates__preview-more">+{template.blocks.length - 3} blocks</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockTemplates;