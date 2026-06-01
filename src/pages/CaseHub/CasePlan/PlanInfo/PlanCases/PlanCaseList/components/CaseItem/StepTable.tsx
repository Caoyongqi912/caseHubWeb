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
import { STEP_STATUS_CONFIG } from './statusConfig';

const { Text } = Typography;

interface StepData {
  step_id: number;
  plan_id: number;
  status: number;
  actual_result: string;
  bug_url: string;
}

interface StepTableProps {
  steps: CaseSubStep[];
  planId?: string;
}

/**
 * 用例步骤表格组件
 * 支持编辑实际结果、状态、缺陷链接，数据变更自动同步后端（防抖 1s）
 */
const StepTable: React.FC<StepTableProps> = ({ steps, planId }) => {
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
   * 步骤状态选项配置
   * 用于表单下拉选择
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
        width: '12%',
        formItemRender: (_, { record }) => (
          <Select
            variant="underlined"
            value={record?.status ?? 0}
            style={{ width: '100%' }}
            options={statusOptions}
            optionRender={(option) =>
              renderStatusOption(Number(option.data.value))
            }
            labelRender={(option) => renderStatusOption(Number(option.value))}
          />
        ),
      },
      {
        title: '缺陷',
        dataIndex: 'bug_url',
        width: '12%',
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
      statusOptions,
      renderStatusOption,
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
