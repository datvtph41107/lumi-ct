import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

interface DndContextType {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const DndContextContext = createContext<DndContextType | null>(null);

export const useDndContext = () => {
  const context = useContext(DndContextContext);
  if (!context) {
    throw new Error('useDndContext must be used within a DndProvider');
  }
  return context;
};

interface DndProviderProps {
  children: React.ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
}

export const DndProvider: React.FC<DndProviderProps> = ({
  children,
  onDragEnd,
  onDragOver,
  onDragStart,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
    onDragStart?.(event);
  }, [onDragStart]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false);
    onDragEnd?.(event);
  }, [onDragEnd]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    onDragOver?.(event);
  }, [onDragOver]);

  return (
    <DndContextContext.Provider
      value={{
        activeId,
        setActiveId,
        isDragging,
        setIsDragging,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {children}
        <DragOverlay>
          {activeId ? (
            <div className="drag-overlay">
              <div className="drag-overlay__content">
                {activeId}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DndContextContext.Provider>
  );
};