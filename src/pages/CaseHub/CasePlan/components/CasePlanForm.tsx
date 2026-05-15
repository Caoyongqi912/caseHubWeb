/**
 * CasePlanForm - 测试计划表单弹窗
 */

import { searchUser } from '@/api/base';
import { createCasePlan, updateCasePlan } from '@/api/case/caseplan';
import { useCaseHubTheme } from '@/pages/CaseHub/styles/useCaseHubTheme';
import { ICasePlan } from '@/pages/CaseHub/types';
import { useModel } from '@@/exports';
import {
  CalendarOutlined,
  EditOutlined,
  PlusOutlined,
  ProjectOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormInstance, message } from 'antd';
import type { Rule } from 'antd/es/form';
import dayjs from 'dayjs';
import { useCallback } from 'react';

interface Props {
  record: ICasePlan | null;
  isEdit: boolean;
  form: FormInstance<ICasePlan>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReload: () => void;
}

const formatDate = (value: string | dayjs.Dayjs | undefined) =>
  value ? dayjs(value).format('YYYY-MM-DD') : undefined;

const CasePlanForm: React.FC<Props> = ({
  record,
  isEdit,
  form,
  open,
  onOpenChange,
  onReload,
}) => {
  const { token } = useCaseHubTheme();
  const textSecondary = token.colorTextSecondary;
  const { initialState } = useModel('@@initialState');
  const projects = initialState?.projects || [];

  const queryUser = useCallback(async (value: { keyWords?: string }) => {
    if (!value.keyWords) return [];
    const { code, data } = await searchUser({ username: value.keyWords });
    return code === 0
      ? data.map((item: { username: string; id: number }) => ({
          label: item.username,
          value: item.id,
        }))
      : [];
  }, []);

  const handleChargeChange = useCallback(
    (value: unknown) => {
      form.setFieldValue('charge_name', (value as { label?: string })?.label);
    },
    [form],
  );

  const handleFinish = useCallback(async () => {
    const data = await form.validateFields();
    const chargeId = data.charge_id as { value?: number } | number | undefined;
    const submitData: Record<string, unknown> = {
      project_id: data.project_id,
      plan_name: data.plan_name,
      charge_name: data.charge_name,
      plan_start_time: formatDate(data.plan_start_time),
      plan_end_time: formatDate(data.plan_end_time),
      charge_id:
        typeof chargeId === 'object' && chargeId ? chargeId.value : chargeId,
    };
    if (isEdit && record) submitData.id = record.id;
    const [api, msg] =
      isEdit && record
        ? [updateCasePlan, '更新成功']
        : [createCasePlan, '创建成功'];
    const { code } = await api(submitData as unknown as ICasePlan);
    if (code === 0) {
      message.success(msg);
      onReload();
    }
    return true;
  }, [form, isEdit, record, onReload]);

  return (
    <ModalForm
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isEdit ? <EditOutlined /> : <PlusOutlined />}
          {isEdit ? '编辑计划' : '新增计划'}
        </span>
      }
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      onFinish={handleFinish}
    >
      <div style={{ padding: '0 8px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, color: textSecondary, fontSize: 12 }}>
            <ProjectOutlined style={{ marginRight: 6 }} />
            基本信息
          </div>
          <ProFormSelect
            label="所属项目"
            options={projects}
            name="project_id"
            width="md"
            rules={[{ required: true, message: '请选择项目' }]}
            fieldProps={{ variant: 'filled' }}
          />
          <div style={{ marginTop: 16 }}>
            <ProFormTextArea
              label="计划名称"
              name="plan_name"
              width="xl"
              placeholder="请输入计划名称"
              rules={[{ required: true, message: '请输入计划名称' }]}
              fieldProps={{
                variant: 'filled',
                maxLength: 100,
                showCount: true,
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, color: textSecondary, fontSize: 12 }}>
            <UserOutlined style={{ marginRight: 6 }} />
            负责人
          </div>
          <ProFormSelect
            showSearch
            name="charge_id"
            placeholder="请搜索并选择负责人"
            request={queryUser}
            width="xl"
            debounceTime={1000}
            fieldProps={{
              variant: 'filled',
              optionFilterProp: 'label',
              labelInValue: true,
              onChange: handleChargeChange,
            }}
          />
          <ProFormText name="charge_name" hidden />
        </div>

        <div>
          <div style={{ marginBottom: 8, color: textSecondary, fontSize: 12 }}>
            <CalendarOutlined style={{ marginRight: 6 }} />
            计划时间
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ProFormDatePicker
              width="md"
              name="plan_start_time"
              placeholder="开始日期"
              fieldProps={{
                variant: 'filled',
                format: 'YYYY-MM-DD',
                disabledDate: (current: dayjs.Dayjs) =>
                  current && current < dayjs().startOf('day'),
              }}
            />
            <div style={{ color: textSecondary, paddingTop: token.padding }}>
              至
            </div>
            <ProFormDatePicker
              width="md"
              name="plan_end_time"
              placeholder="结束日期"
              format="YYYY-MM-DD"
              rules={[
                {
                  validator: (_: unknown, value: dayjs.Dayjs) => {
                    const start = form.getFieldValue('plan_start_time');
                    if (!value && !start) return Promise.resolve();
                    if (value && !start)
                      return Promise.reject(new Error('请先选择计划开始时间'));
                    if (value && start && value.isBefore(start))
                      return Promise.reject(
                        new Error('结束时间必须晚于开始时间'),
                      );
                    return Promise.resolve();
                  },
                } as unknown as Rule,
              ]}
              fieldProps={{
                variant: 'filled',
                format: 'YYYY-MM-DD',
                disabledDate: (current: dayjs.Dayjs) => {
                  const start = form.getFieldValue('plan_start_time');
                  return (
                    current &&
                    current <
                      (start
                        ? dayjs(start).startOf('day')
                        : dayjs().startOf('day'))
                  );
                },
              }}
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
};

export default CasePlanForm;
