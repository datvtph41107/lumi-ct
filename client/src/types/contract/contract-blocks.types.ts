export interface ContractBlock {
    id: string;
    type: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    template: string;
    required: boolean;
    isActive: boolean;
    order: number;
}

export const DEFAULT_CONTRACT_BLOCKS: ContractBlock[] = [
    {
        id: "intro-section",
        type: "introductory-section",
        title: "Phần giới thiệu",
        description: "Giới thiệu và tổng quan hợp đồng",
        category: "header",
        icon: "faFileText",
        template: `
      <h2>PHẦN GIỚI THIỆU</h2>
      <p>Hợp đồng này được ký kết giữa các bên như được nêu dưới đây:</p>
      <p><strong>Bên A:</strong> [Tên Công ty]</p>
      <p><strong>Bên B:</strong> [Tên Khách hàng]</p>
      <p><strong>Ngày:</strong> [Ngày ký hợp đồng]</p>
      <p><strong>Mục đích:</strong> [Mô tả ngắn gọn về mục đích hợp đồng]</p>
    `,
        required: true,
        isActive: true,
        order: 1,
    },
    {
        id: "scope-work",
        type: "scope-of-work",
        title: "Phạm vi công việc",
        description: "Xác định phạm vi và sản phẩm bàn giao",
        category: "content",
        icon: "faTasks",
        template: `
      <h2>PHẠM VI CÔNG VIỆC</h2>
      <p>Các dịch vụ và sản phẩm bàn giao sau đây được bao gồm trong hợp đồng này:</p>
      <ul>
        <li>Dịch vụ/Sản phẩm 1: [Mô tả]</li>
        <li>Dịch vụ/Sản phẩm 2: [Mô tả]</li>
        <li>Dịch vụ/Sản phẩm 3: [Mô tả]</li>
      </ul>
      <p><strong>Thời gian thực hiện:</strong> [Thời gian dự án]</p>
      <p><strong>Các mốc quan trọng:</strong></p>
      <ol>
        <li>Mốc 1: [Mô tả và thời hạn]</li>
        <li>Mốc 2: [Mô tả và thời hạn]</li>
        <li>Mốc 3: [Mô tả và thời hạn]</li>
      </ol>
    `,
        required: true,
        isActive: true,
        order: 2,
    },
    {
        id: "payment-terms",
        type: "payment-terms",
        title: "Điều khoản thanh toán",
        description: "Lịch trình và điều kiện thanh toán",
        category: "legal",
        icon: "faMoneyBill",
        template: `
      <h2>ĐIỀU KHOẢN THANH TOÁN</h2>
      <p><strong>Tổng giá trị hợp đồng:</strong> [Số tiền]</p>
      <p><strong>Lịch trình thanh toán:</strong></p>
      <ul>
        <li>Thanh toán ban đầu: [Số tiền] - Thanh toán khi ký hợp đồng</li>
        <li>Thanh toán tiến độ 1: [Số tiền] - Thanh toán khi [mốc thời gian]</li>
        <li>Thanh toán cuối cùng: [Số tiền] - Thanh toán khi hoàn thành</li>
      </ul>
      <p><strong>Phương thức thanh toán:</strong> [Chuyển khoản ngân hàng/Séc/Khác]</p>
      <p><strong>Thanh toán chậm:</strong> Lãi suất [%] mỗi tháng sẽ được áp dụng cho các khoản quá hạn.</p>
    `,
        required: false,
        isActive: true,
        order: 3,
    },
    {
        id: "terms-conditions",
        type: "terms-conditions",
        title: "Điều khoản và điều kiện",
        description: "Điều khoản chung và điều kiện pháp lý",
        category: "legal",
        icon: "faGavel",
        template: `
      <h2>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN</h2>
      <h3>1. Trách nhiệm</h3>
      <p><strong>Trách nhiệm của Bên A:</strong></p>
      <ul>
        <li>[Trách nhiệm 1]</li>
        <li>[Trách nhiệm 2]</li>
      </ul>
      <p><strong>Trách nhiệm của Bên B:</strong></p>
      <ul>
        <li>[Trách nhiệm 1]</li>
        <li>[Trách nhiệm 2]</li>
      </ul>
      
      <h3>2. Sở hữu trí tuệ</h3>
      <p>[Điều khoản sở hữu trí tuệ]</p>
      
      <h3>3. Bảo mật</h3>
      <p>[Điều khoản bảo mật]</p>
      
      <h3>4. Chấm dứt hợp đồng</h3>
      <p>[Điều kiện chấm dứt hợp đồng]</p>
    `,
        required: false,
        isActive: true,
        order: 4,
    },
    {
        id: "signatures",
        type: "signatures",
        title: "Chữ ký",
        description: "Phần chữ ký cho tất cả các bên",
        category: "signature",
        icon: "faSignature",
        template: `
      <h2>CHỮ KÝ</h2>
      <p>Bằng việc ký tên dưới đây, cả hai bên đồng ý với các điều khoản và điều kiện được nêu trong hợp đồng này.</p>
      
      <div style="margin-top: 40px;">
        <p><strong>Bên A:</strong></p>
        <p>Họ tên: _________________________</p>
        <p>Chức vụ: _________________________</p>
        <p>Chữ ký: _____________________</p>
        <p>Ngày: __________________________</p>
      </div>
      
      <div style="margin-top: 40px;">
        <p><strong>Bên B:</strong></p>
        <p>Họ tên: _________________________</p>
        <p>Chức vụ: _________________________</p>
        <p>Chữ ký: _____________________</p>
        <p>Ngày: __________________________</p>
      </div>
    `,
        required: true,
        isActive: true,
        order: 5,
    },
];

export const CONTRACT_TEMPLATES = [
    {
        id: "simple-contract",
        name: "Hợp đồng đơn giản",
        description: "Mẫu hợp đồng cơ bản",
        blocks: ["intro-section", "scope-work", "payment-terms", "signatures"],
    },
    {
        id: "service-agreement",
        name: "Hợp đồng dịch vụ",
        description: "Hợp đồng dịch vụ toàn diện",
        blocks: ["intro-section", "scope-work", "payment-terms", "terms-conditions", "signatures"],
    },
    {
        id: "consulting-contract",
        name: "Hợp đồng tư vấn",
        description: "Hợp đồng tư vấn chuyên nghiệp",
        blocks: ["intro-section", "scope-work", "payment-terms", "terms-conditions", "signatures"],
    },
];
