import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import {
  DownOutlined,
  HolderOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Button,
  Checkbox,
  Dropdown,
  message,
  Modal,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  copyOnePlanCase,
  deletePlanCasePermanently,
  removeAssociatePlanCases,
  updateAssociatePlanCases,
} from '@/api/case/caseplan';
import MyDrawer from '@/components/MyDrawer';
import TestCaseDetail from '@/pages/CaseHub/CaseLibrary/TestCaseDetail';
import { ITestCase } from '@/pages/CaseHub/types';

import { createMoreMenuItems } from './moreMenu';
import { StatusConfig, useDynamicStatusConfig } from './statusConfig';
import StepTable from './StepTable';

const { Text } = Typography;

/**
 * 步骤 → 用例 状态聚合 (与后端 _aggregate_case_status_from_steps 规则一致)
 *
 * 规则 (v2 修正: "未设置" 不算"非 pass"):
 *   - 只看已设置的 step (排除 undefined / null / ''), 未测试的不参与判定
 *   - 没有任何已设置 step -> 返回 null, 调用方保持原状 (用户没开始测就不动 case)
 *   - 所有已设置 step = 'pass' -> 用例 status = 'pass'
 *   - 任意已设置 step 是 'fail' / 'block' / 'skip' / 'ready' 等非 pass -> 用例 status = 'fail'
 *
 * 旧版问题: 把 undefined 视为"非 pass", 用户改第一个 step 时 case 直接 fail,
 * 即使后面 step 还没开始测, 体验差. 现版本对齐用户预期: "如果后面有 fail 了 再 fail".
 *
 * 该函数纯函数, 不依赖 React, 便于单测. 前端做"乐观更新"时调用,
 * 后端 update_case_step_result 的 _aggregate_case_status_from_steps
 * 会做相同计算并写 DB, 前后端规则保持单一来源.
 */
type AggregableStatusField = 'first_status' | 'second_status';
function aggregateStepStatuses(
  steps: CaseSubStep[] | undefined | null,
  field: AggregableStatusField,
): string | null {
  if (!steps || steps.length === 0) return null;
  // 过滤掉未设置的 (undefined / null / ''), 这些视为"未测试", 不参与判定
  const setValues = steps
    .map((s) => s[field])
    .filter((v): v is string => v != null && v !== '');
  if (setValues.length === 0) return null;
  return setValues.every((v) => v === 'pass') ? 'pass' : 'fail';
}

interface CaseItemProps {
  testCase: ITestCase;
  selected?: boolean;
  planId?: string;
  moduleId?: number | null;
  onSelectedChange?: (id: number | undefined, selected: boolean) => void;
  onReviewChange?: (caseId: number, isReview: string) => void;
  /** 二轮测试状态切换回调 */
  onSecondStatusChange?: (caseId: number, status: string) => void;
  /** 卡片折叠状态变更回调（用于通知父级虚拟列表重新计算行高） */
  onCollapsedChange?: (caseId: number | undefined, collapsed: boolean) => void;
  /** 是否启用拖拽排序 */
  isSortable?: boolean;
  /** 受控折叠状态（由父组件 collapsedCaseIds 驱动，一键折叠时使用） */
  collapsed?: boolean;
  onRefresh?: () => void;
  /**
   * 多选拖拽时，标识当前行是否是被选中的同伴（非 activeId）。
   * 用于添加视觉提示，让用户清楚看到整块会一起被拖走。
   */
  isBlockDragPeer?: boolean;
}

/**
 * 用例卡片组件
 * 展示单个测试用例的完整信息，包括：
 * - 用例基本信息（名称、评审状态）
 * - 用例步骤列表（由 StepTable 子组件渲染）
 * - 状态切换操作
 * - 更多操作菜单
 */
