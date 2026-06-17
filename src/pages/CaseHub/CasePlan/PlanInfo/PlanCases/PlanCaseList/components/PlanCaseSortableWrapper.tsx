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

/** 拖拽相对 over 节点的落点位置 */
export type DropPosition = 'before' | 'after';

interface PlanCaseSortableWrapperProps {
  /** 用例列表（用于构建 SortableContext 的 items） */
  items: ITestCase[];
  /**
   * 拖拽结束回调
   * @param activeId 被拖拽的用例 ID
   * @param overId 目标位置的用例 ID（dnd-kit 提供的 drop target）
   * @param dropPosition 相对 over 的落点：'before' = 落到 over 之上；'after' = 落到 over 之下
   */
  onReorder: (
    activeId: number,
    overId: number,
    dropPosition: DropPosition,
  ) => void;
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
    if (active.id === over.id) return;

    // 判定落点：active 拖动后中心在 over 中心之上 -> 落到 over 之前
    const activeRect = active.rect.current.translated;
    const overRect = over.rect;
    let dropPosition: DropPosition = 'after';
    if (activeRect && overRect) {
      const activeCenterY = activeRect.top + activeRect.height / 2;
      const overCenterY = overRect.top + overRect.height / 2;
      dropPosition = activeCenterY < overCenterY ? 'before' : 'after';
    }

    onReorder(Number(active.id), Number(over.id), dropPosition);
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
