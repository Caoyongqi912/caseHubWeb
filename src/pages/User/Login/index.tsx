import { ILoginParams } from '@/api';
import { login } from '@/api/base';
import { setToken } from '@/utils/token';
import {
  ApiOutlined,
  LockOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { message, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

const Index: React.FC = () => {
  const handleSubmit = async (values: ILoginParams) => {
    try {
      const { code, data } = await login({ ...values });
      if (code === 0) {
        message.success({
          content: '登录成功！欢迎使用 CaseHub',
          icon: <SafetyCertificateOutlined />,
        });
        if (data) {
          setToken(data);
        }
        const urlParams = new URL(window.location.href).searchParams;
        const redirectUrl = urlParams.get('redirect') || '/';
        window.location.href = redirectUrl;
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
        minHeight: '100vh',
        display: 'flex',
        background: '#0a0e27',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
          }
          
          .login-left-panel {
            animation: slideInLeft 0.8s ease-out;
          }
          
          .login-right-panel {
            animation: slideInRight 0.8s ease-out;
          }
          
          .feature-item {
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
          }
          
          .feature-item:nth-child(1) { animation-delay: 0.2s; }
          .feature-item:nth-child(2) { animation-delay: 0.4s; }
          .feature-item:nth-child(3) { animation-delay: 0.6s; }
          
          .floating-icon {
            animation: float 6s ease-in-out infinite;
          }
          
          .pulse-circle {
            animation: pulse 4s ease-in-out infinite;
          }
          
          .glow-button:hover {
            animation: glow 2s ease-in-out infinite;
          }
          
          .cyber-grid {
            background-image: 
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `}
      </style>

      <div
        className="login-left-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          position: 'relative',
          background:
            'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1629 100%)',
        }}
      >
        <div
          className="cyber-grid"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.3,
          }}
        />

        <div
          className="pulse-circle"
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          }}
        />

        <div
          className="pulse-circle"
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div
            className="floating-icon"
            style={{
              marginBottom: '40px',
              display: 'inline-block',
            }}
          >
            <RocketOutlined
              style={{
                fontSize: '80px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))',
              }}
            />
          </div>

          <Title
            level={1}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '64px',
              fontWeight: 900,
              background:
                'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              letterSpacing: '4px',
              textShadow: '0 0 40px rgba(96, 165, 250, 0.3)',
            }}
          >
            CASEHUB
          </Title>

          <Text
            style={{
              display: 'block',
              fontSize: '20px',
              color: '#94a3b8',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 500,
              letterSpacing: '2px',
              marginBottom: '60px',
            }}
          >
            智能测试管理平台
          </Text>

          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            {[
              {
                icon: <ThunderboltOutlined />,
                title: '高效测试',
                desc: '自动化测试流程，提升测试效率 200%',
              },
              {
                icon: <ApiOutlined />,
                title: '接口管理',
                desc: '一站式接口测试与管理解决方案',
              },
              {
                icon: <SafetyCertificateOutlined />,
                title: '安全可靠',
                desc: '企业级安全保障，数据加密存储',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="feature-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                  marginBottom: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.border =
                    '1px solid rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.border =
                    '1px solid rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background:
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '20px',
                    fontSize: '24px',
                    color: '#60a5fa',
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <Text
                    style={{
                      display: 'block',
                      fontSize: '18px',
                      color: '#e2e8f0',
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      color: '#64748b',
                    }}
                  >
                    {item.desc}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="login-right-panel"
        style={{
          width: '520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          position: 'relative',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Title
            level={2}
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '36px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            欢迎回来
          </Title>
          <Text
            style={{
              display: 'block',
              fontSize: '16px',
              color: '#64748b',
              textAlign: 'center',
              marginBottom: '48px',
            }}
          >
            登录您的账户继续探索
          </Text>

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
                  height: '52px',
                  fontSize: '16px',
                  fontWeight: 600,
                  fontFamily: "'Rajdhani', sans-serif",
                  background:
                    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease',
                },
                className: 'glow-button',
                onMouseEnter: (e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 20px rgba(59, 130, 246, 0.5)';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 14px rgba(59, 130, 246, 0.4)';
                },
              },
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: (
                    <UserOutlined
                      style={{
                        color: '#3b82f6',
                        fontSize: '18px',
                        marginRight: '8px',
                      }}
                    />
                  ),
                  placeholder: '请输入用户名或邮箱',
                  style: {
                    height: '52px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    background: '#ffffff',
                    transition: 'all 0.3s ease',
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

            <div style={{ marginBottom: '20px' }}>
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: (
                    <LockOutlined
                      style={{
                        color: '#3b82f6',
                        fontSize: '18px',
                        marginRight: '8px',
                      }}
                    />
                  ),
                  placeholder: '请输入密码',
                  style: {
                    height: '52px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    background: '#ffffff',
                    transition: 'all 0.3s ease',
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
              }}
            >
              <ProFormCheckbox name="autoLogin" noStyle>
                <Text
                  style={{
                    color: '#64748b',
                    fontSize: '14px',
                  }}
                >
                  记住我
                </Text>
              </ProFormCheckbox>
              <a
                style={{
                  color: '#3b82f6',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
                onClick={() => message.info('请联系管理员重置密码')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#3b82f6';
                }}
              >
                忘记密码？
              </a>
            </div>

            <div
              style={{
                textAlign: 'center',
                paddingTop: '32px',
                borderTop: '1px solid #e2e8f0',
                marginTop: '24px',
              }}
            >
              <Text
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                还没有账号？{' '}
                <a
                  style={{
                    color: '#3b82f6',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                  }}
                  onClick={() => message.info('请联系管理员申请账号')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#8b5cf6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                >
                  申请账号
                </a>
              </Text>
            </div>
          </LoginForm>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            textAlign: 'center',
          }}
        >
          <Text
            style={{
              color: '#94a3b8',
              fontSize: '13px',
            }}
          >
            © 2026 CaseHub. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Index;
