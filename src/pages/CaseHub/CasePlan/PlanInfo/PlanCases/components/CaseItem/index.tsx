import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  LinkOutlined,
  MinusCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import type { MenuProps } from 'antd';
import {
  Button,
  Checkbox,
  Dropdown,
  message,
  Space,
  Tag,
  theme,
  Tooltip,
} from 'antd';
import type { CSSProperties } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { updateAssociatePlanCases } from '@/api/case/caseplan';
import { CaseSubStep, ITestCase } from '@/pages/CaseHub/types';

interface CaseItemProps {
  testCase: ITestCase;
  selected?: boolean;
  planId?: string;
  onSelectedChange?: (id: number | undefined, selected: boolean) => void;
  onReviewChange?: (caseId: number, isReview: boolean) => void;
  onStatusChange?: (caseId: number, status: number) => void;
}

interface StatusConfig {
  label: string;
  color: string;
}

const QUICK_TOGGLE_STATUS: number[] = [1, 2];

const STATUS_CONFIG_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '未开始', color: 'default' },
  1: { label: '通过', color: 'success' },
  2: { label: '失败', color: 'error' },
  3: { label: '阻塞', color: 'warning' },
  4: { label: '跳过', color: 'processing' },
};

const STATUS_ICON_MAP: Record<number, React.ReactNode> = {
  0: <ClockCircleOutlined />,
  1: <CheckCircleOutlined />,
  2: <CloseCircleOutlined />,
  3: <MinusCircleOutlined />,
  4: <MinusCircleOutlined />,
};

type StepIndexStyleCalculator = (index: number) => CSSProperties;

