import { DocumentTreeManager } from './DocumentTreeManager';
import { FieldBindingManager } from './FieldBindingManager';
import { ConditionalLogicEngine } from './ConditionalLogicEngine';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'json';
  includePageNumbers?: boolean;
  includeWatermark?: boolean;
  watermarkText?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  headerText?: string;
  footerText?: string;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ExportResult {
  success: boolean;
  data?: any;
  format: string;
  timestamp: number;
  error?: string;
  metadata?: {
    pageCount: number;
    wordCount: number;
    fieldCount: number;
    processingTime: number;
  };
}

export interface Version {
  id: string;
  timestamp: number;
  metadata: VersionMetadata;
  tree: any;
  diff: TreeDiff;
}

export interface VersionMetadata {
  author: string;
  message: string;
  tags?: string[];
  description?: string;
}

export interface TreeDiff {
  added: string[];
  removed: string[];
  modified: string[];
  changes: DiffChange[];
}

export interface DiffChange {
  nodeId: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
  path: string[];
}

export interface ExportTransformer {
  name: string;
  format: string;
  transform: (tree: any, options: ExportOptions) => Promise<ExportResult>;
}

export class ExportPipeline {
  private transformers = new Map<string, ExportTransformer>();
  private versions: Version[] = [];
  private currentVersion: number = 0;
  private treeManager: DocumentTreeManager;
  private fieldManager: FieldBindingManager;
  private conditionalEngine: ConditionalLogicEngine;

  constructor(
    treeManager: DocumentTreeManager,
    fieldManager: FieldBindingManager,
    conditionalEngine: ConditionalLogicEngine
  ) {
    this.treeManager = treeManager;
    this.fieldManager = fieldManager;
    this.conditionalEngine = conditionalEngine;
    this.initializeTransformers();
  }

  // Initialize default transformers
  private initializeTransformers(): void {
    // JSON transformer
    this.registerTransformer({
      name: 'JSON Transformer',
      format: 'json',
      transform: async (tree, options) => {
        const startTime = Date.now();
        const resolvedTree = await this.resolveFields(tree);
        const processingTime = Date.now() - startTime;

        return {
          success: true,
          data: resolvedTree,
          format: 'json',
          timestamp: Date.now(),
          metadata: {
            pageCount: 1,
            wordCount: this.countWords(resolvedTree),
            fieldCount: this.countFields(resolvedTree),
            processingTime
          }
        };
      }
    });

    // HTML transformer
    this.registerTransformer({
      name: 'HTML Transformer',
      format: 'html',
      transform: async (tree, options) => {
        const startTime = Date.now();
        const resolvedTree = await this.resolveFields(tree);
        const html = this.generateHTML(resolvedTree, options);
        const processingTime = Date.now() - startTime;

        return {
          success: true,
          data: html,
          format: 'html',
          timestamp: Date.now(),
          metadata: {
            pageCount: this.estimatePageCount(html),
            wordCount: this.countWords(resolvedTree),
            fieldCount: this.countFields(resolvedTree),
            processingTime
          }
        };
      }
    });

    // PDF transformer (placeholder)
    this.registerTransformer({
      name: 'PDF Transformer',
      format: 'pdf',
      transform: async (tree, options) => {
        const startTime = Date.now();
        const resolvedTree = await this.resolveFields(tree);
        const html = this.generateHTML(resolvedTree, options);
        // TODO: Implement PDF generation using jsPDF or similar
        const processingTime = Date.now() - startTime;

        return {
          success: true,
          data: html, // Placeholder - should be PDF buffer
          format: 'pdf',
          timestamp: Date.now(),
          metadata: {
            pageCount: this.estimatePageCount(html),
            wordCount: this.countWords(resolvedTree),
            fieldCount: this.countFields(resolvedTree),
            processingTime
          }
        };
      }
    });

    // DOCX transformer (placeholder)
    this.registerTransformer({
      name: 'DOCX Transformer',
      format: 'docx',
      transform: async (tree, options) => {
        const startTime = Date.now();
        const resolvedTree = await this.resolveFields(tree);
        // TODO: Implement DOCX generation using docx library
        const processingTime = Date.now() - startTime;

        return {
          success: true,
          data: resolvedTree, // Placeholder - should be DOCX buffer
          format: 'docx',
          timestamp: Date.now(),
          metadata: {
            pageCount: 1,
            wordCount: this.countWords(resolvedTree),
            fieldCount: this.countFields(resolvedTree),
            processingTime
          }
        };
      }
    });
  }

