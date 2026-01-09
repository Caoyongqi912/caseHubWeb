import { ILoginParams } from '@/api';
import { login } from '@/api/base';
import { getToken, setToken } from '@/utils/token';
import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProCard,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { message, theme, Typography } from 'antd';
import React from 'react';
import { history, useModel } from 'umi';

const { Title, Text } = Typography;

const Index: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState, setInitialState } = useModel('@@initialState');

  const getCurrentUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const handleSubmit = async (values: ILoginParams) => {
    try {
      const { code, data } = await login({ ...values });
      if (code === 0) {
        message.success({
          content: '登录成功！欢迎使用 CASE HUB',
          icon: <SafetyCertificateOutlined />,
        });
        if (data && data !== getToken()) {
          setToken(data);
        }
        await getCurrentUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return Promise.resolve();
      }
    } catch (error) {
      message.error('登录失败，请检查网络或联系管理员');
      return Promise.reject(error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, #f0f9ff 100%)`,
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* 装饰背景 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 80%, rgba(24, 144, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(82, 196, 26, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />
      <ProCard
        ghost
        style={{
          minHeight: '100vh',
          height: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title
            level={2}
            style={{
              marginBottom: '12px',
              color: token.colorTextHeading,
            }}
          >
            欢迎登录
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            请输入您的账号密码，开始使用 CASE HUB
          </Text>
        </div>

        <LoginForm
          logo={null}
          title={null}
          subTitle={null}
          initialValues={{ autoLogin: true }}
          onFinish={async (values) => {
            await handleSubmit(values as ILoginParams);
          }}
          submitter={{
            searchConfig: {
              submitText: '登录',
            },
            submitButtonProps: {
              size: 'large',
              style: {
                width: '100%',
                height: '48px',
                fontSize: '16px',
                fontWeight: 500,
                background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                border: 'none',
                borderRadius: '10px',
                boxShadow: `0 4px 12px ${token.colorPrimaryBg}`,
              },
            },
          }}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: (
                <UserOutlined
                  style={{
                    color: token.colorPrimary,
                    marginRight: '8px',
                  }}
                />
              ),
              placeholder: '请输入用户名',
              style: {
                height: '52px',
                fontSize: '16px',
                borderRadius: '10px',
                padding: '0 16px',
              },
            }}
            rules={[
              {
                required: true,
                message: '请输入用户名',
              },
            ]}
            placeholder="用户名"
          />

          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: (
                <LockOutlined
                  style={{
                    color: token.colorPrimary,
                    marginRight: '8px',
                  }}
                />
              ),
              placeholder: '请输入密码',
              style: {
                height: '52px',
                fontSize: '16px',
                borderRadius: '10px',
                padding: '0 16px',
              },
            }}
            rules={[
              {
                required: true,
                message: '请输入密码',
              },
            ]}
            placeholder="密码"
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              marginTop: '8px',
            }}
          >
            <ProFormCheckbox name="autoLogin" noStyle>
              <Text style={{ color: token.colorTextSecondary }}>自动登录</Text>
            </ProFormCheckbox>
            <a
              style={{
                color: token.colorPrimary,
                fontWeight: 500,
                textDecoration: 'none',
              }}
              onClick={() => message.info('请联系管理员重置密码')}
            >
              忘记密码？
            </a>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              borderTop: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Text type="secondary">
              还没有账号？{' '}
              <a
                style={{
                  color: token.colorPrimary,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
                onClick={() => message.info('请联系管理员申请账号')}
              >
                申请账号
              </a>
            </Text>
          </div>
        </LoginForm>
      </ProCard>
    </div>
  );
};

export default Index;
