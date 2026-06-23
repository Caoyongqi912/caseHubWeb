import { STEP_TAG_BASE_STYLE } from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/tagConfig';
import { HolderOutlined } from '@ant-design/icons';
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
  // inline-flex 让图标和 Tag 在 div 内排成一行，div 本身也不会因为 block 占满父宽度，
  // 把 Space 里后面的 Tag 挤到下一行。
  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation(); // 防止触发卡片点击事件
      }}
      {...attributes}
      {...listeners}
      style={{ ...style, display: 'inline-flex', alignItems: 'center' }}
    >
      <HolderOutlined style={{ color: '#c3cad4', marginRight: 20 }} />
      {/* 跟同行的渐变 / 公共私有 / conditionKey 等标签共用同一份基础尺寸，避免高度不齐。 */}
      <Tag color="green" variant="solid" style={{ ...STEP_TAG_BASE_STYLE }}>
        STEP_{step}
      </Tag>
    </div>
  );
};

export default Handler;
