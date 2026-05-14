import { IObjGet } from '@/api';
import { searchUser } from '@/api/base';
import {
  createCasePlan,
  deleteCasePlan,
  pageCasePlan,
  updateCasePlan,
} from '@/api/case/caseplan';
import { queryProjectEnum } from '@/components/CommonFunc';
import MyProTable from '@/components/Table/MyProTable';
import { ICasePlan } from '@/pages/CaseHub/types';
import { pageData } from '@/utils/somefunc';
import { useModel } from '@@/exports';
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message, Modal, Space } from 'antd';
import type { Rule } from 'antd/es/form';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';

const Index = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ICasePlan | null>(null);
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];
  const [form] = Form.useForm<ICasePlan>();
  const [projectEnumMap, setProjectEnumMap] = useState<IObjGet>({});

  useEffect(() => {
    queryProjectEnum(setProjectEnumMap);
  }, []);

  const queryRecord = useCallback(async (params: any, sort: any) => {
    const values = {
      ...params,
      sort: sort,
    };
    const { code, data } = await pageCasePlan(values);
    return pageData(code, data);
  }, []);

  const queryUser: any = async (value: any) => {
    const { keyWords } = value;
    if (keyWords) {
      const { code, data } = await searchUser({ username: keyWords });
      if (code === 0) {
        return data.map((item) => ({
          label: item.username,
          value: item.id,
        }));
      }
    }
    return [];
  };

  const handleEdit = useCallback(
    (record: ICasePlan) => {
      setIsEdit(true);
      setCurrentRecord(record);
      const formData: Record<string, unknown> = {
        ...record,
      };
      if (record.charge_id && record.charge_name) {
        formData.charge_id = {
          label: record.charge_name,
          value: record.charge_id,
        };
      }
      if (record.plan_start_time) {
        formData.plan_start_time = dayjs(record.plan_start_time);
      }
      if (record.plan_end_time) {
        formData.plan_end_time = dayjs(record.plan_end_time);
      }
      form.setFieldsValue(formData as unknown as ICasePlan);
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
      key: 'plan_name',
      fixed: 'left',
      width: '20%',
    },
    {
      title: '负责人',
      dataIndex: 'charge_name',
      key: 'charge_name',
      width: '10%',
    },
    {
      title: '测试计划完成率',
      dataIndex: 'plan_complete_rate',
      key: 'plan_complete_rate',
      hideInSearch: true,
      width: '15%',
    },
    {
      title: '状态',
      dataIndex: 'plan_status',
      key: 'plan_status',
      width: '10%',
    },

    {
      title: '执行阶段',
      dataIndex: 'plan_phase',
      key: 'plan_phase',
      width: '10%',
    },
    {
      title: '计划开始时间',
      dataIndex: 'plan_start_time',
      key: 'plan_start_time',
      valueType: 'date',
      width: '10%',
    },
    {
      title: '计划结束时间',
      dataIndex: 'plan_end_time',
      key: 'plan_end_time',
      valueType: 'date',

      width: '10%',
    },
    {
      title: '备注',
      dataIndex: 'plan_mark',
      ellipsis: true,
      hideInSearch: true,
      key: 'plan_mark',
      width: '10%',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: '15%',
      render: (_, record) => (
        <Space size={4}>
          <a type="primary" onClick={() => handleEdit(record)}>
            编辑
          </a>
          <a type="danger" onClick={() => handleDelete(record)}>
            删除
          </a>
        </Space>
      ),
    },
  ];
  return (
    <>
      <ModalForm
        title={isEdit ? '编辑计划' : '新增计划'}
        form={form}
        open={openModal}
        onOpenChange={handleOpenChange}
        autoFocus={true}
        autoFocusFirstInput
        modalProps={{
          destroyOnHidden: true,
        }}
        submitTimeout={2000}
        onFinish={async () => {
          const data = await form.validateFields();

          const chargeIdValue = data.charge_id;
          const submitData = {
            project_id: data.project_id,
            plan_name: data.plan_name,
            plan_start_time: data.plan_start_time
              ? dayjs(data.plan_start_time).format('YYYY-MM-DD')
              : undefined,
            plan_end_time: data.plan_end_time
              ? dayjs(data.plan_end_time).format('YYYY-MM-DD')
              : undefined,
          };

          if (chargeIdValue !== undefined && chargeIdValue !== null) {
            (submitData as Record<string, unknown>).charge_id =
              typeof chargeIdValue === 'object'
                ? (chargeIdValue as { value: number }).value
                : chargeIdValue;
          }

          let result;
          if (isEdit && currentRecord) {
            result = await updateCasePlan(submitData as unknown as ICasePlan);
          } else {
            result = await createCasePlan(submitData as unknown as ICasePlan);
          }

          const { code, msg } = result;
          if (code === 0) {
            message.success(msg);
            actionRef.current?.reload();
            return true;
          }
          return true;
        }}
      >
        <ProFormSelect
          label="项目"
          options={projects}
          name={'project_id'}
          width={'md'}
          required={true}
          rules={[{ required: true, message: '请选择项目' }]}
          fieldProps={{
            variant: 'filled',
          }}
        />
        <ProFormTextArea
          label="计划名称"
          name="plan_name"
          placeholder="请输入计划名称"
          required
          rules={[{ required: true, message: '请输入计划名称' }]}
          fieldProps={{
            variant: 'filled',
          }}
        />
        <ProFormSelect
          showSearch
          mode="single"
          name="charge_id"
          label="负责人"
          request={queryUser}
          debounceTime={1000}
          fieldProps={{
            variant: 'filled',
            optionFilterProp: 'label',
            labelInValue: true,
            onChange: (_value, option) => {
              const selectedOption = option as { title?: string };
              if (selectedOption?.title) {
                form.setFieldValue('charge_name', selectedOption.title);
              } else {
                form.setFieldValue('charge_name', undefined);
              }
            },
          }}
        />
        <ProFormText name="charge_name" hidden />

        <ProForm.Group>
          <ProFormDatePicker
            width="md"
            name="plan_start_time"
            label="计划开始时间"
            showTime={false}
            fieldProps={{
              variant: 'filled',
              format: 'YYYY-MM-DD',
              disabledDate: (current: dayjs.Dayjs) =>
                current && current < dayjs().startOf('day'),
            }}
          />
          <ProFormDatePicker
            width="md"
            name="plan_end_time"
            label="计划结束时间"
            format="YYYY-MM-DD"
            showTime={false}
            rules={[
              ({
                getFieldValue,
              }: {
                getFieldValue: (name: string) => dayjs.Dayjs | undefined;
              }) =>
                ({
                  validator: (_: unknown, value: dayjs.Dayjs) => {
                    const startTime = getFieldValue('plan_start_time');
                    if (!value && !startTime) return Promise.resolve();
                    if (value && !startTime)
                      return Promise.reject(new Error('请先选择计划开始时间'));
                    if (value && startTime && value.isBefore(startTime)) {
                      return Promise.reject(
                        new Error('结束时间必须晚于开始时间'),
                      );
                    }
                    return Promise.resolve();
                  },
                } as unknown as Rule),
            ]}
            fieldProps={{
              variant: 'filled',
              format: 'YYYY-MM-DD',
              disabledDate: (current: dayjs.Dayjs) => {
                const startTime = form.getFieldValue('plan_start_time');
                if (!startTime)
                  return current && current < dayjs().startOf('day');
                return current && current < dayjs(startTime).startOf('day');
              },
            }}
          />
        </ProForm.Group>
      </ModalForm>

      <MyProTable
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setOpenModal(true);
            }}
          >
            新增计划
          </Button>,
        ]}
        columns={columns}
        rowKey={'uid'}
        request={queryRecord}
      />
    </>
  );
};

export default Index;
