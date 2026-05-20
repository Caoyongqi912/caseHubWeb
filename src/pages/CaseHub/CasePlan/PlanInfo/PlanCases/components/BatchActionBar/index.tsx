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
      console.log('[BatchActionBar] 删除成功回调触发');
      setDeleteModalVisible(false);
      console.log('[BatchActionBar] 调用 onBatchSuccess');
      onBatchSuccess?.();
      console.log('[BatchActionBar] onBatchSuccess 执行完成');
    },
  });

  // ==================== 移动操作 ====================
  const handleMove = useCallback(() => {
    console.log('[BatchActionBar] 点击移动按钮');
    setMoveModalVisible(true);
  }, []);

  const handleMoveCancel = useCallback(() => {
    console.log('[BatchActionBar] 移动弹窗取消');
    setMoveModalVisible(false);
  }, []);

  const handleMoveSuccess = useCallback(() => {
    console.log('[BatchActionBar] 移动成功回调触发');
    setMoveModalVisible(false);
    console.log('[BatchActionBar] 调用 onBatchSuccess');
    onBatchSuccess?.();
    console.log('[BatchActionBar] onBatchSuccess 执行完成');
  }, [onBatchSuccess]);

  // ==================== 复制操作 ====================
  const handleCopy = useCallback(() => {
    console.log('[BatchActionBar] 点击复制按钮');
    setCopyModalVisible(true);
  }, []);

  const handleCopyCancel = useCallback(() => {
    console.log('[BatchActionBar] 复制弹窗取消');
    setCopyModalVisible(false);
  }, []);

  const handleCopySuccess = useCallback(() => {
    console.log('[BatchActionBar] 复制成功回调触发');
    setCopyModalVisible(false);
    console.log('[BatchActionBar] 调用 onBatchSuccess');
    onBatchSuccess?.();
    console.log('[BatchActionBar] onBatchSuccess 执行完成');
  }, [onBatchSuccess]);

  // ==================== 修改操作 ====================
  const handleEdit = useCallback(() => {
    console.log('[BatchActionBar] 点击修改按钮');
    setEditModalVisible(true);
  }, []);

  const handleEditCancel = useCallback(() => {
    console.log('[BatchActionBar] 修改弹窗取消');
    setEditModalVisible(false);
  }, []);

  const handleEditSuccess = useCallback(() => {
    console.log('[BatchActionBar] 修改成功回调触发');
    setEditModalVisible(false);
    console.log('[BatchActionBar] 调用 onBatchSuccess');
    onBatchSuccess?.();
    console.log('[BatchActionBar] onBatchSuccess 执行完成');
  }, [onBatchSuccess]);

  // ==================== 删除操作 ====================
  const handleDeleteClick = useCallback(() => {
    console.log('[BatchActionBar] 点击删除按钮', { selectedCaseIds });
    setDeleteModalVisible(true);
  }, [selectedCaseIds]);

  const handleDeleteCancel = useCallback(() => {
    console.log('[BatchActionBar] 删除确认弹窗取消');
    setDeleteModalVisible(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    console.log('[BatchActionBar] 点击删除确认', { planId, selectedCaseIds });
    if (!planId) {
      console.error('[BatchActionBar] 缺少 planId，无法删除');
      return;
    }
    console.log('[BatchActionBar] 调用 deleteCases');
    deleteCases(Number(planId), selectedCaseIds);
    console.log('[BatchActionBar] deleteCases 调用完成');
  }, [planId, selectedCaseIds, deleteCases]);

  // ==================== 退出选择 ====================
  const handleExit = useCallback(() => {
    console.log('[BatchActionBar] 点击退出按钮');
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