  // Register export transformer
  registerTransformer(transformer: ExportTransformer): void {
    this.transformers.set(transformer.format, transformer);
  }

  // Export document
  async exportDocument(format: string, options: ExportOptions): Promise<ExportResult> {
    try {
      const startTime = Date.now();

      // 1. Get current document tree
      const tree = this.treeManager.getTree();

      // 2. Resolve all field values
      const resolvedTree = await this.resolveFields(tree);

      // 3. Apply conditional logic
      const filteredTree = await this.applyConditionalLogic(resolvedTree);

      // 4. Generate numbering
      this.treeManager.generateNumbering();

      // 5. Update cross-references
      this.treeManager.updateCrossReferences();

      // 6. Transform to target format
      const transformer = this.transformers.get(format);
      if (!transformer) {
        throw new Error(`Unsupported export format: ${format}`);
      }

      const result = await transformer.transform(filteredTree, options);
      const totalProcessingTime = Date.now() - startTime;

      // Update metadata with total processing time
      if (result.metadata) {
        result.metadata.processingTime = totalProcessingTime;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        format,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Resolve field values in document tree
  private async resolveFields(tree: any): Promise<any> {
    const resolvedTree = JSON.parse(JSON.stringify(tree)); // Deep clone
    
    const resolveNodeFields = (node: any): void => {
      // Replace field placeholders in content
      if (node.content && typeof node.content === 'string') {
        node.content = this.replaceFieldPlaceholders(node.content);
      }

      // Resolve field nodes
      if (node.content && typeof node.content === 'object' && node.content.fieldKey) {
        const fieldValue = this.fieldManager.getFieldValue(node.content.fieldKey);
        node.content.value = fieldValue;
      }

      // Recursive call for children
      if (node.children) {
        node.children.forEach((childId: string) => {
          const child = resolvedTree.nodes.get(childId);
          if (child) {
            resolveNodeFields(child);
          }
        });
      }
    };

    resolveNodeFields(resolvedTree.root);
    return resolvedTree;
  }

  // Replace field placeholders in text
  private replaceFieldPlaceholders(content: string): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, fieldKey) => {
      const value = this.fieldManager.getFieldValue(fieldKey);
      return value || match;
    });
  }

  // Apply conditional logic to filter visible blocks
  private async applyConditionalLogic(tree: any): Promise<any> {
    const filteredTree = JSON.parse(JSON.stringify(tree));
    
    const filterNode = (node: any): boolean => {
      // Check if node should be visible
      if (node.metadata && node.metadata.visible === false) {
        return false;
      }

      // Filter children
      if (node.children) {
        node.children = node.children.filter((childId: string) => {
          const child = filteredTree.nodes.get(childId);
          return child ? filterNode(child) : false;
        });
      }

      return true;
    };

    filterNode(filteredTree.root);
    return filteredTree;
  }

  // Generate HTML from resolved tree
  private generateHTML(tree: any, options: ExportOptions): string {
    let html = '<!DOCTYPE html>\n<html>\n<head>\n';
    html += '<meta charset="UTF-8">\n';
    html += '<title>Document Export</title>\n';
    html += '<style>\n';
    html += this.generateCSS(options);
    html += '</style>\n</head>\n<body>\n';

    // Add watermark if requested
    if (options.includeWatermark && options.watermarkText) {
      html += `<div class="watermark">${options.watermarkText}</div>\n`;
    }

    // Add header if requested
    if (options.includeHeader && options.headerText) {
      html += `<header class="document-header">${options.headerText}</header>\n`;
    }

    // Generate content
    html += this.generateContentHTML(tree.root, tree.nodes);

    // Add footer if requested
    if (options.includeFooter && options.footerText) {
      html += `<footer class="document-footer">${options.footerText}</footer>\n`;
    }

    // Add page numbers if requested
    if (options.includePageNumbers) {
      html += '<div class="page-numbers"></div>\n';
    }

    html += '</body>\n</html>';
    return html;
  }

