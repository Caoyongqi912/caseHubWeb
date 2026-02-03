import { insertPushConfig, updatePushConfig } from '@/api/base/pushConfig';
import { IPushConfig } from '@/pages/Project/types';
import {
  ModalForm,
  ProCard,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { Button, Form, message } from 'antd';
import { FC, useEffect, useState } from 'react';

interface IProps {
  callBack: () => void;
  open?: boolean;
  setOpen: (open: boolean) => void;
  record?: IPushConfig;
}

const PushModal: FC<IProps> = ({ callBack, open, setOpen, record }) => {
  const [currentType, setCurrentType] = useState<number>(1);
  const [currentLabel, setCurrentLabel] = useState<string>('目标邮箱');
  const [form] = Form.useForm<IPushConfig>();

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    }
  }, [record]);
  const saveOrUpdate = async () => {
    const values = await form.validateFields();

    if (values && record) {
      await updatePushConfig({ ...values, id: record.id }).then(
        ({ code, msg }) => {
          if (code === 0) {
            message.success(msg);
            callBack();
            setOpen(false);
          }
        },
      );
    } else {
      const { code } = await insertPushConfig(values);
      if (code === 0) {
        callBack();
        form.resetFields();
        setOpen(false);
      }
    }
  };
  return (
    <ProCard>
      <ModalForm<IPushConfig>
        form={form}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
            }}
          >
            Add Push
          </Button>
        }
        submitter={{
          render: () => [
            <Button type={'primary'} onClick={saveOrUpdate}>
              保存
            </Button>,
          ],
        }}
      >
        <ProFormText label={'配置名'} name={'push_name'} required={true} />
        <ProFormTextArea
          label={'配置描述'}
          name={'push_desc'}
          fieldProps={{ rows: 1 }}
        />
        <ProFormSelect
          required={true}
          label={'推送类型'}
          initialValue={currentType}
          name={'push_type'}
          options={[
            { label: 'Email', value: 1 },
            { label: 'DingTalk', value: 2 },
            { label: 'WeWork', value: 3 },
          ]}
          onChange={(value: number) => {
            setCurrentType(value);
            if (value === 1) {
              setCurrentLabel('目标邮箱');
            } else {
              setCurrentLabel('推送Token');
            }
          }}
        />
        <ProFormText label={currentLabel} name={'push_value'} required={true} />
      </ModalForm>
    </ProCard>
  );
};

export default PushModal;
