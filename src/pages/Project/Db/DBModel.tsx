import {
  getDBConfig,
  insertDBConfig,
  testDBConfig,
  updateDBConfig,
} from '@/api/base/dbConfig';
import { IDBConfig } from '@/pages/Project/types';
import {
  DatabaseOutlined,
  LinkOutlined,
  LockOutlined,
  PlusOutlined,
  SaveOutlined,
  ServerOutlined,
  TestTubeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ModalForm, ProCard, ProFormText } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { Button, Form, message, Space, Tooltip } from 'antd';
import { FC, useEffect, useState } from 'react';

interface IProps {
  callBack: () => void;
  currentDBConfigId?: string;
  currentProjectId: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const DBModel: FC<IProps> = ({
  currentProjectId,
  callBack,
  currentDBConfigId,
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<IDBConfig>();
  const [currentType, setCurrentType] = useState<number>(1);
  const [canSave, setCanSave] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // 详情模式 可修改
    if (currentDBConfigId) {
      getDBConfig(currentDBConfigId).then(async ({ code, data }) => {
        if (code === 0) {
          form.setFieldsValue(data);
          setCanSave(true);
        }
      });
    } else {
      form.resetFields();
      setCanSave(false);
    }
    return () => {
      setCanSave(false);
      form.resetFields();
    };
  }, [currentDBConfigId]);

  const save = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      values.project_id = parseInt(currentProjectId);
      if (currentDBConfigId) {
        await updateDBConfig({ ...values, uid: currentDBConfigId }).then(
          ({ code, msg }) => {
            if (code === 0) {
              message.success(msg);
              callBack();
              setOpen?.(false);
            }
          },
        );
      } else {
        const { code, msg } = await insertDBConfig(values);
        if (code === 0) {
          message.success(msg);
          callBack();
          setOpen?.(false);
        }
      }
    } catch (error) {
      message.error('保存失败，请检查表单数据');
    } finally {
      setLoading(false);
    }
  };

  const test = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const { code, msg } = await testDBConfig(values);
      if (code === 0) {
        setCanSave(true);
        message.success('连接测试成功');
      } else {
        message.error(msg || '连接测试失败');
      }
    } catch (error) {
      message.error('请先填写完整的数据库配置');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProCard>
      <ModalForm
        form={form}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCanSave(false);
              form.resetFields();
            }}
            style={{
              borderRadius: '6px',
              boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
            }}
          >
            添加数据库
          </Button>
        }
        title={currentDBConfigId ? '编辑数据库配置' : '添加数据库配置'}
        modalProps={{
          width: 600,
          destroyOnClose: true,
        }}
        submitter={{
          render: () => {
            return (
              <Space size={12}>
                <Tooltip title="测试数据库连接">
                  <Button
                    htmlType="button"
                    type={'primary'}
                    icon={<TestTubeOutlined />}
                    onClick={test}
                    loading={loading}
                    key="test"
                    style={{
                      borderRadius: '6px',
                    }}
                  >
                    链接测试
                  </Button>
                </Tooltip>
                <Tooltip title="保存数据库配置">
                  <Button
                    type="primary"
                    htmlType="button"
                    icon={<SaveOutlined />}
                    onClick={save}
                    loading={loading}
                    key="save"
                    disabled={!canSave}
                    style={{
                      borderRadius: '6px',
                      boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
                    }}
                  >
                    保存
                  </Button>
                </Tooltip>
              </Space>
            );
          },
        }}
      >
        <ProFormSelect
          label={'数据库类型'}
          initialValue={currentType}
          name={'db_type'}
          options={[
            { label: 'MySQL', value: 1 },
            { label: 'Redis', value: 3 },
            { label: 'Oracle', value: 2 },
          ]}
          onChange={(value: number) => {
            setCurrentType(value);
            setCanSave(false);
          }}
          fieldProps={{
            prefix: <DatabaseOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
        <ProFormText
          label={'配置名称'}
          name={'db_name'}
          required={true}
          placeholder="请输入数据库配置名称"
          fieldProps={{
            prefix: <ServerOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
        <ProFormText
          label={'主机地址'}
          name={'db_host'}
          required={true}
          placeholder="请输入数据库主机地址"
          fieldProps={{
            prefix: <LinkOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
        <ProFormText
          label={'端口号'}
          name={'db_port'}
          required={true}
          placeholder="请输入数据库端口号"
          fieldProps={{
            prefix: <ServerOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
        <ProFormText
          label={'用户名'}
          name={'db_username'}
          required={true}
          placeholder="请输入数据库用户名"
          fieldProps={{
            prefix: <UserOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
        <ProFormText.Password
          label={'密码'}
          name={'db_password'}
          required={currentType === 1}
          placeholder="请输入数据库密码"
          fieldProps={{
            prefix: <LockOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
        <ProFormText
          label={'数据库名称'}
          name={'db_database'}
          required={true}
          placeholder="请输入数据库名称"
          fieldProps={{
            prefix: <DatabaseOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
      </ModalForm>
    </ProCard>
  );
};

export default DBModel;
