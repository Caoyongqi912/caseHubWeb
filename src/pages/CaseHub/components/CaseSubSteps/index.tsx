/**
 * CaseSubSteps - 测试用例步骤管理组件
 *
 * 功能特性：
 * - 展示和管理测试用例的步骤列表
 * - 支持拖拽排序调整步骤顺序
 * - 支持新增、复制、删除步骤操作
 * - 自动保存编辑内容（防抖500ms）
 * - 实时显示保存状态
 */

import { HolderOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tag,
  theme,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
  copyTestCase,
  copyTestCaseStep,
  handleAddTestCaseStep,
  queryTestCaseSupStep,
  removeTestCaseStep,
  reorderTestCaseStep,
  updateRequirementCase,
  updateTestCase,
  updateTestCaseStep,
} from '@/api/case/testCase';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSubStep } from '@/pages/CaseHub/types';
import StepItem from './StepItem';

const { Text } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

interface CaseSubStepsProps {
  caseId?: number;
  requirement_id?: number;
  case_status?: number;
  callback?: () => void;
  hiddenStatusBut?: boolean;
  case_setup?: string;
  case_mark?: string;
  creatorName?: string;
  onStatusChange?: (caseId: number, newStatus: number) => void;
}

/**
 * 组件状态枚举
 */
enum EditStatus {
  Idle = 0,
  Saving = 1,
  Saved = 2,
}

