# Contract Management Server - Updated Version

## Overview

Server đã được cập nhật hoàn chỉnh với các thay đổi sau:

### 🔄 **Thay đổi chính**

1. **Loại bỏ hoàn toàn mối quan hệ (Relationships)**
   - Tất cả entity đã được cập nhật để chỉ sử dụng foreign key đơn giản
   - Không còn sử dụng `@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany`
   - Không còn sử dụng `@JoinColumn`, `@JoinTable`

2. **Cập nhật Service Layer**
   - Tất cả service đã được cập nhật để sử dụng `DataSource` thay vì `@InjectRepository`
   - Loại bỏ `TypeOrmModule.forFeature()` trong các module
   - Sử dụng `this.db.getRepository()` để truy cập repository

3. **Cập nhật Module Structure**
   - Tất cả module đã được cập nhật để không sử dụng `TypeOrmModule`
   - Chỉ sử dụng `DatabaseModule` và `LoggerModule` cho dependency injection

### 🏗️ **Cấu trúc Entity mới**

#### User Entity
```typescript
@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: Role })
    role: Role;

    @Column({ type: 'bigint', nullable: true })
    department_id?: number;
}
```

#### Contract Entity
```typescript
@Entity('contracts')
export class Contract extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'char', length: 36, nullable: true })
    created_by?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    updated_by?: string;
}
```

### 🔧 **Cách sử dụng Service mới**

#### UserService Example
```typescript
@Injectable()
export class UserService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
    ) {}

    async getUserById(userId: number) {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: userId },
        });
        return user;
    }
}
```

### 📁 **Cấu trúc thư mục đã cập nhật**

```
server/
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── user/
│   │   │   │   ├── user.entity.ts ✅
│   │   │   │   └── user-session.entity.ts ✅
│   │   │   ├── contract/
│   │   │   │   ├── contract.entity.ts ✅
│   │   │   │   ├── contract-draft.entity.ts ✅
│   │   │   │   └── ...
│   │   │   └── permission/
│   │   │       ├── role.entity.ts ✅
│   │   │       ├── user-role.entity.ts ✅
│   │   │       └── ...
│   │   └── ...
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.service.ts ✅
│   │   │   ├── user.controller.ts ✅
│   │   │   └── user.module.ts ✅
│   │   ├── contract/
│   │   │   ├── contract.service.ts ✅
│   │   │   ├── contract.controller.ts ✅
│   │   │   └── contract.module.ts ✅
│   │   └── auth/
│   │       ├── auth.service.ts ✅
│   │       ├── auth-core.service.ts ✅
│   │       └── auth.module.ts ✅
│   └── providers/
│       └── database/
│           ├── db.provider.ts ✅
│           └── db.module.ts ✅
```

### 🚀 **Cách chạy server**

1. **Cài đặt dependencies**
```bash
npm install
```

2. **Cấu hình database**
- Tạo file `.env` với thông tin database
- Đảm bảo database đã được tạo

3. **Chạy migrations**
```bash
npm run migration:run
```

4. **Chạy seeds (nếu cần)**
```bash
npm run seed
```

5. **Khởi động server**
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

### 🔍 **API Endpoints**

#### User Management
- `GET /users/:id` - Lấy thông tin user
- `PUT /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user
- `GET /manager/staff` - Lấy danh sách staff trong department
- `POST /manager/staff` - Tạo staff mới

#### Contract Management
- `GET /contracts` - Lấy danh sách contracts
- `POST /contracts` - Tạo contract mới
- `GET /contracts/:id` - Lấy thông tin contract
- `PUT /contracts/:id` - Cập nhật contract
- `DELETE /contracts/:id` - Xóa contract

#### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Đăng xuất

### ⚠️ **Lưu ý quan trọng**

1. **Database Schema**: Đảm bảo database schema đã được cập nhật để phù hợp với entity mới
2. **Foreign Keys**: Tất cả foreign key đã được định nghĩa đúng cách
3. **Indexes**: Các index đã được tối ưu cho performance
4. **Transactions**: Sử dụng queryRunner cho các operation phức tạp

### 🔧 **Troubleshooting**

1. **Lỗi import**: Kiểm tra lại các import path trong service
2. **Lỗi database**: Đảm bảo database connection đúng
3. **Lỗi permission**: Kiểm tra lại cấu hình permission trong AuthCoreService

### 📝 **Migration Notes**

- Tất cả entity đã được cập nhật để không sử dụng relationships
- Service layer đã được refactor để sử dụng DataSource
- Module structure đã được đơn giản hóa
- Performance được cải thiện do loại bỏ lazy loading

---

**Server đã sẵn sàng để sử dụng với cấu trúc mới!** 🎉