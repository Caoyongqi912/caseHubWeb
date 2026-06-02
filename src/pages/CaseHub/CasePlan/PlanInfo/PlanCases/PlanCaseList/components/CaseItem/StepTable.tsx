import { CheckOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, Form, message, Select, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { updateCaseStepResult } from '@/api/case/caseplan';
import { CaseSubStep } from '@/pages/CaseHub/types';
import debounce from 'lodash/debounce';
import BugUrlPopover from './BugUrlPopover';
import { STEP_STATUS_CONFIG } from './statusConfig';

const { Text } = Typography;

interface StepData {
  step_id: number;
  plan_id: number;
  status?: number;
  first_status?: number;
  second_status?: number;
  actual_result: string;
  bug_url: string;
}

interface StepTableProps {
  steps: CaseSubStep[];
  planId?: string;
  /** 父用例一轮测试状态（可选），变化时级联更新所有步骤 first_status */
  firstStatus?: number;
  /** 父用例二轮测试状态（可选），变化时级联更新所有步骤 second_status */
  secondStatus?: number;
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
   */
  useEffect(() => {
    setDataSource(steps);
  }, [steps]);

  /**
   * 跟踪上一次参与级联更新的状态值
   * 使用 ref 而非 state：
   * - 仅作为读取源判断"是否变化"，无需订阅变更
   * - 避免在级联过程中触发额外重渲染
   */
  const lastCascadeFirstStatusRef = useRef<number | undefined>(undefined);
  const lastCascadeSecondStatusRef = useRef<number | undefined>(undefined);

  /**
   * 步骤状态选项配置
   * 用于表单下拉选择（步骤主状态 / 一轮 / 二轮共用同一份枚举）
   */
  const statusOptions = useMemo(
    () =>
      Object.entries(STEP_STATUS_CONFIG).map(([value, config]) => ({
        value: Number(value),
        label: config.label,
      })),
    [],
  );

  /**
   * 更新步骤数据并同步到后端（已做 1s 防抖）
   * debounce 实例保持稳定，通过 ref 读取最新数据
   */
  const emitDataChange = useMemo(
    () =>
      debounce(async (updatedRow?: CaseSubStep) => {
        const targetRow = updatedRow || dataSourceRef.current[0];
        if (!targetRow) return;

        const stepData: StepData = {
          step_id: targetRow.id,
          plan_id: Number(planIdRef.current),
          status: targetRow.status ?? 0,
          first_status: targetRow.first_status,
          second_status: targetRow.second_status,
          actual_result: targetRow.actual_result ?? '',
          bug_url: targetRow.bug_url ?? '',
        };
        await updateCaseStepResult(stepData);
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
   * 批量同步所有步骤状态到后端（防抖 1s）
   * 用途：父用例状态变更时级联更新其下全部步骤
   * - 并行调用每条步骤的 updateCaseStepResult 接口
   * - 通过 ref 读取最新数据，函数体无需依赖外部 state
   * - 接受部分更新对象（first_status / second_status），仅提交变更字段
   */
  const emitBatchStatusChange = useMemo(
    () =>
      debounce(
        async (updates: { first_status?: number; second_status?: number }) => {
          const current = dataSourceRef.current;
          if (!current.length || !planIdRef.current) return;

          // 并行调用每条步骤的更新接口，单条失败不影响其他步骤
          await Promise.all(
            current.map((row) =>
              updateCaseStepResult({
                step_id: row.id,
                plan_id: Number(planIdRef.current),
                ...updates,
                actual_result: row.actual_result ?? '',
                bug_url: row.bug_url ?? '',
              }),
            ),
          );
        },
        1000,
      ),
    [],
  );

  /** 组件卸载时取消批量同步的未执行 debounce */
  useEffect(() => {
    return () => {
      emitBatchStatusChange.cancel();
    };
  }, [emitBatchStatusChange]);

  /**
   * 将父用例级联状态应用到全部步骤（本地 + 编辑表单）
   * 仅做本地状态与 ProTable 行数据同步，不直接发请求；
   * 防抖请求由调用方通过 emitBatchStatusChange 触发
   * @param field 状态字段名
   * @param value 新状态值
   */
  const applyCascadeToSteps = useCallback(
    (field: 'first_status' | 'second_status', value: number) => {
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
   * - 立即更新本地 dataSource 与编辑表单行数据（视觉即时反馈）
   * - 触发防抖批量同步到后端（避免与单步编辑接口重复请求）
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
    emitBatchStatusChange({ first_status: firstStatus });
  }, [firstStatus, emitBatchStatusChange, applyCascadeToSteps]);

  /**
   * 监听父用例二轮测试状态变更，级联更新所有步骤 second_status
   * 逻辑同 caseStatus 级联
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
    emitBatchStatusChange({ second_status: secondStatus });
  }, [secondStatus, emitBatchStatusChange, applyCascadeToSteps]);

  /**
   * 将预期结果复制到实际结果，并标记为通过状态
   * 同时更新前端状态和后端数据
   */
  const handleCopyExpectedToActual = useCallback(
    async (row: CaseSubStep) => {
      const newValue = row.expected_result ?? '';
      const rowIndex = dataSource.findIndex((item) => item.id === row.id);

      if (rowIndex === -1) {
        message.error('未找到该行数据');
        return;
      }

      const newRow = {
        ...dataSource[rowIndex],
        actual_result: newValue,
        status: 1,
      };

      editorFormRef.current?.setRowData?.(rowIndex, newRow);
      setDataSource((prev) =>
        prev.map((item) => (item.id === row.id ? newRow : item)),
      );

      // 通过 emitDataChange 异步同步后端，避免与 debounce 重复触发接口
      emitDataChange(newRow);
      message.success('已复制预期结果到实际结果');
    },
    [dataSource, emitDataChange, planId],
  );

  /**
   * 根据状态值获取配置并渲染选项
   * 使用统一的状态配置
   * @param value - 状态值
   */
  const renderStatusOption = useCallback((value: number) => {
    const cfg = STEP_STATUS_CONFIG[value];
    if (!cfg) return null;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  }, []);

  /**
   * 渲染状态展示单元格（非编辑模式）
   * 仅展示当前状态对应的图标 + label
   */
  const renderStatusDisplay = useCallback((value?: number) => {
    const cfg = STEP_STATUS_CONFIG[value ?? 0];
    if (!cfg) return <Text type="secondary">-</Text>;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  }, []);

  /**
   * 渲染状态可编辑单元格（编辑模式）
   * 关键：必须用 Form.Item 包裹 Select，让 EditableProTable 的编辑表单
   * 知道这个字段存在；否则用户在下拉里选新状态后，编辑表单感知不到变化，
   * onValuesChange 不会触发，dataSource 不会更新，关闭后 UI 又回到旧值。
   * @param field 字段名（status / first_status / second_status）
   */
  const renderStatusFormItem = useCallback(
    (field: 'status' | 'first_status' | 'second_status') => (
      <Form.Item name={field} noStyle>
        <Select
          variant="underlined"
          style={{ width: '100%' }}
          options={statusOptions}
          optionRender={(option) =>
            renderStatusOption(Number(option.data.value))
          }
          labelRender={(option) => renderStatusOption(Number(option.value))}
        />
      </Form.Item>
    ),
    [statusOptions, renderStatusOption],
  );

  /**
   * 表格列配置
   * 注意：handleCopyExpectedToActual 和 popoverOpenId 变化时会重建列配置
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
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        width: '10%',
        render: (_, record) => renderStatusDisplay(record?.status),
        formItemRender: () => renderStatusFormItem('status'),
      },
      {
        title: '一轮测试状态',
        key: 'first_status',
        dataIndex: 'first_status',
        width: '11%',
        render: (_, record) => renderStatusDisplay(record?.first_status),
        formItemRender: () => renderStatusFormItem('first_status'),
      },
      {
        title: '二轮测试状态',
        key: 'second_status',
        dataIndex: 'second_status',
        width: '11%',
        render: (_, record) => renderStatusDisplay(record?.second_status),
        formItemRender: () => renderStatusFormItem('second_status'),
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
      renderStatusDisplay,
      renderStatusFormItem,
      emitDataChange,
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
      onChange={(value) => setDataSource([...value])}
      rowKey="id"
      pagination={false}
      search={false}
      options={false}
      columns={stepColumns}
      recordCreatorProps={false}
      scroll={{ x: 'max-content' }}
      editable={{
        type: 'multiple',
        editableKeys,
        onValuesChange: (_, recordList) => {
          setDataSource(recordList);
          if (recordList.length > 0) {
            emitDataChange(recordList[0]);
          }
        },
      }}
    />
  );
};

export default StepTable;
