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
} from './statusConfig';
import StepTable from './StepTable';

const { Text } = Typography;

interface CaseItemProps {
  testCase: ITestCase;
  selected?: boolean;
  planId?: string;
  moduleId?: number | null;
  /** 父组件控制折叠态，便于虚拟化时按需挂载 StepTable */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onSelectedChange?: (id: number | undefined, selected: boolean) => void;
  onReviewChange?: (caseId: number, isReview: boolean) => void;
  onStatusChange?: (caseId: number, status: number) => void;
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
    expanded = false,
    onExpandedChange,
    onSelectedChange,
    onReviewChange,
    onStatusChange,
    onRefresh,
  } = props;

  const caseId = testCase.id;
  const caseStatus = testCase.case_status ?? 0;
  const isReview = testCase.is_review ?? false;

  // 折叠态由父组件控制（便于虚拟化时按需挂载 StepTable）
  const [switchingReview, setSwitchingReview] = useState(false);
  const [switchingStatus, setSwitchingStatus] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  /**
   * 同步 ref 维持最新 callback（render 期间同步赋值，不依赖 useEffect）
   * 解决 useFnsRef 在 useEffect 异步更新中可能拿到陈旧 callback 的边界情况
   */
  const callbacksRef = useRef({ onReviewChange, onStatusChange, onRefresh });
  callbacksRef.current = { onReviewChange, onStatusChange, onRefresh };

  /** 状态选择下拉菜单项 */
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
   * @param updates - 更新内容，支持 case_status 或 is_review
   */
  const handleStatusUpdate = useCallback(
    async (updates: { case_status?: number; is_review?: number }) => {
      if (!caseId || !planId) return;

      if (updates.case_status !== undefined) {
        setSwitchingStatus(true);
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
          } else if (updates.case_status !== undefined) {
            const config = CASE_STATUS_CONFIG[updates.case_status];
            message.success(`已切换为${config?.label ?? '未知'}`);
            onStatusChange?.(caseId, updates.case_status);
          }
        } else {
          message.error('修改失败');
        }
      } catch {
        message.error('修改失败');
      } finally {
        setSwitchingStatus(false);
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

  /** 选择用例状态 */
  const handleStatusSelect = useCallback(
    (newStatus: number) => {
      if (switchingStatus) return;
      handleStatusUpdate({ case_status: newStatus });
    },
    [switchingStatus, handleStatusUpdate],
  );

  const currentStatusConfig =
    CASE_STATUS_CONFIG[caseStatus] || CASE_STATUS_CONFIG[0];

  /** 卡片标题区域：复选框 + 评审状态 + 用例名称
   *  Checkbox 完全裸着不加任何 stopPropagation（之前 span+stopPropagation 吞了点击）
   *  Tag / Text 加 onClick stopPropagation 避免触发 onHeaderClick
   */
  const cardTitle = useMemo(
    () => (
      <Space size="small" wrap={false}>
        <Checkbox
          checked={selected}
          disabled={switchingStatus}
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
      switchingStatus,
      caseId,
      isReview,
      switchingReview,
      handleReviewToggle,
      testCase.case_name,
      onSelectedChange,
    ],
  );

  /** 切换展开/收起（手动触发，避免 ProCard collapsible 在 absolute 容器里异常） */
  const handleToggleExpanded = useCallback(() => {
    onExpandedChange?.(!expanded);
  }, [onExpandedChange, expanded]);

  /** 卡片右侧操作区域：状态选择 + 更多操作 + 折叠 chevron */
  const cardExtra = useMemo(
    () => (
      <Space size="small" onClick={(e) => e.stopPropagation()}>
        <Button
          type="text"
          size="small"
          icon={expanded ? <UpOutlined /> : <DownOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleExpanded();
          }}
          title={expanded ? '收起' : '展开'}
        />
        <Dropdown
          trigger={['click']}
          menu={{
            items: statusSelectItems,
            onClick: ({ key }) => handleStatusSelect(Number(key)),
          }}
          disabled={switchingStatus}
        >
          <Tag
            color={currentStatusConfig.color}
            style={{
              margin: 0,
              cursor: switchingStatus ? 'wait' : 'pointer',
              opacity: switchingStatus ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {CASE_STATUS_ICONS[caseStatus] || CASE_STATUS_ICONS[0]}
            {currentStatusConfig.label}
            <DownOutlined style={{ fontSize: 10, opacity: 0.6 }} />
          </Tag>
        </Dropdown>
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
      expanded,
      handleToggleExpanded,
      statusSelectItems,
      handleStatusSelect,
      switchingStatus,
      currentStatusConfig,
      caseStatus,
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
        styles={{ body: { padding: 2 } }}
      >
        {/* 折叠时不渲染 StepTable，避免 EditableProTable 提前挂载（虚拟化场景下的延迟挂载） */}
        {expanded && (
          <StepTable steps={testCase.case_sub_steps || []} planId={planId} />
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
