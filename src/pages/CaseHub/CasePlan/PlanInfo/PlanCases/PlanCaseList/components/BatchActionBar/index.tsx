import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Button, Modal, Space, Tooltip } from 'antd';
import { FC, useCallback, useState } from 'react';
import BatchCopyModal from './BatchCopyModal';
import BatchEditModal from './BatchEditModal';
import BatchMoveModal from './BatchMoveModal';
import { useBatchDelete } from './hooks/useBatchDelete';

/**
 * 批量操作栏 Props
 */
export interface BatchActionBarProps {
  selectedCount: number;
  selectedCaseIds: number[];
  planId?: string;
  onBatchSuccess?: () => void;
  onExit?: () => void;
}

/**
 * 批量操作栏组件
 * 支持移动、复制、删除、修改已选中的用例
 */
const BatchActionBar: FC<BatchActionBarProps> = ({
  selectedCount,
  selectedCaseIds,
  planId,
  onBatchSuccess,
  onExit,
}) => {
  const { colors, spacing, borderRadius, shadows, token } = useCaseHubTheme();
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { deleteCases, loading: deleteLoading } = useBatchDelete({
    onSuccess: () => {
      setDeleteModalVisible(false);
      onBatchSuccess?.();
    },
  });

  /** 打开移动弹窗 */
  const handleMove = useCallback(() => setMoveModalVisible(true), []);
  /** 关闭移动弹窗 */
  const handleMoveCancel = useCallback(() => setMoveModalVisible(false), []);
  /** 移动成功回调 */
  const handleMoveSuccess = useCallback(() => {
    setMoveModalVisible(false);
    onBatchSuccess?.();
  }, [onBatchSuccess]);

  /** 打开复制弹窗 */
  const handleCopy = useCallback(() => setCopyModalVisible(true), []);
  /** 关闭复制弹窗 */
  const handleCopyCancel = useCallback(() => setCopyModalVisible(false), []);
  /** 复制成功回调 */
  const handleCopySuccess = useCallback(() => {
    setCopyModalVisible(false);
    onBatchSuccess?.();
  }, [onBatchSuccess]);

  /** 打开修改弹窗 */
  const handleEdit = useCallback(() => setEditModalVisible(true), []);
  /** 关闭修改弹窗 */
  const handleEditCancel = useCallback(() => setEditModalVisible(false), []);
  /** 修改成功回调 */
  const handleEditSuccess = useCallback(() => {
    setEditModalVisible(false);
    onBatchSuccess?.();
  }, [onBatchSuccess]);

  /** 打开删除确认弹窗 */
  const handleDeleteClick = useCallback(() => setDeleteModalVisible(true), []);
  /** 关闭删除确认弹窗 */
  const handleDeleteCancel = useCallback(
    () => setDeleteModalVisible(false),
    [],
  );
  /** 确认删除 */
  const handleDeleteConfirm = useCallback(() => {
    if (!planId) return;
    deleteCases(Number(planId), selectedCaseIds);
  }, [planId, selectedCaseIds, deleteCases]);

  /** 退出批量选择模式 */
  const handleExit = useCallback(() => {
    onExit?.();
  }, [onExit]);

  return (
    <>
      {/* 操作栏主体 */}
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
        {/* 选中数量 */}
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

        <div
          style={{
            width: 1,
            height: 24,
            backgroundColor: colors.borderSecondary,
          }}
        />

        {/* 操作按钮组 */}
        <Space size={spacing.md}>
          <Tooltip title="批量移动" placement="top">
            <Button
              icon={<SwapOutlined />}
              onClick={handleMove}
              type="text"
              shape="circle"
              size="large"
            />
          </Tooltip>
          <Tooltip title="批量复制" placement="top">
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopy}
              type="text"
              shape="circle"
              size="large"
            />
          </Tooltip>
          <Tooltip title="批量修改" placement="top">
            <Button
              icon={<EditOutlined />}
              onClick={handleEdit}
              type="text"
              shape="circle"
              size="large"
            />
          </Tooltip>
          <Tooltip title="批量删除" placement="top">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleDeleteClick}
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
      </div>

      {/* 移动弹窗 */}
      <BatchMoveModal
        open={moveModalVisible}
        selectedCaseIds={selectedCaseIds}
        currentPlanId={planId}
        onCancel={handleMoveCancel}
        onSuccess={handleMoveSuccess}
      />

      {/* 复制弹窗 */}
      <BatchCopyModal
        open={copyModalVisible}
        selectedCaseIds={selectedCaseIds}
        currentPlanId={planId}
        onCancel={handleCopyCancel}
        onSuccess={handleCopySuccess}
      />

      {/* 修改弹窗 */}
      <BatchEditModal
        open={editModalVisible}
        selectedCaseIds={selectedCaseIds}
        currentPlanId={planId}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />

      {/* 删除确认弹窗 */}
      <Modal
        title="批量删除用例"
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onOk={handleDeleteConfirm}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <p style={{ color: colors.text, fontSize: token.fontSize }}>
          确定要删除已选择的 {selectedCount} 项用例吗？
        </p>
        <p
          style={{
            color: colors.textTertiary,
            marginTop: spacing.sm,
            fontSize: token.fontSizeSM,
          }}
        >
          删除后用例将无法恢复，请谨慎操作。
        </p>
      </Modal>
    </>
  );
};

export default BatchActionBar;
