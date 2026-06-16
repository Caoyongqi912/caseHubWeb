import { CheckOutlined, UserOutlined } from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProColumns,
} from '@ant-design/pro-components';
import { Button, message, Select, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useModel } from '@umijs/max';

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
  // 当前用户: 用于 status 变更后乐观更新 updater 信息,避免等后端回写
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const currentUpdaterId = currentUser?.id;
  const currentUpdaterName = currentUser?.username;
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
   * 当外部 steps 变化时初始化内部状态
   *
   * 初始化补全：如果步骤数据中 first_status / second_status 缺失，
   * 但父组件传入了对应的 status 值，则用父级状态填充（保证初始渲染有数据）
   *
   * 注意：仅依赖 steps，firstStatus / secondStatus 的后续变化不再触发本 effect，
   * 避免父级一轮/二轮状态切换时覆盖用户已编辑的子步骤状态。
   * 二轮状态的同步由下方单独的 useEffect 负责。
   */
  useEffect(() => {
    const parentFirst = firstStatus ?? '';
    const parentSecond = secondStatus ?? '';

    const initializedSteps = steps.map((step) => ({
      ...step,
      // 仅当步骤本身无值时才用父级值填充，避免覆盖后端已有数据
      first_status: step.first_status ?? parentFirst,
      second_status: step.second_status ?? parentSecond,
    }));
    setDataSource(initializedSteps);
  }, [steps]);

  /**
   * 二轮测试状态同步：父用例二轮状态变化时，级联更新所有子步骤的二轮状态
   * 一轮状态变化不触发此同步（由业务需求决定）
   *
   * 注意：EditableProTable 在 multiple 编辑模式下内部 form 不会随 value prop 自动刷新，
   * 必须通过 editorFormRef.setRowData 逐行同步内部编辑态，否则 UI 不会实时更新。
   */
  useEffect(() => {
    if (secondStatus === undefined) return;
    const next = dataSourceRef.current.map((step) => ({
      ...step,
      second_status: secondStatus,
    }));
    setDataSource(next);
    // 同步 EditableProTable 内部 form，否则 multiple 编辑模式下表格 UI 不刷新
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
        width: '13%',
        /**
         * 该列在 EditableProTable 中所有行均处于编辑态,
         * 视图层只走 formItemRender 不会调 render。
         * 通过 Select 的 labelRender 把"更新人"与状态合并为单行:
         *   `admin - ● 成功 ▾`  (无 admin 时退化为 `● 成功 ▾`)
         * 下拉项仍为 `● 成功` 形式,避免选择项也带 admin 前缀。
         * render 同步保留以防 editableKeys 后续改为受控时退化为只读。
         */
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
              const cfg = stepStatusConfig[option.value as string] || {};
              const dot = (
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
              );
              const labelEl = <span>{cfg.label || '-'}</span>;
              if (record?.updaterName) {
                return (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={`更新人: ${record.updaterName}`}
                  >
                    <UserOutlined
                      style={{ fontSize: 11, color: colors.textTertiary }}
                    />
                    <span
                      style={{
                        color: colors.textTertiary,
                        maxWidth: 70,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {record.updaterName}
                    </span>
                    <span
                      style={{
                        color: colors.textTertiary,
                        opacity: 0.5,
                      }}
                    >
                      -
                    </span>
                    {dot}
                    {labelEl}
                  </span>
                );
              }
              return (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {dot}
                  {labelEl}
                </span>
              );
            }}
            disabled={!record}
          />
        ),
        render: (_, record: CaseSubStep) => {
          const cfg = stepStatusConfig[record?.first_status || ''] || {};
          const dot = (
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
          );
          if (record?.updaterName) {
            return (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={`更新人: ${record.updaterName}`}
              >
                <UserOutlined
                  style={{ fontSize: 11, color: colors.textTertiary }}
                />
                <span
                  style={{
                    color: colors.textTertiary,
                    maxWidth: 70,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {record.updaterName}
                </span>
                <span style={{ color: colors.textTertiary, opacity: 0.5 }}>
                  -
                </span>
                {dot}
                <span>{cfg.label || '-'}</span>
              </span>
            );
          }
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {dot}
              <span>{cfg.label || '-'}</span>
            </span>
          );
        },
      },
      {
        title: '二轮测试状态',
        key: 'second_status',
        dataIndex: 'second_status',
        width: '11%',
        /**
         * 与一轮一致:通过 Select 的 labelRender 把"更新人"与状态合并为单行
         * (有 admin: 头像 + admin - 状态;无 admin: 状态)
         * 下拉项 optionRender 保持纯状态展示,不带 admin 前缀。
         */
        formItemRender: (_, { record }) => (
          <Select
            variant="underlined"
            value={record?.second_status}
            style={{ width: '100%' }}
            options={statusOptions}
            optionRender={(option) =>
              renderStatusOption(option.data.value as string)
            }
            labelRender={(option) => {
              const cfg = stepStatusConfig[option.value as string] || {};
              const dot = (
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
              );
              const labelEl = <span>{cfg.label || '-'}</span>;
              if (record?.updaterName) {
                return (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={`更新人: ${record.updaterName}`}
                  >
                    <UserOutlined
                      style={{ fontSize: 11, color: colors.textTertiary }}
                    />
                    <span
                      style={{
                        color: colors.textTertiary,
                        maxWidth: 55,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {record.updaterName}
                    </span>
                    <span
                      style={{
                        color: colors.textTertiary,
                        opacity: 0.5,
                      }}
                    >
                      -
                    </span>
                    {dot}
                    {labelEl}
                  </span>
                );
              }
              return (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {dot}
                  {labelEl}
                </span>
              );
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
          // 乐观更新: 当 first_status / second_status 变化时,
          // 立即把当前用户标为 updater,让"admin - 成功"那一行
          // 无需等后端回写就即时刷新。后端会通过 _do_update_case_step_result
          // 持久化 updater 字段(待后端补上),下次刷新会与服务端一致。
          const isStatusChange =
            changedRecord &&
            ('first_status' in changedRecord ||
              'second_status' in changedRecord);

          let nextList: CaseSubStep[] = recordList;
          if (isStatusChange && currentUpdaterId && currentUpdaterName) {
            const targetId = (changedRecord as CaseSubStep).id;
            nextList = recordList.map((r) =>
              r.id === targetId
                ? {
                    ...r,
                    updater: currentUpdaterId,
                    updaterName: currentUpdaterName,
                  }
                : r,
            );
          }
          setDataSource(nextList);
          if (changedRecord) {
            emitDataChange(changedRecord as CaseSubStep);
          }
        },
      }}
    />
  );
};

export default StepTable;
