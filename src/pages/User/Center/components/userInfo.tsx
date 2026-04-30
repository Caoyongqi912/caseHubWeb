import { uploadAvatar } from '@/api/base';
import {
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { message, theme, Upload } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useModel } from 'umi';

interface UserInfoItem {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
  iconColor: string;
}

const Avatar = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser, fetchUserInfo } = initialState ?? {};
  const [avatarUpdate, setAvatarUpdate] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { token } = theme.useToken();

  const isDark =
    token.colorBgContainer === '#141414' || token.colorBgLayout === '#000';

  const colors = {
    avatarBorder: isDark
      ? 'rgba(88, 166, 255, 0.3)'
      : 'rgba(88, 166, 255, 0.2)',
    overlayBg: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
    iconColor: isDark ? '#58a6ff' : '#1890ff',
    gradientStart: isDark
      ? 'rgba(88, 166, 255, 0.15)'
      : 'rgba(24, 144, 255, 0.1)',
    gradientEnd: isDark
      ? 'rgba(139, 92, 246, 0.15)'
      : 'rgba(139, 92, 246, 0.1)',
  };

  useEffect(() => {
    fetchUserInfo?.();
  }, [avatarUpdate, fetchUserInfo]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('avatar', file);

    try {
      const res = await uploadAvatar(form);
      if (res.code === 0) {
        message.success(res.msg || '头像更新成功');
        setAvatarUpdate((prev) => prev + 1);
      }
    } finally {
      setUploading(false);
    }
    return false;
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px',
      }}
    >
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleUpload}
        disabled={uploading}
      >
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
              border: `3px solid ${colors.avatarBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${
                isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(88, 166, 255, 0.2)'
              }`,
            }}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <UserOutlined style={{ fontSize: 48, color: colors.iconColor }} />
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: colors.overlayBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }}
            className="avatar-overlay"
          >
            <CameraOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>

          {uploading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className="avatar-loading-spinner" />
            </div>
          )}
        </div>
      </Upload>

      <style>{`
        .avatar-overlay:hover {
          opacity: 1 !important;
        }
        @keyframes avatar-spin {
          to { transform: rotate(360deg); }
        }
        .avatar-loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: avatar-spin 0.8s linear infinite;
        }
      `}</style>

      <div
        style={{
          marginTop: 16,
          fontSize: 18,
          fontWeight: 600,
          color: isDark ? '#e6edf3' : 'rgba(0, 0, 0, 0.88)',
        }}
      >
        {currentUser?.username || '未设置昵称'}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: isDark ? 'rgba(139, 148, 158, 0.8)' : 'rgba(0, 0, 0, 0.45)',
        }}
      >
        点击头像上传新图片
      </div>
    </div>
  );
};

const UserInfoCard = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const { token } = theme.useToken();

  const isDark =
    token.colorBgContainer === '#141414' || token.colorBgLayout === '#000';

  const colors = {
    containerBg: isDark
      ? 'rgba(22, 27, 34, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    containerBorder: isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.06)',
    contentBg: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    contentBgHover: isDark
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.04)',
    contentBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    contentBorderHover: isDark
      ? 'rgba(88, 166, 255, 0.2)'
      : 'rgba(88, 166, 255, 0.3)',
    textPrimary: isDark ? '#e6edf3' : 'rgba(0, 0, 0, 0.88)',
    textSecondary: isDark ? 'rgba(139, 148, 158, 0.8)' : 'rgba(0, 0, 0, 0.45)',
    textDescription: isDark
      ? 'rgba(225, 228, 232, 0.85)'
      : 'rgba(0, 0, 0, 0.65)',
    accentPrimary: '#58a6ff',
    accentSecondary: '#8b5cf6',
    badgeBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    iconBg: isDark ? 'rgba(88, 166, 255, 0.1)' : 'rgba(24, 144, 255, 0.08)',
  };

  const userInfoItems: UserInfoItem[] = [
    {
      icon: <PhoneOutlined />,
      label: '联系电话',
      value: currentUser?.phone,
      iconColor: '#58a6ff',
    },
    {
      icon: <MailOutlined />,
      label: '邮箱地址',
      value: currentUser?.email,
      iconColor: '#8b5cf6',
    },
    {
      icon: <TeamOutlined />,
      label: '所属部门',
      value: currentUser?.depart_name || '-',
      iconColor: '#6ee7b7',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .user-info-card {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        .user-info-item:hover .info-icon-wrapper {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(88, 166, 255, 0.2);
        }
        @media (max-width: 768px) {
          .user-info-list {
            flex-direction: column !important;
          }
        }
      `}</style>

      <div
        style={{
          padding: '32px 24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 4,
              height: 20,
              borderRadius: 2,
              background: `linear-gradient(180deg, ${colors.accentPrimary}, ${colors.accentSecondary})`,
            }}
          />
          基本信息
        </div>

        <div
          className="user-info-list"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            flex: 1,
          }}
        >
          {userInfoItems.map((item, index) => (
            <div
              key={item.label}
              className="user-info-card"
              style={{
                background: colors.contentBg,
                border: `1px solid ${colors.contentBorder}`,
                borderRadius: 12,
                padding: '16px 20px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.contentBgHover;
                e.currentTarget.style.borderColor = colors.contentBorderHover;
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${
                  isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.08)'
                }`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.contentBg;
                e.currentTarget.style.borderColor = colors.contentBorder;
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  className="info-icon-wrapper"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${item.iconColor}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.iconColor,
                    fontSize: 18,
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: colors.textPrimary,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.value || '-'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {currentUser?.tagName && (
            <div
              className="user-info-card"
              style={{
                background: colors.contentBg,
                border: `1px solid ${colors.contentBorder}`,
                borderRadius: 12,
                padding: '16px 20px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animationDelay: `${userInfoItems.length * 0.1}s`,
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.contentBgHover;
                e.currentTarget.style.borderColor = colors.contentBorderHover;
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${
                  isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.08)'
                }`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.contentBg;
                e.currentTarget.style.borderColor = colors.contentBorder;
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  className="info-icon-wrapper"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fcd34d',
                    fontSize: 18,
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                >
                  <UserOutlined />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    用户标签
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: colors.textPrimary,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentUser.tagName}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const UserInfo = () => {
  const { token } = theme.useToken();

  const isDark =
    token.colorBgContainer === '#141414' || token.colorBgLayout === '#000';

  const colors = {
    containerBg: isDark
      ? 'rgba(22, 27, 34, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    containerBorder: isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.06)',
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .user-info-wrapper {
            flex-direction: column !important;
          }
          .user-info-divider {
            width: 100% !important;
            height: 1px !important;
          }
        }
      `}</style>

      <div
        className="user-info-wrapper"
        style={{
          display: 'flex',
          background: colors.containerBg,
          border: `1px solid ${colors.containerBorder}`,
          borderRadius: 16,
          overflow: 'hidden',
          backdropFilter: 'blur(12px)',
          minHeight: 400,
        }}
      >
        <div
          style={{
            flex: '0 0 280px',
            borderRight: `1px solid ${colors.containerBorder}`,
            background: isDark
              ? 'rgba(255, 255, 255, 0.01)'
              : 'rgba(0, 0, 0, 0.01)',
          }}
        >
          <Avatar />
        </div>

        <div
          className="user-info-divider"
          style={{
            width: 1,
            background: colors.containerBorder,
          }}
        />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <UserInfoCard />
        </div>
      </div>
    </>
  );
};

export default UserInfo;
