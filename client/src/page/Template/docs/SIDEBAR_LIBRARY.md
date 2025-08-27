# Thư Viện Sidebar - Template Editor

## 🎯 **Tổng quan**

Thư viện sidebar là **trung tâm điều khiển** của Template Editor, cung cấp tất cả các công cụ và tài nguyên cần thiết để xây dựng template hợp đồng. Sidebar được chia thành 3 tab chính, mỗi tab có chức năng riêng biệt và tương tác trực tiếp với editor.

## 📋 **Cấu trúc Sidebar**

```
Sidebar
├── Header (Template Editor)
├── Tabs Navigation
│   ├── Blocks (📄) - Thư viện blocks
│   ├── Fields (⚙️) - Quản lý fields
│   └── Layout (📊) - Cấu trúc tài liệu
└── Content Area (thay đổi theo tab)
```

## 🧱 **1. Tab BLOCKS - Thư Viện Blocks**

### **Mục đích:**
Cung cấp tất cả các loại blocks có thể sử dụng để xây dựng template, từ cơ bản đến nâng cao.

### **Cấu trúc Blocks:**

#### **A. Basic Blocks (Blocks Cơ Bản)**
```typescript
// 1. Heading Blocks
{
  id: 'heading-1',
  type: 'heading',
  label: 'Tiêu đề',
  icon: Type,
  attrs: { level: 1 },
  description: 'Tiêu đề chính',
  usage: 'Tạo tiêu đề chính cho tài liệu'
}

{
  id: 'heading-2', 
  type: 'heading',
  label: 'Tiêu đề phụ',
  icon: Hash,
  attrs: { level: 2 },
  description: 'Tiêu đề phụ',
  usage: 'Tạo tiêu đề phụ, mục con'
}

// 2. Content Blocks
{
  id: 'clause-block',
  type: 'clauseBlock',
  label: 'Điều khoản',
  icon: FileText,
  attrs: { title: 'Điều khoản mới' },
  description: 'Khối điều khoản',
  usage: 'Tạo điều khoản hợp đồng với auto-numbering'
}

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
    showTotal: false
  },
  description: 'Bảng với tính năng nâng cao',
  usage: 'Tạo bảng giá, danh mục hàng hóa/dịch vụ'
}

// 3. Control Blocks
{
  id: 'conditional-block',
  type: 'conditionalBlock',
  label: 'Điều kiện',
  icon: Code,
  attrs: { 
    type: 'if',
    conditions: [],
    description: 'Điều kiện hiển thị'
  },
  description: 'Block có điều kiện',
  usage: 'Hiển thị/ẩn nội dung theo điều kiện'
}

{
  id: 'signature-block',
  type: 'signatureBlock',
  label: 'Chữ ký',
  icon: FileSignature,
  attrs: { parties: ['A', 'B'] },
  description: 'Khối chữ ký',
  usage: 'Tạo khối chữ ký cho các bên'
}

{
  id: 'page-break',
  type: 'pageBreak',
  label: 'Ngắt trang',
  icon: SeparatorHorizontal,
  attrs: { type: 'page' },
  description: 'Ngắt trang mới',
  usage: 'Tạo trang mới trong tài liệu'
}
```

#### **B. Field Types (Các Loại Trường)**
```typescript
// 1. Inline Fields (Trường nội tuyến)
{
  id: 'field-text',
  type: 'inlineField',
  label: 'Văn bản',
  icon: Type,
  attrs: { type: 'text' },
  description: 'Trường văn bản',
  usage: 'Nhập tên công ty, địa chỉ, mô tả ngắn'
}

{
  id: 'field-number',
  type: 'inlineField',
  label: 'Số',
  icon: Hash,
  attrs: { type: 'number' },
  description: 'Trường số',
  usage: 'Nhập số lượng, mã số, thứ tự'
}

{
  id: 'field-money',
  type: 'inlineField',
  label: 'Tiền tệ',
  icon: DollarSign,
  attrs: { type: 'money' },
  description: 'Trường tiền tệ',
  usage: 'Nhập giá trị tiền, phí, tổng tiền'
}

{
  id: 'field-date',
  type: 'inlineField',
  label: 'Ngày tháng',
  icon: Calendar,
  attrs: { type: 'date' },
  description: 'Trường ngày tháng',
  usage: 'Nhập ngày ký, ngày hiệu lực, thời hạn'
}

// 2. Block Fields (Trường khối)
{
  id: 'field-textarea',
  type: 'blockField',
  label: 'Văn bản dài',
  icon: FileText,
  attrs: { type: 'textarea' },
  description: 'Trường văn bản nhiều dòng',
  usage: 'Nhập mô tả chi tiết, điều khoản dài'
}
```

