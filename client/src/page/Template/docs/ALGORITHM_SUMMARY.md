# Thuật toán Then Chốt - Template Editor System

## 🎯 **Tổng quan thuật toán**

Thuật toán then chốt trong hệ thống Template Editor là **hệ điều phối trung tâm** quản lý toàn bộ luồng dữ liệu, đồng bộ hóa và tương tác người dùng. Đây không phải là một thuật toán đơn lẻ mà là **tập hợp các thuật toán phối hợp** để tạo ra trải nghiệm mượt mà và chính xác.

## 🔄 **1. Document Tree Management Algorithm**

### **Mục đích:**
Quản lý cấu trúc tài liệu dưới dạng cây phân cấp, đảm bảo tính nhất quán và khả năng mở rộng.

### **Cách hoạt động:**
```typescript
// Cấu trúc dữ liệu
Document
├── Section 1
│   ├── Clause 1.1
│   ├── Clause 1.2
│   └── Table 1.3
├── Section 2
│   ├── Conditional Block (if contractType == "Service")
│   │   └── Clause 2.1
│   └── CrossReference (see Clause 1.2)
└── Signature Block
```

### **Thuật toán reordering:**
1. **Remove**: Xóa node khỏi vị trí hiện tại
2. **Insert**: Chèn vào vị trí mới
3. **Update**: Cập nhật positions và parent relationships
4. **Regenerate**: Tạo lại numbering và cross-references

### **Ví dụ thực tế:**
```
Trước: [Clause 1] [Clause 2] [Clause 3] [Clause 4]
Sau khi kéo Clause 4 lên đầu: [Clause 4] [Clause 1] [Clause 2] [Clause 3]
→ Auto renumber: [Clause 1] [Clause 2] [Clause 3] [Clause 4]
→ Update references: "see Clause 4" → "see Clause 1"
```

## 🔗 **2. Sync Pipeline Algorithm**

### **Mục đích:**
Đồng bộ real-time giữa UI components (Sidebar ↔ Editor ↔ Data Store) với performance tối ưu.

### **Cách hoạt động:**
```typescript
// Event-driven sync pipeline
User Action → UI Event → Sync Queue → Process → Update All Components

// Ví dụ: User kéo block
Drag Start → Show Overlay → Track Position → Drop → Update Tree → Sync UI
```

### **Thuật toán queue processing:**
1. **Debounce**: Gộp các operations liên tiếp
2. **Batch**: Xử lý hàng loạt để tối ưu performance
3. **Optimistic Update**: Update UI ngay lập tức
4. **Background Sync**: Đồng bộ với server trong background

### **Ví dụ thực tế:**
```
User kéo block → UI update ngay → Background sync → Success/Error feedback
```

## 🎯 **3. Field Binding Algorithm**

### **Mục đích:**
Quản lý các trường dữ liệu động, đảm bảo "nhập một lần, sử dụng nhiều nơi".

### **Cách hoạt động:**
```typescript
// Field registry pattern
FieldRegistry {
  "company_name": {
    value: "ABC Corp",
    subscribers: ["clause_1", "clause_5", "signature_block"]
  }
}

// Khi update field
updateField("company_name", "XYZ Corp") {
  // Update value
  // Notify all subscribers
  // Update UI components
}
```

### **Thuật toán subscriber notification:**
1. **Register**: Đăng ký field với subscribers
2. **Update**: Cập nhật giá trị field
3. **Notify**: Thông báo tất cả subscribers
4. **Render**: Cập nhật UI components

### **Ví dụ thực tế:**
```
User nhập "Công ty ABC" → Tất cả {{company_name}} trong document auto update
```

## 🔢 **4. Auto Numbering & Cross-Reference Algorithm**

### **Mục đích:**
Tự động đánh số và quản lý tham chiếu chéo, đảm bảo tính nhất quán khi thay đổi cấu trúc.

### **Cách hoạt động:**
```typescript
// Numbering algorithm
traverseAndNumber(node, prefix, level) {
  let counter = 1;
  for (child of node.children) {
    const number = generateNumber(child.type, prefix, counter);
    child.metadata.numbering = number;
    traverseAndNumber(child, `${number}.`, level + 1);
    counter++;
  }
}

// Cross-reference update
updateCrossReferences() {
  for (ref of allCrossReferences) {
    const targetNumber = getNumbering(ref.targetId);
    ref.text = ref.text.replace(/\d+(\.\d+)*/, targetNumber);
  }
}
```

### **Thuật toán numbering:**
1. **Traverse**: Duyệt cây document
2. **Generate**: Tạo số theo type và level
3. **Cache**: Lưu cache để tối ưu performance
4. **Update**: Cập nhật cross-references

### **Ví dụ thực tế:**
```
Clause 1 → Clause 1.1 → Clause 1.1.1
Kéo Clause 1.1 lên thành Clause 2 → Auto renumber: Clause 2 → Clause 2.1 → Clause 2.1.1
Cross-reference "see Clause 1.1" → "see Clause 2"
```

## 🔀 **5. Conditional Logic Algorithm**

