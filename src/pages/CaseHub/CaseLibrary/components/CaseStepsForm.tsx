import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  HolderOutlined,
} from '@ant-design/icons';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Divider, Input, Popconfirm, Space, theme } from 'antd';
import { FC, useCallback, useState } from 'react';

const { TextArea } = Input;
const { useToken } = theme;

export interface TestCaseStep {
  order: number;
  action: string;
  expected_result: string;
}

export interface CaseStepsProps {
  value: TestCaseStep[];
  onChange: (steps: TestCaseStep[]) => void;
}

/**
 * 单个可拖拽步骤项组件
 * 支持拖拽排序、编辑、复制、删除操作
 */
function SortableStepItem({
  order,
  record,
  onDelete,
  onCopy,
  onChange,
}: {
  order: number;
  record: TestCaseStep;
  onDelete: (order: number) => void;
  onCopy: (record: TestCaseStep) => void;
  onChange: (
    order: number,
    field: 'action' | 'expected_result',
    value: string,
  ) => void;
}) {
  const { token } = useToken();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginBottom: 8,
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: isDragging
          ? `0 ${token.paddingXS}px ${token.paddingLG}px rgba(0, 0, 0, 0.1)`
          : 'none',
      }}
    >
      <Space.Compact style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <Button
          type="text"
          icon={<HolderOutlined />}
          style={{
            cursor: 'grab',
            touchAction: 'none',
            color: token.colorTextSecondary,
            margin: `${token.paddingXS}px`,
          }}
          {...attributes}
          {...listeners}
        />
        <TextArea
          placeholder="请输入操作步骤"
          value={record.action}
          onChange={(e) => onChange(order, 'action', e.target.value)}
          variant="borderless"
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{
            flex: 1,
            padding: `${token.paddingXS}px ${token.paddingSM}px`,
          }}
        />
        <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />
        <TextArea
          placeholder="请输入预期结果"
          value={record.expected_result}
          autoSize={{ minRows: 1, maxRows: 4 }}
          onChange={(e) => onChange(order, 'expected_result', e.target.value)}
          variant="borderless"
          style={{
            flex: 1,
            padding: `${token.paddingXS}px ${token.paddingSM}px`,
          }}
        />
        <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />
        <Space size={4} style={{ paddingRight: token.paddingSM }}>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => onCopy(record)}
            style={{ color: token.colorPrimary }}
          >
            复制
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条步骤吗？"
            onConfirm={() => onDelete(order)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </Space.Compact>
    </div>
  );
}

/**
 * 测试步骤编辑组件
 * 支持拖拽排序、新增、复制、删除、编辑操作
 */
const CaseStepsForm: FC<CaseStepsProps> = ({ value: steps, onChange }) => {
  const { token } = useToken();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [stepCounter, setStepCounter] = useState(1);

  const getNextOrder = useCallback(() => {
    const maxOrder = steps.reduce((max, step) => Math.max(max, step.order), 0);
    const nextOrder = maxOrder >= stepCounter ? maxOrder + 1 : stepCounter;
    setStepCounter(nextOrder + 1);
    return nextOrder;
  }, [steps, stepCounter]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = steps.findIndex(
          (item) => item.order.toString() === active.id,
        );
        const newIndex = steps.findIndex(
          (item) => item.order.toString() === over.id,
        );
        onChange(arrayMove(steps, oldIndex, newIndex));
      }
    },
    [steps, onChange],
  );

  const handleAddStep = useCallback(() => {
    const newStep: TestCaseStep = {
      order: getNextOrder(),
      action: '',
      expected_result: '',
    };
    onChange([...steps, newStep]);
  }, [steps, onChange, getNextOrder]);

  const handleDeleteStep = useCallback(
    (order: number) => {
      onChange(steps.filter((item) => item.order !== order));
    },
    [steps, onChange],
  );

  const handleCopyStep = useCallback(
    (record: TestCaseStep) => {
      const newStep: TestCaseStep = {
        order: getNextOrder(),
        action: record.action,
        expected_result: record.expected_result,
      };
      const index = steps.findIndex((item) => item.order === record.order);
      const newSteps = [...steps];
      newSteps.splice(index + 1, 0, newStep);
      onChange(newSteps);
    },
    [steps, onChange, getNextOrder],
  );

  const handleFieldChange = useCallback(
    (order: number, field: 'action' | 'expected_result', value: string) => {
      onChange(
        steps.map((item) =>
          item.order === order ? { ...item, [field]: value } : item,
        ),
      );
    },
    [steps, onChange],
  );

  const handleReset = useCallback(() => {
    onChange([]);
    setStepCounter(1);
  }, [onChange]);

  return (
    <div style={{ marginBottom: token.marginLG }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: token.marginMD,
          gap: token.paddingSM,
        }}
      >
        <span
          style={{
            fontSize: token.fontSize,
            fontWeight: 500,
            color: token.colorText,
          }}
        >
          测试步骤
        </span>
        <span
          style={{
            fontSize: token.fontSizeSM,
            color: token.colorTextSecondary,
          }}
        >
          拖拽调整顺序
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((s) => s.order.toString())}
          strategy={verticalListSortingStrategy}
        >
          {steps.map((step) => (
            <SortableStepItem
              key={step.order}
              order={step.order}
              record={step}
              onDelete={handleDeleteStep}
              onCopy={handleCopyStep}
              onChange={handleFieldChange}
            />
          ))}
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: `${token.paddingLG}px 0`,
            color: token.colorTextSecondary,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            border: `1px dashed ${token.colorBorder}`,
          }}
        >
          <div style={{ marginBottom: token.marginXS }}>暂无测试步骤</div>
          <div style={{ fontSize: token.fontSizeSM }}>
            点击下方按钮添加测试步骤
          </div>
        </div>
      )}

      <Button
        type="dashed"
        icon={<CheckCircleOutlined />}
        onClick={handleAddStep}
        block
        style={{
          marginTop: token.marginMD,
          height: 40,
          borderStyle: 'dashed',
        }}
      >
        新增步骤
      </Button>
    </div>
  );
};

export default CaseStepsForm;
export { SortableStepItem };
