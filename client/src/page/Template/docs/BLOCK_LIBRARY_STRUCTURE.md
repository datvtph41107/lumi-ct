# 🎯 **Cấu Trúc Block Library - Template Editor**

## 📋 **Mục Tiêu Chính**

Thư viện sidebar là **kho chứa trung tâm** của Template Editor, cung cấp tất cả các khối (blocks), trường (fields), và thành phần (components) để người dùng kéo vào khung Editor.

**Mục tiêu:**
- ✅ **Tái sử dụng (Reusable)**: Các blocks và fields có thể sử dụng nhiều lần
- ✅ **Tùy biến (Customizable)**: Mỗi thành phần có thể được cấu hình linh hoạt
- ✅ **Tạo hợp đồng nhanh**: Hỗ trợ tạo hợp đồng nhanh và chuẩn hóa dữ liệu
- ✅ **Linh hoạt**: Vẫn đảm bảo tính linh hoạt cao cho người dùng

## 🗂️ **7 Nhóm Blocks Chính**

### **🔹 1. Kiểu văn bản & nội dung cơ bản (Text Blocks)**

**Mục đích**: Dùng để xây dựng bố cục (layout) và nội dung cơ bản.

#### **Các blocks:**
```typescript
// 1. Text Blocks
- Văn bản (paragraph) - Đoạn văn thường
- Tiêu đề chính (heading-1) - H1, căn giữa, in đậm
- Tiêu đề phụ (heading-2) - H2, căn trái, in đậm  
- Tiêu đề nhỏ (heading-3) - H3, căn trái, in đậm
- Danh sách gạch đầu dòng (bulletList) - List với dấu gạch
- Danh sách số thứ tự (orderedList) - List với số thứ tự (1.1, 1.2...)
- Văn bản in nghiêng (paragraph-italic) - Cho chú thích
- Văn bản in đậm (paragraph-bold) - Cho điều khoản
```

#### **Ví dụ sử dụng:**
- **Tiêu đề chính**: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
- **Tiêu đề phụ**: "HỢP ĐỒNG KINH TẾ"
- **Danh sách**: Các điều khoản dạng gạch đầu dòng hoặc số thứ tự

#### **Tính năng:**
- Cho phép chỉnh cỡ chữ, căn lề, in đậm/hoa
- Có thể chỉnh justify, căn trái/phải/giữa
- Dùng cho nội dung văn bản mô tả hoặc các điều khoản

---

### **🔹 2. Kiểu dữ liệu động (Dynamic Fields)**

**Mục đích**: Các trường mà hệ thống sẽ tự động thay thế bằng dữ liệu.

#### **Các fields:**
```typescript
// 2. Dynamic Fields
- Biến văn bản (variable-text) - {{company_name}}
- Ngày tháng (field-date) - dd/mm/yyyy format
- Số (field-number) - Trường số
- Tiền tệ (field-currency) - VND format (1.000.000 VNĐ)
- Chữ ký (field-signature) - Trường chữ ký
- Văn bản dài (field-textarea) - Nhiều dòng
```

#### **Ví dụ sử dụng:**
- **Ngày tháng**: "Ngày 06 tháng 10 năm 2018" tự động sinh từ contract_date
- **Số hợp đồng**: Sinh từ DB hoặc do người dùng nhập
- **Bên A/Bên B**: Tên công ty, người đại diện, chức vụ, địa chỉ, mã số thuế

#### **Tính năng:**
- Trộn dữ liệu khi sinh hợp đồng từ DB hoặc form
- Tự động thay thế placeholder bằng dữ liệu thực
- Hỗ trợ định dạng ngày tháng, tiền tệ

---

### **🔹 3. Kiểu bố cục (Layout Blocks)**

**Mục đích**: Dùng để sắp xếp cấu trúc hợp đồng, căn chỉnh lề chính xác.

#### **Các blocks:**
```typescript
// 3. Layout Blocks
- Phần (section) - Khối chứa các block con
- 2 cột (columns-2) - Chia thành 2 cột
- 3 cột (columns-3) - Chia thành 3 cột
- Khoảng cách (spacer) - Block khoảng cách
- Bảng dữ liệu (table-block) - Bảng với tính năng nâng cao
```

