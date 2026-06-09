/**
 * ActionIcons · 表格行操作图标组
 *
 * 设计取向:统一图标按钮 + Tooltip 提示,操作位更紧凑、辨识度更高。
 * 色彩走 antd token:编辑主色 / 删除 error,hover 时背景微填充。
 */

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { memo } from 'react';

export interface ActionIconsProps {
  onEdit: () => void;
  onDelete: () => void;
  token: any;
}

const ActionIcons: React.FC<ActionIconsProps> = ({
  onEdit,
  onDelete,
  token,
}) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <Tooltip title="编辑">
      <Button
        type="text"
        size="small"
        icon={<EditOutlined style={{ fontSize: 14 }} />}
        onClick={onEdit}
        style={{
          color: token.colorPrimary,
          width: 28,
          height: 28,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </Tooltip>
    <Tooltip title="删除">
      <Button
        type="text"
        size="small"
        danger
        icon={<DeleteOutlined style={{ fontSize: 14 }} />}
        onClick={onDelete}
        style={{
          width: 28,
          height: 28,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </Tooltip>
  </span>
);

export default memo(ActionIcons);
