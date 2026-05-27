import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Button, Modal, Space, Tooltip } from 'antd';
import { FC, useCallback, useState } from 'react';
import BatchEditModal from './BatchEditModal';
import BatchMoveModal from './BatchMoveModal';
import { useBatchDelete } from './hooks';

export interface BatchActionBarProps {
  selectedCount: number;
  selectedCaseIds: number[];
  onBatchSuccess?: () => void;
  onExit?: () => void;
}

const BatchActionBar: FC<BatchActionBarProps> = ({
  selectedCount,
  selectedCaseIds,
  onBatchSuccess,
  onExit,
}) => {
  const { colors, spacing, borderRadius, shadows, token } = useCaseHubTheme();
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { deleteCases, loading: deleteLoading } = useBatchDelete({
    onSuccess: () => {
      setDeleteModalVisible(false);
      onBatchSuccess?.();
    },
  });

  const handleMove = useCallback(() => setMoveModalVisible(true), []);
  const handleMoveCancel = useCallback(() => setMoveModalVisible(false), []);
  const handleMoveSuccess = useCallback(() => {
    setMoveModalVisible(false);
    onBatchSuccess?.();
  }, [onBatchSuccess]);

  const handleEdit = useCallback(() => setEditModalVisible(true), []);
  const handleEditCancel = useCallback(() => setEditModalVisible(false), []);
  const handleEditSuccess = useCallback(() => {
    setEditModalVisible(false);
    onBatchSuccess?.();
  }, [onBatchSuccess]);

  const handleDeleteClick = useCallback(() => setDeleteModalVisible(true), []);
  const handleDeleteCancel = useCallback(
    () => setDeleteModalVisible(false),
    [],
  );
  const handleDeleteConfirm = useCallback(() => {
    deleteCases(selectedCaseIds);
  }, [selectedCaseIds, deleteCases]);

  const handleExit = useCallback(() => {
    onExit?.();
  }, [onExit]);

  return (
    <>
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

      <BatchMoveModal
        open={moveModalVisible}
        selectedCaseIds={selectedCaseIds}
        onCancel={handleMoveCancel}
        onSuccess={handleMoveSuccess}
      />

      <BatchEditModal
        open={editModalVisible}
        selectedCaseIds={selectedCaseIds}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />

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
