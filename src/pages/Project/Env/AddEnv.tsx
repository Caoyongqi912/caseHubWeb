import { IEnv } from '@/api';
import { insertEnv, queryProject } from '@/api/base';
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  NumberOutlined,
  PlusOutlined,
  ProjectOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, message, Space } from 'antd';
import React, { useState } from 'react';

interface selfProps {
  reload?: Function | undefined;
}

const AddEnv: React.FC<selfProps> = ({ reload }) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <ModalForm<IEnv>
      title="新建环境配置"
      trigger={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            borderRadius: '6px',
            boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
          }}
        >
          新建环境
        </Button>
      }
      autoFocusFirstInput
      onFinish={async (values: IEnv) => {
        try {
          setLoading(true);
          const result = await insertEnv(values);
          if (result.code === 0) {
            message.success('环境添加成功');
            reload!(true);
            return true;
          } else {
            message.error(result.msg || '环境添加失败');
            return false;
          }
        } catch (error) {
          message.error('环境添加失败，请重试');
          return false;
        } finally {
          setLoading(false);
        }
      }}
      modalProps={{
        onCancel: () => console.log('close'),
        width: 600,
        destroyOnClose: true,
      }}
      submitter={{
        render: () => (
          <Space size={12}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              style={{
                borderRadius: '6px',
                boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
              }}
            >
              保存
            </Button>
          </Space>
        ),
      }}
    >
      <ProFormText
        name="name"
        label="环境名称"
        placeholder="请输入环境名称"
        required={true}
        fieldProps={{
          prefix: <EnvironmentOutlined />,
        }}
        style={{
          marginBottom: 16,
        }}
      />
      <ProFormText
        name="host"
        label="主机地址"
        placeholder="请输入主机地址或域名"
        required={true}
        rules={[
          {
            pattern:
              /^(http|https):\/\/([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/,
            message: '请输入正确的主机地址',
          },
        ]}
        fieldProps={{
          prefix: <LinkOutlined />,
        }}
        style={{
          marginBottom: 16,
        }}
      />
      <ProFormText
        name="port"
        label="端口号"
        placeholder="请输入端口号"
        required={false}
        fieldProps={{
          prefix: <NumberOutlined />,
        }}
        style={{
          marginBottom: 16,
        }}
      />
      <ProFormText
        name="description"
        label="环境描述"
        placeholder="请输入环境描述"
        fieldProps={{
          prefix: <InfoCircleOutlined />,
        }}
        style={{
          marginBottom: 16,
        }}
      />
      <ProFormSelect
        name="project_id"
        label="所属项目"
        required={true}
        request={async () => {
          const { code, data } = await queryProject();
          if (code === 0) {
            return data.map((item) => ({
              label: item.title,
              value: item.id,
            }));
          } else return [];
        }}
        fieldProps={{
          prefix: <ProjectOutlined />,
        }}
        style={{
          marginBottom: 16,
        }}
      />
    </ModalForm>
  );
};

export default AddEnv;
