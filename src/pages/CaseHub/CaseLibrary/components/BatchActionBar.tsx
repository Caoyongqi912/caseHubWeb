import { exportCases } from '@/api/case/testCase';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Button, message, Modal, Space, Tooltip } from 'antd';
import { FC, useCallback, useState } from 'react';
import BatchEditModal from './BatchEditModal';
import BatchMoveModal from './BatchMoveModal';
import { useBatchDelete } from './hooks';

export interface BatchActionBarProps {
  selectedCount: number;
  selectedCaseIds: number[];
  /**
   * 导出范围. library scope 必传 (导出选中 case_ids 走这个 scope 防御).
   * - project_id: 必填, 后端 library 校验依赖
   * - module_id: 必填, scope_id = module_id; 若未选 module 不渲染导出按钮
   */
  exportScope?: {
    project_id: number;
    module_id: number;
  };
  onBatchSuccess?: () => void;
  onExit?: () => void;
}

const BatchActionBar: FC<BatchActionBarProps> = ({
  selectedCount,
  selectedCaseIds,
  exportScope,
  onBatchSuccess,
  onExit,
}) => {
  const { colors, spacing, borderRadius, shadows, token } = useCaseHubTheme();
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

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

  /**
   * 导出当前选中的用例. 后端按 case_ids 走 library scope 全量覆盖 (空 = scope 内全部);
   * 传 case_ids 时严格按 ID 过滤, 与 scope_id 一起做跨 scope 防御 (PR-3 commit 复用此校验).
   */
  const handleExport = useCallback(async () => {
    if (!exportScope?.project_id || !exportScope?.module_id) {
      message.warning('缺少项目 / 目录, 无法导出');
      return;
    }
    if (selectedCaseIds.length === 0) {
      message.warning('请先选择要导出的用例');
      return;
    }
    setExportLoading(true);
    try {
      await exportCases({
        scope_type: 'library',
        scope_id: exportScope.module_id,
        project_id: exportScope.project_id,
        case_ids: selectedCaseIds,
      });
      message.success(
        `已提交导出 ${selectedCaseIds.length} 条, 留意浏览器下载`,
      );
    } catch (err) {
      // 全局拦截器已 message.error
      console.error('exportCases (selected) failed:', err);
    } finally {
      setExportLoading(false);
    }
  }, [exportScope, selectedCaseIds]);

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
          {exportScope?.project_id && exportScope?.module_id ? (
            <Tooltip title="导出所选用例" placement="top">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exportLoading}
                type="text"
                shape="circle"
                size="large"
              />
            </Tooltip>
          ) : null}
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