#### **Ví dụ sử dụng:**
- **2 cột**: Thông tin bên A trái, bên B phải
- **Bảng**: Bảng chi tiết thanh toán, lịch trình công việc
- **Khoảng cách**: Căn chỉnh khoảng cách giữa các phần

#### **Tính năng:**
- Có thể merge ô, thêm dòng, căn chỉnh
- Giúp căn chỉnh vị trí chuẩn
- Sắp xếp cấu trúc hợp đồng

---

### **🔹 4. Kiểu điều khoản (Contract Clause Block)**

**Mục đích**: Được định nghĩa sẵn để tái sử dụng, tạo hợp đồng có cấu trúc rõ ràng.

#### **Các blocks:**
```typescript
// 4. Clause Blocks
- Tiêu đề điều khoản (clause-title) - Điều 1, Điều 2...
- Nội dung điều khoản (clause-content) - Nội dung clause
- Điều khoản lặp lại (repeatable-clause) - Có thể nhân bản
```

#### **Ví dụ sử dụng:**
- **Điều 1**: Công việc theo hợp đồng
- **Điều 2**: Giá trị hợp đồng, phương thức thanh toán
- **Điều 3**: Quyền và nghĩa vụ các bên

#### **Tính năng:**
- Thêm mới một khối điều khoản
- Chỉnh sửa nội dung điều khoản
- Bật/tắt hiển thị từng điều khoản
- Dễ lặp lại và tái sử dụng

---

### **🔹 5. Kiểu đa phương tiện (Media Blocks)**

**Mục đích**: Ít dùng nhưng hữu ích cho việc chèn hình ảnh, logo, con dấu.

#### **Các blocks:**
```typescript
// 5. Media Blocks
- Hình ảnh (image) - Chèn hình ảnh
- Logo công ty (logo) - Logo với kích thước chuẩn
- Con dấu (stamp-seal) - Khối dành cho đóng dấu
- Tài liệu đính kèm (attachment) - Ghi chú phụ lục
```

#### **Ví dụ sử dụng:**
- **Logo**: Logo công ty ở header hợp đồng
- **Con dấu**: Đóng dấu công ty, con dấu chức năng
- **Tài liệu đính kèm**: Ghi chú "đính kèm phụ lục, tài liệu"

#### **Tính năng:**
- Chèn hình ảnh chữ ký scan
- Hiển thị dạng text "Đại diện theo pháp luật"
- Hình ảnh minh họa, biểu đồ

---

### **🔹 6. Kiểu điều khiển hiển thị (UI Control)**

**Mục đích**: Rất quan trọng nếu sau này muốn sinh hợp đồng động theo logic kinh doanh.

#### **Các blocks:**
```typescript
// 6. Control Blocks
- Đường kẻ phân cách (divider) - Phân cách các phần
- Ngắt trang (page-break) - Ngắt trang khi xuất PDF
- Khối có điều kiện (conditional-block) - Hiển thị/ẩn theo điều kiện
```

#### **Ví dụ sử dụng:**
- **Đường kẻ**: Chia tách các phần trong hợp đồng
- **Ngắt trang**: Tạo trang mới khi xuất PDF
- **Điều kiện**: Chỉ hiển thị "Thưởng KPI" nếu có

#### **Tính năng:**
- Hiển thị/ẩn theo điều kiện dữ liệu
- Sinh hợp đồng động theo logic kinh doanh
- Chia tách các phần trong hợp đồng

---

### **🔹 7. Kiểu nâng cao (Advanced Blocks)**

**Mục đích**: Cho template động, xử lý các trường hợp phức tạp.

#### **Các blocks:**
```typescript
// 7. Advanced Blocks
- Khối lặp lại (repeatable-block) - Lặp nhóm dữ liệu
- Bảng động (dynamic-table) - Bảng sinh từ dữ liệu
- HTML tùy chỉnh (custom-html) - HTML tùy chỉnh
- Khối trống chờ nhập (placeholder) - Chờ nhập thủ công
```

