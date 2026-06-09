/**
 * CasePlan · 测试计划管理
 *
 * 设计方向：Precision Ledger —— 精密账本式管理后台
 * 以高信息密度、精确的视觉层级和克制动效为特征。
 * 严格基于 Ant Design 5.x，通过 token 定制和组件组合实现差异化。
 */

import {
  deleteCasePlan,
  pageCasePlan,
  updateCasePlan,
} from '@/api/case/caseplan';
import UserSelect from '@/components/Table/UserSelect';
import { useCaseEnumConfig } from '@/pages/CaseHub/hooks/useCaseEnumConfig';
import { useCaseHubTheme } from '@/pages/CaseHub/styles/useCaseHubTheme';
import { ICasePlan } from '@/pages/CaseHub/types';
import { pageData } from '@/utils/somefunc';
import {
  BarChartOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { useModel, useNavigate } from '@umijs/max';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  theme,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CasePlanForm from './components/CasePlanForm';
import type { PlanStatusItem } from './components/StatCards';
import { computePlanStats, type PlanStats } from './components/StatCards';
import { resolveStatusColor } from './statusColor';

const { Content } = Layout;
const { RangePicker } = DatePicker;

// ═════════════════════════════════════════════════════════════════
//  辅助组件
// ═════════════════════════════════════════════════════════════════

/** 计划名称 —— ellipsis + Tooltip，hover 主色下划线 */
const PlanNameCell: React.FC<{
  record: ICasePlan;
  onOpen: () => void;
}> = ({ record, onOpen }) => {
  const { token } = theme.useToken();
  const [hover, setHover] = useState(false);
  return (
    <Tooltip title={record.plan_name} placement="topLeft">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxWidth: 280,
        }}
      >
        <span
          onClick={onOpen}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: hover ? token.colorPrimary : token.colorText,
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: hover ? `underline ${token.colorPrimary}` : 'none',
            textUnderlineOffset: 4,
            transition: 'color 180ms ease',
          }}
        >
          {record.plan_name}
        </span>
        {record.plan_description && (
          <span
            style={{
              fontSize: 11,
              color: token.colorTextTertiary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {record.plan_description}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

/** 负责人 —— Avatar + 用户名 */
const ChargeCell: React.FC<{ name?: string; avatar?: string }> = ({
  name,
  avatar,
}) => (
  <Space size={8}>
    <Avatar size="small" src={avatar} style={{ backgroundColor: '#f0f0f0' }}>
      {(name || '?')[0]?.toUpperCase()}
    </Avatar>
    <span style={{ fontSize: 13 }}>{name || '—'}</span>
  </Space>
);

/** 完成率 —— Progress + 百分比文字 */
const RateCell: React.FC<{
  rate: number;
  executed?: number;
  total?: number;
}> = ({ rate, executed, total }) => {
  const { token } = theme.useToken();
  const v = Math.max(0, Math.min(100, rate || 0));
  const status = v >= 100 ? 'success' : v >= 60 ? 'normal' : 'exception';
  return (
    <Space style={{ minWidth: 140 }}>
      <Progress
        percent={v}
        size="small"
        status={status}
        showInfo={false}
        strokeColor={v >= 100 ? token.colorSuccess : token.colorPrimary}
      />
      <Space size={8}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: v >= 100 ? token.colorSuccess : token.colorText,
            fontFamily: token.fontFamilyCode,
          }}
        >
          {v}%
        </span>
        {typeof executed === 'number' && typeof total === 'number' && (
          <span style={{ fontSize: 11, color: token.colorTextTertiary }}>
            {executed}/{total}
          </span>
        )}
      </Space>
    </Space>
  );
};

/** 时间 —— Tooltip 显示完整范围 */
const TimeCell: React.FC<{ start?: string; end?: string }> = ({
  start,
  end,
}) => {
  const { token } = theme.useToken();
  const text = start && end ? `${start} 至 ${end}` : start || end || '—';
  return (
    <Tooltip title={text}>
      <Space>
        <span style={{ fontSize: 13, color: token.colorText }}>
          {start || '—'}
        </span>
        <span style={{ fontSize: 11, color: token.colorTextTertiary }}>
          至 {end || '—'}
        </span>
      </Space>
    </Tooltip>
  );
};

// ═════════════════════════════════════════════════════════════════
//  统计卡片
// ═════════════════════════════════════════════════════════════════

const StatOverview: React.FC<{
  stats: PlanStats;
  statuses: PlanStatusItem[];
  loading?: boolean;
}> = ({ stats, statuses, loading }) => {
  const { token } = theme.useToken();
  const [primary, secondary] = statuses;
  const primaryColor = primary
    ? resolveStatusColor(token, primary.color)
    : token.colorTextTertiary;
  const secondaryColor = secondary
    ? resolveStatusColor(token, secondary.color)
    : token.colorTextTertiary;

  if (loading) {
    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col span={6} key={i}>
            <Skeleton active paragraph={false} title={{ width: '80%' }} />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col xs={12} sm={12} md={6}>
        <Card
          size="small"
          style={{
            background: token.colorFillQuaternary,
            borderRadius: 8,
          }}
          styles={{ body: { padding: '16px 20px' } }}
        >
          <Statistic
            title="总计划"
            value={stats.total}
            prefix={<BarChartOutlined style={{ color: token.colorPrimary }} />}
            styles={{
              value: {
                fontFamily: token.fontFamilyCode,
                fontSize: 28,
                fontWeight: 600,
              },
            }}
          />
        </Card>
      </Col>
      {primary && (
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              background: `${primaryColor}08`,
              borderRadius: 8,
              border: `1px solid ${primaryColor}20`,
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Statistic
              title={primary.label}
              value={stats.statusCounts[primary.value] || 0}
              prefix={<Badge color={primaryColor} style={{ marginRight: 4 }} />}
              styles={{
                value: {
                  fontFamily: token.fontFamilyCode,
                  fontSize: 28,
                  fontWeight: 600,
                  color: primaryColor,
                },
              }}
            />
          </Card>
        </Col>
      )}
      {secondary && (
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              background: `${secondaryColor}08`,
              borderRadius: 8,
              border: `1px solid ${secondaryColor}20`,
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Statistic
              title={secondary.label}
              value={stats.statusCounts[secondary.value] || 0}
              prefix={
                <Badge color={secondaryColor} style={{ marginRight: 4 }} />
              }
              styles={{
                value: {
                  fontFamily: token.fontFamilyCode,
                  fontSize: 28,
                  fontWeight: 600,
                  color: secondaryColor,
                },
              }}
            />
          </Card>
        </Col>
      )}
      <Col xs={12} sm={12} md={secondary ? 6 : 12}>
        <Card
          size="small"
          style={{
            background: token.colorFillQuaternary,
            borderRadius: 8,
          }}
          styles={{ body: { padding: '16px 20px' } }}
        >
          <Statistic
            title="平均完成率"
            value={stats.avgCompletion}
            suffix="%"
            prefix={
              <ClockCircleOutlined
                style={{
                  color:
                    stats.avgCompletion >= 100
                      ? token.colorSuccess
                      : token.colorPrimary,
                }}
              />
            }
            styles={{
              value: {
                fontFamily: token.fontFamilyCode,
                fontSize: 28,
                fontWeight: 600,
                color:
                  stats.avgCompletion >= 100
                    ? token.colorSuccess
                    : token.colorText,
              },
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

// ═════════════════════════════════════════════════════════════════
//  Main Page
// ═════════════════════════════════════════════════════════════════

type StatusFilter = string;

const CasePlanPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ICasePlan>();
  const { token } = useCaseHubTheme();

  const { initialState } = useModel('@@initialState');
  const projectList = initialState?.projects || [];

  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ICasePlan | null>(null);

  // 统计
  const [stats, setStats] = useState<PlanStats>({
    total: 0,
    statusCounts: {},
    phaseCounts: {},
    avgCompletion: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // 筛选条件
  const [statusFilter, setStatusFilter] = useState<StatusFilter>();
  const [phaseFilter, setPhaseFilter] = useState<StatusFilter>();
  const [keyword, setKeyword] = useState('');
  const [filterCharge, setFilterCharge] = useState<{
    label: string;
    value: number;
  }>();
  const [filterDateRange, setFilterDateRange] = useState<[string, string]>();

  // 枚举配置
  const { options: planStatusOptions } = useCaseEnumConfig('PLAN_STATUS');
  const statuses = planStatusOptions as PlanStatusItem[];
  const statusColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of statuses) m[s.value] = resolveStatusColor(token, s.color);
    return m;
  }, [statuses, token]);

  const { options: planPhaseOptions } = useCaseEnumConfig('PLAN_PHASE');
  const phases = planPhaseOptions as PlanStatusItem[];
  const phaseColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of phases) m[p.value] = resolveStatusColor(token, p.color);
    return m;
  }, [phases, token]);

  // 默认选中第一个项目
  useEffect(() => {
    if (projectList.length > 0 && selectedProjectId === undefined) {
      setSelectedProjectId(projectList[0].value);
    }
  }, [projectList, selectedProjectId]);

  // 表格请求
  const queryRecord = useCallback(
    async (params: any, sort: any) => {
      if (selectedProjectId === undefined) {
        return { data: [], success: true, total: 0 };
      }
      const merged = { ...params };
      if (statusFilter) merged.plan_status = statusFilter;
      if (phaseFilter) merged.plan_phase = phaseFilter;
      if (keyword) merged.plan_name = keyword;
      if (filterCharge) merged.charge_id = filterCharge.value;
      if (filterDateRange) {
        merged.plan_start_time = filterDateRange[0];
        merged.plan_end_time = filterDateRange[1];
      }
      const { code, data } = await pageCasePlan({
        ...merged,
        sort,
        project_id: selectedProjectId,
      });
      if (
        code === 0 &&
        Array.isArray(data?.items) &&
        !statusFilter &&
        !phaseFilter
      ) {
        setStats(computePlanStats(data.items, statuses, phases));
      }
      return pageData(code, data);
    },
    [
      selectedProjectId,
      statusFilter,
      phaseFilter,
      keyword,
      filterCharge,
      filterDateRange,
      statuses,
      phases,
    ],
  );

  // 加载全量统计
  const reloadKey = useRef(0);
  const loadStats = useCallback(async () => {
    if (selectedProjectId === undefined) {
      setStats({
        total: 0,
        statusCounts: {},
        phaseCounts: {},
        avgCompletion: 0,
      });
      return;
    }
    setStatsLoading(true);
    const fetchId = ++reloadKey.current;
    try {
      const { code, data } = await pageCasePlan({
        current: 1,
        pageSize: 100,
        project_id: selectedProjectId,
      });
      if (fetchId !== reloadKey.current) return;
      if (code === 0 && Array.isArray(data?.items)) {
        setStats(computePlanStats(data.items, statuses, phases));
      }
    } finally {
      if (fetchId === reloadKey.current) setStatsLoading(false);
    }
  }, [selectedProjectId, statuses, phases]);

  // 筛选变化时刷新表格
  useEffect(() => {
    if (selectedProjectId !== undefined) {
      actionRef.current?.reload();
    }
  }, [
    selectedProjectId,
    statusFilter,
    phaseFilter,
    keyword,
    filterCharge,
    filterDateRange,
  ]);

  // 编辑回显
  const handleEdit = useCallback(
    (record: ICasePlan) => {
      form.setFieldsValue({
        ...record,
        charge_id:
          record.charge_id && record.charge_name
            ? { label: record.charge_name, value: record.charge_id }
            : undefined,
        plan_start_time: record.plan_start_time
          ? dayjs(record.plan_start_time)
          : undefined,
        plan_end_time: record.plan_end_time
          ? dayjs(record.plan_end_time)
          : undefined,
      } as any);
    },
    [form],
  );

  // 删除
  const handleDelete = useCallback(
    (record: ICasePlan) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除计划「${record.plan_name}」吗？该操作不可恢复。`,
        okText: '确认删除',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: async () => {
          const { code, msg } = await deleteCasePlan({ plan_id: record.id });
          if (code === 0) {
            message.success(msg);
            actionRef.current?.reload();
            loadStats();
          }
        },
      });
    },
    [loadStats],
  );

  /** 行内编辑：直接修改状态/阶段 */
  const handleInlineUpdate = useCallback(
    async (id: number, field: string, value: string) => {
      const { code, msg } = await updateCasePlan({
        id,
        [field]: value,
      } as unknown as ICasePlan);
      if (code === 0) {
        message.success('更新成功');
        actionRef.current?.reload();
        loadStats();
      } else {
        message.error(msg || '更新失败');
      }
    },
    [loadStats],
  );

  // 清空筛选
  const handleClearAllFilters = useCallback(() => {
    setStatusFilter(undefined);
    setPhaseFilter(undefined);
    setKeyword('');
    setFilterCharge(undefined);
    setFilterDateRange(undefined);
  }, []);

  // 弹窗控制
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpenModal(open);
      if (!open) {
        setIsEdit(false);
        setCurrentRecord(null);
        form.resetFields();
      }
    },
    [form],
  );

  const openFormModal = useCallback(
    (record?: ICasePlan) => {
      if (record) {
        setIsEdit(true);
        setCurrentRecord(record);
        handleEdit(record);
      } else {
        setIsEdit(false);
        setCurrentRecord(null);
        form.resetFields();
      }
      setOpenModal(true);
    },
    [form, handleEdit],
  );

  // 表格列定义
  const columns = useMemo<ProColumns<ICasePlan>[]>(
    () => [
      {
        title: '计划名称',
        dataIndex: 'plan_name',
        fixed: 'left',
        width: '25%',
        ellipsis: true,
        render: (_, r) => (
          <PlanNameCell
            record={r}
            onOpen={() => navigate(`/cases/casePlan/planInfo/${r.id}`)}
          />
        ),
      },
      {
        title: '负责人',
        dataIndex: 'charge_name',
        width: '15%',
        render: (_, r) => (
          <ChargeCell name={r.charge_name} avatar={r.charge_avatar} />
        ),
      },
      {
        title: '完成率',
        dataIndex: 'completion_rate',
        width: '5%',
        render: (_, r) => <RateCell rate={r.completion_rate || 0} />,
      },
      {
        title: '状态',
        dataIndex: 'plan_status',
        width: '15%',
        align: 'center',
        render: (_, r) => (
          <Select
            size="small"
            variant="borderless"
            value={r.plan_status}
            onChange={(val) => handleInlineUpdate(r.id, 'plan_status', val)}
            options={statuses.map((s) => ({
              label: (
                <Tag
                  color={resolveStatusColor(token, s.color)}
                  style={{
                    margin: 0,
                    borderRadius: 999,
                    fontSize: 11,
                    padding: '1px 8px',
                  }}
                >
                  {s.label}
                </Tag>
              ),
              value: s.value,
            }))}
            style={{ minWidth: 90 }}
          />
        ),
      },
      {
        title: '执行阶段',
        dataIndex: 'plan_phase',
        width: '15%',
        render: (_, r) => (
          <Select
            size="small"
            variant="borderless"
            value={r.plan_phase}
            onChange={(val) => handleInlineUpdate(r.id, 'plan_phase', val)}
            options={phases.map((p) => ({
              label: (
                <Space size={6}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: resolveStatusColor(token, p.color),
                      display: 'inline-block',
                    }}
                  />
                  {p.label}
                </Space>
              ),
              value: p.value,
            }))}
            style={{ minWidth: 90 }}
          />
        ),
      },
      {
        title: '计划时间',
        dataIndex: 'plan_start_time',
        width: '15%',
        render: (_, r) => (
          <TimeCell start={r.plan_start_time} end={r.plan_end_time} />
        ),
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: '10%',
        render: (_, r) => (
          <Space size={4}>
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openFormModal(r)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(r)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [
      navigate,
      token,
      openFormModal,
      handleDelete,
      handleInlineUpdate,
      statusColorMap,
      phaseColorMap,
    ],
  );

  const handleAdd = useCallback(() => openFormModal(), [openFormModal]);

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <Content style={{ padding: '24px 32px' }}>
        {/* 表单弹窗 */}
        <CasePlanForm
          record={currentRecord}
          isEdit={isEdit}
          form={form}
          open={openModal}
          onOpenChange={handleOpenChange}
          onReload={() => {
            actionRef.current?.reload();
            loadStats();
          }}
          projectId={selectedProjectId}
        />

        {/* 页面标题栏 */}
        <div style={{ marginBottom: 24 }}>
          <Space size={16} align="center">
            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                margin: 0,
                color: token.colorTextHeading,
              }}
            >
              测试计划
            </h1>
            <Select
              variant="filled"
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              options={projectList}
              style={{ minWidth: 200 }}
              placeholder="选择项目"
            />
          </Space>
        </div>

        {/* 统计概览 */}
        <StatOverview
          stats={stats}
          statuses={statuses}
          loading={statsLoading}
        />

        {/* 表格区域 */}
        <ProTable<ICasePlan>
          actionRef={actionRef}
          columns={columns}
          rowKey="uid"
          scroll={{ y: window.innerHeight - 350 }}
          request={queryRecord}
          search={false}
          dateFormatter="string"
          headerTitle={
            <Space wrap size={8}>
              <Input
                variant="filled"
                placeholder="搜索计划名称"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: 180 }}
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                allowClear
              />
              <div style={{ width: 160 }}>
                <UserSelect
                  variant="filled"
                  value={filterCharge}
                  onChange={(val) => setFilterCharge(val as any)}
                />
              </div>
              <RangePicker
                variant="filled"
                value={
                  filterDateRange
                    ? [dayjs(filterDateRange[0]), dayjs(filterDateRange[1])]
                    : undefined
                }
                onChange={(dates) => {
                  if (dates?.[0] && dates?.[1]) {
                    setFilterDateRange([
                      dates[0].format('YYYY-MM-DD'),
                      dates[1].format('YYYY-MM-DD'),
                    ]);
                  } else {
                    setFilterDateRange(undefined);
                  }
                }}
                placeholder={['开始日期', '结束日期']}
              />
              <Select
                variant="filled"
                placeholder="状态"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                style={{ width: 120 }}
                allowClear
                options={statuses}
              />
              <Select
                variant="filled"
                placeholder="阶段"
                value={phaseFilter}
                onChange={(val) => setPhaseFilter(val)}
                style={{ width: 120 }}
                allowClear
                options={phases}
              />
              <Button
                type="link"
                icon={<ClearOutlined />}
                onClick={handleClearAllFilters}
              >
                重置
              </Button>
            </Space>
          }
          toolbar={{
            actions: [
              <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新建计划
              </Button>,
            ],

            multipleLine: false,
          }}
          pagination={{
            showQuickJumper: true,
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            style: { margin: '16px 24px' },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  selectedProjectId === undefined
                    ? '请先在上方选择项目'
                    : '暂无测试计划数据'
                }
              />
            ),
          }}
        />
      </Content>
    </Layout>
  );
};

export default CasePlanPage;
