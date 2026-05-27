import { IUser } from '@/api';
import { currentUser, queryProject } from '@/api/base';
import { GlassBackground } from '@/components/Glass';
import { errorConfig } from '@/requestErrorConfig';
import '@/warningFilter';
import { RequestConfig } from '@@/plugin-request/request';
import {
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  PageLoading,
  Settings as LayoutSettings,
} from '@ant-design/pro-components';
import { Avatar, Dropdown, MenuProps, Segmented } from 'antd';
import { useState } from 'react';
import { history, RunTimeLayoutConfig } from 'umi';
import defaultSetting from '../config/defaultSetting';
import { clearToken } from './utils/token';

const loginPath = '/userLogin';
const THEME_KEY = 'app-theme';
type ThemeType = 'realDark' | 'light';

interface InitialState {
  settings?: Partial<LayoutSettings>;
  currentUser?: IUser;
  loading?: boolean;
  projects?: { label: string; value: number }[];
  fetchUserInfo?: () => Promise<IUser | undefined>;
  refreshProjects?: () => Promise<{ label: string; value: number }[]>;
  theme?: ThemeType;
  setTheme?: (theme: ThemeType) => void;
}

const getStoredTheme = (): ThemeType =>
  (localStorage.getItem(THEME_KEY) as ThemeType) || 'light';

const setStoredTheme = (theme: ThemeType) =>
  localStorage.setItem(THEME_KEY, theme);

const fetchUserInfo = async (): Promise<IUser | undefined> => {
  try {
    const res = await currentUser();
    return res.data;
  } catch {
    const currentPath = history.location.pathname;
    const redirect = encodeURIComponent(currentPath);
    history.push(`${loginPath}?redirect=${redirect}`);
    return undefined;
  }
};

const fetchProjects = async (): Promise<{ label: string; value: number }[]> => {
  try {
    const { code, data } = await queryProject();
    if (code === 0)
      return data.map((item) => ({ label: item.title, value: item.id }));
    if (code === 4000) history.push(loginPath);
    return [];
  } catch {
    return [];
  }
};

export async function getInitialState(): Promise<InitialState> {
  const baseState = {
    fetchUserInfo,
    refreshProjects: fetchProjects,
    theme: getStoredTheme(),
    setTheme: setStoredTheme,
    settings: defaultSetting,
  };

  if (history.location.pathname !== loginPath) {
    const [user, projects] = await Promise.all([
      fetchUserInfo(),
      fetchProjects(),
    ]);
    return { ...baseState, currentUser: user, projects };
  }

  return baseState;
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  const currentTheme = initialState?.theme || 'light';
  const [collapsed, setCollapsed] = useState(true);

  const changeTheme = (value: string | number) => {
    const next = value === 'realDark' ? 'realDark' : 'light';
    setStoredTheme(next as ThemeType);
    setInitialState((prev) => ({ ...prev, theme: next as ThemeType }));
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'center',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => history.push('/user/center'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: () => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
        clearToken();
        history.push(loginPath);
      },
    },
  ];

  return {
    // 👇 👇 核心修复：这里控制 ProLayout（侧边栏/头部/菜单）的主题
    navTheme: currentTheme,
    theme: currentTheme === 'realDark' ? 'dark' : 'light',
    breakPoint: false,
    collapsed: true, // 用全局默认
    onCollapse: setCollapsed,
    waterMarkProps: initialState?.currentUser?.username
      ? { content: String(initialState.currentUser.username) }
      : undefined,
    onPageChange: () => {
      if (
        !initialState?.currentUser &&
        history.location.pathname !== loginPath
      ) {
        history.push(loginPath);
      }
    },
    unAccessible: <div>无访问权限</div>,
    childrenRender: (children: React.ReactNode) => (
      <GlassBackground>
        {initialState?.loading ? <PageLoading /> : <>{children}</>}
      </GlassBackground>
    ),
    actionsRender: ({ isMobile }) => [
      !isMobile && (
        <Segmented
          key="theme"
          value={currentTheme}
          onChange={changeTheme}
          vertical
          options={[
            { value: 'light', icon: <SunOutlined /> },
            { value: 'realDark', icon: <MoonOutlined /> },
          ]}
        />
      ),
    ],
    footerRender: false,
    menuFooterRender: false,
    avatarProps: initialState?.currentUser
      ? {
          title: initialState.currentUser.username,
          render: (_props: any, _dom: React.ReactNode) => {
            const user = initialState?.currentUser;
            if (!user) return null;
            return (
              <Dropdown menu={{ items: userMenuItems }}>
                <a>
                  <Avatar
                    src={user.avatar || undefined}
                    icon={!user.avatar ? <UserOutlined /> : undefined}
                    style={
                      !user.avatar ? { backgroundColor: '#1677ff' } : undefined
                    }
                  >
                    {!user.avatar && user.username?.[0]?.toUpperCase()}
                  </Avatar>
                </a>
              </Dropdown>
            );
          },
        }
      : false,
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  ...errorConfig,
};
