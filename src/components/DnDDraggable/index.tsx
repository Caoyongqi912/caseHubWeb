import { SortableItem } from '@/components/DnDDraggable/SortableItem';
import { DraggableItem } from '@/components/DnDDraggable/type';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { FC } from 'react';

interface Props {
  items: DraggableItem[];
  setItems: React.Dispatch<React.SetStateAction<DraggableItem[]>>;
  orderFetch: (newItems: any[]) => void;
}

const Index: FC<Props> = ({ items, setItems, orderFetch }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // activationConstraint: {
      //   distance: 5, // 需要移动5像素才触发拖拽
      // },
    }),
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates,
    // }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        orderFetch(newItems);
        return newItems;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {item.content}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default Index;
