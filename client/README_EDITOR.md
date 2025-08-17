# Trình soạn thảo hợp đồng (Editor - Tiptap)

Tài liệu này mô tả cách sử dụng và các tính năng chính của trình soạn thảo hợp đồng trong hệ thống.

## Bố cục màn hình
- Header: thanh hành động (Export PDF/DOCX/HTML, Print, Share) và điều chỉnh thu phóng.
- Sidebar trái: gợi ý, cấu trúc, template, lịch sử. Cho phép chèn nội dung/khung mẫu trực tiếp vào Editor.
- Khu vực Editor: Tiptap Editor với thanh công cụ nổi (Toolbar) giúp định dạng văn bản.
- Sidebar phải: thông tin hợp đồng, cài đặt, quản lý cộng tác (collaborator), hoạt động (audit).

## Trải nghiệm soạn thảo
- Khởi tạo: khi Editor trống, hệ thống tự sinh skeleton theo contractType (service/employment/…)
- Gợi ý (SidebarLeft): click để chèn nhanh các mục (ví dụ Bảo mật, Thanh toán) hoặc áp dụng định dạng chuẩn (justify, line-height 1.5).
- Cấu trúc (SidebarLeft): danh sách mục chuẩn của hợp đồng. Click từng mục để chèn vào Editor.
- Template (SidebarLeft): chọn một template để đổ skeleton vào Editor, có thể chỉnh sửa tiếp.

## Toolbar (tự ẩn/hiện)
- Tự động ẩn khi đang gõ, hiện lại sau 600ms ngừng gõ.
- Ẩn khi chọn ảnh; hiện khi có focus và không ở trạng thái ẩn thủ công.
- Chuột phải lên khung Editor sẽ toggle chế độ thủ công: ẩn/hiện chỉ khi người dùng bật lại.
- Chức năng: Undo/Redo, Bold/Italic, Căn lề, Danh sách, Dòng chữ, Màu chữ, Liên kết, Ảnh, Line-height…

## Lưu bản nháp
- Tự động đồng bộ nội dung mỗi lần Editor cập nhật vào `useContractDraftStore`.
- SidebarRight có nút Lưu (Save) để lưu ngay: cập nhật nội dung hiện tại và gọi autosave.
- Cảnh báo thoát (beforeunload) khi có dữ liệu chưa lưu.
- Phím tắt Ctrl/Cmd+S để lưu thủ công (hook `useAutoSave`).

## Export/Print
- PDF/DOCX (server): nút ở Header. Server trả về nội dung base64 (hiện tại bản đơn giản: HTML/TXT placeholder) để tải xuống.
- HTML (client): Export HTML gói nội dung Editor vào khung in tiêu chuẩn (title, style, @page).
- Print: dùng @media print để ẩn sidebar, toolbar, chỉ in nội dung hợp đồng.

## Cộng tác và nhật ký
- SidebarRight: quản lý collaborator (thêm/sửa/xóa/chuyển owner) và xem hoạt động gần đây (audit log) qua `auditLogService`.

## Mở rộng/cấu hình
- Thêm template/khung hợp đồng: cập nhật logic sinh skeleton theo `contractType` hoặc mở rộng qua service templates.
- Tùy biến Toolbar: thêm button mới trong `components/Toolbar/EditorButton` và đăng ký extension Tiptap tương ứng.
- Quyền (RBAC): các hành động nhạy cảm (Export/Transfer ownership) nằm trong `PermissionGuard`.

## Lưu ý phát triển
- Đồng bộ types ở `types/contract/contract.types.ts` với các stage và store.
- Khi thêm trường mới vào hợp đồng, cập nhật `ContractFormData` và các nơi dùng `updateDraftData`.
- Đảm bảo các service API trả về `ApiResponse<T>` hợp lệ và xử lý lỗi rõ ràng.