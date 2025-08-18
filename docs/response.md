## Chuẩn Response

Server gắn `ResponseInterceptor` toàn cục, chuẩn hóa thành:

Thành công:
```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Lỗi (bọc lại HttpException):
```json
{
  "success": false,
  "message": "...",
  "error": {
    "name": "ErrorName",
    "details": "..."
  }
}
```

Lưu ý: Một số controller `contract-drafts` đã tự trả `{ success: true, data }` — vẫn tương thích với interceptor.
