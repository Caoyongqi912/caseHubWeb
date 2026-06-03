import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ReactNode } from 'react';

import { ITestCase } from '@/pages/CaseHub/types';

interface PlanCaseSortableWrapperProps {
  /** 用例列表（用于构建 SortableContext 的 items） */
  items: ITestCase[];
  /** 拖拽结束回调，参数为 (activeId, overId) */
  onReorder: (activeId: number, overId: number) => void;
  children: ReactNode;
}

/**
 * PlanCaseSortableWrapper
 * 包裹虚拟列表（VariableSizeList），提供 DnD 排序上下文
 *
 * 设计要点：
 * - 使用 PointerSensor + distance:5 避免误触点击
 * - 支持 KeyboardSensor 实现无障碍操作
 * - verticalListSortingStrategy 匹配垂直列表布局
 */
const PlanCaseSortableWrapper: React.FC<PlanCaseSortableWrapperProps> = ({
  items,
  onReorder,
  children,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id !== over.id) {
      onReorder(Number(active.id), Number(over.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((c) => c.id!).filter(Boolean)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default PlanCaseSortableWrapper;