#### **C. Advanced Blocks (Blocks Nâng Cao)**
```typescript
{
  id: 'cross-reference',
  type: 'crossReference',
  label: 'Tham chiếu',
  icon: Link,
  attrs: { 
    targetType: 'clause',
    text: 'Điều khoản'
  },
  description: 'Tham chiếu chéo',
  usage: 'Tạo link tham chiếu đến điều khoản khác'
}
```

### **Cách sử dụng Blocks:**

#### **1. Drag & Drop**
```typescript
// User kéo block từ sidebar
userDragsBlock() {
  // 1. Kéo block từ BlockLibrary
  // 2. Thả vào CanvasDropZone
  // 3. Block được tạo trong editor
  // 4. Auto-insert vào document tree
}

// Ví dụ: Kéo "Điều khoản"
dragClauseBlock() {
  // Tạo clauseBlock mới
  editor.commands.setClauseBlock({
    title: 'Điều khoản mới',
    numbering: 'auto' // Tự động đánh số
  });
}
```

#### **2. Block Configuration**
```typescript
// Sau khi thả block, user có thể cấu hình
configureBlock() {
  // Mở Properties Panel
  // Cấu hình attributes
  // Preview real-time
}
```

## 🎯 **2. Tab FIELDS - Quản Lý Fields**

### **Mục đích:**
Quản lý tất cả các trường dữ liệu (fields) được sử dụng trong template, bao gồm định nghĩa, validation, và binding.

### **Cấu trúc Field Management:**

#### **A. Field Registry (Đăng ký Fields)**
```typescript
interface FieldDefinition {
  id: string;
  key: string;           // company_name, contract_number
  label: string;         // 'Tên công ty', 'Số hợp đồng'
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;    // Bắt buộc hay không
  default?: any;         // Giá trị mặc định
  validation?: FieldValidation;
  options?: FieldOption[]; // Cho select fields
  placeholder?: string;  // Placeholder text
  description?: string;  // Mô tả field
}
```

#### **B. Field Categories (Phân Loại Fields)**
```typescript
// 1. Contract Information (Thông tin hợp đồng)
const contractFields = [
  {
    key: 'contract_number',
    label: 'Số hợp đồng',
    type: 'text',
    required: true,
    validation: { pattern: '^HD-[0-9]{6}$' }
  },
  {
    key: 'contract_date',
    label: 'Ngày ký hợp đồng',
    type: 'date',
    required: true
  },
  {
    key: 'contract_type',
    label: 'Loại hợp đồng',
    type: 'select',
    options: [
      { value: 'service', label: 'Dịch vụ' },
      { value: 'purchase', label: 'Mua bán' },
      { value: 'rental', label: 'Thuê mướn' }
    ]
  }
];

// 2. Party Information (Thông tin các bên)
const partyFields = [
  {
    key: 'company_a_name',
    label: 'Tên công ty A',
    type: 'text',
    required: true
  },
  {
    key: 'company_a_address',
    label: 'Địa chỉ công ty A',
    type: 'textarea'
  },
  {
    key: 'company_a_tax_code',
    label: 'Mã số thuế A',
    type: 'text',
    validation: { pattern: '^[0-9]{10,13}$' }
  }
];

// 3. Financial Information (Thông tin tài chính)
const financialFields = [
  {
    key: 'total_amount',
    label: 'Tổng giá trị',
    type: 'money',
    required: true,
    validation: { min: 0 }
  },
  {
    key: 'payment_terms',
    label: 'Điều khoản thanh toán',
    type: 'textarea'
  }
];
```

#### **C. Field Operations (Thao Tác Fields)**
```typescript
// 1. Add Field
addField(field: FieldDefinition) {
  // Thêm field mới vào registry
  fieldManager.registerField(field);
  // Cập nhật UI
  updateFieldList();
}

// 2. Update Field
updateField(key: string, updates: Partial<FieldDefinition>) {
  // Cập nhật field definition
  fieldManager.updateField(key, updates);
  // Re-validate tất cả instances
  revalidateFieldInstances(key);
}

// 3. Delete Field
deleteField(key: string) {
  // Kiểm tra xem field có đang được sử dụng không
  if (isFieldInUse(key)) {
    showWarning('Field đang được sử dụng');
    return;
  }
  // Xóa field
  fieldManager.removeField(key);
}
```

