import { insertInterGlobalVariable } from '@/api/inter/interGlobal';
import { queryProjects } from '@/components/CommonFunc';
import { IInterfaceGlobalVariable } from '@/pages/Httpx/types';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import React, { FC, useEffect, useState } from 'react';

interface ISelfProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callBack?: () => void;
}

const VarModalForm: FC<ISelfProps> = ({ open, setOpen, callBack }) => {
  const [varFrom] = Form.useForm<IInterfaceGlobalVariable>();
  const [projects, setProjects] = useState<{ label: string; value: number }[]>(
    [],
  );

  useEffect(() => {
    queryProjects(setProjects).then();
  }, []);
  const onFinish = async () => {
    const value = await varFrom.validateFields();
    const { code, msg } = await insertInterGlobalVariable(value);
    if (code === 0) {
      message.success(msg);
      varFrom.resetFields();
      setOpen(false);
      callBack?.();
      // actionRef.current?.reload();
    }
  };
  return (
    <ModalForm<IInterfaceGlobalVariable>
      open={open}
      form={varFrom}
      onFinish={onFinish}
      onOpenChange={setOpen}
    >
      <ProFormSelect
        options={projects}
        label={'所属项目'}
        name={'project_id'}
        required={true}
      />
      <ProFormText
        name={'key'}
        label={'key'}
        required
        rules={[{ required: true, message: 'key必填' }]}
      />
      <ProFormText
        name={'value'}
        label={'value'}
        required
        rules={[{ required: true, message: 'value必填' }]}
      />
      <ProFormTextArea name={'description'} label={'desc'} />
    </ModalForm>
  );
};

export default VarModalForm;
