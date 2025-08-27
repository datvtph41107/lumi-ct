import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TableBlockView } from '../components/TableBlockView';

export interface TableBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableBlock: {
      setTableBlock: (attributes?: { 
        title?: string;
        headers?: string[];
        rows?: number;
        cols?: number;
        autoNumbering?: boolean;
        showTotal?: boolean;
        totalRow?: number;
      }) => ReturnType;
      addTableRow: (position?: 'before' | 'after') => ReturnType;
      addTableColumn: (position?: 'before' | 'after') => ReturnType;
      deleteTableRow: () => ReturnType;
      deleteTableColumn: () => ReturnType;
      mergeCells: () => ReturnType;
      splitCell: () => ReturnType;
    };
  }
}

export const TableBlock = Node.create<TableBlockOptions>({
  name: 'tableBlock',
  group: 'block',
  content: 'table',
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      title: {
        default: 'Bảng dữ liệu',
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => {
          return {
            'data-title': attributes.title,
          };
        },
      },
      headers: {
        default: ['STT', 'Tên', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'],
        parseHTML: element => {
          const headers = element.getAttribute('data-headers');
          return headers ? JSON.parse(headers) : ['STT', 'Tên', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'];
        },
        renderHTML: attributes => {
          return {
            'data-headers': JSON.stringify(attributes.headers),
          };
        },
      },
      rows: {
        default: 3,
        parseHTML: element => parseInt(element.getAttribute('data-rows') || '3'),
        renderHTML: attributes => {
          return {
            'data-rows': attributes.rows,
          };
        },
      },
      cols: {
        default: 6,
        parseHTML: element => parseInt(element.getAttribute('data-cols') || '6'),
        renderHTML: attributes => {
          return {
            'data-cols': attributes.cols,
          };
        },
      },
      autoNumbering: {
        default: true,
        parseHTML: element => element.getAttribute('data-auto-numbering') === 'true',
        renderHTML: attributes => {
          return {
            'data-auto-numbering': attributes.autoNumbering,
          };
        },
      },
      showTotal: {
        default: false,
        parseHTML: element => element.getAttribute('data-show-total') === 'true',
        renderHTML: attributes => {
          return {
            'data-show-total': attributes.showTotal,
          };
        },
      },
      totalRow: {
        default: -1, // -1 means last row
        parseHTML: element => parseInt(element.getAttribute('data-total-row') || '-1'),
        renderHTML: attributes => {
          return {
            'data-total-row': attributes.totalRow,
          };
        },
      },
      cellData: {
        default: {},
        parseHTML: element => {
          const data = element.getAttribute('data-cell-data');
          return data ? JSON.parse(data) : {};
        },
        renderHTML: attributes => {
          return {
            'data-cell-data': JSON.stringify(attributes.cellData),
          };
        },
      },
      mergedCells: {
        default: [],
        parseHTML: element => {
          const merged = element.getAttribute('data-merged-cells');
          return merged ? JSON.parse(merged) : [];
        },
        renderHTML: attributes => {
          return {
            'data-merged-cells': JSON.stringify(attributes.mergedCells),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-table-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-table-block': 'true' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableBlockView);
  },

  addCommands() {
    return {
      setTableBlock:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
            content: [
              {
                type: 'table',
                content: this.generateTableContent(attributes),
              },
            ],
          });
        },

      addTableRow:
        (position = 'after') =>
        ({ tr, dispatch }) => {
          // Implementation for adding row
          return true;
        },

      addTableColumn:
        (position = 'after') =>
        ({ tr, dispatch }) => {
          // Implementation for adding column
          return true;
        },

      deleteTableRow:
        () =>
        ({ tr, dispatch }) => {
          // Implementation for deleting row
          return true;
        },

      deleteTableColumn:
        () =>
        ({ tr, dispatch }) => {
          // Implementation for deleting column
          return true;
        },

      mergeCells:
        () =>
        ({ tr, dispatch }) => {
          // Implementation for merging cells
          return true;
        },

      splitCell:
        () =>
        ({ tr, dispatch }) => {
          // Implementation for splitting cell
          return true;
        },
    };
  },

  generateTableContent(attributes: any) {
    const { headers = [], rows = 3, cols = 6, autoNumbering = true, showTotal = false } = attributes;
    const content = [];

    // Header row
    const headerRow = {
      type: 'tableRow',
      content: headers.map((header: string, index: number) => ({
        type: 'tableHeader',
        attrs: { colspan: 1, rowspan: 1 },
        content: [{ type: 'text', text: header }],
      })),
    };
    content.push(headerRow);

    // Data rows
    for (let i = 0; i < rows; i++) {
      const rowContent = [];
      for (let j = 0; j < cols; j++) {
        let cellText = '';
        
        if (j === 0 && autoNumbering) {
          cellText = (i + 1).toString();
        } else if (j === cols - 1 && showTotal) {
          cellText = '=SUM(E' + (i + 2) + ')'; // Excel-like formula
        }

        rowContent.push({
          type: 'tableCell',
          attrs: { colspan: 1, rowspan: 1 },
          content: [{ type: 'text', text: cellText }],
        });
      }
      content.push({
        type: 'tableRow',
        content: rowContent,
      });
    }

    return content;
  },
});