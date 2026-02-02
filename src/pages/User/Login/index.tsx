import { ILoginParams } from '@/api';
import { login } from '@/api/base';
import { getToken, setToken } from '@/utils/token';
import {
  ArrowRightOutlined,
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
          content: '登录成功！欢迎使用 CaseHub',
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
      className="login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${token.colorPrimary}15 0%, ${token.colorPrimary}05 100%)`,
        position: 'relative',
        overflow: 'hidden',
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
          backgroundImage: `
          radial-gradient(circle at 20% 30%, ${token.colorPrimary}20 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, ${token.colorPrimary}15 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, ${token.colorPrimary}10 0%, transparent 50%),
          radial-gradient(circle at 60% 20%, ${token.colorPrimary}10 0%, transparent 50%)
        `,
          pointerEvents: 'none',
        }}
      />

      {/* 登录容器 */}
      <div
        className="login-container"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          zIndex: 1,
        }}
      >
        {/* 品牌标识 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          <Title
            level={1}
            style={{
              marginBottom: '16px',
              fontSize: '36px',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            CaseHub
          </Title>
        </div>

        {/* 登录卡片 */}
        <ProCard
          style={{
            borderRadius: '20px',
            boxShadow: `0 20px 60px ${token.colorPrimary}10`,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            overflow: 'hidden',
          }}
        >
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
                icon: <ArrowRightOutlined />,
                style: {
                  width: '100%',
                  height: '56px',
                  fontSize: '18px',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: `0 8px 24px ${token.colorPrimary}40`,
                },
              },
            }}
          >
            {/* 用户名输入框 */}
            <div style={{ marginBottom: '24px' }}>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: (
                    <UserOutlined
                      style={{
                        color: token.colorPrimary,
                        fontSize: '20px',
                        marginRight: '12px',
                      }}
                    />
                  ),
                  placeholder: '请输入用户名或邮箱',
                  style: {
                    height: '56px',
                    fontSize: '16px',
                    borderRadius: '16px',
                    border: `2px solid ${token.colorBorder}`,
                  },
                }}
                rules={[
                  {
                    required: true,
                    message: '请输入用户名或邮箱',
                  },
                ]}
              />
            </div>

            {/* 密码输入框 */}
            <div style={{ marginBottom: '24px' }}>
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: (
                    <LockOutlined
                      style={{
                        color: token.colorPrimary,
                        fontSize: '20px',
                        marginRight: '12px',
                      }}
                    />
                  ),
                  placeholder: '请输入密码',
                  style: {
                    height: '56px',
                    fontSize: '16px',
                    borderRadius: '16px',
                    border: `2px solid ${token.colorBorder}`,
                  },
                }}
                rules={[
                  {
                    required: true,
                    message: '请输入密码',
                  },
                ]}
              />
            </div>

            {/* 记住我和忘记密码 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
              }}
            >
              <ProFormCheckbox name="autoLogin" noStyle>
                <Text
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: '14px',
                    fontWeight: 400,
                  }}
                >
                  记住我
                </Text>
              </ProFormCheckbox>
              <a
                style={{
                  color: token.colorPrimary,
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
                onClick={() => message.info('请联系管理员重置密码')}
              >
                忘记密码？
              </a>
            </div>

            {/* 底部链接 */}
            <div
              style={{
                textAlign: 'center',
                paddingTop: '32px',
                borderTop: `1px solid ${token.colorBorderSecondary}`,
                marginTop: '24px',
              }}
            >
              <Text
                style={{
                  color: token.colorTextSecondary,
                  fontSize: '14px',
                }}
              >
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

        {/* 页脚 */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '32px',
            paddingBottom: '24px',
          }}
        >
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: '14px',
            }}
          >
            © 2026 CaseHub
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Index;
