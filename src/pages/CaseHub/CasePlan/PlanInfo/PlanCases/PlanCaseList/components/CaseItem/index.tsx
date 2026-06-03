import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import {
  DownOutlined,
  HolderOutlined,
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
  Space,
  Tag,
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

interface CaseItemProps {
  testCase: ITestCase;
  selected?: boolean;
  planId?: string;
  moduleId?: number | null;
  onSelectedChange?: (id: number | undefined, selected: boolean) => void;
  onReviewChange?: (caseId: number, isReview: string) => void;
  /** 一轮测试状态切换回调（用于驱动父组件 caseList 更新与 StepTable 级联） */
  onFirstStatusChange?: (caseId: number, status: string) => void;
  /** 二轮测试状态切换回调 */
  onSecondStatusChange?: (caseId: number, status: string) => void;
  /** 卡片折叠状态变更回调（用于通知父级虚拟列表重新计算行高） */
  onCollapsedChange?: (caseId: number | undefined, collapsed: boolean) => void;
  /** 在此用例之后插入新用例 */
  onInsertAfter?: (afterCaseId: number) => void;
  /** 是否启用拖拽排序 */
  isSortable?: boolean;
  /** 受控折叠状态（由父组件 collapsedCaseIds 驱动，一键折叠时使用） */
  collapsed?: boolean;
  onRefresh?: () => void;
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
    onFirstStatusChange,
    onSecondStatusChange,
    onCollapsedChange,
    onInsertAfter,
    isSortable = false,
    collapsed: externalCollapsed,
    onRefresh,
  } = props;

  const caseId = testCase.id;
  // ITestCase 的 first_status / second_status / is_review 已为 string 类型，直接使用
  const firstStatus = testCase.first_status ?? '';
  const secondStatus = testCase.second_status ?? '';
  const isReview = testCase.is_review ?? '';

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

  const [switchingReview, setSwitchingReview] = useState(false);
  const [switchingFirstStatus, setSwitchingFirstStatus] = useState(false);
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
  const reviewOptionMap = useMemo(
    () => new Map(reviewOptions.map((o) => [o.value, o])),
    [reviewOptions],
  );

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
   */
  const [collapsed, setCollapsed] = useState(false);

  /**
   * 受控模式：当父组件传入 collapsed prop（一键折叠场景）时，
   * 同步内部状态，确保 StepTable 正确隐藏/显示
   */
  useEffect(() => {
    if (externalCollapsed !== undefined && externalCollapsed !== collapsed) {
      setCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

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
    onFirstStatusChange,
    onSecondStatusChange,
    onRefresh,
  });
  callbacksRef.current = {
    onReviewChange,
    onFirstStatusChange,
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
   * 移除当前用例
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

  /** 更多操作下拉菜单项 */
  const moreMenuItems = useMemo(
    () =>
      createMoreMenuItems({
        onCopyCase: handleCopyCase,
        onRemoveCase: handleRemoveCase,
        onInsertAfter: onInsertAfter ? () => onInsertAfter(caseId!) : undefined,
      }),
    [handleCopyCase, handleRemoveCase, onInsertAfter, caseId],
  );

  /**
   * 统一的状态更新处理函数
   * 内部接收 string 类型的枚举值（与后端枚举 value 类型对齐）
   * - API 调用：直接传递 string 值（后端接口已支持 string 类型）
   * - 父组件回调：转为 number（ITestCase 状态字段仍为 number）
   * @param updates - 更新内容，value 为 string 枚举值
   */
  const handleStatusUpdate = useCallback(
    async (updates: {
      first_status?: string;
      second_status?: string;
      is_review?: string;
    }) => {
      if (!caseId || !planId) return;

      if (updates.first_status !== undefined) {
        setSwitchingFirstStatus(true);
      } else if (updates.second_status !== undefined) {
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
          } else if (updates.first_status !== undefined) {
            // 同步驱动父组件 caseList 更新，进而触发 StepTable 的 firstStatus 级联
            onFirstStatusChange?.(caseId, updates.first_status);
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
        setSwitchingFirstStatus(false);
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

  /** 选择一轮测试状态（value 为 string 枚举值） */
  const handleFirstStatusSelect = useCallback(
    (newStatus: string) => {
      if (switchingFirstStatus) return;
      handleStatusUpdate({ first_status: newStatus });
    },
    [switchingFirstStatus, handleStatusUpdate],
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
  const currentFirstStatusConfig = caseStatusConfig[firstStatus] ||
    caseStatusConfig['0'] || { label: '未知', color: 'default' };
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
        <Text
          strong
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsDetailOpen(true);
          }}
        >
          {testCase.case_name}
        </Text>
      </Space>
    ),
    [
      selected,
      caseId,
      isReview,
      switchingReview,
      handleReviewSelect,
      testCase.case_name,
      onSelectedChange,
      isSortable,
    ],
  );

  /** 卡片右侧操作区域：折叠按钮 + 一轮测试 + 二轮测试 + 更多操作 */
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
          currentFirstStatusConfig,
          switchingFirstStatus,
          handleFirstStatusSelect,
          '一轮',
        )}
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
      firstStatus,
      currentFirstStatusConfig,
      switchingFirstStatus,
      handleFirstStatusSelect,
      secondStatus,
      currentSecondStatusConfig,
      switchingSecondStatus,
      handleSecondStatusSelect,
      moreMenuItems,
    ],
  );

  return (
    <div ref={isSortable ? setNodeRef : undefined} style={sortableStyle}>
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
