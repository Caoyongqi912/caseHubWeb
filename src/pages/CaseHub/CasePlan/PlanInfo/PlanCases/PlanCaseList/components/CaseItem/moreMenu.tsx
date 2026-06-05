import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

export interface MoreMenuHandlers {
  onCopyCase?: () => void;
  onRemoveCase?: () => void;
  /** 彻底删除（解除关联 + 数据库物理删除用例） */
  onDeleteCase?: () => void;
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
  { type: 'divider' as const },
  {
    key: 'remove',
    icon: <DeleteOutlined />,
    label: '移除用例',
    danger: true,
    onClick: handlers?.onRemoveCase,
  },
  {
    key: 'delete-permanent',
    icon: <DeleteOutlined />,
    label: '彻底删除',
    danger: true,
    onClick: handlers?.onDeleteCase,
  },
];
