import {
  copyTestCase,
  copyTestCaseStep,
  handleAddTestCaseStep,
  queryTestCaseSupStep,
  removeTestCaseStep,
  reorderTestCaseStep,
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
import { Button, message, Popconfirm, Spin, Tooltip, Typography } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useCaseSubStepsStyles } from './styles';

const { Text } = Typography;

interface IProps {
  caseId?: number;
  requirement_id?: number;
  case_status?: number;
  callback?: () => void;
  hiddenStatusBut?: boolean;
  case_setup?: string;
  case_mark?: string;
  creatorName?: string;
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
}) => {
  const [steps, setSteps] = useState<CaseSubStep[]>([]);
  const [editStatus, setEditStatus] = useState(0);
  const [addLine, setAddLine] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<{
    uid: string;
    field: string;
  } | null>(null);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [setupValue, setSetupValue] = useState(case_setup);
  const [markValue, setMarkValue] = useState(case_mark);
  const [setupFocused, setSetupFocused] = useState(false);
  const [markFocused, setMarkFocused] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepsRef = useRef<CaseSubStep[]>(steps);
  const styles = useCaseSubStepsStyles();
  const { colors, spacing } = useCaseHubTheme();
  const statusConfig =
    caseStatusColors[case_status || 0] || caseStatusColors[0];

  useEffect(() => {
    setSetupValue(case_setup);
    setMarkValue(case_mark);
  }, [case_setup, case_mark]);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    if (!caseId) return;
    queryTestCaseSupStep(caseId.toString()).then(async ({ code, data }) => {
      if (code === 0) {
        setSteps(data);
      }
    });
  }, [caseId, addLine]);

  const handleDragStart = (uid: string) => {
    setDraggedStep(uid);
  };

  const handleDragEnd = () => {
    setDraggedStep(null);
  };

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
      await reorderTestCaseStep({ stepIds: orderIds });
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
  };

  const handleFieldBlur = (uid: string) => {
    saveStep(uid);
    setFocusedField(null);
  };

  const handleFieldKeyDown = (e: React.KeyboardEvent, uid: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).blur();
    }
  };

  const handleSetupBlur = () => {
    setSetupFocused(false);
    if (setupValue !== case_setup) {
      saveCaseField('case_setup', setupValue);
    }
  };

  const handleMarkBlur = () => {
    setMarkFocused(false);
    if (markValue !== case_mark) {
      saveCaseField('case_mark', markValue);
    }
  };

  const addStep = async () => {
    if (caseId) {
      const { code } = await handleAddTestCaseStep({ caseId });
      if (code === 0) {
        setAddLine((prev) => prev + 1);
      }
    }
  };

  const deleteStep = async (stepId: number) => {
    const { code } = await removeTestCaseStep({ stepId });
    if (code === 0) {
      setAddLine((prev) => prev + 1);
    }
  };

  const copyStep = async (stepId: number) => {
    const { code } = await copyTestCaseStep({ stepId });
    if (code === 0) {
      setAddLine((prev) => prev + 1);
    }
  };

  const handleStatusChange = async (checked: boolean) => {
    if (!caseId) return;
    const { code } = await updateTestCase({
      id: caseId,
      case_status: checked ? 1 : 2,
    } as any);
    if (code === 0) {
      callback?.();
    }
  };

  const SaveIndicator = () => {
    const config = {
      0: { text: '', icon: null },
      1: { text: '保存中...', icon: <Spin size="small" /> },
      2: { text: '已保存', icon: <SaveOutlined /> },
    };
    const current = config[editStatus as keyof typeof config];

    if (!current.text) return null;

    return (
      <div style={styles.saveIndicator(editStatus)}>
        {current.icon}
        <span>{current.text}</span>
      </div>
    );
  };

  const CreatorBadge = () => {
    if (!creatorName) return null;
    return (
      <div style={styles.headerRight()}>
        <span>创建者：</span>
        <span style={{ color: colors.primary, fontWeight: 500 }}>
          {creatorName}
        </span>
      </div>
    );
  };

  return (
    <div style={styles.container()}>
      <div style={styles.header()}>
        <div style={styles.headerLeft()}>
          <div style={styles.stepCounter()}>
            <HolderOutlined style={{ fontSize: 14 }} />
            <span>{steps.length} 个步骤</span>
          </div>

          {!hiddenStatusBut && (
            <div
              style={styles.statusSwitch(statusConfig)}
              onClick={() => handleStatusChange(case_status !== 1)}
            >
              {case_status === 1 ? (
                <CheckCircleFilled style={{ fontSize: 14, color: '#22c55e' }} />
              ) : case_status === 2 ? (
                <CloseCircleFilled style={{ fontSize: 14, color: '#ef4444' }} />
              ) : (
                <HolderOutlined
                  style={{ fontSize: 14, color: colors.textSecondary }}
                />
              )}
              <span style={styles.statusText(case_status || 0)}>
                {case_status === 1
                  ? '通过'
                  : case_status === 2
                  ? '失败'
                  : '待测试'}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
          <CreatorBadge />
          <SaveIndicator />
        </div>
      </div>

      <div style={styles.body()}>
        <div style={styles.textareaWrapper()}>
          <div style={styles.textareaLabel()}>
            <span>前置条件</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              （可选）
            </Text>
          </div>
          <textarea
            value={setupValue}
            placeholder="输入用例执行的前置条件..."
            style={styles.textarea(setupFocused)}
            onFocus={() => setSetupFocused(true)}
            onBlur={handleSetupBlur}
            onChange={(e) => setSetupValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
            rows={2}
          />
        </div>

        <div style={styles.sectionTitle()}>测试步骤</div>

        <div style={styles.stepsContainer()}>
          {steps.map((step, index) => (
            <div
              key={step.uid}
              style={styles.stepRow(hoveredStep === step.uid, index)}
              onMouseEnter={() => setHoveredStep(step.uid)}
              onMouseLeave={() => setHoveredStep(null)}
              draggable
              onDragStart={() => handleDragStart(step.uid)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(step.uid)}
            >
              <div
                style={{
                  ...styles.dragHandle(draggedStep === step.uid),
                  opacity: hoveredStep === step.uid ? 1 : 0.3,
                }}
              >
                <HolderOutlined style={{ fontSize: 16 }} />
              </div>

              <div style={styles.stepNumber(index + 1)}>{index + 1}</div>

              <textarea
                value={step.action || ''}
                placeholder="输入操作步骤..."
                style={styles.stepInput(
                  focusedField?.uid === step.uid &&
                    focusedField?.field === 'action',
                )}
                onFocus={() =>
                  setFocusedField({ uid: step.uid, field: 'action' })
                }
                onBlur={() => handleFieldBlur(step.uid)}
                onChange={(e) =>
                  handleFieldChange(step.uid, 'action', e.target.value)
                }
                onKeyDown={(e) => handleFieldKeyDown(e, step.uid)}
                rows={2}
              />

              <textarea
                value={step.expected_result || ''}
                placeholder="输入预期结果..."
                style={styles.stepInput(
                  focusedField?.uid === step.uid &&
                    focusedField?.field === 'expected_result',
                )}
                onFocus={() =>
                  setFocusedField({ uid: step.uid, field: 'expected_result' })
                }
                onBlur={() => handleFieldBlur(step.uid)}
                onChange={(e) =>
                  handleFieldChange(step.uid, 'expected_result', e.target.value)
                }
                onKeyDown={(e) => handleFieldKeyDown(e, step.uid)}
                rows={2}
              />

              <div style={styles.stepActions()}>
                <Tooltip title="复制">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined style={{ fontSize: 14 }} />}
                    onClick={() => {
                      if (typeof step.id === 'number') {
                        copyStep(step.id);
                      }
                    }}
                    style={{ opacity: hoveredStep === step.uid ? 1 : 0 }}
                  />
                </Tooltip>
                <Popconfirm
                  title="确认删除此步骤？"
                  description="删除后无法恢复"
                  onConfirm={() => {
                    if (typeof step.id === 'number') {
                      deleteStep(step.id);
                    }
                  }}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                    style={{ opacity: hoveredStep === step.uid ? 1 : 0 }}
                  />
                </Popconfirm>
              </div>
            </div>
          ))}

          <button
            style={styles.addButton()}
            onClick={addStep}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1890ff';
              e.currentTarget.style.color = '#1890ff';
              e.currentTarget.style.background = '#e6f7ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.color = '';
              e.currentTarget.style.background = '';
            }}
          >
            <PlusOutlined style={{ fontSize: 16 }} />
            <span>添加步骤</span>
          </button>
        </div>

        <div style={styles.textareaWrapper()}>
          <div style={styles.textareaLabel()}>
            <span>备注</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              （可选）
            </Text>
          </div>
          <textarea
            value={markValue}
            placeholder="输入备注信息..."
            style={styles.textarea(markFocused)}
            onFocus={() => setMarkFocused(true)}
            onBlur={handleMarkBlur}
            onChange={(e) => setMarkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
            rows={2}
          />
        </div>
        <div style={styles.footerAction()}>
          <Button
            hidden={hiddenStatusBut}
            style={styles.quickCreateBtn()}
            onClick={async () => {
              if (!caseId || !requirement_id) return;
              const { code, msg } = await copyTestCase({
                requirement_id: requirement_id,
                caseId: caseId,
              });
              if (code === 0) {
                message.success(msg);
                callback?.();
              }
            }}
          >
            <PlusOutlined />
            快速创建下一个
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseSubSteps;
