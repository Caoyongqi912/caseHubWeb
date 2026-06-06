/**
 * CasePlan · 测试计划列表
 *
 * 视觉:Refined Ledger —— 表格 cell 用 №、印章、发丝线、阶段点、
 * 时间堆叠、文本下划线操作,主标题与计划名用 antd 默认字体;数字与编号
 * 用 antd 等宽字体。所有色值经 antd token 解析,跟随主题切换。
 */

import { deleteCasePlan, pageCasePlan } from '@/api/case/caseplan';
import UserSelect from '@/components/Table/UserSelect';
import { useCaseHubTheme } from '@/pages/CaseHub/styles/useCaseHubTheme';
import { ICasePlan } from '@/pages/CaseHub/types';
import { pageData } from '@/utils/somefunc';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { useModel, useNavigate } from '@umijs/max';
import { Button, Form, message, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CasePlanForm from './components/CasePlanForm';
import {
  PHASE_DOT,
  PHASE_OPTIONS,
  resolveColor,
  STATUS_OPTIONS,
  STATUS_SEAL,
} from './styles';

const UserSelectMultiple = () => <UserSelect multiple />;

// ═════════════════════════════════════════════════════════════════
//  Cell renderers
// ═════════════════════════════════════════════════════════════════

/** № 编号列 —— 等宽数字 + Tertiary 灰 */
const IndexCell: React.FC<{ index: number; token: any }> = ({
  index,
  token,
}) => (
  <span
    style={{
      fontFamily: token.fontFamilyCode,
      fontSize: 11,
      color: token.colorTextTertiary,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '0.06em',
    }}
  >
    № {String(index).padStart(3, '0')}
  </span>
);

/** 计划名 —— 主标题 + 描述副标题(如有),hover 出现主色下划线 */
const PlanNameCell: React.FC<{
  record: ICasePlan;
  onOpen: () => void;
  token: any;
}> = ({ record, onOpen, token }) => {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span
        onClick={onOpen}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: hover ? token.colorPrimary : token.colorText,
          cursor: 'pointer',
          letterSpacing: '0.005em',
          lineHeight: 1.3,
          textDecoration: hover ? 'underline' : 'none',
          textUnderlineOffset: 5,
          textDecorationColor: token.colorPrimary,
          textDecorationThickness: 1,
          transition: 'color 200ms ease',
        }}
      >
        {record.plan_name}
      </span>
      {record.plan_description ? (
        <span
          style={{
            fontSize: 11,
            color: token.colorTextTertiary,
            lineHeight: 1.4,
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontStyle: 'italic',
          }}
        >
          {record.plan_description}
        </span>
      ) : null}
      {record.charge_name && (
        <span
          style={{
            fontSize: 10,
            color: token.colorTextTertiary,
            lineHeight: 1.4,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: token.colorTextTertiary,
              opacity: 0.7,
            }}
          >
            Owner
          </span>
          <span style={{ color: token.colorTextSecondary }}>
            {record.charge_name}
          </span>
        </span>
      )}
    </div>
  );
};

const ChargeCell: React.FC<{ name?: string; token: any }> = ({
  name,
  token,
}) => {
  const initial = (name || '?').trim()[0]?.toUpperCase() || '?';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: token.colorFillTertiary,
          color: token.colorTextSecondary,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 600,
          border: `1px solid ${token.colorBorderSecondary}`,
          fontFamily: token.fontFamilyCode,
        }}
      >
        {initial}
      </span>
      <span style={{ fontSize: 12, color: token.colorText }}>
        {name || <span style={{ color: token.colorTextTertiary }}>—</span>}
      </span>
    </span>
  );
};