### **Field Binding & Usage:**
```typescript
// 1. Field được sử dụng trong blocks
useFieldInBlock() {
  // User kéo field từ sidebar vào block
  // Field được bind với block
  // Tạo placeholder: {{company_name}}
  // Auto-update khi field value thay đổi
}

// 2. Global Field Binding
globalFieldBinding() {
  // Một field có thể được sử dụng ở nhiều nơi
  // Khi update field value → tất cả instances auto-update
  // Ví dụ: company_name xuất hiện ở 5 chỗ → update 1 lần
}
```

## 📊 **3. Tab LAYOUT - Cấu Trúc Tài Liệu**

### **Mục đích:**
Hiển thị và quản lý cấu trúc phân cấp của tài liệu, cho phép user xem tổng quan và thao tác với layout.

### **Cấu trúc Layout:**

#### **A. Document Tree View (Xem Cây Tài Liệu)**
```typescript
interface LayoutNode {
  id: string;
  type: 'heading' | 'clause' | 'table' | 'field' | 'conditional';
  title: string;
  level: number;
  numbering?: string;    // "1", "1.1", "2.3"
  visible: boolean;      // Hiển thị/ẩn
  children: LayoutNode[];
  metadata: {
    wordCount: number;
    fieldCount: number;
    lastModified: Date;
  };
}
```

#### **B. Layout Operations (Thao Tác Layout)**
```typescript
// 1. Expand/Collapse Nodes
toggleNodeExpansion(nodeId: string) {
  // Mở rộng/thu gọn node
  // Hiển thị/ẩn children
  // Update UI state
}

// 2. Reorder Nodes
reorderNodes(sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') {
  // Kéo thả để sắp xếp lại
  // Update document tree
  // Auto renumbering
  // Update cross-references
}

// 3. Node Visibility
toggleNodeVisibility(nodeId: string) {
  // Hiển thị/ẩn node
  // Update conditional logic
  // Re-evaluate conditions
}
```

#### **C. Layout Features (Tính Năng Layout)**
```typescript
// 1. Search & Filter
searchInLayout(query: string) {
  // Tìm kiếm trong layout
  // Highlight kết quả
  // Jump to node
}

// 2. Bulk Operations
bulkOperations() {
  // Select multiple nodes
  // Move, delete, hide multiple nodes
  // Batch operations
}

// 3. Layout Statistics
layoutStatistics() {
  return {
    totalNodes: number,
    visibleNodes: number,
    hiddenNodes: number,
    totalWordCount: number,
    totalFieldCount: number,
    depth: number
  };
}
```

## 🔄 **Tương Tác Với Editor**

### **1. Drag & Drop Integration**
```typescript
// Sidebar → Editor
sidebarToEditor() {
  // 1. User kéo block từ BlockLibrary
  // 2. DragOver: Hiển thị drop zone
  // 3. Drop: Tạo block trong editor
  // 4. Auto-insert vào document tree
  // 5. Update layout structure
}

// Editor → Layout
editorToLayout() {
  // 1. User thay đổi trong editor
  // 2. Auto-update layout structure
  // 3. Sync numbering
  // 4. Update cross-references
}
```

### **2. Real-time Sync**
```typescript
// Field Updates
fieldUpdateSync() {
  // 1. User thay đổi field value
  // 2. Notify all subscribers
  // 3. Update all instances trong editor
  // 4. Re-evaluate conditional logic
  // 5. Update layout statistics
}

// Block Changes
blockChangeSync() {
  // 1. User thay đổi block content
  // 2. Update document tree
  // 3. Re-generate numbering
  // 4. Update cross-references
  // 5. Update layout view
}
```

### **3. Context Menu & Actions**
```typescript
// Right-click actions
contextMenuActions() {
  return {
    // Block actions
    'duplicate': 'Nhân bản block',
    'delete': 'Xóa block',
    'move-up': 'Di chuyển lên',
    'move-down': 'Di chuyển xuống',
    
    // Field actions
    'edit-field': 'Chỉnh sửa field',
    'find-usage': 'Tìm nơi sử dụng',
    'copy-value': 'Sao chép giá trị',
    
    // Layout actions
    'expand-all': 'Mở rộng tất cả',
    'collapse-all': 'Thu gọn tất cả',
    'export-section': 'Xuất section'
  };
}
```

## 🎨 **UI/UX Features**

### **1. Visual Feedback**
```scss
// Drag & Drop Feedback
.drag-over {
  border: 2px dashed #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.drop-zone {
  border: 2px solid #28a745;
  background: rgba(40, 167, 69, 0.1);
}

// Hover Effects
.block-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

// Active States
.tab.active {
  background: #007bff;
  color: white;
}
```

