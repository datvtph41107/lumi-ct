import React, { useState } from 'react';
import { 
  Type, 
  Hash, 
  FileText, 
  Table, 
  User, 
  Calendar, 
  DollarSign,
  FileSignature,
  SeparatorHorizontal,
  Link,
  Code,
  Image,
  List,
  Columns,
  Square,
  GripVertical,
  FileImage,
  Stamp,
  Paperclip,
  Eye,
  EyeOff,
  Repeat,
  Database,
  Settings,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Minus,
  FileCheck
} from 'lucide-react';
import { FieldDef } from '../store/fieldStore';
import { DraggableBlockItem } from './DraggableBlockItem';
import './BlockLibrary.scss';

interface BlockLibraryProps {
  fields: FieldDef[];
}

const BlockLibrary: React.FC<BlockLibraryProps> = ({
  fields,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('text');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 🔹 1. Kiểu văn bản & nội dung cơ bản
  const textBlocks = [
    {
      id: 'text',
      type: 'paragraph',
      label: 'Văn bản',
      icon: Type,
      attrs: { 
        style: 'normal',
        align: 'left'
      },
      description: 'Đoạn văn thường',
      category: 'text',
      usage: 'Nhập nội dung mô tả, điều khoản, thông tin tự do'
    },
    {
      id: 'heading-1',
      type: 'heading',
      label: 'Tiêu đề chính',
      icon: Bold,
      attrs: { 
        level: 1,
        style: 'bold',
        align: 'center'
      },
      description: 'Tiêu đề lớn (H1) - Ví dụ: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"',
      category: 'text',
      usage: 'Tiêu đề chính của hợp đồng'
    },
    {
      id: 'heading-2',
      type: 'heading',
      label: 'Tiêu đề phụ',
      icon: Hash,
      attrs: { 
        level: 2,
        style: 'bold',
        align: 'left'
      },
      description: 'Tiêu đề phụ (H2) - Ví dụ: "HỢP ĐỒNG KINH TẾ"',
      category: 'text',
      usage: 'Tiêu đề phụ, mục con'
    },
    {
      id: 'heading-3',
      type: 'heading',
      label: 'Tiêu đề nhỏ',
      icon: Hash,
      attrs: { 
        level: 3,
        style: 'bold',
        align: 'left'
      },
      description: 'Tiêu đề nhỏ (H3)',
      category: 'text',
      usage: 'Tiêu đề nhỏ, mục con'
    },
    {
      id: 'list-bullet',
      type: 'bulletList',
      label: 'Danh sách gạch đầu dòng',
      icon: List,
      attrs: { 
        listType: 'bullet',
        style: 'normal'
      },
      description: 'Danh sách với dấu gạch đầu dòng',
      category: 'text',
      usage: 'Dùng cho các điều khoản dạng gạch đầu dòng'
    },
    {
      id: 'list-numbered',
      type: 'orderedList',
      label: 'Danh sách số thứ tự',
      icon: List,
      attrs: { 
        listType: 'ordered',
        style: 'normal'
      },
      description: 'Danh sách với số thứ tự (1.1, 1.2...)',
      category: 'text',
      usage: 'Dùng cho các điều khoản dạng số thứ tự'
    },
    {
      id: 'paragraph-italic',
      type: 'paragraph',
      label: 'Văn bản in nghiêng',
      icon: Italic,
      attrs: { 
        style: 'italic',
        align: 'left'
      },
      description: 'Đoạn văn in nghiêng cho phần chú thích',
      category: 'text',
      usage: 'Chú thích, ghi chú'
    },
    {
      id: 'paragraph-bold',
      type: 'paragraph',
      label: 'Văn bản in đậm',
      icon: Bold,
      attrs: { 
        style: 'bold',
        align: 'left'
      },
      description: 'Đoạn văn in đậm cho điều khoản',
      category: 'text',
      usage: 'Điều khoản quan trọng, nhấn mạnh'
    }
  ];

  // 🔹 2. Kiểu dữ liệu động (Dynamic Field)
  const dynamicFields = [
    {
      id: 'variable-text',
      type: 'inlineField',
      label: 'Biến văn bản',
      icon: Type,
      attrs: { 
        type: 'text',
        placeholder: '{{company_name}}'
      },
      description: 'Ô chèn dữ liệu động - Ví dụ: {{company_name}}',
      category: 'dynamic',
      usage: 'Trộn dữ liệu khi sinh hợp đồng từ DB hoặc form'
    },
    {
      id: 'field-date',
      type: 'inlineField',
      label: 'Ngày tháng',
      icon: Calendar,
      attrs: { 
        type: 'date',
        format: 'dd/mm/yyyy',
        placeholder: '{{contract_date}}'
      },
      description: 'Trường ngày tháng có định dạng (dd/mm/yyyy, ngày ... tháng ... năm ...)',
      category: 'dynamic',
      usage: 'Ví dụ: "Ngày 06 tháng 10 năm 2018"'
    },
    {
      id: 'field-number',
      type: 'inlineField',
      label: 'Số',
      icon: Hash,
      attrs: { 
        type: 'number',
        placeholder: '{{contract_number}}'
      },
      description: 'Trường số - Sinh từ DB hoặc do người dùng nhập',
      category: 'dynamic',
      usage: 'Số hợp đồng, mã số, thứ tự'
    },
    {
      id: 'field-currency',
      type: 'inlineField',
      label: 'Tiền tệ',
      icon: DollarSign,
      attrs: { 
        type: 'money',
        currency: 'VND',
        placeholder: '{{total_amount}}'
      },
      description: 'Trường số hoặc tiền tệ có định dạng (1.000.000 VNĐ, USD)',
      category: 'dynamic',
      usage: 'Giá trị hợp đồng, phí, tổng tiền'
    },
    {
      id: 'field-signature',
      type: 'inlineField',
      label: 'Chữ ký',
      icon: FileSignature,
      attrs: { 
        type: 'signature',
        placeholder: '{{signature_field}}'
      },
      description: 'Trường chỗ ký (bên A, bên B)',
      category: 'dynamic',
      usage: 'Chữ ký các bên, đại diện theo pháp luật'
    },
    {
      id: 'field-textarea',
      type: 'blockField',
      label: 'Văn bản dài',
      icon: FileText,
      attrs: { 
        type: 'textarea',
        placeholder: '{{textarea_field}}'
      },
      description: 'Trường văn bản nhiều dòng',
      category: 'dynamic',
      usage: 'Mô tả chi tiết, điều khoản dài'
    }
  ];

  // 🔹 3. Kiểu bố cục (Layout Block)
  const layoutBlocks = [
    {
      id: 'section',
      type: 'section',
      label: 'Phần',
      icon: Square,
      attrs: { 
        title: 'Phần mới',
        collapsible: false
      },
      description: 'Khối chứa các block con',
      category: 'layout',
      usage: 'Sắp xếp cấu trúc hợp đồng, căn chỉnh lề chính xác'
    },
    {
      id: 'columns-2',
      type: 'columns',
      label: '2 cột',
      icon: Columns,
      attrs: { 
        columns: 2,
        gap: '20px'
      },
      description: 'Chia thành 2 cột (ví dụ: thông tin bên A trái, bên B phải)',
      category: 'layout',
      usage: 'Thông tin các bên, so sánh dữ liệu'
    },
    {
      id: 'columns-3',
      type: 'columns',
      label: '3 cột',
      icon: Columns,
      attrs: { 
        columns: 3,
        gap: '15px'
      },
      description: 'Chia thành 3 cột',
      category: 'layout',
      usage: 'Bảng thông tin, danh sách'
    },
    {
      id: 'spacer',
      type: 'spacer',
      label: 'Khoảng cách',
      icon: SeparatorHorizontal,
      attrs: { 
        height: '20px',
        type: 'space'
      },
      description: 'Block khoảng cách, giúp căn chỉnh vị trí chuẩn',
      category: 'layout',
      usage: 'Căn chỉnh khoảng cách giữa các phần'
    },
    {
      id: 'table-block',
      type: 'tableBlock',
      label: 'Bảng dữ liệu',
      icon: Table,
      attrs: { 
        title: 'Bảng dữ liệu',
        headers: ['STT', 'Tên', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'],
        rows: 3,
        cols: 6,
        autoNumbering: true,
        showTotal: true
      },
      description: 'Bảng (có thể merge ô, thêm dòng, căn chỉnh)',
      category: 'layout',
      usage: 'Bảng chi tiết thanh toán, lịch trình công việc'
    }
  ];

  // 🔹 4. Kiểu điều khoản (Contract Clause Block)
  const clauseBlocks = [
    {
      id: 'clause-title',
      type: 'clauseTitle',
      label: 'Tiêu đề điều khoản',
      icon: FileText,
      attrs: { 
        level: 1,
        autoNumber: true,
        style: 'bold'
      },
      description: 'Tiêu đề điều khoản (Điều 1, Điều 2...)',
      category: 'clause',
      usage: 'Tạo hợp đồng có cấu trúc rõ ràng, dễ lặp lại'
    },
    {
      id: 'clause-content',
      type: 'clauseBlock',
      label: 'Nội dung điều khoản',
      icon: FileText,
      attrs: { 
        title: 'Điều khoản mới',
        numbering: 'auto'
      },
      description: 'Nội dung điều khoản',
      category: 'clause',
      usage: 'Điều 1: Công việc theo hợp đồng, Điều 2: Giá trị hợp đồng...'
    },
    {
      id: 'repeatable-clause',
      type: 'repeatableClause',
      label: 'Điều khoản lặp lại',
      icon: Repeat,
      attrs: { 
        title: 'Điều khoản lặp lại',
        repeatable: true
      },
      description: 'Nhóm điều khoản có thể nhân bản thêm',
      category: 'clause',
      usage: 'Nhiều điều kiện thanh toán, nhiều phụ lục'
    }
  ];

  // 🔹 5. Kiểu đa phương tiện (ít dùng nhưng hữu ích)
  const mediaBlocks = [
    {
      id: 'image',
      type: 'image',
      label: 'Hình ảnh',
      icon: Image,
      attrs: { 
        src: '',
        alt: 'Hình ảnh',
        width: 'auto',
        height: 'auto'
      },
      description: 'Chèn hình ảnh',
      category: 'media',
      usage: 'Hình ảnh minh họa, biểu đồ'
    },
    {
      id: 'logo',
      type: 'logo',
      label: 'Logo công ty',
      icon: FileImage,
      attrs: { 
        src: '',
        alt: 'Logo',
        width: '150px',
        height: 'auto'
      },
      description: 'Chèn logo công ty',
      category: 'media',
      usage: 'Logo công ty ở header hợp đồng'
    },
    {
      id: 'stamp-seal',
      type: 'stampSeal',
      label: 'Con dấu',
      icon: Stamp,
      attrs: { 
        type: 'stamp',
        placeholder: 'Con dấu công ty'
      },
      description: 'Khối dành cho đóng dấu',
      category: 'media',
      usage: 'Đóng dấu công ty, con dấu chức năng'
    },
    {
      id: 'attachment',
      type: 'attachment',
      label: 'Tài liệu đính kèm',
      icon: Paperclip,
      attrs: { 
        title: 'Tài liệu đính kèm',
        description: 'Phụ lục, tài liệu liên quan'
      },
      description: 'Mục ghi chú "đính kèm phụ lục, tài liệu"',
      category: 'media',
      usage: 'Ghi chú tài liệu đính kèm, phụ lục'
    }
  ];

  // 🔹 6. Kiểu điều khiển hiển thị (UI Control)
  const controlBlocks = [
    {
      id: 'divider',
      type: 'divider',
      label: 'Đường kẻ phân cách',
      icon: Minus,
      attrs: { 
        type: 'line',
        style: 'solid',
        color: '#000'
      },
      description: 'Đường kẻ phân cách các phần',
      category: 'control',
      usage: 'Chia tách các phần trong hợp đồng'
    },
    {
      id: 'page-break',
      type: 'pageBreak',
      label: 'Ngắt trang',
      icon: SeparatorHorizontal,
      attrs: { 
        type: 'page'
      },
      description: 'Ngắt trang khi xuất PDF',
      category: 'control',
      usage: 'Tạo trang mới khi xuất PDF'
    },
    {
      id: 'conditional-block',
      type: 'conditionalBlock',
      label: 'Khối có điều kiện',
      icon: Eye,
      attrs: { 
        type: 'if',
        conditions: [],
        description: 'Hiển thị/ẩn theo điều kiện dữ liệu'
      },
      description: 'Hiển thị/ẩn theo điều kiện dữ liệu (ví dụ: chỉ hiển thị "Thưởng KPI" nếu có)',
      category: 'control',
      usage: 'Sinh hợp đồng động theo logic kinh doanh'
    }
  ];

  // 🔹 7. Kiểu nâng cao (cho template động)
  const advancedBlocks = [
    {
      id: 'repeatable-block',
      type: 'repeatableBlock',
      label: 'Khối lặp lại',
      icon: Repeat,
      attrs: { 
        title: 'Khối lặp lại',
        dataSource: '',
        template: []
      },
      description: 'Lặp lại một nhóm dữ liệu (ví dụ: danh sách nhân viên, danh sách sản phẩm)',
      category: 'advanced',
      usage: 'Dùng khi có nhiều hạng mục, danh sách sản phẩm, bảng giá, danh sách nhân sự'
    },
    {
      id: 'dynamic-table',
      type: 'dynamicTable',
      label: 'Bảng động',
      icon: Database,
      attrs: { 
        title: 'Bảng động',
        dataSource: '',
        columns: []
      },
      description: 'Bảng sinh động từ dữ liệu (ví dụ: bảng lương, bảng công việc)',
      category: 'advanced',
      usage: 'Bảng chi tiết thanh toán, lịch trình công việc'
    },
    {
      id: 'custom-html',
      type: 'customHtml',
      label: 'HTML tùy chỉnh',
      icon: Code,
      attrs: { 
        html: '',
        css: ''
      },
      description: 'Khối custom (JS/Markdown/HTML) dành cho logic phức tạp',
      category: 'advanced',
      usage: 'Logic phức tạp, tính toán tự động'
    },
    {
      id: 'placeholder',
      type: 'placeholder',
      label: 'Khối trống chờ nhập',
      icon: FileCheck,
      attrs: { 
        placeholder: 'Chờ nhập thủ công',
        type: 'manual'
      },
      description: 'Cho phép soạn sẵn mẫu nhưng để trống vài trường để người dùng điền thủ công khi in hợp đồng',
      category: 'advanced',
      usage: 'Để trống vài trường để người dùng điền thủ công khi in'
    }
  ];

  const categories = [
    { id: 'text', label: 'Văn bản', icon: Type, color: '#007bff', description: 'Text, Heading, List' },
    { id: 'dynamic', label: 'Dữ liệu động', icon: Database, color: '#28a745', description: 'Variable, Date, Currency, Signature' },
    { id: 'layout', label: 'Bố cục', icon: Columns, color: '#ffc107', description: 'Section, Columns, Table, Spacer' },
    { id: 'clause', label: 'Điều khoản', icon: FileText, color: '#dc3545', description: 'Clause Title, Content, Repeatable' },
    { id: 'media', label: 'Đa phương tiện', icon: Image, color: '#6f42c1', description: 'Logo, Image, Stamp, Attachment' },
    { id: 'control', label: 'Hiển thị', icon: Eye, color: '#fd7e14', description: 'Divider, Page Break, Conditional' },
    { id: 'advanced', label: 'Nâng cao', icon: Settings, color: '#20c997', description: 'Repeatable, Dynamic Table, Custom HTML' }
  ];

  const getBlocksByCategory = (category: string) => {
    switch (category) {
      case 'text': return textBlocks;
      case 'dynamic': return dynamicFields;
      case 'layout': return layoutBlocks;
      case 'clause': return clauseBlocks;
      case 'media': return mediaBlocks;
      case 'control': return controlBlocks;
      case 'advanced': return advancedBlocks;
      default: return [];
    }
  };

  const allBlocks = [
    ...textBlocks,
    ...dynamicFields,
    ...layoutBlocks,
    ...clauseBlocks,
    ...mediaBlocks,
    ...controlBlocks,
    ...advancedBlocks
  ];

  const filteredBlocks = allBlocks.filter(block => {
    const matchesCategory = activeCategory === 'all' || block.category === activeCategory;
    const matchesSearch = block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         block.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         block.usage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="block-library">
      <div className="block-library__header">
        <h4 className="block-library__title">Thư viện Blocks</h4>
        <p className="block-library__subtitle">Kéo thả để xây hợp đồng</p>
      </div>

      <div className="block-library__search">
        <input
          type="text"
          placeholder="Tìm kiếm blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block-library__search-input"
        />
      </div>

      <div className="block-library__categories">
        <button
          className={`block-library__category ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          <GripVertical size={16} />
          Tất cả
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`block-library__category ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
            style={{ '--category-color': category.color } as React.CSSProperties}
            title={category.description}
          >
            <category.icon size={16} />
            {category.label}
          </button>
        ))}
      </div>

      <div className="block-library__content">
        {filteredBlocks.length === 0 ? (
          <div className="block-library__empty">
            <FileText size={48} />
            <p>Không tìm thấy block phù hợp</p>
          </div>
        ) : (
          <div className="block-library__items">
            {filteredBlocks.map((block) => (
              <DraggableBlockItem
                key={block.id}
                id={block.id}
                data={{
                  source: 'sidebar',
                  type: block.type,
                  attrs: block.attrs,
                }}
                className={`block-library__item block-library__item--${block.category}`}
              >
                <div className="block-library__item-icon">
                  <block.icon size={16} />
                </div>
                <div className="block-library__item-content">
                  <div className="block-library__item-label">{block.label}</div>
                  <div className="block-library__item-description">{block.description}</div>
                  <div className="block-library__item-usage">{block.usage}</div>
                </div>
                <div className="block-library__item-category">
                  {categories.find(cat => cat.id === block.category)?.label}
                </div>
              </DraggableBlockItem>
            ))}
          </div>
        )}
      </div>

      <div className="block-library__footer">
        <div className="block-library__stats">
          <span>{filteredBlocks.length} blocks</span>
          {activeCategory !== 'all' && (
            <span className="block-library__category-name">
              trong {categories.find(cat => cat.id === activeCategory)?.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockLibrary;