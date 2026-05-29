import { deleteCasePlan, pageCasePlan } from '@/api/case/caseplan';
import UserSelect from '@/components/Table/UserSelect';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan } from '@/pages/CaseHub/types';
import { pageData } from '@/utils/somefunc';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProCard,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useModel, useNavigate } from '@umijs/max';
import {
  Button,
  Form,
  message,
  Modal,
  Progress,
  Select,
  Space,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CasePlanForm from './components/CasePlanForm';

const UserSelectMultiple = () => <UserSelect multiple />;

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

  const { token, colors, spacing } = useCaseHubTheme();

  useEffect(() => {
    if (projectList.length > 0 && selectedProjectId === undefined) {
      setSelectedProjectId(projectList[0].value);
    }
  }, [projectList, selectedProjectId]);

  const queryRecord = useCallback(
    async (params: any, sort: any) => {
      if (selectedProjectId === undefined) {
        return { data: [], success: true, total: 0 };
      }
      const { code, data } = await pageCasePlan({
        ...params,
        sort,
        project_id: selectedProjectId,
      });
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
        width: '18%',
        render: (_, r) => (
          <a onClick={() => navigate(`/cases/casePlan/planInfo/${r.id}`)}>
            {r.plan_name}
          </a>
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
        width: '10%',
        render: (_, r) => r.charge_name || '-',
      },
      {
        title: '完成率',
        dataIndex: 'completion_rate',
        search: true,
        width: '12%',
        render: (_, r) => {
          const rate = r.completion_rate || 0;
          return (
            <Space size={8}>
              <Progress
                percent={rate}
                size="small"
                strokeColor={
                  rate === 100 ? token.colorSuccess : token.colorPrimary
                }
                railColor={token.colorFillSecondary}
                format={() => ''}
                style={{ width: 80, marginBottom: 0 }}
              />
              <span style={{ color: token.colorTextSecondary, fontSize: 12 }}>
                {rate}%
              </span>
            </Space>
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'plan_status',
        width: '9%',
        render: (_, r) => (
          <Tag color={r.plan_status === '已完成' ? 'success' : 'default'}>
            {r.plan_status || '-'}
          </Tag>
        ),
      },
      {
        title: '执行阶段',
        dataIndex: 'plan_phase',
        render: (_, r) => <Tag>{r.plan_phase || '-'}</Tag>,
      },
      {
        title: '计划时间',
        dataIndex: 'plan_start_time',
        width: '12%',
        render: (_, r) => (
          <Space direction="vertical" size={0}>
            <span>{r.plan_start_time || '-'}</span>
            <span style={{ color: token.colorTextTertiary, fontSize: 12 }}>
              至 {r.plan_end_time || '-'}
            </span>
          </Space>
        ),
      },
      {
        title: '备注',
        dataIndex: 'plan_mark',
        ellipsis: true,
        search: true,
        width: '10%',
        render: (_, r) => r.plan_mark || '-',
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: '10%',
        render: (_, r) => (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openFormModal(r)}
            >
              编辑
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(r)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [navigate, token, openFormModal, handleDelete],
  );

  const handleAdd = useCallback(() => openFormModal(), [openFormModal]);

  return (
    <PageContainer
      title={false}
      header={{
        breadcrumb: {
          routes: [],
        },
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 20px)',
        overflow: 'hidden',
      }}
    >
      <CasePlanForm
        record={currentRecord}
        isEdit={isEdit}
        form={form}
        open={openModal}
        onOpenChange={handleOpenChange}
        onReload={() => actionRef.current?.reload()}
      />
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ProCard
          title={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <ProjectOutlined
                style={{
                  fontSize: 18,
                  color: colors.primary,
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.text,
                  whiteSpace: 'nowrap',
                }}
              >
                所属项目
              </span>
              <Select
                showSearch
                placeholder="请选择项目"
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                options={projectList}
                style={{ minWidth: 240 }}
                fieldNames={{ label: 'label', value: 'value' }}
              />
            </div>
          }
          headerBordered
          variant="outlined"
          style={{
            flex: 1,
            height: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
          styles={{
            body: {
              padding: '12px',
              height: '100%',
            },
          }}
        >
          <ProTable
            columnsState={{
              persistenceKey: 'case_plan',
              persistenceType: 'localStorage',
            }}
            actionRef={actionRef}
            columns={columns}
            rowKey="uid"
            style={{ height: '100%' }}
            scroll={{
              x: 1200,
              y: 'calc(100vh - 420px)',
            }}
            request={queryRecord}
            pagination={{
              showQuickJumper: true,
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            toolBarRender={() => [
              <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增计划
              </Button>,
            ]}
          />
        </ProCard>
      </div>
    </PageContainer>
  );
};

export default Index;