  // Generate CSS for HTML export
  private generateCSS(options: ExportOptions): string {
    let css = `
      body {
        font-family: 'Times New Roman', serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px;
        background: white;
      }
      
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 48px;
        color: rgba(0,0,0,0.1);
        z-index: -1;
        pointer-events: none;
      }
      
      .document-header {
        text-align: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      
      .document-footer {
        text-align: center;
        border-top: 1px solid #000;
        padding-top: 10px;
        margin-top: 20px;
      }
      
      .page-numbers {
        text-align: center;
        margin-top: 20px;
      }
      
      .clause {
        margin: 10px 0;
        padding: 10px;
        border-left: 3px solid #007bff;
      }
      
      .field {
        background: #f8f9fa;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: bold;
      }
      
      .table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      
      .table th, .table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      
      .table th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
    `;

    // Add page size specific styles
    if (options.pageSize === 'A4') {
      css += `
        @page {
          size: A4;
          margin: ${options.margins?.top || 20}mm ${options.margins?.right || 20}mm ${options.margins?.bottom || 20}mm ${options.margins?.left || 20}mm;
        }
      `;
    }

    return css;
  }

  // Generate content HTML recursively
  private generateContentHTML(node: any, nodes: Map<string, any>): string {
    let html = '';

    // Generate content based on node type
    switch (node.type) {
      case 'block':
        if (node.content && typeof node.content === 'string') {
          html += `<p>${node.content}</p>\n`;
        } else if (node.content && node.content.blockType === 'tableBlock') {
          html += this.generateTableHTML(node.content);
        } else if (node.content && node.content.blockType === 'clauseBlock') {
          html += `<div class="clause">${node.content.title || 'Clause'}</div>\n`;
        }
        break;
      case 'field':
        if (node.content && node.content.value) {
          html += `<span class="field">${node.content.value}</span>\n`;
        }
        break;
    }

    // Generate children
    if (node.children) {
      node.children.forEach((childId: string) => {
        const child = nodes.get(childId);
        if (child) {
          html += this.generateContentHTML(child, nodes);
        }
      });
    }

    return html;
  }

  // Generate table HTML
  private generateTableHTML(tableData: any): string {
    let html = '<table class="table">\n<thead>\n<tr>\n';
    
    // Generate headers
    if (tableData.headers) {
      tableData.headers.forEach((header: string) => {
        html += `<th>${header}</th>\n`;
      });
    }
    
    html += '</tr>\n</thead>\n<tbody>\n';
    
    // Generate rows (placeholder - should use actual table data)
    for (let i = 0; i < (tableData.rows || 3); i++) {
      html += '<tr>\n';
      for (let j = 0; j < (tableData.cols || 3); j++) {
        html += '<td>Sample data</td>\n';
      }
      html += '</tr>\n';
    }
    
    html += '</tbody>\n</table>\n';
    return html;
  }

  // Count words in document
  private countWords(tree: any): number {
    let wordCount = 0;
    
    const countNodeWords = (node: any): void => {
      if (node.content && typeof node.content === 'string') {
        wordCount += node.content.split(/\s+/).length;
      }
      
      if (node.children) {
        node.children.forEach((childId: string) => {
          const child = tree.nodes.get(childId);
          if (child) {
            countNodeWords(child);
          }
        });
      }
    };

    countNodeWords(tree.root);
    return wordCount;
  }

  // Count fields in document
  private countFields(tree: any): number {
    let fieldCount = 0;
    
    const countNodeFields = (node: any): void => {
      if (node.type === 'field') {
        fieldCount++;
      }
      
      if (node.children) {
        node.children.forEach((childId: string) => {
          const child = tree.nodes.get(childId);
          if (child) {
            countNodeFields(child);
          }
        });
      }
    };

    countNodeFields(tree.root);
    return fieldCount;
  }

