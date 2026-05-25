import { CheckOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import {
  Button,
  Input,
  message,
  Popover,
  Select,
  Tooltip,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { updateCaseStepResult } from '@/api/case/caseplan';
import { CaseSubStep } from '@/pages/CaseHub/types';
import debounce from 'lodash/debounce';
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
  const [popoverOpenId, setPopoverOpenId] = useState<number | null>(null);

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
        console.log('[StepTable] 数据变更:', stepData);
        await updateCaseStepResult(stepData);
      }, 1000),
    [],
  );

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

      emitDataChange(newRow);
      await updateCaseStepResult({
        plan_id: Number(planId),
        step_id: row.id,
        status: 1,
        actual_result: newValue,
      }).then(({ code }) => {
        if (code === 0) {
          message.success('已复制预期结果到实际结果');
        }
      });
    },
    [dataSource, emitDataChange, planId],
  );

  /**
   * 缺陷链接输入组件 - Popover 内嵌输入框
   * 内部独立管理输入状态，避免输入时触发父组件重渲染导致卡顿
   */
  const BugUrlInput: React.FC<{ record: CaseSubStep; onClose: () => void }> = ({
    record,
    onClose,
  }) => {
    const [inputValue, setInputValue] = useState('');

    const handleConfirm = () => {
      if (!inputValue.trim()) {
        message.warning('请输入缺陷链接');
        return;
      }

      const rowIndex = dataSource.findIndex((item) => item.id === record.id);
      if (rowIndex === -1) return;

      const newRow = { ...dataSource[rowIndex], bug_url: inputValue.trim() };
      editorFormRef.current?.setRowData?.(rowIndex, newRow);
      setDataSource((prev) =>
        prev.map((item) => (item.id === record.id ? newRow : item)),
      );

      onClose();
      message.success('缺陷链接已添加');
    };

    return (
      <div style={{ width: 280 }}>
        <Input
          placeholder="请输入缺陷URL"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleConfirm}
          autoFocus
        />
        <div style={{ marginTop: 8, textAlign: 'right' }}>
          <Button size="small" onClick={onClose} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" size="small" onClick={handleConfirm}>
            确认
          </Button>
        </div>
      </div>
    );
  };

  /**
   * 根据状态值获取配置并渲染选项
   * 使用统一的状态配置
   */
  const renderStatusOption = useCallback((option: { value: number }) => {
    const cfg = STEP_STATUS_CONFIG[option.value];
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
        formItemRender: () => (
          <Select
            variant="underlined"
            defaultValue={0}
            style={{ width: '100%' }}
            options={statusOptions}
            optionRender={(option) => renderStatusOption(option)}
            labelRender={(option) => renderStatusOption(option)}
          />
        ),
      },
      {
        title: '缺陷',
        dataIndex: 'bug_url',
        width: '12%',
        ellipsis: true,
        editable: false,
        render: (_, record: CaseSubStep) => {
          const bugUrl = record.bug_url;
          if (bugUrl) {
            return (
              <Tooltip title={`跳转至: ${bugUrl}`}>
                <a
                  href={bugUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <LinkOutlined />
                  <span
                    style={{
                      maxWidth: 80,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    BUG
                  </span>
                </a>
              </Tooltip>
            );
          }

          return (
            <Popover
              trigger="click"
              open={popoverOpenId === record.id}
              onOpenChange={(open) => {
                setPopoverOpenId(open ? record.id : null);
              }}
              content={
                <BugUrlInput
                  record={record}
                  onClose={() => setPopoverOpenId(null)}
                />
              }
            >
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={(e) => e.stopPropagation()}
              >
                添加缺陷
              </Button>
            </Popover>
          );
        },
      },
    ],
    [
      handleCopyExpectedToActual,
      popoverOpenId,
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
