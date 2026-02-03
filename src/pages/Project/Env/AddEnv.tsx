import { IEnv } from '@/api';
import { insertEnv, queryProject } from '@/api/base';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import React from 'react';

interface selfProps {
  reload?: Function | undefined;
}

const AddEnv: React.FC<selfProps> = ({ reload }) => {
  return (
    <ModalForm<IEnv>
      title="新建Env"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          新建环境
        </Button>
      }
      autoFocusFirstInput
      onFinish={async (values: IEnv) => {
        await insertEnv(values);
        reload!(true);
        return true;
      }}
      // 关闭执录入执行
      modalProps={{
        onCancel: () => console.log('close'),
      }}
    >
      <ProFormText
        name="name"
        label="title"
        placeholder="input your host title"
        required={true}
      />
      <ProFormText
        name="host"
        label="host"
        placeholder="input your host or domain"
        required={true}
        rules={[
          {
            pattern:
              /^(http|https):\/\/([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/,
            message: '请输入正确的host',
          },
        ]}
      />
      <ProFormText
        name="port"
        label="port"
        placeholder="input your port"
        required={false}
      />
      <ProFormText
        name="description"
        label="desc"
        placeholder="input your host desc"
      />
      <ProFormSelect
        name="project_id"
        label="项目"
        request={async () => {
          const { code, data } = await queryProject();
          if (code === 0) {
            return data.map((item) => ({
              label: item.title,
              value: item.id,
            }));
          } else return [];
        }}
      />
    </ModalForm>
  );
};

export default AddEnv;
