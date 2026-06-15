import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SwapOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Modal, Popconfirm, Space, Tooltip } from 'antd';
import { FC, useCallback, useState } from 'react';
import BatchCopyModal from './BatchCopyModal';
import BatchEditModal from './BatchEditModal';
import BatchMoveModal from './BatchMoveModal';
import { useBatchDeletePermanent, useBatchUnlink } from './hooks';

/**
 * 批量操作栏 Props
 */
export interface BatchActionBarProps {
  selectedCount: number;
  selectedCaseIds: number[];
  planId?: string;
  onBatchSuccess?: () => void;
  /** 多选时：批量导出所选用例 (走 exportCases 的 case_ids 路径, M2 模板) */
  onBatchExport?: () => void;
  onExit?: () => void;
  /** 单选时：在选中用例之后插入新用例 */
  onInsertAfter?: (afterCaseId: number) => void;
  /** 单选时：在选中用例之后批量上传 */
  onInsertAfterImport?: (afterCaseId: number) => void;
}

/**
 * 批量操作栏组件
 * 支持移动、复制、编辑、解除关联、彻底删除已选中的用例
 */
const BatchActionBar: FC<BatchActionBarProps> = ({
  selectedCount,
  selectedCaseIds,
  planId,
  onBatchSuccess,
  onBatchExport,
  onExit,
  onInsertAfter,
  onInsertAfterImport,
}) => {
  const { colors, spacing, borderRadius, shadows, token } = useCaseHubTheme();
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [unlinkModalVisible, setUnlinkModalVisible] = useState(false);
  const [deletePermanentModalVisible, setDeletePermanentModalVisible] =
    useState(false);
  // 物理删除二次确认：用户必须勾选"我已知晓不可恢复"才能点确定
  const [deletePermanentConfirmed, setDeletePermanentConfirmed] =
    useState(false);

  const { unlinkCases, loading: unlinkLoading } = useBatchUnlink({
    onSuccess: () => {
      setUnlinkModalVisible(false);
      onBatchSuccess?.();
    },
  });

  const { deleteCasesPermanently, loading: deletePermanentLoading } =
    useBatchDeletePermanent({
      onSuccess: () => {
        setDeletePermanentModalVisible(false);
        setDeletePermanentConfirmed(false);
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

  /** 打开解除关联确认弹窗 */
  const handleUnlinkClick = useCallback(() => setUnlinkModalVisible(true), []);
  /** 关闭解除关联确认弹窗 */
  const handleUnlinkCancel = useCallback(
    () => setUnlinkModalVisible(false),
    [],
  );
  /** 确认解除关联 */
  const handleUnlinkConfirm = useCallback(() => {
    if (!planId) return;
    unlinkCases(Number(planId), selectedCaseIds);
  }, [planId, selectedCaseIds, unlinkCases]);

  /** 打开物理删除确认弹窗（每次重置勾选状态） */
  const handleDeletePermanentClick = useCallback(() => {
    setDeletePermanentConfirmed(false);
    setDeletePermanentModalVisible(true);
  }, []);
  /** 关闭物理删除确认弹窗 */
  const handleDeletePermanentCancel = useCallback(() => {
    setDeletePermanentModalVisible(false);
    setDeletePermanentConfirmed(false);
  }, []);
  /** 确认物理删除 */
  const handleDeletePermanentConfirm = useCallback(() => {
    if (!planId) return;
    deleteCasesPermanently(Number(planId), selectedCaseIds);
  }, [planId, selectedCaseIds, deleteCasesPermanently]);

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
          {/* 单选时显示：在选中用例之后操作 */}
          {selectedCount === 1 && (onInsertAfter || onInsertAfterImport) && (
            <>
              {onInsertAfter && (
                <Tooltip title="在此之后插入用例" placement="top">
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => onInsertAfter(selectedCaseIds[0])}
                    type="primary"
                    size="small"
                    style={{ fontWeight: 500 }}
                  >
                    插入用例
                  </Button>
                </Tooltip>
              )}
              {onInsertAfterImport && (
                <Tooltip title="在此之后批量导入" placement="top">
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => onInsertAfterImport(selectedCaseIds[0])}
                    size="small"
                    style={{ fontWeight: 500 }}
                  >
                    批量上传
                  </Button>
                </Tooltip>
              )}
              <div
                style={{
                  width: 1,
                  height: 24,
                  backgroundColor: colors.borderSecondary,
                }}
              />
            </>
          )}
          {onBatchExport && (
            <Tooltip title="导出所选用例" placement="top">
              <Popconfirm
                title={`确认导出所选 ${selectedCount} 个用例?`}
                okText="确认导出"
                cancelText="取消"
                onConfirm={() => onBatchExport()}
              >
                <Button
                  icon={<DownloadOutlined />}
                  type="text"
                  shape="circle"
                  size="large"
                />
              </Popconfirm>
            </Tooltip>
          )}
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
          {/* 解除关联：仅删除用例与当前计划的关联，用例本体保留 */}
          <Tooltip title="解除关联" placement="top">
            <Button
              icon={<DisconnectOutlined />}
              onClick={handleUnlinkClick}
              type="text"
              shape="circle"
              size="large"
            />
          </Tooltip>
          {/* 物理删除：解除关联 + 删除用例本体及子步骤，不可恢复 */}
          <Tooltip title="彻底删除用例" placement="top">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleDeletePermanentClick}
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

      {/* 解除关联确认弹窗（轻量确认） */}
      <Modal
        title="解除用例关联"
        open={unlinkModalVisible}
        onCancel={handleUnlinkCancel}
        onOk={handleUnlinkConfirm}
        okText="解除关联"
        cancelText="取消"
        okButtonProps={{ loading: unlinkLoading }}
      >
        <p style={{ color: colors.text, fontSize: token.fontSize }}>
          确认解除已选择的 {selectedCount} 项用例与本计划的关联吗？
        </p>
        <p
          style={{
            color: colors.textTertiary,
            marginTop: spacing.sm,
            fontSize: token.fontSizeSM,
          }}
        >
          解除后用例本体仍保留在用例库中，可后续重新关联。
        </p>
      </Modal>

      {/* 物理删除确认弹窗（强警告 + 二次确认） */}
      <Modal
        title={
          <span style={{ color: colors.error }}>彻底删除用例（不可恢复）</span>
        }
        open={deletePermanentModalVisible}
        onCancel={handleDeletePermanentCancel}
        onOk={handleDeletePermanentConfirm}
        okText="彻底删除"
        cancelText="取消"
        okButtonProps={{
          danger: true,
          loading: deletePermanentLoading,
          disabled: !deletePermanentConfirmed,
        }}
        width={460}
      >
        <p style={{ color: colors.text, fontSize: token.fontSize }}>
          即将彻底删除已选择的{' '}
          <span style={{ color: colors.error, fontWeight: 600 }}>
            {selectedCount}
          </span>{' '}
          项用例。
        </p>
        <ul
          style={{
            color: colors.textTertiary,
            marginTop: spacing.sm,
            fontSize: token.fontSizeSM,
            paddingLeft: spacing.lg,
          }}
        >
          <li>解除用例与当前计划的关联</li>
          <li>从用例库（test_case）物理删除用例本体</li>
          <li>删除该用例下的所有子步骤（case_sub_step）</li>
        </ul>
        <p
          style={{
            color: colors.error,
            marginTop: spacing.md,
            fontSize: token.fontSizeSM,
            fontWeight: 500,
          }}
        >
          ⚠️ 若用例还被其他计划引用，将无法删除，请先解除其他关联。
        </p>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            marginTop: spacing.md,
            color: colors.text,
            fontSize: token.fontSize,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={deletePermanentConfirmed}
            onChange={(e) => setDeletePermanentConfirmed(e.target.checked)}
          />
          我已知晓此操作不可恢复，仍要继续
        </label>
      </Modal>
    </>
  );
};

export default BatchActionBar;
