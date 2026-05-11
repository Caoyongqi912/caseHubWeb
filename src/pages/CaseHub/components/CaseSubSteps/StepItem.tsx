import {
  CopyOutlined,
  DeleteOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Input,
  Popconfirm,
  Space,
  Tag,
  theme,
  Tooltip,
} from 'antd';
import { FC, memo } from 'react';

const { TextArea } = Input;
const { useToken } = theme;

export interface StepItemProps {
  uid: string;
  index: number;
  action?: string;
  expectedResult?: string;
  stepId?: number | string;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onActionChange: (value: string) => void;
  onExpectedResultChange: (value: string) => void;
  onBlur: () => void;
  onCopy: () => void;
  onDelete: () => void;
  colors: {
    primary: string;
    primaryHover: string;
    textSecondary: string;
  };
  borderRadius: {
    round: string | number;
  };
}

const StepItem: FC<StepItemProps> = memo(
  ({
    uid,
    index,
    action,
    expectedResult,
    stepId,
    isDragging,
    isDragOver,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    onActionChange,
    onExpectedResultChange,
    onBlur,
    onCopy,
    onDelete,
    colors,
    borderRadius,
  }) => {
    const { token } = useToken();

    return (
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver();
        }}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          marginBottom: 8,
          background: isDragOver
            ? `${colors.primary}08`
            : token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${
            isDragOver ? `${colors.primary}40` : token.colorBorderSecondary
          }`,
          boxShadow: isDragging
            ? `0 ${token.paddingXS}px ${token.paddingLG}px rgba(0, 0, 0, 0.1)`
            : 'none',
          opacity: isDragging ? 0.6 : 1,
          transition: 'all 150ms ease',
        }}
      >
        <Space.Compact
          style={{ display: 'flex', alignItems: 'center', gap: 0 }}
        >
          <Tooltip title="拖拽排序">
            <Button
              type="text"
              icon={<HolderOutlined />}
              style={{
                cursor: 'grab',
                touchAction: 'none',
                color: token.colorTextSecondary,
                margin: `${token.paddingXS}px`,
              }}
            />
          </Tooltip>

          <Tag
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
              color: '#fff',
              borderRadius: borderRadius.round,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Tag>

          <TextArea
            placeholder="请输入操作步骤"
            value={action || ''}
            onChange={(e) => onActionChange(e.target.value)}
            onBlur={onBlur}
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
            value={expectedResult || ''}
            onChange={(e) => onExpectedResultChange(e.target.value)}
            onBlur={onBlur}
            variant="borderless"
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              flex: 1,
              padding: `${token.paddingXS}px ${token.paddingSM}px`,
            }}
          />

          <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />

          <Space size={4} style={{ paddingRight: token.paddingSM }}>
            <Tooltip title="复制">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={onCopy}
                style={{ color: token.colorPrimary }}
              >
                复制
              </Button>
            </Tooltip>

            <Popconfirm
              title="确认删除"
              description="确定要删除这条步骤吗？"
              onConfirm={onDelete}
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
  },
);

StepItem.displayName = 'StepItem';

export default StepItem;
