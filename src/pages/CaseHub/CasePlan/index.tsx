/**
 * CasePlan - 测试计划管理页面
 */

import { IObjGet } from '@/api';
import { deleteCasePlan, pageCasePlan } from '@/api/case/caseplan';
import { queryProjectEnum } from '@/components/CommonFunc';
import { useCaseHubTheme } from '@/pages/CaseHub/styles';
import { ICasePlan } from '@/pages/CaseHub/types';
import { pageData } from '@/utils/somefunc';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import {
  Button,
  Form,
  message,
  Modal,
  Progress,
  Space,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import CasePlanForm from './components/CasePlanForm';
import { useCasePlanStyles } from './styles';

const { Text } = Typography;

const Index = () => {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ICasePlan>();
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});

  const { token } = useCaseHubTheme();
  const styles = useCasePlanStyles();

  /** 加载项目枚举数据 */
  useEffect(() => {
    queryProjectEnum(setProjectEnumMap);
  }, []);

  const queryRecord = useCallback(async (params: any, sort: any) => {
    const { code, data } = await pageCasePlan({ ...params, sort });
    return pageData(code, data);
  }, []);

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

  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ICasePlan | null>(null);

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

  const columns: ProColumns<ICasePlan>[] = [
    {
      title: '项目',
      valueType: 'select',
      valueEnum: projectEnumMap,
      hideInTable: true,
    },
    {
      title: '计划名称',
      dataIndex: 'plan_name',
      fixed: 'left',
      width: '18%',
      render: (_, r) => (
        <span style={styles.planNameCell()}>
          <a onClick={() => navigate(`/cases/casePlan/planInfo/${r.id}`)}>
            {r.plan_name}
          </a>
        </span>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'charge_name',
      width: '10%',
      render: (_, r) => (
        <Space size={4} style={styles.chargeNameCell()}>
          <span style={styles.chargeNameCell()}>{r.charge_name || '-'}</span>
        </Space>
      ),
    },
    {
      title: '完成率',
      dataIndex: 'plan_completion_rate',
      hideInSearch: true,
      width: '12%',
      render: (_, r) => {
        const rate = r.plan_completion_rate || 0;
        return (
          <Space size={8} style={styles.completionRateCell()}>
            <Progress
              percent={rate}
              size="small"
              strokeColor={
                rate === 100 ? token.colorSuccess : token.colorPrimary
              }
              trailColor={token.colorFillSecondary}
              format={() => ''}
              style={{ width: 80, marginBottom: 0 }}
            />
            <span style={styles.completionRateText()}>{rate}%</span>
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'plan_status',
      width: '9%',
      render: (_, r) => (
        <Tag style={styles.statusTag(r.plan_status || '')}>
          {r.plan_status || '-'}
        </Tag>
      ),
    },
    {
      title: '执行阶段',
      dataIndex: 'plan_phase',
      width: '9%',
      render: (_, r) => (
        <Tag style={styles.phaseTag(r.plan_phase || '')}>
          {r.plan_phase || '-'}
        </Tag>
      ),
    },
    {
      title: '计划时间',
      width: '14%',
      render: (_, r) => (
        <Space direction="vertical" size={0} style={styles.planTimeCell()}>
          <span style={styles.planTimeMain()}>
            <span style={styles.planTimeIcon()}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect
                  x="1"
                  y="2"
                  width="10"
                  height="9"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M3 1V3M9 1V3M1 5H11"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </span>
            {r.plan_start_time || '-'}
          </span>
          <span style={styles.planTimeSub()}>至 {r.plan_end_time || '-'}</span>
        </Space>
      ),
    },
    {
      title: '备注',
      dataIndex: 'plan_mark',
      ellipsis: true,
      hideInSearch: true,
      width: '10%',
      render: (_, r) => (
        <Text style={styles.markCell()}>{r.plan_mark || '-'}</Text>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: '10%',
      render: (_, r) => (
        <Space size={8} style={styles.actionCell()}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openFormModal(r)}
            style={styles.editButton()}
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
  ];

  const AddPlanButton = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => openFormModal()}
    >
      新增计划
    </Button>
  );

  return (
    <PageContainer
      title={false}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <CasePlanForm
        record={currentRecord}
        isEdit={isEdit}
        form={form}
        open={openModal}
        onOpenChange={handleOpenChange}
        onReload={() => {
          actionRef.current?.reload();
        }}
      />
      <div style={{ height: 'calc(100vh - 240px)' }}>
        <ProTable
          actionRef={actionRef}
          columns={columns}
          rowKey="uid"
          scroll={{ y: 'fill' }}
          request={queryRecord}
          pagination={{ defaultPageSize: 10 }}
          toolBarRender={() => []}
        />
      </div>
    </PageContainer>
  );
};

export default Index;
