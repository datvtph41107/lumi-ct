import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import './DropPreview.scss';

interface DropPreviewProps {
  id: string;
  type: string;
  label: string;
  description?: string;
  icon?: string;
}

const DropPreview: React.FC<DropPreviewProps> = ({
  id,
  type,
  label,
  description,
  icon,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type,
      label,
      description,
      icon,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="drop-preview drop-preview--dragging"
        {...attributes}
        {...listeners}
      >
        <div className="drop-preview__content">
          <div className="drop-preview__icon">{icon || '📄'}</div>
          <div className="drop-preview__info">
            <div className="drop-preview__label">{label}</div>
            {description && (
              <div className="drop-preview__description">{description}</div>
            )}
          </div>
          <div className="drop-preview__indicator">
            <div className="drop-preview__arrow">→</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DropPreview;