const useCaseItemLogic = (props: CaseItemProps) => {
  const { testCase, planId, onSelectedChange, onReviewChange, onStatusChange } =
    props;

  const { token } = theme.useToken();
  const caseId = testCase.id;
  const caseStatus = testCase.case_status ?? 0;
  const isReview = testCase.is_review ?? false;

  const [switchingReview, setSwitchingReview] = useState(false);
  const [switchingStatus, setSwitchingStatus] = useState(false);

  const stepIndexStyle = useCallback(
    (index: number): CSSProperties => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      borderRadius: 12,
      background:
        index % 2 === 0 ? token.colorBgContainer : token.colorBgElevated,
      color: token.colorPrimary,
      fontSize: 12,
      fontWeight: 600,
    }),
    [token.colorBgContainer, token.colorBgElevated, token.colorPrimary],
  );

  const handleCheckboxChange = useCallback(
    (e: { target: { checked: boolean } }) =>
      onSelectedChange?.(caseId, e.target.checked),
    [caseId, onSelectedChange],
  );

  const handleReviewToggle = useCallback(async () => {
    if (!caseId || !planId || switchingReview) return;

    const newReviewStatus = !isReview;
    setSwitchingReview(true);
    try {
      const { code } = await updateAssociatePlanCases({
        plan_id: Number(planId),
        case_id_list: [caseId],
        is_review: newReviewStatus ? 1 : 0,
      });

      if (code === 0) {
        message.success(newReviewStatus ? '已标记为已评审' : '已取消评审');
        onReviewChange?.(caseId, newReviewStatus);
      } else {
        message.error('修改评审状态失败');
      }
    } catch {
      message.error('修改评审状态失败');
    } finally {
      setSwitchingReview(false);
    }
  }, [caseId, planId, isReview, switchingReview, onReviewChange]);

  const handleStatusToggle = useCallback(async () => {
    if (!caseId || !planId || switchingStatus) return;
    if (!QUICK_TOGGLE_STATUS.includes(caseStatus)) return;

    const newStatus = caseStatus === 1 ? 2 : 1;
    setSwitchingStatus(true);
    try {
      const { code } = await updateAssociatePlanCases({
        plan_id: Number(planId),
        case_id_list: [caseId],
        case_status: newStatus,
      });

      if (code === 0) {
        message.success(`已切换为${STATUS_CONFIG_MAP[newStatus].label}`);
        onStatusChange?.(caseId, newStatus);
      } else {
        message.error('修改状态失败');
      }
    } catch {
      message.error('修改状态失败');
    } finally {
      setSwitchingStatus(false);
    }
  }, [caseId, planId, caseStatus, switchingStatus, onStatusChange]);

  const handleStatusSelect = useCallback(
    async (newStatus: number) => {
      if (!caseId || !planId || switchingStatus) return;

      setSwitchingStatus(true);
      try {
        const { code } = await updateAssociatePlanCases({
          plan_id: Number(planId),
          case_id_list: [caseId],
          case_status: newStatus,
        });

        if (code === 0) {
          message.success(`已切换为${STATUS_CONFIG_MAP[newStatus].label}`);
          onStatusChange?.(caseId, newStatus);
        } else {
          message.error('修改状态失败');
        }
      } catch {
        message.error('修改状态失败');
      } finally {
        setSwitchingStatus(false);
      }
    },
    [caseId, planId, switchingStatus, onStatusChange],
  );

  const handleEditDefect = useCallback((step: CaseSubStep) => {
    message.info(`编辑缺陷功能开发中 - 步骤: ${step.uid}`);
  }, []);

  const moreMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'edit', icon: <EditOutlined />, label: '编辑用例' },
      { key: 'copy', icon: <CopyOutlined />, label: '复制用例' },
      { type: 'divider' },
      {
        key: 'remove',
        icon: <DeleteOutlined />,
        label: '移除用例',
        danger: true,
      },
    ],
    [],
  );

  const statusSelectItems: MenuProps['items'] = useMemo(
    () =>
      Object.entries(STATUS_CONFIG_MAP).map(([key, config]) => ({
        key,
        label: (
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {STATUS_ICON_MAP[Number(key)]}
            {config.label}
          </span>
        ),
      })),
    [],
  );

  const sortedSteps = useMemo(
    () =>
      [...(testCase.case_sub_steps || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    [testCase.case_sub_steps],
  );

  return {
    caseId,
    caseStatus,
    isReview,
    switchingReview,
    switchingStatus,
    sortedSteps,
    stepIndexStyle,
    handleCheckboxChange,
    handleReviewToggle,
    handleStatusToggle,
    handleStatusSelect,
    handleEditDefect,
    moreMenuItems,
    statusSelectItems,
    STATUS_ICON_MAP,
  };
};

const CaseItem: React.FC<CaseItemProps> = (props) => {
  const { testCase, selected = false } = props;

  const {
    caseStatus,
    isReview,
    switchingReview,
    switchingStatus,
    sortedSteps,
    stepIndexStyle,
    handleCheckboxChange,
    handleReviewToggle,
    handleStatusSelect,
    handleEditDefect,
    moreMenuItems,
    statusSelectItems,
    STATUS_ICON_MAP,
  } = useCaseItemLogic(props);

  const stepColumns: ProColumns<CaseSubStep>[] = useMemo(
    () => [
      {
        title: '序号',
        dataIndex: 'index',
        width: 56,
        align: 'center',
        render: (_, __, index) => (
          <span style={stepIndexStyle(index)}>{index + 1}</span>
        ),
      },
      { title: '操作', dataIndex: 'action', ellipsis: true },
      { title: '预期', dataIndex: 'expected_result', ellipsis: true },
      {
        title: '实际结果',
        dataIndex: 'actual_result',
        ellipsis: true,
        render: (text: React.ReactNode) => text || '-',
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        align: 'center',
        render: (text) => {
          const status =
            STATUS_CONFIG_MAP[text as number] || STATUS_CONFIG_MAP[0];
          return <Tag color={status.color}>{status.label}</Tag>;
        },
      },
      {
        title: '缺陷',
        dataIndex: 'bug_url',
        width: 100,
        ellipsis: true,
        render: (_: React.ReactNode, record: CaseSubStep) => {
          const bugUrl = (record as unknown as Record<string, unknown>)
            .bug_url as string;
          return bugUrl ? (
            <Tooltip title={bugUrl}>
              <a href={bugUrl} target="_blank" rel="noopener noreferrer">
                <LinkOutlined /> BUG
              </a>
            </Tooltip>
          ) : (
            <Tooltip title="添加缺陷">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditDefect(record)}
              >
                缺陷
              </Button>
            </Tooltip>
          );
        },
      },
    ],
    [stepIndexStyle, handleEditDefect],
  );

  const currentStatusConfig =
    STATUS_CONFIG_MAP[caseStatus] || STATUS_CONFIG_MAP[0];

  const statusTagStyle: React.CSSProperties = {
    margin: 0,
    cursor: switchingStatus ? 'wait' : 'pointer',
    opacity: switchingStatus ? 0.5 : 1,
    transition: 'all 0.2s',
  };

  const cardExtra = (
    <Space size="small">
      <Dropdown
        trigger={['click', 'hover']}
        menu={{
          items: statusSelectItems,
          onClick: ({ key }) => handleStatusSelect(Number(key)),
        }}
        disabled={switchingStatus}
      >
        <Tag
          color={currentStatusConfig.color}
          style={{
            ...statusTagStyle,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {STATUS_ICON_MAP[caseStatus] || STATUS_ICON_MAP[0]}
          {currentStatusConfig.label}
          <DownOutlined style={{ fontSize: 10, opacity: 0.6 }} />
        </Tag>
      </Dropdown>
      <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  );

  const cardTitle = (
    <Space onClick={(e) => e.stopPropagation()}>
      <Checkbox checked={selected} onChange={handleCheckboxChange} />
      <Tag
        color={isReview ? 'success' : 'default'}
        style={{ cursor: switchingReview ? 'wait' : 'pointer' }}
        onClick={handleReviewToggle}
      >
        {switchingReview ? '切换中...' : isReview ? '已评审' : '待评审'}
      </Tag>
      <span style={{ fontWeight: 600 }}>{testCase.case_name}</span>
    </Space>
  );

  return (
    <ProCard
      title={cardTitle}
      bordered
      hoverable
      extra={cardExtra}
      collapsible
      bodyStyle={{ padding: 'var(--ant-padding-xs)' }}
    >
      <ProTable
        dataSource={sortedSteps}
        rowKey="uid"
        pagination={false}
        search={false}
        options={false}
        columns={stepColumns}
      />
    </ProCard>
  );
};

export default CaseItem;
export type { CaseItemProps, StatusConfig, StepIndexStyleCalculator };
export { STATUS_CONFIG_MAP, QUICK_TOGGLE_STATUS };
