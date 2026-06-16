import { CheckOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, message, Select, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { updateCaseStepResult } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
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
  /**
   * 父用例一轮测试状态（可选）
   * 仅在首次渲染、子步骤自身无值时用于兜底填充，
   * 父用例状态后续变化【不再】级联到子步骤
   */
  firstStatus?: string;
  /**
   * 父用例二轮测试状态（可选）
   * 仅在首次渲染、子步骤自身无值时用于兜底填充，
   * 父用例状态后续变化【不再】级联到子步骤
   */
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
  const { colors, borderRadius } = useCaseHubTheme();
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
   * 当外部 steps 变化时同步内部状态
   *
   * 重要: 不再用父级 status 兜底子步骤的 null 值。
   * 原因: 后端 case_sub_step_result 中 first_status / second_status 为 null
   * 表示"未开始",labelRender 会显示"未开始"占位;若用父级 status 兜底,
   * 会出现父用例改了状态、所有子步骤都被强制刷成相同状态的副作用
   * (覆盖了 labelRender 的"未开始"判断)。
   *
   * 注意: 仅依赖 steps,firstStatus / secondStatus 的后续变化不再触发本 effect。
   * 二轮状态的级联同步由下方单独的 useEffect 负责(且仅在 prop 真正变化时触发)。
   */
  useEffect(() => {
    setDataSource([...steps]);
  }, [steps]);

  /**
   * 二轮测试状态同步:父用例二轮状态变化时,级联更新所有子步骤的二轮状态
   * 一轮状态变化不触发此同步(由业务需求决定)
   *
   * 关键: 仅在 secondStatus 真正变化时级联,初次挂载(prop 由 undefined 变成
   * 初始值)不算"用户主动修改父级",此时不动子步骤的真实 null,
   * 保持"未开始"占位。后续父级 status 变化才级联。
   *
   * 注意: EditableProTable 在 multiple 编辑模式下内部 form 不会随 value prop 自动刷新,
   * 必须通过 editorFormRef.setRowData 逐行同步内部编辑态,否则 UI 不会实时更新。
   */
  const prevSecondStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (secondStatus === undefined) return;
    // 初次挂载: 仅记录当前值,不级联(让 labelRender 自然展示"未开始")
    if (prevSecondStatusRef.current === undefined) {
      prevSecondStatusRef.current = secondStatus;
      return;
    }
    // 值未变: 跳过(React 18 严格模式下 effect 可能跑两次)
    if (prevSecondStatusRef.current === secondStatus) return;
    prevSecondStatusRef.current = secondStatus;

    const next = dataSourceRef.current.map((step) => ({
      ...step,
      second_status: secondStatus,
    }));
    setDataSource(next);
    // 同步 EditableProTable 内部 form,否则 multiple 编辑模式下表格 UI 不刷新
    next.forEach((row, index) => {
      editorFormRef.current?.setRowData?.(index, row);
    });
  }, [secondStatus]);

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
   * @param updatedRow 要更新的行数据
   * @param options.skipFirstSecond 为 true 时不传递 first_status / second_status
   *                               （用于"复制预期到实际结果"等只改 actual_result 的场景）
   *
   * 注意：updatedRow 必须存在才发起请求，避免 fallback 到错误行数据
   */
  const emitDataChange = useMemo(
    () =>
      debounce(
        async (
          updatedRow?: CaseSubStep,
          options?: { skipFirstSecond?: boolean },
        ) => {
          // 无有效行数据时直接返回，不发送请求（防止误更新其他步骤）
          if (!updatedRow) return;

          const stepData: StepData = {
            step_id: updatedRow.id,
            plan_id: Number(planIdRef.current),
            status: String(updatedRow.status ?? 0),
            actual_result: updatedRow.actual_result ?? '',
            bug_url: updatedRow.bug_url ?? '',
          };

          // 仅在非 skip 模式下才传递一二轮状态
          // （复制预期到实际结果时不应覆盖子步骤已有的一二轮状态）
          if (!options?.skipFirstSecond) {
            stepData.first_status = updatedRow.first_status;
            stepData.second_status = updatedRow.second_status;
          }

          try {
            await updateCaseStepResult(stepData);
          } catch (e) {
            // 防抖请求失败时静默处理，避免重复提示（用户可能已离开该步骤）
            console.error('updateCaseStepResult error:', e);
          }
        },
        1000,
      ),
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

      // 复制预期到实际结果：只传 actual_result + 必要字段，不覆盖一二轮状态
      emitDataChange(newRow, { skipFirstSecond: true });
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
            labelRender={(option) => {
              const value = option.value as string;
              const cfg = stepStatusConfig[value];
              // 状态为空/无效时:仅显示占位文字,不渲染 updater
              if (!value || !cfg) {
                return (
                  <span
                    style={{
                      color: colors.textTertiary,
                      fontSize: 12,
                    }}
                  >
                    未开始
                  </span>
                );
              }
              return renderStatusOption(value);
            }}
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
            labelRender={(option) => {
              const value = option.value as string;
              const cfg = stepStatusConfig[value];
              // 状态为空/无效时:仅显示占位文字,不渲染 updater
              if (!value || !cfg) {
                return (
                  <span
                    style={{
                      color: colors.textTertiary,
                      fontSize: 12,
                    }}
                  >
                    未开始
                  </span>
                );
              }
              return renderStatusOption(value);
            }}
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
      colors,
      borderRadius,
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