const CaseSubSteps: FC<CaseSubStepsProps> = ({
  caseId,
  case_status,
  requirement_id,
  hiddenStatusBut = false,
  callback,
  creatorName = '',
  case_setup = '',
  case_mark = '',
  onStatusChange,
}) => {
  const { token } = useToken();

  // ==================== 状态定义 ====================
  const [steps, setSteps] = useState<CaseSubStep[]>([]);
  const [editStatus, setEditStatus] = useState<EditStatus>(EditStatus.Idle);
  const [addLine, setAddLine] = useState(0);
  const [setupValue, setSetupValue] = useState(case_setup);
  const [markValue, setMarkValue] = useState(case_mark);
  const [localCaseStatus, setLocalCaseStatus] = useState(case_status);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // ==================== Refs ====================
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepsRef = useRef<CaseSubStep[]>(steps);
  const draggedIdRef = useRef<string | null>(null);

  // ==================== Theme ====================
  const { colors, spacing } = useCaseHubTheme();

  // ==================== Effects ====================

  // 同步外部 props 变化到内部状态
  useEffect(() => {
    setSetupValue(case_setup);
    setMarkValue(case_mark);
  }, [case_setup, case_mark]);

  useEffect(() => {
    setLocalCaseStatus(case_status);
  }, [case_status]);

  // 保持 stepsRef 与 steps 同步，用于在回调中访问最新数据
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // 加载步骤数据
  useEffect(() => {
    if (!caseId) return;
    queryTestCaseSupStep(caseId.toString()).then(({ code, data }) => {
      if (code === 0) {
        setSteps(data);
      }
    });
  }, [caseId, addLine]);

  // ==================== 拖拽处理 ====================

  const handleDragStart = useCallback((uid: string) => {
    draggedIdRef.current = uid;
    setDraggingId(uid);
  }, []);

  const handleDragEnd = useCallback(() => {
    draggedIdRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((uid: string) => {
    setDragOverId(uid);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  /**
   * 处理拖拽放置
   * 重新排序步骤并同步到服务器
   */
  const handleDrop = useCallback(
    async (targetUid: string) => {
      const draggedUid = draggedIdRef.current;
      if (!draggedUid || draggedUid === targetUid) return;

      const newSteps = [...steps];
      const draggedIndex = newSteps.findIndex((s) => s.uid === draggedUid);
      const targetIndex = newSteps.findIndex((s) => s.uid === targetUid);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedItem] = newSteps.splice(draggedIndex, 1);
        newSteps.splice(targetIndex, 0, draggedItem);
        setSteps(newSteps);

        // 同步排序到服务器
        const orderIds = newSteps
          .map((item) => item.id)
          .filter((id): id is number => typeof id === 'number');
        await reorderTestCaseStep({ step_ids: orderIds });
      }
    },
    [steps],
  );

  // ==================== 步骤操作 ====================

  /**
   * 保存单个步骤
   * 使用防抖机制，500ms 内只保存一次
   */
  const saveStep = useCallback(async (uid: string) => {
    const step = stepsRef.current.find((s) => s.uid === uid);
    if (!step?.id) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setEditStatus(EditStatus.Saving);
    saveTimeoutRef.current = setTimeout(async () => {
      const { code } = await updateTestCaseStep(step);
      if (code === 0) {
        setEditStatus(EditStatus.Saved);
        setTimeout(() => setEditStatus(EditStatus.Idle), 2000);
      }
    }, 500);
  }, []);

  /**
   * 处理步骤字段变化
   */
  const handleFieldChange = useCallback(
    (uid: string, field: 'action' | 'expected_result', value: string) => {
      setSteps((prev) =>
        prev.map((step) =>
          step.uid === uid ? { ...step, [field]: value } : step,
        ),
      );
    },
    [],
  );

  /**
   * 处理步骤失焦，触发保存
   */
  const handleFieldBlur = useCallback(
    (uid: string) => {
      saveStep(uid);
    },
    [saveStep],
  );

  /**
   * 删除步骤
   */
  const deleteStep = useCallback(async (stepId: number) => {
    const { code } = await removeTestCaseStep({ stepId });
    if (code === 0) setAddLine((prev) => prev + 1);
  }, []);

  /**
   * 复制步骤
   */
  const copyStep = useCallback(async (stepId: number) => {
    const { code } = await copyTestCaseStep({ step_id: stepId });
    if (code === 0) setAddLine((prev) => prev + 1);
  }, []);

  /**
   * 新增步骤
   */
  const addStep = useCallback(async () => {
    if (!caseId) return;
    const { code } = await handleAddTestCaseStep({ caseId });
    if (code === 0) setAddLine((prev) => prev + 1);
  }, [caseId]);

  // ==================== 用例字段操作 ====================

  /**
   * 保存用例字段（前置条件/备注）
   */
  const saveCaseField = useCallback(
    async (field: 'case_setup' | 'case_mark', value: string) => {
      if (!caseId) return;

      setEditStatus(EditStatus.Saving);
      const { code } = await updateTestCase({
        id: caseId,
        [field]: value,
      } as any);

      if (code === 0) {
        setEditStatus(EditStatus.Saved);
        setTimeout(() => setEditStatus(EditStatus.Idle), 2000);
        // callback?.();
      }
    },
    [caseId],
  );

  /**
   * 切换用例状态
   */
  const handleStatusChange = useCallback(
    async (newStatus: number) => {
      if (!caseId || !requirement_id) return;

      setLocalCaseStatus(newStatus);

      const { code } = await updateRequirementCase({
        requirement_id,
        case_id: caseId,
        case_status: newStatus,
      } as any);

      if (code === 0) {
        onStatusChange?.(caseId, newStatus);
      } else {
        setLocalCaseStatus(case_status);
      }
    },
    [caseId, requirement_id, case_status, onStatusChange],
  );

  /**
   * 快速创建下一个用例
   */
  const handleQuickCreate = useCallback(async () => {
    if (!caseId || !requirement_id) return;
    const { code } = await copyTestCase({ requirement_id, caseId });
    if (code === 0) callback?.();
  }, [caseId, requirement_id, callback]);

  // ==================== 渲染辅助 ====================

  // 用例状态配置
  const caseStatusConfig = [
    {
      value: 1,
      label: '成功',
      color: '#52c41a',
      bgColor: 'rgba(82, 196, 26, 0.1)',
    },
    {
      value: 2,
      label: '失败',
      color: '#ff4d4f',
      bgColor: 'rgba(255, 77, 79, 0.1)',
    },
    {
      value: 3,
      label: '阻塞',
      color: '#faad14',
      bgColor: 'rgba(250, 173, 20, 0.1)',
    },
    {
      value: 0,
      label: '待开始',
      color: '#8c8c8c',
      bgColor: 'rgba(140, 140, 140, 0.1)',
    },
  ] as const;

  return (
    <ProCard
      bordered={false}
      style={{ minHeight: '100%', background: colors.bgContainer }}
    >
      {/* ==================== 头部区域 ==================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.lg}px ${spacing.xl}px`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Space size="large">
          <Space>
            <HolderOutlined style={{ color: colors.textSecondary }} />
            <Text type="secondary">{steps.length} 个步骤</Text>
          </Space>

          {!hiddenStatusBut && (
            <Select
              variant="borderless"
              value={localCaseStatus}
              onChange={handleStatusChange}
              options={caseStatusConfig.map((s) => ({
                value: s.value,
                label: (
                  <Tag
                    style={{
                      background: s.bgColor,
                      color: s.color,
                      border: `1px solid ${s.color}30`,
                      margin: 0,
                    }}
                  >
                    {s.label}
                  </Tag>
                ),
              }))}
            />
          )}
        </Space>

        <Space size="large">
          {creatorName && (
            <Text type="secondary">
              创建者：
              <Text strong style={{ color: colors.primary }}>
                {creatorName}
              </Text>
            </Text>
          )}
          {editStatus === EditStatus.Saving && (
            <Tag icon={<Spin size="small" />} color="processing">
              保存中...
            </Tag>
          )}
          {editStatus === EditStatus.Saved && (
            <Tag icon={<SaveOutlined />} color="success">
              已保存
            </Tag>
          )}
        </Space>
      </div>

      {/* ==================== 内容区域 ==================== */}
      <div style={{ padding: spacing.xl }}>
        {/* 前置条件 */}
        <div style={{ marginBottom: spacing.lg }}>
          <Space style={{ marginBottom: spacing.sm }}>
            <Text strong>前置条件</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              （可选）
            </Text>
          </Space>
          <TextArea
            value={setupValue}
            placeholder="输入用例执行的前置条件..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            onBlur={() =>
              setupValue !== case_setup &&
              saveCaseField('case_setup', setupValue)
            }
            onChange={(e) => setSetupValue(e.target.value)}
          />
        </div>

        {/* 测试步骤 */}
        <div style={{ marginBottom: token.marginLG }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: token.marginMD,
              gap: token.paddingSM,
            }}
          >
            <Text
              strong
              style={{ fontSize: token.fontSize, color: token.colorText }}
            >
              测试步骤
            </Text>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              拖拽调整顺序
            </Text>
          </div>

          {/* 步骤列表 */}
          <Space
            direction="vertical"
            style={{ width: '100%', marginBottom: spacing.lg }}
          >
            {steps.map((step, index) => (
              <StepItem
                key={step.uid}
                index={index}
                action={step.action || ''}
                expectedResult={step.expected_result || ''}
                isDragging={draggingId === step.uid}
                isDragOver={dragOverId === step.uid}
                onDragStart={() => handleDragStart(step.uid)}
                onDragEnd={handleDragEnd}
                onDragOver={() => handleDragOver(step.uid)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(step.uid)}
                onActionChange={(value) =>
                  handleFieldChange(step.uid, 'action', value)
                }
                onExpectedResultChange={(value) =>
                  handleFieldChange(step.uid, 'expected_result', value)
                }
                onBlur={() => handleFieldBlur(step.uid)}
                onCopy={() =>
                  typeof step.id === 'number' && copyStep(step.id as number)
                }
                onDelete={() =>
                  typeof step.id === 'number' && deleteStep(step.id as number)
                }
              />
            ))}
          </Space>

          {/* 空状态 */}
          {steps.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: `${token.paddingLG}px 0`,
                color: token.colorTextSecondary,
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                border: `1px dashed ${token.colorBorder}`,
                marginBottom: token.marginMD,
              }}
            >
              <div style={{ marginBottom: token.marginXS }}>暂无测试步骤</div>
              <div style={{ fontSize: token.fontSizeSM }}>
                点击下方按钮添加测试步骤
              </div>
            </div>
          )}

          {/* 新增步骤按钮 */}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addStep}
            block
            style={{
              marginTop: token.marginMD,
              height: 40,
              borderStyle: 'dashed',
            }}
          >
            新增步骤
          </Button>
        </div>

        {/* 备注 */}
        <div style={{ marginBottom: spacing.lg }}>
          <Space style={{ marginBottom: spacing.sm }}>
            <Text strong>备注</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              （可选）
            </Text>
          </Space>
          <TextArea
            value={markValue}
            placeholder="输入备注信息..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            onBlur={() =>
              markValue !== case_mark && saveCaseField('case_mark', markValue)
            }
            onChange={(e) => setMarkValue(e.target.value)}
          />
        </div>

        {/* 快速创建下一个 */}
        {!hiddenStatusBut && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Popconfirm
              title="确认创建"
              description="将基于当前用例创建一个新的测试用例？"
              onConfirm={handleQuickCreate}
              okText="确定"
              cancelText="取消"
            >
              <Button type="primary" ghost icon={<PlusOutlined />}>
                快速创建下一个
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </ProCard>
  );
};

export default CaseSubSteps;
