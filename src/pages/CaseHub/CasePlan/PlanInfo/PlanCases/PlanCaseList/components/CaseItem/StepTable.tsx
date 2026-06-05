import { CheckOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, message, Select, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { updateCaseStepResult } from '@/api/case/caseplan';
import { CaseSubStep } from '@/pages/CaseHub/types';
import debounce from 'lodash/debounce';
import BugUrlPopover from './BugUrlPopover';
import { useDynamicStatusConfig } from './statusConfig';

const { Text } = Typography;

interface StepData {
  step_id: number;
  plan_id: number;
  status?: string;
  first_status?: string;
  second_status?: string;
  actual_result: string;
  bug_url: string;
}

interface StepTableProps {
  steps: CaseSubStep[];
  planId?: string;
  /** 父用例一轮测试状态（可选），变化时级联更新所有步骤 first_status */
  firstStatus?: string;
  /** 父用例二轮测试状态（可选），变化时级联更新所有步骤 second_status */
  secondStatus?: string;
}

/**
 * 用例步骤表格组件
 * 支持编辑实际结果、状态、缺陷链接，数据变更自动同步后端（防抖 1s）
 */
const StepTable: React.FC<StepTableProps> = ({
  steps,
  planId,
  firstStatus,
  secondStatus,
}) => {
  const editorFormRef = useRef<EditableFormInstance<CaseSubStep>>();
  const [dataSource, setDataSource] = useState<CaseSubStep[]>(steps);

  /**
   * 从 Context 获取动态状态配置
   * caseStatusConfig: 状态值 → { label, color } 映射（用于下拉选项渲染）
   * 步骤状态与用例执行状态共用同一份枚举配置，直接使用 caseStatusConfig 即可
   */
  const { caseStatusConfig: stepStatusConfig } = useDynamicStatusConfig();

  /**
   * 使用 ref 保存最新值，避免 debounce 因依赖变化而重新创建
   * 这解决了闭包陷阱：debounce 内部可以访问最新数据和 props
   */
  const dataSourceRef = useRef(dataSource);
  const planIdRef = useRef(planId);

  useEffect(() => {
    dataSourceRef.current = dataSource;
  }, [dataSource]);

  useEffect(() => {
    planIdRef.current = planId;
  }, [planId]);

  /**
   * 当外部 steps 变化时更新内部状态
   * 使用函数式更新避免依赖 steps
   *
   * 初始化补全：如果步骤数据中 first_status / second_status 缺失，
   * 但父组件传入了对应的 status 值，则用父级状态填充（保证初始渲染有数据）
   */
  useEffect(() => {
    // 父 case 的状态值（string 类型，undefined 表示未传入）
    const parentFirst = firstStatus ?? '';
    const parentSecond = secondStatus ?? '';

    const initializedSteps = steps.map((step) => ({
      ...step,
      // 仅当步骤本身无值时才用父级值填充，避免覆盖后端已有数据
      first_status: step.first_status ?? parentFirst,
      second_status: step.second_status ?? parentSecond,
    }));
    setDataSource(initializedSteps);
  }, [steps, firstStatus, secondStatus]);

  /**
   * 跟踪上一次参与级联更新的状态值
   * 使用 ref 而非 state：
   * - 仅作为读取源判断"是否变化"，无需订阅变更
   * - 避免在级联过程中触发额外重渲染
   */
  const lastCascadeFirstStatusRef = useRef<string | undefined>(undefined);
  const lastCascadeSecondStatusRef = useRef<string | undefined>(undefined);

  /**
   * 步骤状态选项配置
   * 用于表单下拉选择（步骤主状态 / 一轮 / 二轮共用同一份枚举）
   * 从动态 stepStatusConfig 构建，value 为 string 类型（与后端枚举对齐）
   */
  const statusOptions = useMemo(
    () =>
      Object.entries(stepStatusConfig).map(([value, config]) => ({
        value,
        label: config.label,
      })),
    [stepStatusConfig],
  );

  /**
   * 更新步骤数据并同步到后端（已做 1s 防抖）
   * debounce 实例保持稳定，通过 ref 读取最新数据
   *
   * 注意：updatedRow 必须存在才发起请求，避免 fallback 到错误行数据
   */
  const emitDataChange = useMemo(
    () =>
      debounce(async (updatedRow?: CaseSubStep) => {
        // 无有效行数据时直接返回，不发送请求（防止误更新其他步骤）
        if (!updatedRow) return;

        const stepData: StepData = {
          step_id: updatedRow.id,
          plan_id: Number(planIdRef.current),
          status: String(updatedRow.status ?? 0),
          // CaseSubStep.first_status / second_status 已为 string 类型，直接使用
          first_status: updatedRow.first_status,
          second_status: updatedRow.second_status,
          actual_result: updatedRow.actual_result ?? '',
          bug_url: updatedRow.bug_url ?? '',
        };
        try {
          await updateCaseStepResult(stepData);
        } catch (e) {
          // 防抖请求失败时静默处理，避免重复提示（用户可能已离开该步骤）
          console.error('updateCaseStepResult error:', e);
        }
      }, 1000),
    [],
  );

  /** 组件卸载时取消未执行的 debounce */
  useEffect(() => {
    return () => {
      emitDataChange.cancel();
    };
  }, [emitDataChange]);

  /**
   * 将父用例级联状态应用到全部步骤（本地 + 编辑表单）
   * 仅做本地状态与 ProTable 行数据同步，不直接发请求；
   * 防抖请求由调用方通过 emitBatchStatusChange 触发
   * @param field 状态字段名
   * @param value 新状态值
   */
  const applyCascadeToSteps = useCallback(
    (field: 'first_status' | 'second_status', value: string) => {
      const current = dataSourceRef.current;
      if (current.length === 0) return;

      // 本地状态：批量覆盖所有步骤的指定字段
      const updatedSteps = current.map((step) => ({
        ...step,
        [field]: value,
      }));
      setDataSource(updatedSteps);

      // 同步更新可编辑表单中的行数据，保证 ProTable 渲染一致
      updatedSteps.forEach((row, index) => {
        editorFormRef.current?.setRowData?.(index, row);
      });
    },
    [],
  );

  /**
   * 监听父用例一轮测试状态变更，级联更新所有步骤 first_status
   * - 仅在 firstStatus 实际变化时触发
   * - 跳过初次挂载（lastCascadeFirstStatusRef.current 为 undefined）以避免覆盖已有数据
   * - 仅更新本地 dataSource 与编辑表单行数据（视觉即时反馈）
   * - 不发起步骤级请求：后端在 case 层统一处理批量状态更新
   */
  useEffect(() => {
    if (firstStatus === undefined) return;
    if (lastCascadeFirstStatusRef.current === firstStatus) return;

    if (lastCascadeFirstStatusRef.current === undefined) {
      lastCascadeFirstStatusRef.current = firstStatus;
      return;
    }

    lastCascadeFirstStatusRef.current = firstStatus;
    applyCascadeToSteps('first_status', firstStatus);
  }, [firstStatus, applyCascadeToSteps]);

  /**
   * 监听父用例二轮测试状态变更，级联更新所有步骤 second_status
   * 逻辑同 firstStatus 级联，仅做本地赋值，不请求后端
   */
  useEffect(() => {
    if (secondStatus === undefined) return;
    if (lastCascadeSecondStatusRef.current === secondStatus) return;

    if (lastCascadeSecondStatusRef.current === undefined) {
      lastCascadeSecondStatusRef.current = secondStatus;
      return;
    }

    lastCascadeSecondStatusRef.current = secondStatus;
    applyCascadeToSteps('second_status', secondStatus);
  }, [secondStatus, applyCascadeToSteps]);

  /**
   * 将预期结果复制到实际结果，并标记为通过状态
   * 同时更新前端状态和后端数据
   *
   * 使用 ref 读取最新数据（rerender-defer-reads）：
   * 该函数仅在 onClick 中调用，无需在每次 dataSource 变化时重建，
   * 通过 dataSourceRef 获取最新值即可保证数据正确性
   */
  const handleCopyExpectedToActual = useCallback(
    async (row: CaseSubStep) => {
      const newValue = row.expected_result ?? '';
      // 通过 ref 读取最新数据，避免订阅 dataSource 状态导致回调频繁重建
      const current = dataSourceRef.current;
      const rowIndex = current.findIndex((item) => item.id === row.id);

      if (rowIndex === -1) {
        message.error('未找到该行数据');
        return;
      }

      const newRow = {
        ...current[rowIndex],
        actual_result: newValue,
        status: '1',
      };

      editorFormRef.current?.setRowData?.(rowIndex, newRow);
      setDataSource((prev) =>
        prev.map((item) => (item.id === row.id ? newRow : item)),
      );

      // 通过 emitDataChange 异步同步后端，避免与 debounce 重复触发接口
      emitDataChange(newRow);
      message.success('已复制预期结果到实际结果');
    },
    [emitDataChange],
  );

  /**
   * 渲染带颜色圆点的状态选项
   * 利用 stepStatusConfig 中的 color 字段为每个状态渲染彩色圆点 + 文字标签
   * 用于状态下拉选择框的 optionRender / labelRender
   *
   * @param value - 状态字符串值（来自 Select option，与后端枚举 value 对齐）
   */
  const renderStatusOption = useCallback(
    (value: string) => {
      const cfg = stepStatusConfig[value];
      if (!cfg) return null;
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: cfg.color || '#999',
              flexShrink: 0,
            }}
          />
          <span>{cfg.label}</span>
        </span>
      );
    },
    [stepStatusConfig],
  );

  /**
   * 表格列配置
   * 依赖项变化时重建列配置，保证渲染数据最新
   */
  const stepColumns: ProColumns<CaseSubStep>[] = useMemo(
    () => [
      {
        title: '序号',
        dataIndex: 'index',
        width: '6%',
        align: 'center' as const,
        editable: false,
        render: (_, __, index) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 12,
              color: '#1890ff',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {index + 1}
          </span>
        ),
      },
      {
        title: '操作',
        width: '20%',
        dataIndex: 'action',
        ellipsis: true,
        editable: false,
        render: (_, record) => <Text type="secondary">{record.action}</Text>,
      },
      {
        title: '预期',
        width: '20%',
        dataIndex: 'expected_result',
        ellipsis: true,
        editable: false,
        render: (_, record: CaseSubStep) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Tooltip title={record.expected_result || '-'}>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <Text type="secondary">{record.expected_result || '-'}</Text>
              </span>
            </Tooltip>
            <Tooltip title="复制到实际结果">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined style={{ color: 'green' }} />}
                onClick={() => handleCopyExpectedToActual(record)}
              />
            </Tooltip>
          </div>
        ),
      },
      {
        title: '实际结果',
        width: '20%',
        dataIndex: 'actual_result',
        ellipsis: false,
        valueType: 'text',
        fieldProps: {
          placeholder: '请输入实际结果',
          variant: 'underlined' as const,
        },
        render: (text) =>
          text ? (
            <Tooltip title={text}>
              <span
                style={{
                  display: 'block',
                  maxWidth: 150,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </span>
            </Tooltip>
          ) : (
            <span style={{ color: '#c0c0c0' }}>-</span>
          ),
      },
      {
        title: '一轮测试状态',
        key: 'first_status',
        dataIndex: 'first_status',
        width: '11%',
        formItemRender: (_, { record }) => (
          <Select
            variant="underlined"
            value={record?.first_status}
            style={{ width: '100%' }}
            options={statusOptions}
            optionRender={(option) =>
              renderStatusOption(option.data.value as string)
            }
            labelRender={(option) => renderStatusOption(option.value as string)}
            disabled={!record}
          />
        ),
      },
      {
        title: '二轮测试状态',
        key: 'second_status',
        dataIndex: 'second_status',
        width: '11%',
        formItemRender: (_, { record }) => (
          <Select
            variant="underlined"
            // record.second_status 已为 string 类型，与 options.value 直接匹配
            value={record?.second_status}
            style={{ width: '100%' }}
            options={statusOptions}
            optionRender={(option) =>
              renderStatusOption(option.data.value as string)
            }
            labelRender={(option) => renderStatusOption(option.value as string)}
            disabled={!record}
          />
        ),
      },
      {
        title: '缺陷',
        dataIndex: 'bug_url',
        width: '10%',
        ellipsis: true,
        editable: false,
        render: (_, record: CaseSubStep) => (
          <BugUrlPopover
            record={record}
            onConfirm={(bugUrl) => {
              // 通过 dataSourceRef 读取最新数据，避免 columns useMemo 依赖 dataSource
              const current = dataSourceRef.current;
              const rowIndex = current.findIndex(
                (item) => item.id === record.id,
              );
              if (rowIndex === -1) return;
              const newRow = {
                ...current[rowIndex],
                bug_url: bugUrl,
              };
              editorFormRef.current?.setRowData?.(rowIndex, newRow);
              setDataSource((prev) =>
                prev.map((item) => (item.id === record.id ? newRow : item)),
              );
              emitDataChange(newRow);
            }}
          />
        ),
      },
    ],
    [
      handleCopyExpectedToActual,
      emitDataChange,
      statusOptions,
      renderStatusOption,
    ],
  );

  /**
   * 可编辑行的 key 集合
   * 用于标识哪些行可以编辑
   */
  const editableKeys = useMemo(
    () => dataSource.map((item) => item.id),
    [dataSource],
  );

  return (
    <EditableProTable
      editableFormRef={editorFormRef}
      value={dataSource}
      size="small"
      // EditableProTable 返回 readonly 数组，需转为可变数组以匹配 SetStateAction 类型
      onChange={(value) => setDataSource([...value])}
      rowKey="id"
      pagination={false}
      search={false}
      options={false}
      columns={stepColumns}
      recordCreatorProps={false}
      editable={{
        type: 'multiple',
        editableKeys,
        onValuesChange: (changedRecord, recordList) => {
          setDataSource(recordList);
          if (changedRecord) {
            emitDataChange(changedRecord as CaseSubStep);
          }
        },
      }}
    />
  );
};

export default StepTable;