/** 完成率 —— 发丝线 + 端点 pip,600ms 缓动 */
const HairlineProgress: React.FC<{ value: number; token: any }> = ({
  value,
  token,
}) => {
  const v = Math.max(0, Math.min(100, value || 0));
  const isDone = v >= 100;
  const color = isDone ? token.colorSuccess : token.colorPrimary;
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          height: 1,
          background: token.colorBorder,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${v}%`,
            background: color,
            transition: 'width 600ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${v}%`,
            transform: 'translate(-50%, -50%)',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 0 3px ${token.colorBgContainer}`,
            transition: 'left 600ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: token.fontFamilyCode,
          fontSize: 12,
          fontVariantNumeric: 'tabular-nums',
          color: isDone ? token.colorSuccess : token.colorTextSecondary,
          letterSpacing: '0.02em',
          minWidth: 36,
          textAlign: 'right',
        }}
      >
        {v}%
      </span>
    </div>
  );
};

/** 状态印章 —— 圆角药丸 + 细线边框 + 圆点指示 + 大写小字 */
const StatusSeal: React.FC<{ status?: string; token: any }> = ({
  status,
  token,
}) => {
  const cfg = STATUS_SEAL[status || ''] || {
    colorKey: 'colorTextTertiary',
    label: '—',
  };
  const color = resolveColor(token, cfg.colorKey);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px 2px 6px',
        border: `1px solid ${color}66`,
        borderRadius: 999,
        color,
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontWeight: 600,
        background: `${color}0a`,
        transition: 'all 200ms ease',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
        }}
      />
      {status || '—'}
    </span>
  );
};

/** 执行阶段 —— 小色点 + 名称 */
const PhaseDot: React.FC<{ phase?: string; token: any }> = ({
  phase,
  token,
}) => {
  const color = resolveColor(
    token,
    PHASE_DOT[phase || ''] || 'colorTextTertiary',
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 0 2px ${color}22`,
        }}
      />
      <span style={{ fontSize: 12, color: token.colorText }}>
        {phase || '—'}
      </span>
    </span>
  );
};

/** 计划时间 —— 左侧细线 + 上下两段 */
const TimeCell: React.FC<{
  start?: string;
  end?: string;
  token: any;
}> = ({ start, end, token }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'stretch',
      gap: 8,
      fontSize: 12,
      lineHeight: 1.5,
    }}
  >
    <div
      style={{
        width: 1,
        background: token.colorBorderSecondary,
        marginTop: 2,
        marginBottom: 2,
      }}
    />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ color: token.colorText }}>{start || '—'}</span>
      <span style={{ color: token.colorTextTertiary, fontSize: 11 }}>
        至 {end || '—'}
      </span>
    </div>
  </div>
);

/** 文本动作 —— 文字下划线 hover,无按钮边框 */
const ActionLink: React.FC<{
  onClick: () => void;
  color: string;
  token: any;
  children: React.ReactNode;
}> = ({ onClick, color, token, children }) => {
  const [hover, setHover] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        color: hover ? color : token.colorTextSecondary,
        textDecoration: hover ? 'underline' : 'none',
        textUnderlineOffset: 4,
        textDecorationColor: color,
        textDecorationThickness: 1,
        transition: 'color 180ms ease',
        fontSize: 12,
      }}
    >
      {children}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════
//  Page Header —— 克制版,只保留功能信息
// ═════════════════════════════════════════════════════════════════

const PageHeader: React.FC<{
  total: number;
  projectList: { label: string; value: number }[];
  selectedProjectId?: number;
  onProjectChange: (v: number) => void;
  onAdd: () => void;
  token: any;
}> = ({
  total,
  projectList,
  selectedProjectId,
  onProjectChange,
  onAdd,
  token,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap',
      padding: '18px 40px 16px',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      background: token.colorBgContainer,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 18,
        flexWrap: 'wrap',
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 500,
          color: token.colorText,
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
        }}
      >
        测试计划
      </h1>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: token.colorTextSecondary,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: token.colorPrimary,
          }}
        />
        共
        <span
          style={{
            fontFamily: token.fontFamilyCode,
            fontVariantNumeric: 'tabular-nums',
            color: token.colorText,
            fontWeight: 600,
          }}
        >
          {String(total).padStart(3, '0')}
        </span>
        条
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          paddingLeft: 18,
          marginLeft: 4,
          borderLeft: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Select
          variant="borderless"
          value={selectedProjectId}
          onChange={onProjectChange}
          options={projectList}
          style={{ minWidth: 180 }}
          fieldNames={{ label: 'label', value: 'value' }}
          size="middle"
        />
      </span>
    </div>
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={onAdd}
      style={{
        height: 32,
        padding: '0 16px',
        fontSize: 13,
        letterSpacing: '0.02em',
        borderRadius: 2,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontWeight: 500,
      }}
    >
      新建计划
    </Button>
  </div>
);

// ═════════════════════════════════════════════════════════════════
//  Main Page
// ═════════════════════════════════════════════════════════════════

