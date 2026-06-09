/**
 * BulkActionBar · 表格上方批量操作条
 *
 * 设计取向:选中行数 > 0 时浮出,左侧显示已选数量,
 * 右侧放置批量操作按钮(目前仅 批量删除);最右侧 "取消选中"。
 */

import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { memo } from 'react';

export interface BulkActionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  token: any;
  /** 是否正在执行批量操作(用于 disable 按钮) */
  loading?: boolean;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  count,
  onDelete,
  onClear,
  token,
  loading,
}) => {
  if (count === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 16px',
        margin: '0 0 12px',
        background: token.colorPrimaryBg,
        border: `1px solid ${token.colorPrimaryBorder}`,
        borderRadius: 6,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: token.colorText,
          fontSize: 13,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 22,
            height: 22,
            padding: '0 8px',
            borderRadius: 11,
            background: token.colorPrimary,
            color: token.colorTextLightSolid || '#fff',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: token.fontFamilyCode,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
        <span>项已选中</span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          loading={loading}
          onClick={onDelete}
        >
          批量删除
        </Button>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onClear}
        >
          取消选中
        </Button>
      </div>
    </div>
  );
};

export default memo(BulkActionBar);
