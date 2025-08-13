# Contract Management System

Hệ thống quản lý hợp đồng toàn diện với các tính năng soạn thảo, phê duyệt, versioning và analytics.

## 🚀 Tính năng chính

### 📋 Quản lý hợp đồng

- ✅ Tạo, chỉnh sửa, xóa hợp đồng
- ✅ Quản lý trạng thái (draft, pending, active, completed, cancelled, expired)
- ✅ Tìm kiếm và lọc nâng cao
- ✅ Phân quyền chi tiết

### ✍️ Soạn thảo hợp đồng

- ✅ Hỗ trợ 3 chế độ: Form-based, Rich text editor, Upload file
- ✅ Lưu bản nháp tự động và thủ công
- ✅ Quản lý stage theo quy trình
- ✅ Validation từng bước

### 📊 Versioning & History

- ✅ Tạo và quản lý phiên bản
- ✅ So sánh và rollback version
- ✅ Audit log chi tiết
- ✅ Lịch sử thay đổi

### 🎯 Milestone & Task Management

- ✅ Tạo và quản lý milestone
- ✅ Task assignment và tracking
- ✅ Deadline management
- ✅ Progress tracking

### 👥 Collaboration

- ✅ Quản lý cộng tác viên
- ✅ Phân quyền theo vai trò
- ✅ Real-time notifications
- ✅ Comment và feedback

### 📁 File Management

- ✅ Upload và quản lý file đính kèm
- ✅ Version control cho file
- ✅ File type validation
- ✅ Secure file storage

### ✅ Approval Workflow

- ✅ Multi-level approval
- ✅ Request changes
- ✅ Approval history
- ✅ Email notifications

### 📈 Analytics & Dashboard

- ✅ Contract analytics
- ✅ Progress tracking
- ✅ Performance metrics
- ✅ Custom reports

### 🖨️ Export & Print

- ✅ Export PDF/DOCX
- ✅ Print-friendly views
- ✅ Custom templates
- ✅ Branding support

## 🛠️ Công nghệ sử dụng

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL với TypeORM
- **Authentication**: JWT
- **File Storage**: Local/Cloud storage
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Frontend (Client)

- **Framework**: React + TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Custom components
- **Rich Text Editor**: TipTap
- **Styling**: SCSS modules

## 📦 Cài đặt

### Yêu cầu hệ thống

- Node.js 18+
- PostgreSQL 12+
- Redis (optional, cho caching)

### 1. Clone repository

```bash
git clone <repository-url>
cd contract
```

### 2. Cài đặt dependencies

```bash
# Backend
cd contract-management
npm install

# Frontend
cd ../contract-MNG-client
npm install
```

### 3. Cấu hình database

```bash
# Tạo database
createdb contract_management

# Chạy migrations
cd contract-management
npm run migration:run

# Seed data (optional)
npm run seed
```

### 4. Cấu hình environment

```bash
# Backend (.env)
cp .env.example .env

# Cập nhật các biến môi trường
DATABASE_URL=postgresql://username:password@localhost:5432/contract_management
JWT_SECRET=your-jwt-secret
UPLOAD_PATH=./uploads
```

### 5. Chạy ứng dụng

```bash
# Backend (development)
cd contract-management
npm run start:dev

# Frontend (development)
cd contract-MNG-client
npm run dev
```

## 🏗️ Cấu trúc project

```
contract/
├── contract-management/          # Backend API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── contract/        # Contract management
│   │   │   ├── auth/           # Authentication
│   │   │   ├── user/           # User management
│   │   │   └── uploadFile/     # File upload
│   │   ├── core/
│   │   │   ├── domain/         # Entities
│   │   │   ├── dto/           # Data Transfer Objects
│   │   │   └── shared/        # Shared utilities
│   │   └── main.ts
│   └── package.json
│
└── contract-MNG-client/         # Frontend
    ├── src/
    │   ├── components/         # React components
    │   ├── pages/             # Page components
    │   ├── services/          # API services
    │   ├── store/             # Redux store
    │   └── types/             # TypeScript types
    └── package.json
```

## 📚 API Documentation

Xem chi tiết API tại: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Start API Examples

```bash
# Tạo hợp đồng mới
curl -X POST http://localhost:3000/api/contracts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hợp đồng lao động",
    "contract_type": "employment",
    "mode": "form"
  }'

# Lấy danh sách hợp đồng
curl -X GET "http://localhost:3000/api/contracts?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tạo milestone
curl -X POST http://localhost:3000/api/contracts/CONTRACT_ID/milestones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ký kết hợp đồng",
    "due_date": "2024-01-15"
  }'
```

## 🔧 Development

### Scripts có sẵn

```bash
# Backend
npm run start:dev      # Development mode
npm run build         # Build production
npm run start:prod    # Production mode
npm run test          # Run tests
npm run test:e2e      # Run e2e tests
npm run migration:run # Run migrations
npm run migration:generate # Generate migration

# Frontend
npm run dev           # Development mode
npm run build         # Build production
npm run preview       # Preview build
npm run test          # Run tests
```

### Code Style

```bash
# Backend
npm run lint          # ESLint
npm run format        # Prettier

# Frontend
npm run lint          # ESLint
npm run format        # Prettier
```

## 🧪 Testing

```bash
# Backend tests
npm run test          # Unit tests
npm run test:e2e      # Integration tests
npm run test:cov      # Coverage report

# Frontend tests
npm run test          # Unit tests
npm run test:coverage # Coverage report
```

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build và chạy với Docker Compose
docker-compose up -d

# Hoặc build từng service
docker build -t contract-api ./contract-management
docker build -t contract-client ./contract-MNG-client
```

### Manual Deployment

```bash
# Backend
cd contract-management
npm run build
npm run start:prod

# Frontend
cd contract-MNG-client
npm run build
# Deploy dist/ folder to web server
```

## 📊 Monitoring & Logging

- **Logging**: Winston logger với file rotation
- **Monitoring**: Health checks và metrics
- **Error Tracking**: Structured error logging
- **Performance**: Request timing và database queries

## 🔒 Security

- **Authentication**: JWT với refresh tokens
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive validation
- **File Upload**: Secure file handling
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Input sanitization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@yourcompany.com

## 🔄 Changelog

### v1.0.0 (2024-01-01)

- ✅ Initial release
- ✅ Core contract management features
- ✅ Basic workflow and approval system
- ✅ File upload and management
- ✅ User authentication and authorization

### v1.1.0 (Planned)

- 🔄 Advanced analytics dashboard
- 🔄 Multi-language support
- 🔄 Mobile responsive design
- 🔄 Advanced reporting features
