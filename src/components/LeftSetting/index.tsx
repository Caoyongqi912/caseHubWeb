import { history } from '@@/core/history';
import { useModel } from '@@/exports';
import {
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Dropdown,
  Flex,
  MenuProps,
  Segmented,
  Space,
  Spin,
} from 'antd';
import { FC } from 'react';

type ThemeType = 'realDark' | 'light';

interface SelfProps {
  collapsed: boolean;
  currentTheme: string;
  toggleTheme: (t: ThemeType) => void;
}

const Index: FC<SelfProps> = ({ collapsed, currentTheme, toggleTheme }) => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const loading = (
    <Spin
      size="small"
      style={{
        marginLeft: 8,
        marginRight: 8,
      }}
    />
  );

  if (!initialState) {
    return loading;
  }
  const { currentUser } = initialState;
  if (!currentUser || !currentUser.username) {
    return loading;
  }

  const handleThemeChange = (value: string) => {
    toggleTheme(value as ThemeType);
  };

  const items: MenuProps['items'] = [
    {
      key: 'center',
      icon: <UserOutlined />,
      label: (
        <a
          onClick={(e) => {
            e.preventDefault();
            history.push('/user/center');
          }}
        >
          个人中心
        </a>
      ),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: (
        <a
          onClick={() => {
            setInitialState((s) => ({ ...s, currentUser: undefined }));
            history.push('/userLogin');
          }}
        >
          登出
        </a>
      ),
    },
  ];

  // 未折叠状态：水平左右布局
  if (!collapsed) {
    return (
      <Flex
        align="center"
        justify="space-between"
        style={{
          width: '100%',
          padding: '0 16px',
          gap: 12,
        }}
      >
        <Flex align="center" gap={12}>
          <Segmented
            value={currentTheme}
            onChange={handleThemeChange}
            size="small"
            shape="round"
            options={[
              { value: 'light', icon: <SunOutlined /> },
              { value: 'realDark', icon: <MoonOutlined /> },
            ]}
          />
        </Flex>

        <Dropdown menu={{ items }} placement="bottomRight">
          <Flex
            align="center"
            gap={8}
            style={{ cursor: 'pointer', padding: '4px 8px' }}
          >
            <Avatar
              size="small"
              style={{
                backgroundColor: '#f56a00',
                flexShrink: 0,
              }}
              src={currentUser.avatar}
              alt="avatar"
            >
              {currentUser.username[0]}
            </Avatar>
            <span
              style={{
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.88)',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentUser.username}
            </span>
          </Flex>
        </Dropdown>
      </Flex>
    );
  }

  // 折叠状态：上下垂直布局，整体居中
  return (
    <Space
      direction="vertical"
      align="center"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '120px',
        padding: '8px 0',
      }}
    >
      {/* 主题切换器 - 放在上面 */}
      <div style={{ marginBottom: 4 }}>
        <Segmented
          value={currentTheme}
          vertical={true}
          onChange={handleThemeChange}
          size="small"
          shape="round"
          options={[
            {
              value: 'light',
              icon: <SunOutlined />,
            },
            {
              value: 'realDark',
              icon: <MoonOutlined />,
            },
          ]}
        />
      </div>

      {/* 用户头像 */}
      <Dropdown menu={{ items }} overlayStyle={{ minWidth: '120px' }}>
        <div
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 0',
          }}
        >
          <Avatar
            size="default"
            style={{
              backgroundColor: '#f56a00',
              marginBottom: 4,
            }}
            src={currentUser.avatar}
            alt="avatar"
          >
            {currentUser.username[0]}
          </Avatar>
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(0, 0, 0, 0.65)',
              textAlign: 'center',
              maxWidth: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            {currentUser.username}
          </span>
        </div>
      </Dropdown>
    </Space>
  );
};

export default Index;
