# Sequence Diagram - Template Editor Data Flow

## 🔄 **1. Drag & Drop Pipeline Sequence**

```mermaid
sequenceDiagram
    participant User
    participant Sidebar
    participant DragDrop
    participant Editor
    participant TreeManager
    participant NumberingManager
    participant UIManager
    participant DataStore

    User->>Sidebar: Drag block from sidebar
    Sidebar->>DragDrop: handleDragStart()
    DragDrop->>UIManager: showDragOverlay()
    UIManager->>User: Visual feedback

    User->>Editor: Drag over editor
    Editor->>DragDrop: handleDragOver()
    DragDrop->>UIManager: showDropIndicator()
    UIManager->>User: Drop zone highlight

    User->>Editor: Drop block
    Editor->>DragDrop: handleDragEnd()
    DragDrop->>TreeManager: createDropOperation()
    TreeManager->>DataStore: addOperation()
    
    DataStore->>TreeManager: reorderTree()
    TreeManager->>NumberingManager: generateNumbering()
    NumberingManager->>NumberingManager: updateCrossReferences()
    
    TreeManager->>UIManager: updateEditor()
    TreeManager->>UIManager: updateSidebar()
    UIManager->>User: UI updated
```

## 🔗 **2. Field Binding & Sync Sequence**

```mermaid
sequenceDiagram
    participant User
    participant FieldManager
    participant BindingManager
    participant Subscribers
    participant Editor
    participant DataStore

    User->>FieldManager: Update field value
    FieldManager->>BindingManager: updateFieldValue()
    BindingManager->>BindingManager: getSubscribers()
    
    loop For each subscriber
        BindingManager->>Subscribers: notifyNodeUpdate()
        Subscribers->>Editor: updateNodeContent()
        Editor->>User: Visual update
    end
    
    BindingManager->>DataStore: saveFieldValue()
    DataStore->>User: Data persisted
```

## 🔢 **3. Auto Numbering & Cross-Reference Sequence**

```mermaid
sequenceDiagram
    participant User
    participant TreeManager
    participant NumberingManager
    participant ReferenceManager
    participant Editor
    participant DataStore

    User->>TreeManager: Reorder blocks
    TreeManager->>NumberingManager: generateNumbering()
    
    NumberingManager->>NumberingManager: traverseAndNumber()
    NumberingManager->>NumberingManager: updateNodeMetadata()
    
    NumberingManager->>ReferenceManager: updateCrossReferences()
    ReferenceManager->>ReferenceManager: findCrossReferences()
    ReferenceManager->>ReferenceManager: updateReferenceText()
    
    NumberingManager->>Editor: updateNumbering()
    ReferenceManager->>Editor: updateReferences()
    Editor->>User: Visual update
    
    TreeManager->>DataStore: saveDocument()
    DataStore->>User: Data persisted
```

## 🔀 **4. Conditional Logic Sequence**

```mermaid
sequenceDiagram
    participant User
    participant FieldManager
    participant ConditionalEngine
    participant TreeManager
    participant Editor
    participant DataStore

    User->>FieldManager: Change field value
    FieldManager->>ConditionalEngine: evaluateConditions()
    
    ConditionalEngine->>ConditionalEngine: evaluateBlockConditions()
    ConditionalEngine->>ConditionalEngine: evaluateCondition()
    
    ConditionalEngine->>TreeManager: updateConditionalVisibility()
    TreeManager->>TreeManager: traverseAndUpdateVisibility()
    TreeManager->>TreeManager: updateNodeMetadata()
    
    TreeManager->>Editor: updateVisibility()
    Editor->>User: Show/hide blocks
    
    TreeManager->>DataStore: saveDocument()
    DataStore->>User: Data persisted
```

## 📤 **5. Export & Versioning Sequence**

```mermaid
sequenceDiagram
    participant User
    participant ExportManager
    participant FieldResolver
    participant ConditionalEngine
    participant NumberingManager
    participant Transformer
    participant VersionManager
    participant Storage

    User->>ExportManager: Export document
    ExportManager->>FieldResolver: resolveFields()
    FieldResolver->>FieldResolver: replaceFieldPlaceholders()
    
    ExportManager->>ConditionalEngine: applyConditionalLogic()
    ConditionalEngine->>ConditionalEngine: filterVisibleBlocks()
    
    ExportManager->>NumberingManager: generateNumbering()
    ExportManager->>NumberingManager: updateCrossReferences()
    
    ExportManager->>Transformer: transform()
    Transformer->>User: Export file
    
    User->>VersionManager: Save version
    VersionManager->>VersionManager: createVersion()
    VersionManager->>VersionManager: calculateDiff()
    VersionManager->>Storage: saveVersion()
    Storage->>User: Version saved
```

