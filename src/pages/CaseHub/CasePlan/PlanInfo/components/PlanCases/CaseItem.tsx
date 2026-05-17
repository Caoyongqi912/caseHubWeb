import { queryTestCaseSupStep } from '@/api/case/testCase';
import MyProTable from '@/components/Table/MyProTable';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { CaseSubStep, ITestCase } from '@/pages/CaseHub/types';
import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FileSearchOutlined,
  MoreOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import { ProCard, ProColumns } from '@ant-design/pro-components';
import type { MenuProps } from 'antd';
import {
  Dropdown,
  Empty,
  message,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { usePlanCaseListStyles } from './styles';

const { Text } = Typography;

interface CaseItemProps {
  testCase: ITestCase;
  onReviewToggle?: (caseId: number, isReview: boolean) => void;
  onStatusChange?: (caseId: number, caseStatus: number) => void;
  onEdit?: (testCase: ITestCase) => void;
  onRemove?: (caseId: number) => void;
}

const STATUS_CONFIG_MAP: Record<
  number,
  { label: string; colorKey: string; bgKey: string; borderColorKey: string }
> = {
  0: {
    label: '待执行',
    colorKey: 'textTertiary',
    bgKey: 'transparent',
    borderColorKey: 'border',
  },
  1: {
    label: '通过',
    colorKey: 'success',
    bgKey: 'successBg',
    borderColorKey: 'success',
  },
  2: {
    label: '失败',
    colorKey: 'error',
    bgKey: 'errorBg',
    borderColorKey: 'error',
  },
};

const CaseItem: FC<CaseItemProps> = ({
  testCase,
  onReviewToggle,
  onStatusChange,
  onEdit,
  onRemove,
}) => {
  const styles = usePlanCaseListStyles();
  const { colors, spacing, borderRadius, animations } = useCaseHubTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [steps, setSteps] = useState<CaseSubStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  const caseId = testCase.id;
  const isReview = testCase.is_review ?? false;
  const caseStatus = testCase.case_status ?? 0;
  const currentStatusConfig =
    STATUS_CONFIG_MAP[caseStatus] || STATUS_CONFIG_MAP[0];
  const resolveColor = (key: string) => (colors as Record<string, string>)[key];

  useEffect(() => {
    if (!isExpanded || !caseId) return;
    setStepsLoading(true);
    queryTestCaseSupStep(caseId.toString())
      .then(({ code, data }) => {
        if (code === 0) setSteps(data || []);
      })
      .finally(() => setStepsLoading(false));
  }, [isExpanded, caseId]);

  const handleExpandToggle = useCallback(() => setIsExpanded((v) => !v), []);
  const handleReviewToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (caseId) onReviewToggle?.(caseId, !isReview);
    },
    [caseId, isReview, onReviewToggle],
  );
  const handlePassClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (caseId) onStatusChange?.(caseId, caseStatus === 1 ? 0 : 1);
    },
    [caseId, caseStatus, onStatusChange],
  );

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [steps],
  );

  const moreMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'copy', icon: <CopyOutlined />, label: '复制用例' },
      {
        key: 'remove',
        icon: <DeleteOutlined />,
        label: <span style={{ color: colors.error }}>移除用例</span>,
        danger: true,
      },
    ],
    [colors.error],
  );

  const handleMoreMenuClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      if (key === 'copy') message.info('复制功能开发中');
      else if (key === 'remove' && caseId && onRemove) onRemove(caseId);
    },
    [caseId, onRemove],
  );

  /** 步骤表格列配置 */
  const stepColumns: ProColumns<CaseSubStep>[] = [
    {
      dataIndex: 'index',
      width: 56,
      align: 'center',
      render: (_, __, index) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: 12,
            background:
              index % 2 === 0 ? colors.primaryBg : `${colors.primary}15`,
            color: colors.primary,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: '操作步骤',
      dataIndex: 'action',
      ellipsis: true,
      render: (text) =>
        text || <span style={{ color: colors.textTertiary }}>-</span>,
    },
    {
      title: '预期结果',
      dataIndex: 'expected_result',
      ellipsis: true,
      render: (text) =>
        text || <span style={{ color: colors.textTertiary }}>-</span>,
    },
    {
      title: '',
      key: 'action',
      width: 80,
      align: 'center',
      render: () => null,
    },
  ];

  return (
    <div
      style={styles.caseItemWrapper(isHovered, isExpanded)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.leftAccent(isHovered, caseStatus)} />

      <div style={styles.caseItemInner()}>
        {/* 头部行：展开箭头 + 用例名 + 等级 + 状态按钮 + 操作 */}
        <div style={styles.caseItemHeaderRow()} onClick={handleExpandToggle}>
          <div style={styles.expandIcon(isExpanded)}>
            <DownOutlined style={{ fontSize: 10 }} />
          </div>

          <span title={testCase.case_name} style={styles.caseName()}>
            {testCase.case_name}
          </span>

          {testCase.case_level && (
            <span style={styles.levelTag(testCase.case_level)}>
              {testCase.case_level}
            </span>
          )}

          <Space size={4} style={{ flexShrink: 0 }}>
            <Tooltip title={currentStatusConfig.label}>
              <div
                style={{
                  ...styles.actionBtn('pass', caseStatus === 1),
                  background:
                    currentStatusConfig.bgKey === 'transparent'
                      ? 'transparent'
                      : resolveColor(currentStatusConfig.bgKey),
                  color: resolveColor(currentStatusConfig.colorKey),
                  border: `1px solid ${resolveColor(
                    currentStatusConfig.borderColorKey,
                  )}40`,
                }}
                onClick={handlePassClick}
              >
                <CheckCircleOutlined style={{ fontSize: 12 }} />
                {currentStatusConfig.label}
              </div>
            </Tooltip>

            <Tooltip title={isReview ? '已评审' : '未评审'}>
              <div
                style={styles.actionBtn('review', isReview)}
                onClick={handleReviewToggle}
              >
                <FileSearchOutlined style={{ fontSize: 12 }} />
                {isReview ? '已评审' : '评审'}
              </div>
            </Tooltip>

            {onEdit && (
              <Tooltip title="编辑用例">
                <button
                  style={{
                    ...styles.iconBtn(isHovered),
                    border: 'none',
                    outline: 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(testCase);
                  }}
                >
                  <EditOutlined style={{ fontSize: 13 }} />
                </button>
              </Tooltip>
            )}

            <Dropdown
              menu={{ items: moreMenuItems, onClick: handleMoreMenuClick }}
              trigger={['click']}
              placement="bottomRight"
            >
              <button
                style={{
                  ...styles.moreBtn(isHovered),
                  border: 'none',
                  outline: 'none',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreOutlined style={{ fontSize: 13 }} />
              </button>
            </Dropdown>
          </Space>
        </div>

        {/* 元数据行：创建者 + 公共标识 | 步骤计数 */}
        <div style={styles.caseItemMetaRow()}>
          <div style={styles.metaLeftSection()}>
            <Text type="secondary">{testCase.creatorName || '-'}</Text>
            {testCase.is_common && (
              <Tag
                style={{
                  background: `${colors.warning}12`,
                  color: colors.warning,
                  border: `1px solid ${colors.warning}25`,
                  fontSize: 11,
                  lineHeight: '18px',
                  padding: '0 6px',
                  borderRadius: borderRadius.round,
                }}
              >
                公共
              </Tag>
            )}
          </div>

          <div style={styles.metaRightSection()}>
            <Tooltip title="展开查看测试步骤">
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: borderRadius.sm,
                  background: isExpanded ? colors.primaryBg : 'transparent',
                  color: isExpanded ? colors.primary : colors.textTertiary,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: `all ${animations.fast} ${animations.easeInOut}`,
                  border: 'none',
                  outline: 'none',
                }}
                onClick={handleExpandToggle}
              >
                <OrderedListOutlined style={{ fontSize: 12 }} />
                {sortedSteps.length > 0 && <span>{sortedSteps.length}</span>}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 展开区域：步骤表格 */}
      <div style={styles.stepsContainer(isExpanded)}>
        <ProCard bordered={false} style={{ padding: 0 }} hoverable>
          {stepsLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${spacing.lg}px 0`,
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="加载步骤中..."
              />
            </div>
          ) : sortedSteps.length > 0 ? (
            <MyProTable
              dataSource={sortedSteps}
              rowKey="uid"
              pagination={false}
              search={false}
              columns={stepColumns}
              height="full"
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${spacing.lg}px 0`,
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无测试步骤"
              />
            </div>
          )}
        </ProCard>
      </div>
    </div>
  );
};

export default CaseItem;
