# Template Editor - Hướng dẫn sử dụng

## Tổng quan

Template Editor là một công cụ mạnh mẽ để tạo và quản lý các template hợp đồng với khả năng drag & drop linh hoạt, quản lý fields và preview real-time.

## Tính năng chính

### 1. Drag & Drop linh hoạt
- **Sidebar → Canvas**: Kéo các blocks và fields từ sidebar vào canvas
- **Canvas reordering**: Sắp xếp lại các blocks trong canvas
- **Visual feedback**: Hiển thị preview và drop indicators
- **Multi-mode support**: Hoạt động trong Edit, Fill và Preview mode

### 2. Quản lý Fields
- **Field Manager**: Tạo, chỉnh sửa và xóa fields
- **Field Types**: Hỗ trợ nhiều loại field (text, number, date, money, select, etc.)
- **Validation**: Validation rules cho từng field
- **Formatting**: Định dạng hiển thị (currency, date format)

### 3. Layout Structure
- **Visual structure**: Hiển thị cấu trúc document dưới dạng tree
- **Block reordering**: Sắp xếp lại blocks bằng drag & drop
- **Visibility control**: Ẩn/hiện các blocks
- **Expand/collapse**: Mở rộng/thu gọn các sections

### 4. Three Modes
- **Edit Mode**: Soạn thảo template, thêm/sửa blocks và fields
- **Fill Mode**: Điền dữ liệu vào template với inline inputs
- **Preview Mode**: Xem trước document cuối cùng

## Cách sử dụng

### 1. Tạo Template mới

1. Mở Template Editor
2. Chọn tab "Blocks" trong sidebar
3. Kéo các blocks cần thiết vào canvas:
   - **Heading**: Tiêu đề chính/phụ
   - **Clause Block**: Khối điều khoản
   - **Table**: Bảng dữ liệu
   - **Signature Block**: Khối chữ ký
   - **Page Break**: Ngắt trang

### 2. Thêm Fields

1. Chọn tab "Fields" trong sidebar
2. Click "Add Field" để tạo field mới
3. Điền thông tin:
   - **Label**: Tên hiển thị
   - **Key**: Khóa duy nhất
   - **Type**: Loại field
   - **Required**: Bắt buộc hay không
   - **Placeholder**: Text gợi ý
4. Kéo field từ "Defined Fields" vào canvas

### 3. Quản lý Layout

1. Chọn tab "Layout" trong sidebar
2. Xem cấu trúc document dưới dạng tree
3. Sử dụng drag & drop để sắp xếp lại blocks
4. Click icon mắt để ẩn/hiện blocks
5. Click icon mũi tên để mở rộng/thu gọn

### 4. Điền dữ liệu

1. Chuyển sang "Fill Mode"
2. Điền dữ liệu vào các fields
3. Validation sẽ chạy real-time
4. Chuyển sang "Preview Mode" để xem kết quả

## Các loại Field

### Text Fields
- **text**: Văn bản ngắn
- **textarea**: Văn bản dài
- **email**: Email address
- **phone**: Số điện thoại

### Numeric Fields
- **number**: Số nguyên/thập phân
- **money**: Tiền tệ (tự động format)

### Date Fields
- **date**: Ngày tháng (với date picker)

### Selection Fields
- **select**: Dropdown selection
- **checkbox**: Checkbox

## Drag & Drop Tips

### Từ Sidebar vào Canvas
1. Hover vào block/field trong sidebar
2. Click và kéo vào canvas
3. Thả vào vùng drop zone
4. Block sẽ được thêm vào cuối document

### Reordering trong Canvas
1. Chọn tab "Layout" trong sidebar
2. Kéo các blocks để sắp xếp lại
3. Visual feedback sẽ hiển thị vị trí mới

### Visual Feedback
- **Blue border**: Drop zone active
- **Green border**: Drop zone over
- **Pulse animation**: Dragging preview
- **Insertion line**: Vị trí sẽ chèn

## Keyboard Shortcuts

- **Ctrl+S**: Save template
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Tab**: Chuyển giữa các tabs trong sidebar

## Best Practices

### 1. Field Naming
- Sử dụng snake_case cho field keys
- Đặt tên rõ ràng và mô tả
- Tránh trùng lặp keys

### 2. Template Structure
- Sử dụng headings để phân chia sections
- Nhóm các fields liên quan
- Thêm page breaks cho documents dài

### 3. Validation
- Đặt required cho fields quan trọng
- Sử dụng validation rules phù hợp
- Thêm placeholder text hữu ích

### 4. Performance
- Không tạo quá nhiều fields không cần thiết
- Sử dụng collapse/expand cho sections lớn
- Regular save để tránh mất dữ liệu

## Troubleshooting

### Drag & Drop không hoạt động
- Kiểm tra xem có đang ở Edit mode không
- Refresh page nếu cần
- Kiểm tra console errors

### Fields không hiển thị
- Kiểm tra field có được định nghĩa chưa
- Xem field có bị ẩn không trong Layout tab
- Kiểm tra field key có đúng không

### Validation errors
- Xem error messages trong Properties panel
- Kiểm tra field type và validation rules
- Đảm bảo required fields được điền

## Technical Details

### Architecture
- **Tiptap**: Rich text editor core
- **dnd-kit**: Drag & drop library
- **Zustand**: State management
- **React**: UI framework

### Data Flow
1. Template data stored in Zustand stores
2. Tiptap manages document structure
3. dnd-kit handles drag & drop interactions
4. React components render UI

### Extensions
- Custom Tiptap extensions for fields and blocks
- NodeViews for custom rendering
- Commands for editor operations

## Future Enhancements

- [ ] Table loop support
- [ ] Conditional logic (visibleIf)
- [ ] Computed fields
- [ ] PDF export
- [ ] Template versioning
- [ ] Collaboration features
- [ ] Advanced validation rules
- [ ] Custom field types