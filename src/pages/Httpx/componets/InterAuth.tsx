import { IInterfaceAPI } from '@/pages/Httpx/types';
import {
  ProCard,
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { FormInstance, Space } from 'antd';
import { FC } from 'react';

interface IProps {
  form: FormInstance<IInterfaceAPI>;
  currentMode: number;
}

const AuthTarget = {
  NoAuth: 1,
  KVAuth: 2,
  BasicAuth: 3,
  BearerAuth: 4,
  JWTAuth: 5,
};

const AuthTypeOption = [
  { value: 1, label: '无需验证' },
  { value: 2, label: '私密键值对验证' },
  { value: 3, label: 'Basic auth' },
  { value: 4, label: 'Bearer Token' },
  { value: 5, label: 'JWT Bearer' },
];

const InterAuth: FC<IProps> = ({ form, currentMode }) => {
  const KVAuth = (
    <>
      <ProFormText
        disabled={currentMode === 1}
        name={['auth', 'key']}
        label={'Key'}
        width={'lg'}
      />
      <ProFormText
        disabled={currentMode === 1}
        name={['auth', 'value']}
        label={'Value'}
        width={'lg'}
      />
      <ProFormSelect
        disabled={currentMode === 1}
        name={['auth', 'target']}
        width={'lg'}
        label={'添加位置'}
        options={[
          { value: 'query', label: 'Query Path' },
          { value: 'header', label: 'Header' },
        ]}
      />
    </>
  );

  const BasicAuth = (
    <>
      <ProFormText
        disabled={currentMode === 1}
        name={['auth', 'username']}
        width={'lg'}
        label={'Username'}
      />
      <ProFormText
        disabled={currentMode === 1}
        name={['auth', 'password']}
        width={'lg'}
        label={'Password'}
      />
    </>
  );

  const BearerAuth = (
    <ProFormText
      disabled={currentMode === 1}
      name={['auth', 'token']}
      width={'lg'}
      label={'token'}
    />
  );

  const JWTAuth = (
    <>
      <ProFormSelect
        disabled={currentMode === 1}
        name={['auth', 'target']}
        width={'lg'}
        label={'添加位置'}
        options={[
          { value: 'query', label: 'Query Path' },
          { value: 'header', label: 'Request Header' },
        ]}
      />
      <ProFormSelect
        disabled={currentMode === 1}
        name={['auth', 'algorithm']}
        width={'lg'}
        label={'Algorithm'}
        options={[
          { value: 'HS256', label: 'HS256' },
          { value: 'HS384', label: 'HS384' },
          { value: 'HS512', label: 'HS512' },
        ]}
      />
      <ProFormText
        disabled={currentMode === 1}
        name={['auth', 'secret']}
        width={'lg'}
        label={'Secret'}
      />
    </>
  );

  return (
    <ProCard layout={'center'}>
      <Space direction={'vertical'}>
        <ProForm.Group disabled={currentMode === 1}>
          <ProFormSelect
            disabled={currentMode === 1}
            name={'auth_type'}
            width={'lg'}
            label={'类型'}
            options={AuthTypeOption}
            required
            onChange={() => {
              form.resetFields(['auth']);
            }}
          />
        </ProForm.Group>
        <ProForm.Group disabled={currentMode === 1}>
          <ProFormDependency name={['auth_type']}>
            {({ auth_type }) => {
              console.log('auth_type:', auth_type, 'type:', typeof auth_type);

              // 确保处理各种可能的类型
              const authType =
                typeof auth_type === 'string' ? parseInt(auth_type) : auth_type;

              switch (authType) {
                case AuthTarget.NoAuth:
                  return null;
                case AuthTarget.KVAuth:
                  return KVAuth;
                case AuthTarget.BasicAuth:
                  return BasicAuth;
                case AuthTarget.BearerAuth:
                  return BearerAuth;
                case AuthTarget.JWTAuth:
                  return JWTAuth;
                default:
                  return null;
              }
            }}
          </ProFormDependency>
        </ProForm.Group>
      </Space>
    </ProCard>
  );
};

export default InterAuth;