  // Estimate page count based on content
  private estimatePageCount(html: string): number {
    // Rough estimation: 500 words per page
    const wordCount = html.split(/\s+/).length;
    return Math.ceil(wordCount / 500);
  }

  // Create new version
  createVersion(metadata: VersionMetadata): string {
    const versionId = `v${this.versions.length + 1}`;
    const currentTree = this.treeManager.getTree();
    
    const version: Version = {
      id: versionId,
      timestamp: Date.now(),
      metadata,
      tree: JSON.parse(JSON.stringify(currentTree)), // Deep clone
      diff: this.calculateDiff(this.getCurrentTree(), currentTree)
    };

    this.versions.push(version);
    this.currentVersion = this.versions.length - 1;

    return versionId;
  }

  // Get current tree (for diff calculation)
  private getCurrentTree(): any {
    if (this.currentVersion >= 0 && this.versions[this.currentVersion]) {
      return this.versions[this.currentVersion].tree;
    }
    return null;
  }

  // Calculate diff between trees
  private calculateDiff(oldTree: any, newTree: any): TreeDiff {
    const diff: TreeDiff = {
      added: [],
      removed: [],
      modified: [],
      changes: []
    };

    if (!oldTree) {
      // First version - everything is added
      newTree.nodes.forEach((node: any, nodeId: string) => {
        diff.added.push(nodeId);
        diff.changes.push({
          nodeId,
          type: 'added',
          newValue: node,
          path: [nodeId]
        });
      });
      return diff;
    }

    // Compare nodes
    const oldNodes = oldTree.nodes;
    const newNodes = newTree.nodes;

    // Find added and modified nodes
    newNodes.forEach((newNode: any, nodeId: string) => {
      const oldNode = oldNodes.get(nodeId);
      if (!oldNode) {
        diff.added.push(nodeId);
        diff.changes.push({
          nodeId,
          type: 'added',
          newValue: newNode,
          path: [nodeId]
        });
      } else if (JSON.stringify(oldNode) !== JSON.stringify(newNode)) {
        diff.modified.push(nodeId);
        diff.changes.push({
          nodeId,
          type: 'modified',
          oldValue: oldNode,
          newValue: newNode,
          path: [nodeId]
        });
      }
    });

    // Find removed nodes
    oldNodes.forEach((oldNode: any, nodeId: string) => {
      if (!newNodes.has(nodeId)) {
        diff.removed.push(nodeId);
        diff.changes.push({
          nodeId,
          type: 'removed',
          oldValue: oldNode,
          path: [nodeId]
        });
      }
    });

    return diff;
  }

  // Rollback to previous version
  rollbackToVersion(versionId: string): boolean {
    const version = this.versions.find(v => v.id === versionId);
    if (!version) {
      return false;
    }

    this.currentVersion = this.versions.indexOf(version);
    
    // Restore tree
    this.treeManager.importFromJSON(JSON.stringify(version.tree));
    
    return true;
  }

  // Get version by ID
  getVersion(versionId: string): Version | undefined {
    return this.versions.find(v => v.id === versionId);
  }

  // Get all versions
  getAllVersions(): Version[] {
    return [...this.versions];
  }

  // Get current version
  getCurrentVersion(): Version | undefined {
    if (this.currentVersion >= 0 && this.versions[this.currentVersion]) {
      return this.versions[this.currentVersion];
    }
    return undefined;
  }

  // Delete version
  deleteVersion(versionId: string): boolean {
    const index = this.versions.findIndex(v => v.id === versionId);
    if (index === -1) {
      return false;
    }

    this.versions.splice(index, 1);
    
    // Update current version if necessary
    if (this.currentVersion >= index) {
      this.currentVersion = Math.max(0, this.currentVersion - 1);
    }

    return true;
  }

  // Get export statistics
  getExportStats(): {
    totalVersions: number;
    currentVersion: number;
    supportedFormats: string[];
    transformersCount: number;
  } {
    return {
      totalVersions: this.versions.length,
      currentVersion: this.currentVersion,
      supportedFormats: Array.from(this.transformers.keys()),
      transformersCount: this.transformers.size
    };
  }
}