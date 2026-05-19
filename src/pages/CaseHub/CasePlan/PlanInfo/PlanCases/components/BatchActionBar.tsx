import { queryCasePlan } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Button, Modal, Select, Space, Tooltip, Tree } from 'antd';
import { FC, useCallback, useState } from 'react';

interface BatchActionBarProps {
  selectedCount: number;
  onBatchMove?: () => void;
  onBatchCopy?: () => void;
  onBatchDelete?: () => void;
  onExit?: () => void;
}

const BatchActionBar: FC<BatchActionBarProps> = ({
  selectedCount,
  onBatchMove,
  onBatchCopy,
  onBatchDelete,
  onExit,
}) => {
  const { colors, spacing, borderRadius, shadows, token } = useCaseHubTheme();
  const [moveModalVisible, setMoveModalVisible] = useState(false);

  const handleBatchMove = useCallback(() => {
    setMoveModalVisible(true);
    onBatchMove?.();
  }, [onBatchMove]);

  const handleMoveModalCancel = useCallback(() => {
    setMoveModalVisible(false);
  }, []);

  const handleMoveModalOk = useCallback(() => {
    setMoveModalVisible(false);
  }, []);

  const handleBatchCopy = useCallback(() => {
    onBatchCopy?.();
  }, [onBatchCopy]);

  const handleBatchDelete = useCallback(() => {
    onBatchDelete?.();
  }, [onBatchDelete]);

  const handleExit = useCallback(() => {
    onExit?.();
  }, [onExit]);

  const handleSearch = async (newValue: string) => {
    console.log(newValue);
    const { code, data } = await queryCasePlan(newValue);
    if (code === 0) {
      return data.map((item) => ({
        label: item.plan_name,
        value: item.id,
      }));
    }
  };
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: `${spacing.sm}px ${spacing.lg}px`,
        borderRadius: borderRadius.xl,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.lg,
        backgroundColor: colors.bgElevated,
        boxShadow: shadows.lg,
        zIndex: 100,
        border: `1px solid ${colors.borderSecondary}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        <span
          style={{
            fontSize: token.fontSize,
            fontWeight: 500,
            color: colors.text,
          }}
        >
          已选择{' '}
          <span
            style={{
              color: colors.primary,
              fontWeight: 600,
              fontSize: token.fontSizeLG,
            }}
          >
            {selectedCount}
          </span>{' '}
          项
        </span>
      </div>

      <div
        style={{
          width: 1,
          height: 24,
          backgroundColor: colors.borderSecondary,
        }}
      />

      <Space size={spacing.md}>
        <Tooltip title="批量移动" placement="top">
          <Button
            icon={<SwapOutlined />}
            onClick={handleBatchMove}
            type="text"
            shape="circle"
            size="large"
          />
        </Tooltip>
        <Tooltip title="批量复制" placement="top">
          <Button
            icon={<CopyOutlined />}
            onClick={handleBatchCopy}
            type="text"
            shape="circle"
            size="large"
          />
        </Tooltip>
        <Tooltip title="批量删除" placement="top">
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={handleBatchDelete}
            type="text"
            shape="circle"
            size="large"
          />
        </Tooltip>
        <Tooltip title="退出" placement="top">
          <Button
            icon={<CloseOutlined />}
            onClick={handleExit}
            type="text"
            shape="circle"
            size="large"
            style={{ color: colors.textTertiary }}
          />
        </Tooltip>
      </Space>

      <Modal
        title="批量移动用例"
        open={moveModalVisible}
        onCancel={handleMoveModalCancel}
        onOk={handleMoveModalOk}
        cancelText="取消"
        okText="确定"
      >
        <div style={{ padding: `${spacing.md}px 0` }}>
          <p
            style={{
              color: colors.textTertiary,
              marginTop: spacing.sm,
              fontSize: token.fontSizeSM,
            }}
          >
            已选择 {selectedCount} 项用例将被移动
          </p>
        </div>
        {/* 选择计划 */}
        <Select
          style={{
            width: '100%',
          }}
          onSearch={handleSearch}
          autoFocus
          allowClear
          prefix={'测试计划'}
        />
        {/* 选择目录 */}
        <Tree />
      </Modal>
    </div>
  );
};

export default BatchActionBar;
