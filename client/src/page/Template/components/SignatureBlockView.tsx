import React, { useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useUIModeStore } from '../store/uiModeStore';
import { useTemplateStore } from '../store/templateStore';
import { formatValue } from '../utils/formatters';
import './SignatureBlockView.scss';

export const SignatureBlockView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const { mode } = useUIModeStore();
  const { getContractData } = useTemplateStore();

  const parties = node.attrs.parties || ['A', 'B'];
  const signatureType = node.attrs.signatureType || 'digital';
  const date = node.attrs.date;
  const location = node.attrs.location;

  const handleEditClick = useCallback(() => {
    if (mode === 'edit') {
      console.log('Edit signature block properties');
    }
  }, [mode]);

  const renderEditMode = () => {
    return (
      <div className="signature-block__edit" onClick={handleEditClick}>
        <div className="signature-block__header">
          <span className="signature-block__title">Chữ ký</span>
          <span className="signature-block__type">({signatureType})</span>
        </div>
        
        <div className="signature-block__parties">
          {parties.map((party: string, index: number) => (
            <div key={party} className="signature-block__party">
              <div className="signature-block__party-label">Bên {party}</div>
              <div className="signature-block__signature-placeholder">
                <div className="signature-block__signature-line"></div>
                <small>Chữ ký</small>
              </div>
            </div>
          ))}
        </div>
        
        <div className="signature-block__footer">
          <div className="signature-block__date">
            Ngày: {date || '[Ngày ký]'}
          </div>
          {location && (
            <div className="signature-block__location">
              Tại: {location}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFillMode = () => {
    return (
      <div className="signature-block__fill">
        <div className="signature-block__header">
          <span className="signature-block__title">Chữ ký</span>
        </div>
        
        <div className="signature-block__parties">
          {parties.map((party: string, index: number) => (
            <div key={party} className="signature-block__party">
              <div className="signature-block__party-label">Bên {party}</div>
              <div className="signature-block__signature-input">
                <input
                  type="text"
                  placeholder="Tên người ký"
                  className="signature-block__name-input"
                />
                <div className="signature-block__signature-line"></div>
                <small>Chữ ký</small>
              </div>
            </div>
          ))}
        </div>
        
        <div className="signature-block__footer">
          <div className="signature-block__date-input">
            <label>Ngày ký:</label>
            <input type="date" className="signature-block__date-field" />
          </div>
          <div className="signature-block__location-input">
            <label>Tại:</label>
            <input type="text" placeholder="Địa điểm" className="signature-block__location-field" />
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewMode = () => {
    return (
      <div className="signature-block__preview">
        <div className="signature-block__header">
          <span className="signature-block__title">Chữ ký</span>
        </div>
        
        <div className="signature-block__parties">
          {parties.map((party: string, index: number) => (
            <div key={party} className="signature-block__party">
              <div className="signature-block__party-label">Bên {party}</div>
              <div className="signature-block__signature-display">
                <div className="signature-block__signature-line"></div>
                <small>Chữ ký</small>
              </div>
            </div>
          ))}
        </div>
        
        <div className="signature-block__footer">
          <div className="signature-block__date-display">
            Ngày: {date || '[Ngày ký]'}
          </div>
          {location && (
            <div className="signature-block__location-display">
              Tại: {location}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (mode) {
      case 'edit':
        return renderEditMode();
      case 'fill':
        return renderFillMode();
      case 'preview':
        return renderPreviewMode();
      default:
        return renderEditMode();
    }
  };

  return (
    <NodeViewWrapper className="signature-block">
      {renderContent()}
    </NodeViewWrapper>
  );
};