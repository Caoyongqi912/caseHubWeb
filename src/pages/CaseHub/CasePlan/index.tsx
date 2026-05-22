/**
 * CasePlan - 测试计划管理页面
 */

import { IObjGet } from '@/api';
import { deleteCasePlan, pageCasePlan } from '@/api/case/caseplan';
import { queryProjectEnum } from '@/components/CommonFunc';
import { useGlassStyles } from '@/components/Glass';
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
import { Button, Form, message, Modal, Progress, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import CasePlanForm from './components/CasePlanForm';

const Index = () => {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ICasePlan>();
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});
  const styles = useGlassStyles();

  const { token } = useCaseHubTheme();

  /** 加载项目枚举数据 */
  useEffect(() => {
    queryProjectEnum(setProjectEnumMap);
  }, []);

  /**
   * 查询测试计划列表数据
   * @param params - ProTable 查询参数
   * @param sort - 排序配置
   */
  const queryRecord = useCallback(async (params: any, sort: any) => {
    const { code, data } = await pageCasePlan({ ...params, sort });
    return pageData(code, data);
  }, []);

  /**
   * 打开编辑弹窗前，将后端数据格式转换为表单可用格式
   * @param record - 当前计划记录
   */
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

  /**
   * 删除计划（带二次确认）
   * @param record - 要删除的计划记录
   */
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

  /**
   * 弹窗开关状态变化处理
   * 关闭时重置表单和编辑状态
   */
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

  /**
   * 打开表单弹窗
   * @param record - 传入则进入编辑模式，不传则进入新增模式
   */
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
        <a onClick={() => navigate(`/cases/casePlan/planInfo/${r.id}`)}>
          {r.plan_name}
        </a>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'charge_name',
      width: '10%',
      render: (_, r) => r.charge_name || '-',
    },
    {
      title: '完成率',
      dataIndex: 'plan_completion_rate',
      hideInSearch: true,
      width: '12%',
      render: (_, r) => {
        const rate = r.plan_completion_rate || 0;
        return (
          <Space size={8}>
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
      hideInSearch: true,
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
  ];

  return (
    <PageContainer
      title={false}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 20px)',
        overflow: 'hidden',
        background: styles.colors.glass,
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

      {/* 占满剩余高度，内部滚动 */}

      <ProTable
        actionRef={actionRef}
        columns={columns}
        rowKey="uid"
        scroll={{
          y: 400,
        }}
        request={queryRecord}
        pagination={{ defaultPageSize: 10 }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openFormModal()}
          >
            新增计划
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Index;