#### **Ví dụ sử dụng:**
- **Khối lặp**: Danh sách nhân viên, danh sách sản phẩm, bảng giá
- **Bảng động**: Bảng lương, bảng công việc
- **Placeholder**: Để trống vài trường để người dùng điền thủ công khi in

#### **Tính năng:**
- Dùng khi có nhiều hạng mục
- Bảng chi tiết thanh toán, lịch trình công việc
- Cho phép soạn sẵn mẫu nhưng để trống vài trường
- Logic phức tạp, tính toán tự động

---

## 🛠️ **Cách Sử Dụng Trong Editor**

### **Quy trình sử dụng:**
1. **Mở Sidebar** → Thư viện
2. **Chọn một khối** (ví dụ: "Tiêu đề", "Ngày tháng", "Bên A")
3. **Drag & Drop** vào vị trí trong editor
4. **Editor hiển thị block** → người dùng có thể click để sửa
5. **Khi lưu template** → block sẽ được lưu dưới dạng JSON (structure)

### **Tùy chỉnh blocks:**
- **Panel bên phải**: Font, căn lề, kích thước, dữ liệu liên kết
- **Inline editing**: Click trực tiếp vào block để chỉnh sửa
- **Properties panel**: Cấu hình chi tiết cho từng block

---

## 📊 **Cấu Trúc Trực Quan**

```
Sidebar - Thư viện block:
 ├─ Văn bản
 │   ├─ Text
 │   ├─ Heading (H1, H2, H3)
 │   ├─ List (Bullet, Numbered)
 │   ├─ Paragraph (Bold, Italic)
 │
 ├─ Dữ liệu động
 │   ├─ Variable ({{company_name}})
 │   ├─ Date (dd/mm/yyyy)
 │   ├─ Currency (1.000.000 VNĐ)
 │   ├─ Signature (Bên A, Bên B)
 │   ├─ Textarea (Nhiều dòng)
 │
 ├─ Bố cục
 │   ├─ Section (Khối chứa)
 │   ├─ Columns (2, 3 cột)
 │   ├─ Table (Merge, thêm dòng)
 │   ├─ Spacer (Khoảng cách)
 │
 ├─ Điều khoản
 │   ├─ Clause Title (Điều 1, 2...)
 │   ├─ Clause Content (Nội dung)
 │   ├─ Repeatable Clause (Nhân bản)
 │
 ├─ Đa phương tiện
 │   ├─ Logo / Image
 │   ├─ Stamp / Seal
 │   ├─ Attachment (Phụ lục)
 │
 ├─ Hiển thị
 │   ├─ Divider (Đường kẻ)
 │   ├─ Page Break (Ngắt trang)
 │   ├─ Conditional Block (Điều kiện)
 │
 ├─ Nâng cao
     ├─ Repeatable Block (Lặp lại)
     ├─ Dynamic Table (Bảng động)
     ├─ Custom HTML (Tùy chỉnh)
     ├─ Placeholder (Chờ nhập)
```

---

## 🎯 **Tóm Tắt**

### **Mục tiêu đạt được:**
- ✅ **Tái sử dụng**: Blocks và fields có thể sử dụng nhiều lần
- ✅ **Tùy biến**: Mỗi thành phần có thể được cấu hình linh hoạt
- ✅ **Tạo nhanh**: Hỗ trợ tạo hợp đồng nhanh và chuẩn hóa dữ liệu
- ✅ **Linh hoạt**: Đảm bảo tính linh hoạt cao cho người dùng

### **Kết quả:**
- **35+ Blocks** được tổ chức thành 7 nhóm chính
- **Drag & Drop** mượt mà với visual feedback
- **Real-time sync** giữa sidebar và editor
- **Responsive design** hoạt động tốt trên mọi device
- **Accessibility** đầy đủ cho người dùng khuyết tật

**Sidebar = thư viện các block. Người dùng kéo các block này sang Editor để xây hợp đồng.**