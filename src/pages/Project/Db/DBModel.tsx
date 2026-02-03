import {
  getDBConfig,
  insertDBConfig,
  testDBConfig,
  updateDBConfig,
} from '@/api/base/dbConfig';
import { IDBConfig } from '@/pages/Project/types';
import { ModalForm, ProCard, ProFormText } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import { Button, Form, message } from 'antd';
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
    const values = await form.validateFields();
    values.project_id = parseInt(currentProjectId);
    if (currentDBConfigId) {
      await updateDBConfig({ ...values, uid: currentDBConfigId }).then(
        ({ code, msg }) => {
          if (code === 0) {
            message.success(msg);
            callBack();
          }
        },
      );
    } else {
      const { code, msg } = await insertDBConfig(values);
      if (code === 0) {
        message.success(msg);
        callBack();
      }
    }
  };

  const test = async () => {
    const values = await form.validateFields();
    const { code } = await testDBConfig(values);
    if (code === 0) {
      setCanSave(true);
      message.success('connect success');
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
            onClick={() => {
              setCanSave(false);
              form.resetFields();
            }}
          >
            Add DB
          </Button>
        }
        submitter={{
          render: () => {
            return [
              <Button
                htmlType="button"
                type={'primary'}
                onClick={test}
                key="edit"
              >
                链接测试
              </Button>,
              <>
                {canSave && (
                  <Button
                    type="primary"
                    htmlType="button"
                    onClick={save}
                    key="read"
                  >
                    保存
                  </Button>
                )}
              </>,
            ];
          },
        }}
      >
        <ProFormSelect
          label={'类型'}
          initialValue={currentType}
          name={'db_type'}
          options={[
            { label: 'mysql', value: 1 },
            { label: 'redis', value: 3 },
            { label: 'oracle', value: 2 },
          ]}
          onChange={(value: number) => {
            setCurrentType(value);
          }}
        />
        <ProFormText label={'name'} name={'db_name'} required={true} />
        <ProFormText label={'host'} name={'db_host'} required={true} />
        <ProFormText label={'port'} name={'db_port'} required={true} />
        <ProFormText label={'username'} name={'db_username'} required={true} />
        <ProFormText.Password
          label={'password'}
          name={'db_password'}
          required={currentType === 1}
        />
        <ProFormText label={'database'} name={'db_database'} required={true} />
      </ModalForm>
    </ProCard>
  );
};

export default DBModel;