## 🔄 **6. Complete Document Save Sequence**

```mermaid
sequenceDiagram
    participant User
    participant UIManager
    participant TreeManager
    participant NumberingManager
    participant ConditionalEngine
    participant VersionManager
    participant Storage
    participant DataStore

    User->>UIManager: Save document
    UIManager->>TreeManager: getCurrentTree()
    
    TreeManager->>NumberingManager: generateNumbering()
    NumberingManager->>NumberingManager: updateCrossReferences()
    
    TreeManager->>ConditionalEngine: updateConditionalVisibility()
    ConditionalEngine->>ConditionalEngine: evaluateAllConditions()
    
    TreeManager->>VersionManager: createVersion()
    VersionManager->>VersionManager: calculateDiff()
    
    VersionManager->>Storage: saveDocument()
    Storage->>DataStore: persistData()
    
    DataStore->>UIManager: saveSuccess()
    UIManager->>User: Save confirmation
```

## 🎯 **7. Real-time Sync Sequence**

```mermaid
sequenceDiagram
    participant User1
    participant User2
    participant SyncManager
    participant DataStore
    participant UIManager1
    participant UIManager2

    User1->>UIManager1: Make change
    UIManager1->>SyncManager: addOperation()
    SyncManager->>DataStore: processOperation()
    DataStore->>SyncManager: operationComplete()
    
    SyncManager->>UIManager2: notifyChange()
    UIManager2->>User2: updateUI()
    
    User2->>UIManager2: Make change
    UIManager2->>SyncManager: addOperation()
    SyncManager->>DataStore: processOperation()
    DataStore->>SyncManager: operationComplete()
    
    SyncManager->>UIManager1: notifyChange()
    UIManager1->>User1: updateUI()
```

## 🔧 **8. Error Handling Sequence**

```mermaid
sequenceDiagram
    participant User
    participant UIManager
    participant TreeManager
    participant ErrorHandler
    participant DataStore

    User->>UIManager: Perform action
    UIManager->>TreeManager: executeOperation()
    
    alt Operation succeeds
        TreeManager->>DataStore: saveData()
        DataStore->>UIManager: success()
        UIManager->>User: Success feedback
    else Operation fails
        TreeManager->>ErrorHandler: handleError()
        ErrorHandler->>ErrorHandler: logError()
        ErrorHandler->>UIManager: errorDetails()
        UIManager->>User: Error message
        UIManager->>TreeManager: rollback()
    end
```

## 📊 **9. Performance Optimization Sequence**

```mermaid
sequenceDiagram
    participant User
    participant UIManager
    participant DebounceManager
    participant TreeManager
    participant DataStore

    User->>UIManager: Rapid changes
    UIManager->>DebounceManager: debounceOperation()
    
    Note over DebounceManager: Wait for user to stop typing
    
    DebounceManager->>TreeManager: batchOperations()
    TreeManager->>TreeManager: optimizeUpdates()
    TreeManager->>DataStore: saveBatch()
    
    DataStore->>UIManager: batchComplete()
    UIManager->>User: Update complete
```

## 🎯 **Key Algorithm Insights:**

### **1. Event-Driven Architecture**
- Tất cả thay đổi đều thông qua event pipeline
- Debouncing cho performance optimization
- Batch operations để giảm overhead

### **2. Single Source of Truth**
- DataStore là nguồn dữ liệu duy nhất
- Tất cả UI components subscribe đến changes
- Real-time sync giữa các components

### **3. Optimistic Updates**
- UI update ngay lập tức cho responsiveness
- Background sync với server
- Rollback mechanism cho error handling

### **4. Caching Strategy**
- Numbering cache để tránh recalculate
- Field value cache cho performance
- Reference cache cho cross-references

### **5. Error Recovery**
- Automatic retry cho failed operations
- Graceful degradation khi network issues
- User-friendly error messages

Thuật toán này đảm bảo hệ thống hoạt động mượt mà, responsive và reliable trong mọi tình huống.