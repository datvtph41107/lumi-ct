import { Template } from '../store/templateStore';
import { FieldDef } from '../store/fieldStore';

export const sampleTemplate: Template = {
  id: 'sample-contract',
  name: 'Hợp đồng thuê nhà - Mẫu A',
  description: 'Mẫu hợp đồng thuê nhà cơ bản',
  version: 1,
  docSchema: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'HỢP ĐỒNG THUÊ NHÀ' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Số: ' },
          {
            type: 'inlineField',
            attrs: {
              key: 'contract_number',
              label: 'Số hợp đồng',
              type: 'text',
              required: true,
            },
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hôm nay, ngày ' },
          {
            type: 'inlineField',
            attrs: {
              key: 'sign_date',
              label: 'Ngày ký',
              type: 'date',
              format: 'DD/MM/YYYY',
            },
          },
          { type: 'text', text: ' chúng tôi gồm:' },
        ],
      },
      {
        type: 'clauseBlock',
        attrs: { title: 'Thông tin các bên', number: 1 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'BÊN CHO THUÊ (Bên A):' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Họ và tên: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'landlord_name',
                  label: 'Tên chủ nhà',
                  type: 'text',
                  required: true,
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Địa chỉ: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'landlord_address',
                  label: 'Địa chỉ chủ nhà',
                  type: 'textarea',
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Số điện thoại: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'landlord_phone',
                  label: 'SĐT chủ nhà',
                  type: 'phone',
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'BÊN THUÊ (Bên B):' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Họ và tên: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'tenant_name',
                  label: 'Tên người thuê',
                  type: 'text',
                  required: true,
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Địa chỉ: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'tenant_address',
                  label: 'Địa chỉ người thuê',
                  type: 'textarea',
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Số điện thoại: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'tenant_phone',
                  label: 'SĐT người thuê',
                  type: 'phone',
                },
              },
            ],
          },
        ],
      },
      {
        type: 'clauseBlock',
        attrs: { title: 'Đối tượng và thời hạn thuê', number: 2 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Địa chỉ nhà cho thuê: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'property_address',
                  label: 'Địa chỉ nhà',
                  type: 'textarea',
                  required: true,
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Thời hạn thuê: Từ ngày ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'start_date',
                  label: 'Ngày bắt đầu',
                  type: 'date',
                  format: 'DD/MM/YYYY',
                },
              },
              { type: 'text', text: ' đến ngày ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'end_date',
                  label: 'Ngày kết thúc',
                  type: 'date',
                  format: 'DD/MM/YYYY',
                },
              },
            ],
          },
        ],
      },
      {
        type: 'clauseBlock',
        attrs: { title: 'Giá thuê và phương thức thanh toán', number: 3 },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Giá thuê: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'rent_amount',
                  label: 'Số tiền thuê',
                  type: 'money',
                  format: 'VND',
                  required: true,
                },
              },
              { type: 'text', text: ' đồng/tháng' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Tiền cọc: ' },
              {
                type: 'inlineField',
                attrs: {
                  key: 'deposit_amount',
                  label: 'Tiền cọc',
                  type: 'money',
                  format: 'VND',
                },
              },
              { type: 'text', text: ' đồng' },
            ],
          },
        ],
      },
      {
        type: 'signatureBlock',
        attrs: {
          parties: ['A', 'B'],
          signatureType: 'manual',
        },
      },
    ],
  },
  fieldsSchema: [
    {
      key: 'contract_number',
      label: 'Số hợp đồng',
      type: 'text',
      required: true,
      placeholder: 'HD-2024-001',
    },
    {
      key: 'sign_date',
      label: 'Ngày ký',
      type: 'date',
      format: 'DD/MM/YYYY',
      required: true,
    },
    {
      key: 'landlord_name',
      label: 'Tên chủ nhà',
      type: 'text',
      required: true,
      placeholder: 'Nguyễn Văn A',
    },
    {
      key: 'landlord_address',
      label: 'Địa chỉ chủ nhà',
      type: 'textarea',
      placeholder: 'Số 123, đường ABC, quận XYZ, TP.HCM',
    },
    {
      key: 'landlord_phone',
      label: 'SĐT chủ nhà',
      type: 'phone',
      placeholder: '0901234567',
    },
    {
      key: 'tenant_name',
      label: 'Tên người thuê',
      type: 'text',
      required: true,
      placeholder: 'Trần Thị B',
    },
    {
      key: 'tenant_address',
      label: 'Địa chỉ người thuê',
      type: 'textarea',
      placeholder: 'Số 456, đường DEF, quận UVW, TP.HCM',
    },
    {
      key: 'tenant_phone',
      label: 'SĐT người thuê',
      type: 'phone',
      placeholder: '0987654321',
    },
    {
      key: 'property_address',
      label: 'Địa chỉ nhà',
      type: 'textarea',
      required: true,
      placeholder: 'Số 789, đường GHI, quận KLM, TP.HCM',
    },
    {
      key: 'start_date',
      label: 'Ngày bắt đầu',
      type: 'date',
      format: 'DD/MM/YYYY',
      required: true,
    },
    {
      key: 'end_date',
      label: 'Ngày kết thúc',
      type: 'date',
      format: 'DD/MM/YYYY',
      required: true,
    },
    {
      key: 'rent_amount',
      label: 'Số tiền thuê',
      type: 'money',
      format: 'VND',
      required: true,
      placeholder: '5000000',
    },
    {
      key: 'deposit_amount',
      label: 'Tiền cọc',
      type: 'money',
      format: 'VND',
      placeholder: '10000000',
    },
  ],
  layout: {
    pageSize: 'A4',
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
};