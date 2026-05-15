/**
 * CasePlan - 测试计划管理页面
 */

import { IObjGet } from '@/api';
import { deleteCasePlan, pageCasePlan } from '@/api/case/caseplan';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { useCaseHubTheme } from '@/pages/CaseHub/styles/useCaseHubTheme';
import { ICasePlan } from '@/pages/CaseHub/types';
import { pageData } from '@/utils/somefunc';
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Form, message, Modal, Progress, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import CasePlanForm from './components/CasePlanForm';

const Index = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ICasePlan | null>(null);

  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<ICasePlan>();
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});

  const { token } = useCaseHubTheme();
  const {
    colorText,
    colorTextSecondary,
    colorTextTertiary,
    colorPrimary,
    colorSuccess,
    colorFillSecondary,
    colorInfo,
    colorInfoBg,
    colorSuccessBg,
    colorWarning,
    colorWarningBg,
    colorError,
    colorErrorBg,
  } = token;

  useEffect(() => {
    queryProjectEnum(setProjectEnumMap);
  }, []);

  const queryRecord = useCallback(async (params: any, sort: any) => {
    const { code, data } = await pageCasePlan({ ...params, sort });
    return pageData(code, data);
  }, []);

  const handleEdit = useCallback(
    (record: ICasePlan) => {
      setIsEdit(true);
      setCurrentRecord(record);
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
      setOpenModal(true);
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

  const statusTag = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      进行中: { color: colorInfo, bg: colorInfoBg },
      已完成: { color: colorSuccess, bg: colorSuccessBg },
      已暂停: { color: colorWarning, bg: colorWarningBg },
      已取消: { color: colorError, bg: colorErrorBg },
    };
    const s = map[status] || { color: colorTextTertiary, bg: 'transparent' };
    return (
      <Tag
        style={{
          color: s.color,
          background: s.bg,
          border: 'none',
          fontWeight: 500,
        }}
      >
        {status || '-'}
      </Tag>
    );
  };

  const phaseTag = (phase: string) => {
    const map: Record<string, string> = {
      规划: '#722ed1',
      设计: '#eb2f96',
      执行: '#13c2c2',
      验收: '#fa8c16',
    };
    return (
      <Tag
        style={{
          color: map[phase] || colorTextTertiary,
          borderColor: map[phase] || colorTextTertiary,
          background: 'transparent',
        }}
      >
        {phase || '-'}
      </Tag>
    );
  };

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
        <span style={{ fontWeight: 500, color: colorText }}>
          <a
            href={`/cases/casePlan/planInfo/${r.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
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
        <Space size={4}>
          <UserOutlined style={{ color: colorTextSecondary }} />
          <span style={{ color: colorText }}>{r.charge_name || '-'}</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={rate}
              size="small"
              strokeColor={rate === 100 ? colorSuccess : colorPrimary}
              trailColor={colorFillSecondary}
              format={() => ''}
              style={{ width: 80, marginBottom: 0 }}
            />
            <span style={{ color: colorTextSecondary, fontSize: 12 }}>
              {rate}%
            </span>
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'plan_status',
      width: '9%',
      render: (_, r) => statusTag(r.plan_status || ''),
    },
    {
      title: '执行阶段',
      dataIndex: 'plan_phase',
      width: '9%',
      render: (_, r) => phaseTag(r.plan_phase || ''),
    },
    {
      title: '计划时间',
      width: '14%',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: colorText, fontSize: 12 }}>
            <CalendarOutlined
              style={{ marginRight: 4, color: colorTextSecondary }}
            />
            {r.plan_start_time || '-'}
          </span>
          <span style={{ color: colorTextTertiary, fontSize: 12 }}>
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
      render: (_, r) => (
        <span style={{ color: colorTextTertiary }}>{r.plan_mark || '-'}</span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: '10%',
      render: (_, r) => (
        <Space size={8}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(r)}
            style={{ color: colorPrimary }}
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
      onClick={() => {
        form.resetFields();
        setOpenModal(true);
      }}
    >
      新增计划
    </Button>
  );

  return (
    <>
      <CasePlanForm
        record={currentRecord}
        isEdit={isEdit}
        form={form}
        open={openModal}
        onOpenChange={handleOpenChange}
        onReload={() => actionRef.current?.reload()}
      />

      <MyProTable
        toolBarRender={() => [AddPlanButton]}
        actionRef={actionRef}
        columns={columns}
        rowKey="uid"
        request={queryRecord}
      />
    </>
  );
};

export default Index;
