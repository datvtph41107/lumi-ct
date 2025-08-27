import React from 'react';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableBlockItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  id,
  children,
  className = '',
  disabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-block-item ${className} ${isDragging ? 'dragging' : ''}`}
      {...attributes}
    >
      <div className="sortable-block-item__drag-handle" {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className="sortable-block-item__content">
        {children}
      </div>
    </div>
  );
};

export const SortableBlockList: React.FC<{
  items: string[];
  children: (id: string) => React.ReactNode;
}> = ({ items, children }) => {
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      {items.map((id) => (
        <SortableBlockItem key={id} id={id}>
          {children(id)}
        </SortableBlockItem>
      ))}
    </SortableContext>
  );
};