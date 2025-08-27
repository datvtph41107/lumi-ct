import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableBlockItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  data?: any;
}

export const DraggableBlockItem: React.FC<DraggableBlockItemProps> = ({
  id,
  children,
  className = '',
  data,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-block-item ${className} ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};