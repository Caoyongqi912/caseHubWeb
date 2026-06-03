import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

export interface MoreMenuHandlers {
  onCopyCase?: () => void;
  onRemoveCase?: () => void;
  onInsertAfter?: () => void;
}

export const createMoreMenuItems = (
  handlers?: MoreMenuHandlers,
): MenuProps['items'] => [
  {
    key: 'copy',
    icon: <CopyOutlined />,
    label: '复制用例',
    onClick: handlers?.onCopyCase,
  },
  {
    key: 'insert-after',
    icon: <PlusOutlined />,
    label: '下方插入用例',
    onClick: handlers?.onInsertAfter,
  },
  { type: 'divider' as const },
  {
    key: 'remove',
    icon: <DeleteOutlined />,
    label: '移除用例',
    danger: true,
    onClick: handlers?.onRemoveCase,
  },
];
