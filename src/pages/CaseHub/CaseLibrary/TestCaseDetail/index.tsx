import {
  copyTestCaseStep,
  handleAddTestCaseStep,
  queryTestCaseSupStep,
  removeTestCaseStep,
  reorderTestCaseStep,
  updateTestCase,
  updateTestCaseStep,
} from '@/api/case/testCase';
import { CaseHubConfig } from '@/pages/CaseHub/config/constants';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSubStep, ITestCase } from '@/pages/CaseHub/types';
import { HolderOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, Input, Space, Spin, Tag, theme, Typography } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import StepItem from '../../components/CaseSubSteps/StepItem';
import { useTestCaseDetailStyles } from './styles';

const { Text } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

/**
 * 用例详情组件 Props
 */
interface Props {
  testcase?: ITestCase;
  callback: () => void;
}

/**
 * 用例详情组件
 *
 * 功能特性：
 * - 展示用例基本信息（标题、等级、类型）
 * - 管理测试步骤（拖拽排序、新增、复制、删除）
 * - 编辑前置条件和备注
 * - 自动保存修改内容
 */
const TestCaseDetail: FC<Props> = ({ testcase, callback }) => {
  const [form] = Form.useForm();
  const { token } = useToken();
  const { colors, spacing, borderRadius } = useCaseHubTheme();
  const styles = useTestCaseDetailStyles();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [steps, setSteps] = useState<CaseSubStep[]>([]);
  const [addLine, setAddLine] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { CASE_LEVEL_OPTION, CASE_TYPE_OPTION } = CaseHubConfig;

  const stepsRef = useRef<CaseSubStep[]>(steps);
  const draggedIdRef = useRef<string | null>(null);

  // ==================== 副作用 ====================

  /** 保持 stepsRef 与 steps 同步 */
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  /** 同步 testcase 数据到表单 */
  useEffect(() => {
    if (!testcase) return;
    console.log(testcase);
    form.setFieldsValue(testcase);
  }, [testcase, form]);

  /** 加载测试步骤数据 */
  useEffect(() => {
    if (!testcase?.id) return;
    queryTestCaseSupStep(testcase.id.toString()).then(({ code, data }) => {
      if (code === 0) {
        setSteps(data);
      }
    });
  }, [testcase?.id, addLine]);

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

  /** 处理步骤拖拽放置，重新排序并同步到服务器 */
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

        const orderIds = newSteps
          .map((item) => item.id)
          .filter((id): id is number => typeof id === 'number');
        await reorderTestCaseStep({ step_ids: orderIds });
      }
    },
    [steps],
  );

  // ==================== 步骤操作 ====================

  /** 保存单个步骤，使用防抖机制 */
  const saveStep = useCallback(async (uid: string) => {
    const step = stepsRef.current.find((s) => s.uid === uid);
    if (!step?.id) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      const { code } = await updateTestCaseStep(step);
      if (code === 0) {
        setIsSaving(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    }, 500);
  }, []);

  /** 处理步骤字段变化 */
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

  /** 处理步骤失焦，触发保存 */
  const handleFieldBlur = useCallback(
    (uid: string) => {
      saveStep(uid);
    },
    [saveStep],
  );

  /** 删除步骤 */
  const deleteStep = useCallback(async (stepId: number) => {
    const { code } = await removeTestCaseStep({ stepId });
    if (code === 0) setAddLine((prev) => prev + 1);
  }, []);

  /** 复制步骤 */
  const copyStep = useCallback(async (stepId: number) => {
    const { code } = await copyTestCaseStep({ step_id: stepId });
    if (code === 0) setAddLine((prev) => prev + 1);
  }, []);

  /** 新增步骤 */
  const addStep = useCallback(async () => {
    if (!testcase?.id) return;
    const { code } = await handleAddTestCaseStep({ caseId: testcase.id });
    if (code === 0) setAddLine((prev) => prev + 1);
  }, [testcase?.id]);

  // ==================== 表单保存 ====================

  /**
   * 处理表单值变化，统一检测所有字段修改
   */
  const handleFormValuesChange = useCallback(
    async (_changedValues: Partial<ITestCase>, allValues: ITestCase) => {
      if (!testcase?.id) return;

      // 检测是否有字段发生变化
      const hasChanges =
        allValues.case_mark !== testcase.case_mark ||
        allValues.case_setup !== testcase.case_setup ||
        allValues.case_name !== testcase.case_name ||
        allValues.case_level !== testcase.case_level ||
        allValues.case_type !== testcase.case_type;

      if (hasChanges) {
        // 防抖保存
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        setIsSaving(true);
        saveTimeoutRef.current = setTimeout(async () => {
          const { code } = await updateTestCase({
            id: testcase.id,
            case_name: allValues.case_name,
            case_level: allValues.case_level,
            case_type: allValues.case_type,
            case_mark: allValues.case_mark,
            case_setup: allValues.case_setup,
          } as ITestCase);

          if (code === 0) {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
            callback?.();
          }
        }, 500);
      }
    },
    [testcase, callback],
  );

  return (
    <div>
      <ProCard style={styles.mainCard()} bodyStyle={{ padding: 0 }}>
        {/* ==================== 头部区域 ==================== */}
        <div style={styles.header()}>
          {/* 左侧：创建者信息 */}
          <div style={styles.headerLeft()}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              创建者
            </Text>
            <Text style={{ fontSize: 13, fontWeight: 500 }}>
              {testcase?.creatorName || '-'}
            </Text>
          </div>

          {/* 右侧：保存状态 */}
          <div style={styles.headerRight()}>
            {isSaving ? (
              <Tag icon={<Spin size="small" />} color="processing">
                保存中...
              </Tag>
            ) : isSaved ? (
              <Tag icon={<SaveOutlined />} color="success">
                已保存
              </Tag>
            ) : null}
          </div>
        </div>

        {/* ==================== 内容区域 ==================== */}
        <div style={styles.body()}>
          <ProForm
            form={form}
            submitter={false}
            onValuesChange={handleFormValuesChange}
          >
            <div style={styles.formGrid()}>
              {/* 用例标题 - 占满整行 */}
              <ProFormTextArea
                name="case_name"
                placeholder="请输入用例标题..."
                required
                //@ts-ignore
                width="100%"
                rules={[{ required: true, message: '标题不能为空' }]}
                fieldProps={{
                  variant: 'filled',
                  autoSize: { minRows: 2, maxRows: 4 },
                }}
              />
            </div>

            {/* 前置条件 */}
            <div style={{ marginBottom: spacing.lg }}>
              <Space style={{ marginBottom: spacing.sm }}>
                <Text strong>前置条件</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  （可选）
                </Text>
              </Space>
              <ProFormTextArea
                name="case_setup"
                placeholder="输入用例执行的前置条件..."
                fieldProps={{
                  variant: 'filled',
                  autoSize: { minRows: 2, maxRows: 4 },
                }}
              />
            </div>

            {/* 测试步骤区域 */}
            <div style={styles.sectionHeader()}>
              <Text style={styles.sectionTitle()}>测试步骤</Text>
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                拖拽调整顺序
              </Text>
              <div style={styles.sectionDivider()} />
              <Space size="large">
                <Space>
                  <HolderOutlined style={{ color: colors.textSecondary }} />
                  <Text type="secondary">{steps.length} 个步骤</Text>
                </Space>
              </Space>
            </div>

            {/* 步骤列表 */}
            <div style={{ marginBottom: token.marginLG }}>
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
                      typeof step.id === 'number' &&
                      deleteStep(step.id as number)
                    }
                  />
                ))}
              </Space>

              {/* 空状态 */}
              {steps.length === 0 && (
                <div style={styles.emptySteps()}>
                  <div style={{ marginBottom: token.marginXS }}>
                    暂无测试步骤
                  </div>
                  <div style={{ fontSize: token.fontSizeSM }}>
                    点击下方按钮添加测试步骤
                  </div>
                </div>
              )}

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

            {/* 用例等级和类型 - 占满一行居中 */}
            <ProForm.Group>
              <ProFormSelect
                name="case_level"
                placeholder="请选择用例等级"
                options={CASE_LEVEL_OPTION}
                fieldProps={{ variant: 'filled' }}
                width={'md'}
              />
              <ProFormSelect
                name="case_type"
                placeholder="请选择用例类型"
                options={CASE_TYPE_OPTION}
                fieldProps={{ variant: 'filled' }}
                width={'md'}
              />
            </ProForm.Group>

            {/* 备注 */}
            <div style={{ marginBottom: spacing.lg }}>
              <Space style={{ marginBottom: spacing.sm }}>
                <Text strong>备注</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  （可选）
                </Text>
              </Space>

              <ProFormTextArea
                name="case_mark"
                placeholder="输入备注信息..."
                fieldProps={{
                  variant: 'filled',
                  autoSize: { minRows: 2, maxRows: 4 },
                }}
              />
            </div>
          </ProForm>
        </div>
      </ProCard>
    </div>
  );
};

export default TestCaseDetail;