### **2. Responsive Design**
```scss
// Mobile Support
@media (max-width: 768px) {
  .template-sidebar {
    width: 100%;
    height: 50vh;
    position: fixed;
    bottom: 0;
    z-index: 1000;
  }
  
  .block-library__items {
    grid-template-columns: repeat(2, 1fr);
  }
}

// Tablet Support
@media (min-width: 769px) and (max-width: 1024px) {
  .template-sidebar {
    width: 300px;
  }
  
  .block-library__items {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### **3. Accessibility**
```typescript
// Keyboard Navigation
keyboardNavigation() {
  // Tab navigation
  // Arrow keys for selection
  // Enter/Space for activation
  // Escape for cancel
}

// Screen Reader Support
screenReaderSupport() {
  // ARIA labels
  // Role attributes
  // Live regions for updates
  // Focus management
}
```

## 📈 **Performance Optimization**

### **1. Lazy Loading**
```typescript
// Lazy load blocks
lazyLoadBlocks() {
  // Load basic blocks first
  // Load advanced blocks on demand
  // Cache loaded blocks
}

// Virtual scrolling for large lists
virtualScrolling() {
  // Only render visible items
  // Reuse DOM elements
  // Smooth scrolling
}
```

### **2. Caching**
```typescript
// Cache field definitions
fieldCache = new Map<string, FieldDefinition>();

// Cache block templates
blockCache = new Map<string, BlockTemplate>();

// Cache layout structure
layoutCache = new Map<string, LayoutNode>();
```

## 🚀 **Advanced Features**

### **1. Block Templates**
```typescript
// Pre-built templates
const blockTemplates = {
  'contract-header': {
    title: 'Header Hợp Đồng',
    blocks: [
      { type: 'heading', level: 1, content: 'HỢP ĐỒNG' },
      { type: 'field', key: 'contract_number' },
      { type: 'field', key: 'contract_date' }
    ]
  },
  
  'party-information': {
    title: 'Thông Tin Các Bên',
    blocks: [
      { type: 'heading', level: 2, content: 'THÔNG TIN CÁC BÊN' },
      { type: 'field', key: 'company_a_name' },
      { type: 'field', key: 'company_a_address' },
      { type: 'field', key: 'company_b_name' },
      { type: 'field', key: 'company_b_address' }
    ]
  }
};
```

### **2. Smart Suggestions**
```typescript
// Context-aware suggestions
smartSuggestions() {
  // Suggest relevant fields based on block type
  // Suggest common block combinations
  // Auto-complete field names
  // Suggest validation rules
}
```

### **3. Import/Export**
```typescript
// Export block library
exportBlockLibrary() {
  return {
    blocks: blockDefinitions,
    fields: fieldDefinitions,
    templates: blockTemplates,
    metadata: {
      version: '1.0',
      created: Date.now(),
      author: 'User'
    }
  };
}

// Import block library
importBlockLibrary(data: BlockLibraryData) {
  // Validate data
  // Merge with existing library
  // Update UI
  // Handle conflicts
}
```

## 🎯 **Tóm Tắt Chức Năng**

### **Tab Blocks:**
- ✅ **Block Library**: Tất cả loại blocks có thể sử dụng
- ✅ **Drag & Drop**: Kéo thả blocks vào editor
- ✅ **Field Types**: Các loại trường dữ liệu
- ✅ **Advanced Blocks**: Blocks nâng cao (conditional, cross-ref)
- ✅ **Block Templates**: Templates có sẵn

### **Tab Fields:**
- ✅ **Field Registry**: Quản lý tất cả fields
- ✅ **Field Categories**: Phân loại fields theo chức năng
- ✅ **Field Validation**: Rules validation cho fields
- ✅ **Field Binding**: Binding fields với blocks
- ✅ **Global Updates**: Update một lần, sync nhiều nơi

### **Tab Layout:**
- ✅ **Document Tree**: Xem cấu trúc tài liệu
- ✅ **Node Operations**: Expand/collapse, reorder, visibility
- ✅ **Search & Filter**: Tìm kiếm trong layout
- ✅ **Bulk Operations**: Thao tác hàng loạt
- ✅ **Layout Statistics**: Thống kê tài liệu

### **Tương Tác Với Editor:**
- ✅ **Real-time Sync**: Đồng bộ real-time
- ✅ **Context Menus**: Menu chuột phải
- ✅ **Keyboard Navigation**: Điều hướng bằng phím
- ✅ **Visual Feedback**: Feedback trực quan
- ✅ **Performance**: Tối ưu hiệu suất

Thư viện sidebar là **trung tâm điều khiển** của Template Editor, cung cấp tất cả công cụ cần thiết để xây dựng template hợp đồng một cách hiệu quả và trực quan.