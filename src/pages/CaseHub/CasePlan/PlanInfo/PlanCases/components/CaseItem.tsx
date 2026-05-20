import { CaseSubStep, ITestCase } from '@/pages/CaseHub/types';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
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
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { CSSProperties, FC, useCallback, useMemo } from 'react';

const { useToken } = theme;

interface CaseItemProps {
  testCase: ITestCase;
  selected?: boolean;
  onSelectedChange?: (id: number | undefined, selected: boolean) => void;
}

const STATUS_CONFIG_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '待执行', color: 'default' },
  1: { label: '通过', color: 'success' },
  2: { label: '失败', color: 'error' },
};

const CaseItem: FC<CaseItemProps> = ({
  testCase,
  selected = false,
  onSelectedChange,
}) => {
  const { token } = useToken();
  const caseId = testCase.id;
  const isReview = testCase.is_review ?? false;

  // 序号圆圈样式：主题自适应
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
    (e: CheckboxChangeEvent) => onSelectedChange?.(caseId, e.target.checked),
    [caseId, onSelectedChange],
  );

  // 步骤排序
  const sortedSteps = useMemo(
    () =>
      [...(testCase.case_sub_steps || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    [testCase.case_sub_steps],
  );

  const handleEditDefect = useCallback((step: CaseSubStep) => {
    message.info(`编辑缺陷功能开发中 - 步骤: ${step.uid}`);
  }, []);

  // 更多操作菜单
  const moreMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'edit', icon: <EditOutlined />, label: '编辑用例' },
      { key: 'copy', icon: <CopyOutlined />, label: '复制用例' },
      { type: 'divider' },
      {
        key: 'remove',
        icon: <DeleteOutlined />,
        label: <span style={{ color: token.colorError }}>移除用例</span>,
        danger: true,
      },
    ],
    [token.colorError],
  );

  // 表格列配置：步骤列表
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

  const cardExtra = (
    <Space>
      {testCase.case_bugs && testCase.case_bugs.length > 0 && (
        <Tooltip title={`关联BUG: ${testCase.case_bugs.join(', ')}`}>
          <Tag color="error" icon={<LinkOutlined />}>
            BUG
          </Tag>
        </Tooltip>
      )}
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
        style={{ cursor: 'pointer' }}
      >
        {isReview ? '已评审' : '待评审'}
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
      bodyStyle={{ padding: token.paddingXS }}
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