### **Mục đích:**
Đánh giá điều kiện và quyết định hiển thị/ẩn blocks dựa trên giá trị fields.

### **Cách hoạt động:**
```typescript
// Condition evaluation
evaluateConditions(conditions, fieldValues) {
  return conditions.every((condition, index) => {
    const result = evaluateCondition(condition, fieldValues);
    
    // Handle logical operators
    if (index > 0 && condition.logicalOperator) {
      const prevResult = evaluateCondition(conditions[index - 1], fieldValues);
      return condition.logicalOperator === 'and' ? 
        prevResult && result : prevResult || result;
    }
    
    return result;
  });
}
```

### **Thuật toán evaluation:**
1. **Parse**: Phân tích điều kiện
2. **Evaluate**: Đánh giá từng condition
3. **Combine**: Kết hợp với logical operators
4. **Update**: Cập nhật visibility

### **Ví dụ thực tế:**
```
Condition: if contractType == "Service" AND hasVAT == true
Field values: contractType = "Service", hasVAT = false
Result: Block hidden (false AND false = false)
```

## 🖱️ **6. Drag & Drop Pipeline Algorithm**

### **Mục đích:**
Xử lý drag & drop events với visual feedback và validation.

### **Cách hoạt động:**
```typescript
// Drag & drop pipeline
handleDragStart(event) {
  // Show overlay
  // Track drag state
}

handleDragOver(event) {
  // Find drop zone
  // Show drop indicator
  // Validate drop position
}

handleDragEnd(event) {
  // Execute drop operation
  // Update document tree
  // Sync UI
}
```

### **Thuật toán drop validation:**
1. **Validate**: Kiểm tra vị trí drop hợp lệ
2. **Preview**: Hiển thị preview vị trí
3. **Execute**: Thực hiện drop operation
4. **Rollback**: Rollback nếu có lỗi

### **Ví dụ thực tế:**
```
User kéo block → Preview line hiển thị → Drop → Block được chèn → Auto renumber
```

## 📤 **7. Export & Versioning Algorithm**

### **Mục đích:**
Chuyển đổi document tree thành các format xuất và quản lý version.

### **Cách hoạt động:**
```typescript
// Export pipeline
exportDocument(tree, format) {
  // 1. Resolve fields
  const resolvedTree = resolveFields(tree);
  
  // 2. Apply conditional logic
  const filteredTree = applyConditionalLogic(resolvedTree);
  
  // 3. Generate numbering
  generateNumbering(filteredTree);
  
  // 4. Transform format
  return transformToFormat(filteredTree, format);
}
```

### **Thuật toán versioning:**
1. **Snapshot**: Tạo snapshot của document tree
2. **Diff**: Tính toán diff với version trước
3. **Store**: Lưu version với metadata
4. **Rollback**: Cho phép rollback về version cũ

### **Ví dụ thực tế:**
```
Save v1: 3 clauses → Save v2: 4 clauses → Rollback v1: 3 clauses
```

## 🔄 **8. Performance Optimization Algorithms**

### **Debouncing Algorithm:**
```typescript
// Debounce user input
const debouncedUpdate = debounce((value) => {
  updateFieldValue(fieldId, value);
}, 300);

// Batch operations
const batchOperations = (operations) => {
  const batched = groupByType(operations);
  processBatch(batched);
};
```

### **Caching Algorithm:**
```typescript
// Cache numbering results
const numberingCache = new Map();
const getNumbering = (nodeId) => {
  if (numberingCache.has(nodeId)) {
    return numberingCache.get(nodeId);
  }
  const number = calculateNumbering(nodeId);
  numberingCache.set(nodeId, number);
  return number;
};
```

## 🎯 **Tóm tắt thuật toán then chốt:**

### **1. Event-Driven Architecture**
- Tất cả thay đổi đều thông qua event pipeline
- Debouncing và batching cho performance
- Optimistic updates cho responsiveness

### **2. Single Source of Truth**
- Document tree là nguồn dữ liệu duy nhất
- Tất cả UI components subscribe đến changes
- Real-time sync giữa các components

### **3. Hierarchical Management**
- Tree structure cho document organization
- Recursive algorithms cho numbering và evaluation
- Parent-child relationships cho complex structures

### **4. Reactive Updates**
- Field binding với subscriber pattern
- Conditional logic với real-time evaluation
- Cross-reference với auto-update

### **5. Error Recovery**
- Validation cho drag & drop operations
- Rollback mechanism cho failed operations
- Graceful degradation cho network issues

## 🚀 **Kết quả đạt được:**

✅ **Mượt mà**: UI responsive với optimistic updates
✅ **Chính xác**: Data consistency với single source of truth
✅ **Mở rộng**: Modular architecture cho easy extension
✅ **Performance**: Optimized với caching và batching
✅ **User-friendly**: Intuitive drag & drop với visual feedback
✅ **Reliable**: Error handling và recovery mechanisms

Thuật toán này tạo ra một hệ thống mạnh mẽ, có thể xử lý các template hợp đồng phức tạp với hiệu suất cao và trải nghiệm người dùng tuyệt vời.