import { ProCard } from '@ant-design/pro-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState } from 'react';

interface SortableItemProps {
  id: number;
  children: React.ReactNode;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const [canDraggable, setCanDraggable] = useState<boolean>(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    // disabled:true
    disabled: canDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    borderRadius: 8,
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        // isDragging,
        // dragAttributes: canDraggable ? attributes : {},
        // dragListeners: canDraggable ? listeners : {},
        setCanDraggable: (canDraggable: boolean) =>
          setCanDraggable(canDraggable),
      });
    }
    return child;
  });
  return (
    <ProCard bodyStyle={{ padding: 4 }}>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    </ProCard>
  );
};
