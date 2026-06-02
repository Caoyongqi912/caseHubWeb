import { DownOutlined, MoreOutlined, UpOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  Checkbox,
  Dropdown,
  message,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
  copyOnePlanCase,
  removeAssociatePlanCases,
  updateAssociatePlanCases,
} from '@/api/case/caseplan';
import MyDrawer from '@/components/MyDrawer';
import TestCaseDetail from '@/pages/CaseHub/CaseLibrary/TestCaseDetail';
import { ITestCase } from '@/pages/CaseHub/types';

import { createMoreMenuItems } from './moreMenu';
import {
  CASE_STATUS_CONFIG,
  CASE_STATUS_ICONS,
  createStatusSelectItems,
  StatusConfig,
} from './statusConfig';
import StepTable from './StepTable';

const { Text } = Typography;

interface CaseItemProps {
  testCase: ITestCase;
  selected?: boolean;
  planId?: string;
  moduleId?: number | null;
  onSelectedChange?: (id: number | undefined, selected: boolean) => void;
  onReviewChange?: (caseId: number, isReview: boolean) => void;
  /** 一轮测试状态切换回调（用于驱动父组件 caseList 更新与 StepTable 级联） */
  onFirstStatusChange?: (caseId: number, status: number) => void;
  /** 二轮测试状态切换回调 */
  onSecondStatusChange?: (caseId: number, status: number) => void;
  /** 卡片折叠状态变更回调（用于通知父级虚拟列表重新计算行高） */
  onCollapsedChange?: (caseId: number | undefined, collapsed: boolean) => void;
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
    onRefresh,
  } = props;

  const caseId = testCase.id;
  const firstStatus = testCase.first_status ?? 0;
  const secondStatus = testCase.second_status ?? 0;
  const isReview = testCase.is_review ?? false;

  const [switchingReview, setSwitchingReview] = useState(false);
  const [switchingFirstStatus, setSwitchingFirstStatus] = useState(false);
  const [switchingSecondStatus, setSwitchingSecondStatus] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

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

  /** 状态选择下拉菜单项（主状态/一轮/二轮复用同一份枚举配置） */
  const statusSelectItems = useMemo(() => createStatusSelectItems(), []);

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
      }),
    [handleCopyCase, handleRemoveCase],
  );

  /**
   * 统一的状态更新处理函数
   * @param updates - 更新内容，支持 first_status / second_status / is_review
   */
  const handleStatusUpdate = useCallback(
    async (updates: {
      first_status?: number;
      second_status?: number;
      is_review?: number;
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
        const { code } = await updateAssociatePlanCases({
          plan_id: Number(planId),
          case_id_list: [caseId],
          ...updates,
        });

        if (code === 0) {
          if (updates.is_review !== undefined) {
            message.success(
              updates.is_review ? '已标记为已评审' : '已取消评审',
            );
            // 直接读 prop，不走 callbacksRef（避免 useEffect 时序问题）
            onReviewChange?.(caseId, !!updates.is_review);
          } else if (updates.first_status !== undefined) {
            const config = CASE_STATUS_CONFIG[updates.first_status];
            message.success(`一轮测试已切换为${config?.label ?? '未知'}`);
            // 同步驱动父组件 caseList 更新，进而触发 StepTable 的 firstStatus 级联
            onFirstStatusChange?.(caseId, updates.first_status);
          } else if (updates.second_status !== undefined) {
            const config = CASE_STATUS_CONFIG[updates.second_status];
            message.success(`二轮测试已切换为${config?.label ?? '未知'}`);
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
    [caseId, planId],
  );

  /** 切换评审状态 */
  const handleReviewToggle = useCallback(() => {
    if (switchingReview) return;
    handleStatusUpdate({ is_review: isReview ? 0 : 1 });
  }, [switchingReview, isReview, handleStatusUpdate]);

  /** 选择一轮测试状态 */
  const handleFirstStatusSelect = useCallback(
    (newStatus: number) => {
      if (switchingFirstStatus) return;
      handleStatusUpdate({ first_status: newStatus });
    },
    [switchingFirstStatus, handleStatusUpdate],
  );

  /** 选择二轮测试状态 */
  const handleSecondStatusSelect = useCallback(
    (newStatus: number) => {
      if (switchingSecondStatus) return;
      handleStatusUpdate({ second_status: newStatus });
    },
    [switchingSecondStatus, handleStatusUpdate],
  );

  const currentFirstStatusConfig =
    CASE_STATUS_CONFIG[firstStatus] || CASE_STATUS_CONFIG[0];
  const currentSecondStatusConfig =
    CASE_STATUS_CONFIG[secondStatus] || CASE_STATUS_CONFIG[0];

  /**
   * 渲染状态选择 Tag/Dropdown
   * 复用同一份状态枚举配置，通过 prefix 区分"一轮 / 二轮"
   * @param status 当前状态值
   * @param config 状态配置（color + label）
   * @param switching 是否正在切换中（loading 态）
   * @param onSelect 选中状态的回调
   * @param prefix 可选的轮次前缀，如 "一轮" / "二轮"
   */
  const renderStatusTag = (
    status: number,
    config: StatusConfig,
    switching: boolean,
    onSelect: (newStatus: number) => void,
    prefix?: string,
  ) => (
    <Dropdown
      trigger={['click']}
      menu={{
        items: statusSelectItems,
        onClick: ({ key }) => onSelect(Number(key)),
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
        {CASE_STATUS_ICONS[status] || CASE_STATUS_ICONS[0]}
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

  /** 卡片标题区域：复选框 + 评审状态 + 用例名称
   *  Checkbox 完全裸着不加任何 stopPropagation（之前 span+stopPropagation 吞了点击）
   *  Tag / Text 加 onClick stopPropagation 避免触发 onHeaderClick
   */
  const cardTitle = useMemo(
    () => (
      <Space size="small" wrap={false}>
        <Checkbox
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelectedChange?.(caseId, e.target.checked);
          }}
        />
        <Tag
          color={isReview ? 'success' : 'default'}
          style={{ cursor: switchingReview ? 'wait' : 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleReviewToggle();
          }}
        >
          {switchingReview ? '切换中...' : isReview ? '已评审' : '待评审'}
        </Tag>
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
      handleReviewToggle,
      testCase.case_name,
      onSelectedChange,
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
          firstStatus,
          currentFirstStatusConfig,
          switchingFirstStatus,
          handleFirstStatusSelect,
          '一轮',
        )}
        {renderStatusTag(
          secondStatus,
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
    <>
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
    </>
  );
});

CaseItem.displayName = 'CaseItem';

export default CaseItem;
export type { CaseItemProps };