const Index = () => {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ICasePlan>();

  const { initialState } = useModel('@@initialState');
  const projectList = initialState?.projects || [];

  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ICasePlan | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const { token } = useCaseHubTheme();

  useEffect(() => {
    if (projectList.length > 0 && selectedProjectId === undefined) {
      setSelectedProjectId(projectList[0].value);
    }
  }, [projectList, selectedProjectId]);

  const lastRequestedProjectId = useRef<number | undefined>();

  const queryRecord = useCallback(
    async (params: any, sort: any) => {
      if (selectedProjectId === undefined) {
        return { data: [], success: true, total: 0 };
      }
      lastRequestedProjectId.current = selectedProjectId;
      const { code, data } = await pageCasePlan({
        ...params,
        sort,
        project_id: selectedProjectId,
      });
      if (
        code === 0 &&
        data?.pageInfo?.total !== undefined &&
        lastRequestedProjectId.current === selectedProjectId
      ) {
        setTotalCount(data.pageInfo.total);
      }
      return pageData(code, data);
    },
    [selectedProjectId],
  );

  useEffect(() => {
    if (selectedProjectId !== undefined) {
      actionRef.current?.reload();
    }
  }, [selectedProjectId]);

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
      } as unknown as ICasePlan);
    },
    [form],
  );

  const handleDelete = useCallback((record: ICasePlan) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除计划「${record.plan_name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const { code, msg } = await deleteCasePlan({ plan_id: record.id });
        if (code === 0) {
          message.success(msg);
          actionRef.current?.reload();
        }
      },
    });
  }, []);

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

  const columns = useMemo<ProColumns<ICasePlan>[]>(
    () => [
      {
        title: '计划名称',
        dataIndex: 'plan_name',
        fixed: 'left',
        width: 260,
        render: (_, r) => (
          <PlanNameCell
            record={r}
            onOpen={() => navigate(`/cases/casePlan/planInfo/${r.id}`)}
            token={token}
          />
        ),
      },
      {
        title: '负责人',
        search: true,
        dataIndex: 'charge_id',
        hideInTable: true,
        formItemRender: () => <UserSelectMultiple />,
      },
      {
        title: '负责人',
        dataIndex: 'charge_name',
        search: false,
        width: 150,
        hideInTable: true,
        render: (_, r) => <ChargeCell name={r.charge_name} token={token} />,
      },
      {
        title: '完成率',
        dataIndex: 'completion_rate',
        hideInSearch: true,
        width: 210,
        render: (_, r) => (
          <HairlineProgress value={r.completion_rate || 0} token={token} />
        ),
      },
      {
        title: '状态',
        dataIndex: 'plan_status',
        width: 140,
        valueType: 'select',
        valueEnum: STATUS_OPTIONS,
        render: (_, r) => <StatusSeal status={r.plan_status} token={token} />,
      },
      {
        title: '执行阶段',
        dataIndex: 'plan_phase',
        width: 110,
        valueType: 'select',
        valueEnum: PHASE_OPTIONS,
        render: (_, r) => <PhaseDot phase={r.plan_phase} token={token} />,
      },
      {
        title: '计划时间',
        dataIndex: 'plan_start_time',
        width: 200,
        hideInSearch: true,
        render: (_, r) => (
          <TimeCell
            start={r.plan_start_time}
            end={r.plan_end_time}
            token={token}
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'plan_mark',
        ellipsis: true,
        hideInSearch: true,
        width: 180,
        render: (_, r) => (
          <span
            style={{
              color: token.colorTextTertiary,
              fontSize: 12,
              fontStyle: r.plan_mark ? 'italic' : 'normal',
            }}
          >
            {r.plan_mark || '—'}
          </span>
        ),
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: 120,
        render: (_, r) => (
          <span style={{ display: 'inline-flex', gap: 16 }}>
            <ActionLink
              color={token.colorPrimary}
              token={token}
              onClick={() => openFormModal(r)}
            >
              编辑
            </ActionLink>
            <ActionLink
              color={token.colorError}
              token={token}
              onClick={() => handleDelete(r)}
            >
              删除
            </ActionLink>
          </span>
        ),
      },
    ],
    [navigate, token, openFormModal, handleDelete],
  );

  const handleAdd = useCallback(() => openFormModal(), [openFormModal]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 20px)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .case-plan-table .ant-table-tbody > tr {
          transition: background 200ms ease;
        }
        .case-plan-table .ant-table-tbody > tr:hover > td {
          background: ${token.colorFillQuaternary} !important;
        }
        .case-plan-table .ant-table-tbody > tr:hover > td:first-child {
          box-shadow: inset 3px 0 0 0 ${token.colorPrimary};
        }
        .case-plan-table .ant-table-thead > tr > th {
          background: transparent !important;
          font-family: ${token.fontFamilyCode};
          font-size: 10px !important;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${token.colorTextTertiary} !important;
          font-weight: 600 !important;
          border-bottom: 1px solid ${token.colorBorder} !important;
        }
        .case-plan-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .case-plan-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${token.colorBorderSecondary} !important;
          padding-top: 12px !important;
          padding-bottom: 12px !important;
        }
        .case-plan-table .ant-table-cell-fix-left,
        .case-plan-table .ant-table-cell-fix-right {
          background: ${token.colorBgContainer} !important;
          z-index: 5 !important;
        }
        /* 固定列(左)最右一个 cell 的硬切分阴影 —— 始终可见,让固定列视觉上真正“浮”在滚动列之上 */
        .case-plan-table .ant-table-cell-fix-left-last {
          box-shadow:
            6px 0 8px -4px rgba(0, 0, 0, 0.12),
            1px 0 0 0 ${token.colorBorderSecondary} !important;
        }
        /* 固定列(右)最左一个 cell 的硬切分阴影 */
        .case-plan-table .ant-table-cell-fix-right-first {
          box-shadow:
            -6px 0 8px -4px rgba(0, 0, 0, 0.12),
            -1px 0 0 0 ${token.colorBorderSecondary} !important;
        }
        /* hover 时阴影略加深,强化分层感 */
        .case-plan-table .ant-table-tbody > tr:hover > .ant-table-cell-fix-left-last {
          box-shadow:
            6px 0 10px -4px rgba(0, 0, 0, 0.16),
            1px 0 0 0 ${token.colorBorderSecondary} !important;
        }
        .case-plan-table .ant-table-tbody > tr:hover > .ant-table-cell-fix-right-first {
          box-shadow:
            -6px 0 10px -4px rgba(0, 0, 0, 0.16),
            -1px 0 0 0 ${token.colorBorderSecondary} !important;
        }
        .case-plan-table .ant-table-tbody > tr:hover .ant-table-cell-fix-left,
        .case-plan-table .ant-table-tbody > tr:hover .ant-table-cell-fix-right {
          background: ${token.colorFillQuaternary} !important;
        }
        .case-plan-table .ant-pagination {
          font-family: ${token.fontFamilyCode};
        }
        .case-plan-table .ant-table {
          background: transparent;
        }
        .case-plan-table .ant-table-placeholder:hover > td {
          background: transparent !important;
        }
        /* 收紧搜索栏:去掉卡片外框,跟头部融为一体 */
        .case-plan-table .ant-pro-query-filter {
          padding: 12px 40px !important;
          border-bottom: 1px solid ${token.colorBorderSecondary} !important;
          background: ${token.colorBgContainer} !important;
        }
        .case-plan-table .ant-pro-query-filter .ant-pro-query-filter-search {
          margin-right: 8px !important;
        }
        .case-plan-table .ant-pro-query-filter .ant-form-item {
          margin-bottom: 0 !important;
        }
      `}</style>
      <CasePlanForm
        record={currentRecord}
        isEdit={isEdit}
        form={form}
        open={openModal}
        onOpenChange={handleOpenChange}
        onReload={() => actionRef.current?.reload()}
      />
      <PageHeader
        total={totalCount}
        projectList={projectList}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onAdd={handleAdd}
        token={token}
      />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0 40px 24px',
          background: token.colorBgContainer,
        }}
      >
        <ProTable<ICasePlan>
          className="case-plan-table"
          columnsState={{
            persistenceKey: 'case_plan',
            persistenceType: 'localStorage',
          }}
          actionRef={actionRef}
          columns={columns}
          rowKey="uid"
          scroll={{
            x: 1400,
            y: 'calc(100vh - 320px)',
          }}
          request={queryRecord}
          pagination={{
            showQuickJumper: true,
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          search={{
            filterType: 'light',
            labelWidth: 'auto',
            defaultCollapsed: false,
            span: 6,
          }}
          dateFormatter="string"
          headerTitle={false}
        />
      </div>
    </div>
  );
};

export default Index;