const CaseItem: React.FC<CaseItemProps> = React.memo((props) => {
  const {
    testCase,
    planId,
    moduleId,
    selected = false,
    onSelectedChange,
    onReviewChange,
    onSecondStatusChange,
    onCollapsedChange,
    isSortable = false,
    collapsed: externalCollapsed,
    onRefresh,
    isBlockDragPeer = false,
  } = props;

  const caseId = testCase.id;
  // ITestCase 的 first_status / second_status / is_review 已为 string 类型，直接使用
  const isReview = testCase.is_review ?? '';

  /**
   * 用例一/二轮状态的本地覆盖 (可控 state).
   *
   * 为什么要 local state:
   * 1) 步骤聚合联动: 用户改完 step 状态 -> 子组件 onStepStatusesChange 回调
   *    触发 -> 这里按后端相同规则做聚合, 乐观更新徽章, 无需刷页
   * 2) 防 prop 漂移: 父级 onSecondStatusChange 触发 refetch 之前, 本地
   *    state 是唯一可靠的真值, 给 StepTable 传值用本地 state
   * 3) 用 lazy initializer 取初值, 避免每次 render 都重置
   *
   * 同步策略 (见下方 useEffect): testCase prop 变化 (含 refetch 拿到新值)
   * 时同步本地 state, 让后端数据回流后覆盖乐观更新.
   */
  const [firstStatus, setFirstStatus] = useState<string>(
    () => testCase.first_status ?? '',
  );
  const [secondStatus, setSecondStatus] = useState<string>(
    () => testCase.second_status ?? '',
  );

  /**
   * prop 同步: testCase.first/second_status 变化时 (refetch / 外部更新)
   * 拉齐本地 state. 仅依赖具体字段, 避免 testCase 引用变化导致无谓重置.
   */
  useEffect(() => {
    setFirstStatus(testCase.first_status ?? '');
  }, [testCase.first_status]);
  useEffect(() => {
    setSecondStatus(testCase.second_status ?? '');
  }, [testCase.second_status]);

  /**
   * 处理子步骤状态变更: 按后端规则做聚合, 乐观更新本地 state.
   * - steps 取最新一次回调的快照, 同时算 first/second 两轮
   * - 仅当聚合结果与本地 state 不同才 setState, 避免触发 StepTable
   *   重复渲染
   */
  const handleStepStatusesChange = useCallback((steps: CaseSubStep[]) => {
    const newFirst = aggregateStepStatuses(steps, 'first_status');
    const newSecond = aggregateStepStatuses(steps, 'second_status');
    setFirstStatus((prev) =>
      newFirst !== null && newFirst !== prev ? newFirst : prev,
    );
    setSecondStatus((prev) =>
      newSecond !== null && newSecond !== prev ? newSecond : prev,
    );
  }, []);

  /**
   * useSortable: 拖拽排序能力（仅 isSortable 时启用）
   * id 使用 caseId 确保唯一性
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: caseId!,
    disabled: !isSortable,
  });

  /** 拖拽样式：基于 dnd-kit transform 计算 */
  const sortableStyle: React.CSSProperties = isSortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
        zIndex: isDragging ? 1000 : 'auto',
        boxShadow: isDragging ? '0 8px 24px rgba(0, 0, 0, 0.15)' : undefined,
      }
    : {};

  /**
   * 多选拖拽时，被选中的同伴（非 active）行的视觉提示
   * 让用户清楚看到整块会一起被拖走
   */
  const blockPeerStyle: React.CSSProperties = isBlockDragPeer
    ? {
        opacity: 0.55,
        outline: '2px dashed #1677ff',
        outlineOffset: '-2px',
        background: 'rgba(22, 119, 255, 0.04)',
      }
    : {};

  const [switchingReview, setSwitchingReview] = useState(false);
  const [switchingSecondStatus, setSwitchingSecondStatus] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  /**
   * 从 Context 获取动态状态配置
   * caseStatusConfig: 状态值(string) → { label, color } 映射（用于 Tag 展示、消息提示）
   * statusSelectItems: 下拉菜单项（用于 Dropdown 选择器，key 为 string）
   * reviewSelectItems: 评审状态下拉菜单项
   */
  const { caseStatusConfig, statusSelectItems, reviewSelectItems } =
    useDynamicStatusConfig();
  const { options: reviewOptions } = useCaseEnumConfig('REVIEW_STATUS');
  // 主题色 (淡底色 / 边色都从主题拿, 不写死 hex)
  const { colors } = useCaseHubTheme();
  const reviewOptionMap = useMemo(
    () => new Map(reviewOptions.map((o) => [o.value, o])),
    [reviewOptions],
  );

  /**
   * 用例名称最大显示字符数
   * 超过此长度则截断 + 省略号，hover Tooltip 展示完整名称
   * 用字符数而非 CSS 宽度省略，避免中英文混排时宽度不一致
   */
  const MAX_NAME_LEN = 40;
  const caseName = testCase.case_name ?? '';
  const truncatedName =
    caseName.length > MAX_NAME_LEN
      ? `${caseName.slice(0, MAX_NAME_LEN)}…`
      : caseName;
  const needNameTooltip = caseName.length > MAX_NAME_LEN;
  // 用例前置条件 (case_setup), 用来在标题上挂 popover
  // trim 后空值就不渲染 popover, 标题保持原样
  const caseSetup = (testCase.case_setup || '').trim();

  /**
   * 卡片折叠状态
   * - false（默认）：展开，显示 StepTable
   * - true：折叠，仅保留标题 + 状态选择器 + 折叠按钮
   *
   * 设计要点（自主控制折叠，不依赖 ProCard collapsible）：
   * 1. 完全自主控制 body 的渲染与隐藏，避免 ProCard 内部折叠逻辑干扰
   * 2. 折叠时 cardExtra（3 个状态 Tag + 更多按钮）依然渲染，用户可继续切换状态
   * 3. 通过手动添加的 chevron 图标按钮触发折叠，图标方向随状态旋转
   * 4. body 区域使用 display:none + 条件渲染双重保障，确保彻底隐藏
   *
   * 关键：使用 lazy initializer 读取 externalCollapsed，避免「先以展开态 mount
   * → 渲染 StepTable → useEffect 同步外部折叠态 → setCollapsed(true) → 卸载
   * StepTable」造成的子步骤先闪出再消失。
   */
  const [collapsed, setCollapsed] = useState<boolean>(
    () => externalCollapsed ?? false,
  );

  /**
   * 受控模式：当父组件传入 collapsed prop 变化时（一键折叠/展开场景），
   * 同步内部状态，确保 StepTable 正确隐藏/显示。
   * 仅对 prop 变化做响应，mount 阶段不重复 set（初始值已对齐）。
   */
  useEffect(() => {
    if (externalCollapsed !== undefined && externalCollapsed !== collapsed) {
      setCollapsed(externalCollapsed);
    }
  }, [externalCollapsed, collapsed]);

  /**
   * 处理折叠状态变更：同步更新本地状态 + 通知父级虚拟列表重新计算行高
   */
  const handleCollapsedChange = useCallback(
    (nextCollapsed: boolean) => {
      setCollapsed(nextCollapsed);
      onCollapsedChange?.(caseId, nextCollapsed);
    },
    [caseId, onCollapsedChange],
  );

  /**
   * 同步 ref 维持最新 callback（render 期间同步赋值，不依赖 useEffect）
   * 解决 useFnsRef 在 useEffect 异步更新中可能拿到陈旧 callback 的边界情况
   */
  const callbacksRef = useRef({
    onReviewChange,
    onSecondStatusChange,
    onRefresh,
  });
  callbacksRef.current = {
    onReviewChange,
    onSecondStatusChange,
    onRefresh,
  };

  /** 状态选择下拉菜单项（主状态/一轮/二轮复用同一份枚举配置，从 Context 动态获取） */
  // statusSelectItems 已通过 useDynamicStatusConfig() 获取，无需重复创建

  /**
   * 复制当前用例
   */
  const handleCopyCase = useCallback(async () => {
    if (!planId || !caseId || !moduleId) {
      message.warning('缺少必要的参数，无法复制用例');
      return;
    }
    if (copyLoading) return;

    setCopyLoading(true);
    try {
      const { code } = await copyOnePlanCase({
        plan_id: Number(planId),
        case_id: caseId,
        plan_module_id: moduleId,
      });
      if (code === 0) {
        message.success('复制用例成功');
        callbacksRef.current.onRefresh?.();
      } else {
        message.error('复制用例失败');
      }
    } catch {
      message.error('复制用例失败，请重试');
    } finally {
      setCopyLoading(false);
    }
  }, [planId, caseId, moduleId, copyLoading]);

  /**
   * 移除当前用例（仅解除关联，用例本体保留在用例库）
   */
  const handleRemoveCase = useCallback(async () => {
    if (!planId || !caseId) {
      message.warning('缺少必要的参数，无法移除用例');
      return;
    }
    if (removeLoading) return;

    setRemoveLoading(true);
    try {
      const { code } = await removeAssociatePlanCases({
        plan_id: Number(planId),
        case_ids: [caseId],
      });
      if (code === 0) {
        message.success('移除用例成功');
        callbacksRef.current.onRefresh?.();
      } else {
        message.error('移除用例失败');
      }
    } catch {
      message.error('移除用例失败，请重试');
    } finally {
      setRemoveLoading(false);
    }
  }, [planId, caseId, removeLoading]);

  /**
   * 彻底删除当前用例（解除关联 + 数据库物理删除用例本体及子步骤）
   * 二次确认后才执行，避免误操作
   */
  const handleDeleteCase = useCallback(() => {
    if (!planId || !caseId) {
      message.warning('缺少必要的参数，无法删除用例');
      return;
    }
    Modal.confirm({
      title: '彻底删除用例',
      content:
        '将解除与当前计划的关联，并从数据库物理删除该用例及其所有子步骤。' +
        '该操作不可恢复，是否继续？',
      okText: '彻底删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          const { code } = await deletePlanCasePermanently({
            plan_id: Number(planId),
            case_ids: [caseId],
          });
          if (code === 0) {
            message.success('彻底删除成功');
            callbacksRef.current.onRefresh?.();
          } else {
            message.error('删除失败');
          }
        } catch {
          message.error('删除失败，请重试');
        }
      },
    });
  }, [planId, caseId]);

  /** 更多操作下拉菜单项 */
  const moreMenuItems = useMemo(
    () =>
      createMoreMenuItems({
        onCopyCase: handleCopyCase,
        onRemoveCase: handleRemoveCase,
        onDeleteCase: handleDeleteCase,
      }),
    [handleCopyCase, handleRemoveCase, handleDeleteCase],
  );

  /**
   * 统一的状态更新处理函数
   * 内部接收 string 类型的枚举值（与后端枚举 value 类型对齐）
   * - API 调用：直接传递 string 值（后端接口已支持 string 类型）
   * - 父组件回调：转为 number（ITestCase 状态字段仍为 number）
   * @param updates - 更新内容，value 为 string 枚举值
   */
  const handleStatusUpdate = useCallback(
    async (updates: { second_status?: string; is_review?: string }) => {
      if (!caseId || !planId) return;

      if (updates.second_status !== undefined) {
        setSwitchingSecondStatus(true);
      } else {
        setSwitchingReview(true);
      }

      try {
        // API 直接接收 string 枚举值（后端已适配 string 类型）
        const { code } = await updateAssociatePlanCases({
          plan_id: Number(planId),
          case_id_list: [caseId],
          ...updates,
        });

        if (code === 0) {
          if (updates.is_review !== undefined) {
            // 回调参数已统一为 string 类型（与后端枚举 value 对齐）
            onReviewChange?.(caseId, updates.is_review);
          } else if (updates.second_status !== undefined) {
            // 同步驱动父组件 caseList 更新，进而触发 StepTable 的 secondStatus 级联
            onSecondStatusChange?.(caseId, updates.second_status);
          }
        } else {
          message.error('修改失败');
        }
      } catch {
        message.error('修改失败');
      } finally {
        setSwitchingSecondStatus(false);
        setSwitchingReview(false);
      }
    },
    [caseId, planId, reviewOptionMap, caseStatusConfig],
  );

  /** 选择评审状态（value 为 string 枚举值） */
  const handleReviewSelect = useCallback(
    (newStatus: string) => {
      if (switchingReview) return;
      handleStatusUpdate({ is_review: newStatus });
    },
    [switchingReview, handleStatusUpdate],
  );

  /** 选择二轮测试状态（value 为 string 枚举值） */
  const handleSecondStatusSelect = useCallback(
    (newStatus: string) => {
      if (switchingSecondStatus) return;
      handleStatusUpdate({ second_status: newStatus });
    },
    [switchingSecondStatus, handleStatusUpdate],
  );

  // 使用 string key 查找配置（枚举 value 为 string 类型）
  const currentSecondStatusConfig = caseStatusConfig[secondStatus] ||
    caseStatusConfig['0'] || { label: '未知', color: 'default' };

  /**
   * 渲染状态选择 Tag/Dropdown
   * 复用同一份状态枚举配置，通过 prefix 区分"一轮 / 二轮"
   * 使用颜色圆点 + label 展示，不再使用静态图标（枚举 value 为动态 string）
   * @param config 状态配置（color + label）
   * @param switching 是否正在切换中（loading 态）
   * @param onSelect 选中状态的回调（参数为 string 枚举值）
   * @param prefix 可选的轮次前缀，如 "一轮" / "二轮"
   */
  const renderStatusTag = (
    config: StatusConfig,
    switching: boolean,
    onSelect: (newStatus: string) => void,
    prefix?: string,
  ) => (
    <Dropdown
      trigger={['click']}
      menu={{
        items: statusSelectItems,
        // menu.key 已是 string，无需 Number() 转换
        onClick: ({ key }) => onSelect(key),
      }}
      disabled={switching}
    >
      <Tag
        color={config.color}
        style={{
          margin: 0,
          cursor: switching ? 'wait' : 'pointer',
          opacity: switching ? 0.5 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {prefix && (
          <>
            <span style={{ opacity: 0.7 }}>{prefix}</span>
            <span style={{ opacity: 0.4 }}>·</span>
          </>
        )}
        {config.label}
        <DownOutlined style={{ fontSize: 10, opacity: 0.6 }} />
      </Tag>
    </Dropdown>
  );

  /** 卡片标题区域：拖拽手柄 + 复选框 + 评审状态 + 用例名称
   *  Checkbox 完全裸着不加任何 stopPropagation（之前 span+stopPropagation 吞了点击）
   *  Tag / Text 加 onClick stopPropagation 避免触发 onHeaderClick
   */
  const cardTitle = useMemo(
    () => (
      <Space size="small" wrap={false}>
        {isSortable && (
          <Button
            type="text"
            size="small"
            icon={<HolderOutlined />}
            style={{
              cursor: 'grab',
              touchAction: 'none',
              color: '#999',
              padding: 0,
              flexShrink: 0,
            }}
            {...attributes}
            {...listeners}
          />
        )}
        <Checkbox
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelectedChange?.(caseId, e.target.checked);
          }}
        />
        <Dropdown
          trigger={['click']}
          menu={{
            items: reviewSelectItems,
            // menu.key 已是 string，无需 Number() 转换
            onClick: ({ key }) => handleReviewSelect(key),
          }}
          disabled={switchingReview}
        >
          <Tag
            color={reviewOptionMap.get(isReview)?.color || 'default'}
            style={{
              cursor: switchingReview ? 'wait' : 'pointer',
              opacity: switchingReview ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {switchingReview
              ? '切换中...'
              : reviewOptionMap.get(isReview)?.label || '待评审'}
            <DownOutlined style={{ fontSize: 10, opacity: 0.6 }} />
          </Tag>
        </Dropdown>
        {(() => {
          // 标题点击 → 打开详情; hover 行为按下面三档分支:
          //   1) 有前置: Popover, 内容展示用例前置 (附带完整用例名当 title)
          //   2) 长名无前置: Tooltip, 显示完整用例名
          //   3) 短名无前置: 裸 Text
          const nameText = (
            <Text
              strong
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailOpen(true);
              }}
            >
              {truncatedName}
            </Text>
          );
          if (caseSetup) {
            return (
              <Popover
                trigger="hover"
                mouseEnterDelay={0.3}
                placement="bottomLeft"
                title={
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <InfoCircleOutlined style={{ fontSize: 12 }} />
                    用例前置
                  </span>
                }
                content={
                  <div
                    style={{
                      maxWidth: 380,
                      maxHeight: 280,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: colors.textSecondary,
                    }}
                  >
                    {caseSetup}
                  </div>
                }
              >
                {nameText}
              </Popover>
            );
          }
          if (needNameTooltip) {
            return (
              <Tooltip title={caseName} mouseEnterDelay={0.3}>
                {nameText}
              </Tooltip>
            );
          }
          return nameText;
        })()}
      </Space>
    ),
    [
      selected,
      caseId,
      isReview,
      switchingReview,
      handleReviewSelect,
      testCase.case_name,
      testCase.case_setup,
      onSelectedChange,
      isSortable,
      truncatedName,
      needNameTooltip,
      caseName,
      caseSetup,
    ],
  );

  /** 卡片右侧操作区域：折叠按钮 + 二轮测试 + 更多操作 */
  const cardExtra = useMemo(
    () => (
      <Space size="small" onClick={(e) => e.stopPropagation()}>
        {/* 手动折叠按钮：图标方向随 collapsed 状态旋转 */}
        <Button
          type="text"
          size="small"
          icon={collapsed ? <DownOutlined /> : <UpOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleCollapsedChange(!collapsed);
          }}
          style={{ transition: 'transform 0.2s' }}
        />
        {renderStatusTag(
          currentSecondStatusConfig,
          switchingSecondStatus,
          handleSecondStatusSelect,
          '二轮',
        )}
        <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </Space>
    ),
    [
      collapsed,
      secondStatus,
      currentSecondStatusConfig,
      switchingSecondStatus,
      handleSecondStatusSelect,
      moreMenuItems,
    ],
  );

  return (
    <div
      ref={isSortable ? setNodeRef : undefined}
      style={{ ...sortableStyle, ...blockPeerStyle }}
    >
      <ProCard
        title={cardTitle}
        variant="outlined"
        headerBordered
        extra={cardExtra}
        styles={{
          // 折叠时彻底隐藏 body 容器（display:none + 条件渲染双重保障）
          // 不再依赖 ProCard 自带的 collapsible，完全自主控制
          body: collapsed
            ? {
                display: 'none',
                padding: 0,
                margin: 0,
                overflow: 'hidden',
                height: 0,
              }
            : { padding: 2 },
          header: {
            padding: '6px 12px',
            cursor: 'pointer',
          },
        }}
      >
        {/*
         * 关键：折叠时彻底卸载 StepTable（条件渲染）
         * 配合 styles.body 的 display:none，双重保障确保：
         * 1. DOM 节点被移除（条件渲染）
         * 2. body 容器本身也不占空间（CSS 隐藏）
         */}
        {!collapsed && (
          <StepTable
            steps={testCase.case_sub_steps || []}
            planId={planId}
            firstStatus={firstStatus}
            secondStatus={secondStatus}
            onStepStatusesChange={handleStepStatusesChange}
          />
        )}
      </ProCard>
      <MyDrawer
        width={'60%'}
        open={isDetailOpen}
        setOpen={setIsDetailOpen}
        onClose={() => {
          if (hasEdited) {
            callbacksRef.current.onRefresh?.();
          }
          setHasEdited(false);
          setIsDetailOpen(false);
        }}
      >
        <TestCaseDetail
          testcase={testCase}
          planId={planId}
          callback={() => setHasEdited(true)}
        />
      </MyDrawer>
    </div>
  );
});

CaseItem.displayName = 'CaseItem';

export default CaseItem;
export type { CaseItemProps };
