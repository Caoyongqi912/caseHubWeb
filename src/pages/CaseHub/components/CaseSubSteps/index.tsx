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
import { caseStatusColors, useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSubStep } from '@/pages/CaseHub/types';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Input,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface IProps {
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

const CaseSubSteps: FC<IProps> = ({
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
  const [steps, setSteps] = useState<CaseSubStep[]>([]);
  const [editStatus, setEditStatus] = useState(0);
  const [addLine, setAddLine] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [setupValue, setSetupValue] = useState(case_setup);
  const [markValue, setMarkValue] = useState(case_mark);
  const [localCaseStatus, setLocalCaseStatus] = useState(case_status);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepsRef = useRef<CaseSubStep[]>(steps);

  const { colors, spacing, borderRadius } = useCaseHubTheme();

  const statusConfig =
    caseStatusColors[localCaseStatus || 0] || caseStatusColors[0];

  useEffect(() => {
    setSetupValue(case_setup);
    setMarkValue(case_mark);
  }, [case_setup, case_mark]);

  useEffect(() => {
    setLocalCaseStatus(case_status);
  }, [case_status]);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    if (!caseId) return;
    queryTestCaseSupStep(caseId.toString()).then(({ code, data }) => {
      if (code === 0) {
        setSteps(data);
      }
    });
  }, [caseId, addLine]);

  const handleDrop = async (targetUid: string) => {
    if (!draggedStep || draggedStep === targetUid) {
      setDraggedStep(null);
      return;
    }

    const newSteps = [...steps];
    const draggedIndex = newSteps.findIndex((s) => s.uid === draggedStep);
    const targetIndex = newSteps.findIndex((s) => s.uid === targetUid);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = newSteps.splice(draggedIndex, 1);
      newSteps.splice(targetIndex, 0, draggedItem);
      setSteps(newSteps);

      const orderIds = newSteps
        .map((item) => item.id)
        .filter((id): id is number => typeof id === 'number');
      await reorderTestCaseStep({ step_ids: orderIds });
    }

    setDraggedStep(null);
  };

  const saveStep = async (uid: string) => {
    const step = stepsRef.current.find((s) => s.uid === uid);
    if (!step?.id) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setEditStatus(1);
    saveTimeoutRef.current = setTimeout(async () => {
      const { code } = await updateTestCaseStep(step);
      if (code === 0) {
        setEditStatus(2);
        setTimeout(() => setEditStatus(0), 2000);
      }
    }, 500);
  };

  const saveCaseField = async (
    field: 'case_setup' | 'case_mark',
    value: string,
  ) => {
    if (!caseId) return;

    setEditStatus(1);
    const { code } = await updateTestCase({
      id: caseId,
      [field]: value,
    } as any);

    if (code === 0) {
      setEditStatus(2);
      setTimeout(() => setEditStatus(0), 2000);
      callback?.();
    }
  };

  const handleFieldChange = (
    uid: string,
    field: 'action' | 'expected_result',
    value: string,
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.uid === uid ? { ...step, [field]: value } : step,
      ),
    );

    if (value.trim()) {
      const currentSteps = stepsRef.current;
      const lastStep = currentSteps[currentSteps.length - 1];
      const isLastStepEmpty =
        lastStep &&
        !lastStep.action?.trim() &&
        !lastStep.expected_result?.trim();

      if (!isLastStepEmpty && caseId) {
        handleAddTestCaseStep({ caseId }).then(({ code }) => {
          if (code === 0) setAddLine((prev) => prev + 1);
        });
      }
    }
  };

  const handleFieldBlur = (uid: string) => {
    saveStep(uid);
  };

  const handleStatusChange = async () => {
    if (!caseId || !requirement_id) return;

    // 状态只在通过(1)和失败(2)之间切换
    const newStatus = localCaseStatus === 1 ? 2 : 1;
    setLocalCaseStatus(newStatus);

    const { code } = await updateRequirementCase({
      requirement_id,
      case_id: caseId,
      case_status: newStatus,
    } as any);

    if (code === 0) {
      onStatusChange?.(caseId, newStatus);
    } else {
      setLocalCaseStatus(localCaseStatus);
    }
  };

  const deleteStep = async (stepId: number) => {
    const { code } = await removeTestCaseStep({ stepId });
    if (code === 0) setAddLine((prev) => prev + 1);
  };

  const copyStep = async (stepId: number) => {
    const { code } = await copyTestCaseStep({ step_id: stepId });
    if (code === 0) setAddLine((prev) => prev + 1);
  };

  const statusText =
    localCaseStatus === 1 ? '通过' : localCaseStatus === 2 ? '失败' : '待测试';
  const StatusIcon =
    localCaseStatus === 1 ? (
      <CheckCircleFilled style={{ color: '#52c41a' }} />
    ) : localCaseStatus === 2 ? (
      <CloseCircleFilled style={{ color: '#ff4d4f' }} />
    ) : (
      <HolderOutlined style={{ color: colors.textSecondary }} />
    );

  return (
    <ProCard
      bordered={false}
      style={{ minHeight: '100%', background: colors.bgContainer }}
    >
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
            <Tag
              style={{
                cursor: 'pointer',
                borderRadius: borderRadius.lg,
              }}
              onClick={handleStatusChange}
            >
              {StatusIcon}
              <span style={{ marginLeft: 4, fontWeight: 600 }}>
                {statusText}
              </span>
            </Tag>
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
          {editStatus === 1 && (
            <Tag icon={<Spin size="small" />} color="processing">
              保存中...
            </Tag>
          )}
          {editStatus === 2 && (
            <Tag icon={<SaveOutlined />} color="success">
              已保存
            </Tag>
          )}
        </Space>
      </div>

      <div style={{ padding: spacing.xl }}>
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

        <Title level={5} style={{ marginBottom: spacing.md }}>
          测试步骤
        </Title>

        <Space
          direction="vertical"
          style={{ width: '100%', marginBottom: spacing.lg }}
        >
          {steps.map((step, index) => (
            <ProCard
              key={step.uid}
              size="small"
              hoverable
              draggable
              onDragStart={() => setDraggedStep(step.uid)}
              onDragEnd={() => setDraggedStep(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(step.uid)}
              style={{
                background:
                  hoveredStep === step.uid
                    ? `${colors.primary}04`
                    : colors.bgLayout,
                border: `1px solid ${
                  hoveredStep === step.uid
                    ? `${colors.primary}20`
                    : colors.borderSecondary
                }`,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={() => setHoveredStep(step.uid)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div
                style={{
                  display: 'flex',
                  gap: spacing.md,
                  alignItems: 'start',
                }}
              >
                <div
                  style={{
                    cursor: 'grab',
                    color:
                      draggedStep === step.uid
                        ? colors.primary
                        : colors.textSecondary,
                    opacity: hoveredStep === step.uid ? 1 : 0.3,
                    paddingTop: 8,
                  }}
                >
                  <HolderOutlined />
                </div>

                <Tag
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
                    color: '#fff',
                    borderRadius: borderRadius.round,
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 8,
                  }}
                >
                  {index + 1}
                </Tag>

                <div style={{ display: 'flex', gap: spacing.md, flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      操作步骤
                    </Text>
                    <TextArea
                      value={step.action || ''}
                      placeholder="输入操作步骤..."
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      onBlur={() => handleFieldBlur(step.uid)}
                      onChange={(e) =>
                        handleFieldChange(step.uid, 'action', e.target.value)
                      }
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      预期结果
                    </Text>
                    <TextArea
                      value={step.expected_result || ''}
                      placeholder="输入预期结果..."
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      onBlur={() => handleFieldBlur(step.uid)}
                      onChange={(e) =>
                        handleFieldChange(
                          step.uid,
                          'expected_result',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <Space
                  direction="vertical"
                  size="small"
                  style={{ marginTop: 20 }}
                >
                  <Tooltip title="复制">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() =>
                        typeof step.id === 'number' && copyStep(step.id)
                      }
                      style={{ opacity: hoveredStep === step.uid ? 1 : 0 }}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="确认删除此步骤？"
                    description="删除后无法恢复"
                    onConfirm={() =>
                      typeof step.id === 'number' && deleteStep(step.id)
                    }
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ opacity: hoveredStep === step.uid ? 1 : 0 }}
                    />
                  </Popconfirm>
                </Space>
              </div>
            </ProCard>
          ))}
        </Space>

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

        {!hiddenStatusBut && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              ghost
              icon={<PlusOutlined />}
              onClick={async () => {
                if (!caseId || !requirement_id) return;
                const { code } = await copyTestCase({ requirement_id, caseId });
                if (code === 0) callback?.();
              }}
            >
              快速创建下一个
            </Button>
          </div>
        )}
      </div>
    </ProCard>
  );
};

export default CaseSubSteps;
