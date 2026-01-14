import { UnorderedListOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tag } from 'antd';
import { FC } from 'react';

const Handler: FC<{ id: number; step: number }> = ({ id, step }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    borderRadius: 8,
  };
  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation(); // 防止触发卡片点击事件
      }}
      style={style}
      {...attributes}
      {...listeners}
    >
      <UnorderedListOutlined style={{ color: '#c3cad4', marginRight: 20 }} />
      <Tag color={'green-inverse'}>STEP_{step}</Tag>
    </div>
  );
};

export default Handler;
