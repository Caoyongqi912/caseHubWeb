import { insertPushConfig, updatePushConfig } from '@/api/base/pushConfig';
import { IPushConfig } from '@/pages/Project/types';
import {
  AppstoreOutlined,
  BellOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  MailOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ProCard,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { Button, Form, message, Space, Tooltip } from 'antd';
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
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    }
  }, [record]);

  const saveOrUpdate = async () => {
    try {
      setLoading(true);
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
        const { code, msg } = await insertPushConfig(values);
        if (code === 0) {
          message.success(msg || '推送配置添加成功');
          callBack();
          form.resetFields();
          setOpen(false);
        }
      }
    } catch (error) {
      message.error('保存失败，请检查表单数据');
    } finally {
      setLoading(false);
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
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setCurrentType(1);
              setCurrentLabel('目标邮箱');
            }}
            style={{
              borderRadius: '6px',
              boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
            }}
          >
            添加推送配置
          </Button>
        }
        title={record ? '编辑推送配置' : '添加推送配置'}
        modalProps={{
          width: 600,
          destroyOnClose: true,
        }}
        submitter={{
          render: () => (
            <Space size={12}>
              <Tooltip title="保存推送配置">
                <Button
                  type={'primary'}
                  icon={<SaveOutlined />}
                  onClick={saveOrUpdate}
                  loading={loading}
                  style={{
                    borderRadius: '6px',
                    boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
                  }}
                >
                  保存
                </Button>
              </Tooltip>
            </Space>
          ),
        }}
      >
        <ProFormText
          label={'配置名称'}
          name={'push_name'}
          required={true}
          placeholder="请输入配置名称"
          fieldProps={{
            prefix: <AppstoreOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
        <ProFormTextArea
          label={'配置描述'}
          name={'push_desc'}
          placeholder="请输入配置描述"
          fieldProps={{
            rows: 2,
            prefix: <InfoCircleOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
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
          fieldProps={{
            prefix: <BellOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
        <ProFormText
          label={currentLabel}
          name={'push_value'}
          required={true}
          placeholder={
            currentLabel === '目标邮箱' ? '请输入邮箱地址' : '请输入推送Token'
          }
          fieldProps={{
            prefix:
              currentLabel === '目标邮箱' ? <MailOutlined /> : <LinkOutlined />,
          }}
          style={{
            marginBottom: 16,
          }}
        />
      </ModalForm>
    </ProCard>
  );
};

export default PushModal;
