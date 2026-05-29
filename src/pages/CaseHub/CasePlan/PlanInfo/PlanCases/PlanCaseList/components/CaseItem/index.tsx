import { DownOutlined, MoreOutlined } from '@ant-design/icons';
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
import React, { useCallback, useMemo, useState } from 'react';

import {
  copyOnePlanCase,
  removeAssociatePlanCases,
  updateAssociatePlanCases,
} from '@/api/case/caseplan';
import MyDrawer from '@/components/MyDrawer';
import TestCaseDetail from '@/pages/CaseHub/CaseLibrary/TestCaseDetail';
import { ITestCase } from '@/pages/CaseHub/types';
import { useFnsRef } from '../../hooks/useFnRef';
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
    onSelectedChange,
    onReviewChange,
    onStatusChange,
    onRefresh,
  } = props;

  const caseId = testCase.id;
  const caseStatus = testCase.case_status ?? 0;
  const isReview = testCase.is_review ?? false;

  const [switchingReview, setSwitchingReview] = useState(false);
  const [switchingStatus, setSwitchingStatus] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  /**
   * 使用 useFnsRef 保持回调函数引用稳定
   * 解决在异步操作中访问最新回调函数的问题
   */
  const callbacksRef = useFnsRef({
    onReviewChange,
    onStatusChange,
    onRefresh,
  });

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
   * 按 order 字段升序排列用例步骤
   */
  const sortedSteps = useMemo(
    () =>
      [...(testCase.case_sub_steps || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    [testCase.case_sub_steps],
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
            callbacksRef.current.onReviewChange?.(caseId, !!updates.is_review);
          } else if (updates.case_status !== undefined) {
            const config = CASE_STATUS_CONFIG[updates.case_status];
            message.success(`已切换为${config?.label ?? '未知'}`);
            callbacksRef.current.onStatusChange?.(caseId, updates.case_status);
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

  /** 卡片右侧操作区域：状态选择 + 更多操作 */
  const cardExtra = (
    <Space size="small">
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
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  );

  /** 卡片标题区域：复选框 + 评审状态 + 用例名称 */
  const cardTitle = (
    <Space onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={selected}
        onChange={(e) => onSelectedChange?.(caseId, e.target.checked)}
      />
      <Tag
        color={isReview ? 'success' : 'default'}
        style={{ cursor: switchingReview ? 'wait' : 'pointer' }}
        onClick={handleReviewToggle}
      >
        {switchingReview ? '切换中...' : isReview ? '已评审' : '待评审'}
      </Tag>
      <Text strong onClick={() => setIsDetailOpen(true)}>
        {testCase.case_name}
      </Text>
    </Space>
  );

  return (
    <>
      <ProCard
        title={cardTitle}
        variant="outlined"
        hoverable
        headerBordered
        extra={cardExtra}
        collapsible
        styles={{ body: { padding: 3 } }}
      >
        <StepTable steps={sortedSteps} planId={planId} />
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
