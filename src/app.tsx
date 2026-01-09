import { IUser } from '@/api';
import { currentUser, queryProject } from '@/api/base';
import LeftSetting from '@/components/LeftSetting';
import { errorConfig } from '@/requestErrorConfig';
import { RequestConfig } from '@@/plugin-request/request';
import { PageLoading } from '@ant-design/pro-components';
import { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { ConfigProvider } from 'antd';
import { useState } from 'react';
import { history, RunTimeLayoutConfig } from 'umi';
import defaultSetting from '../config/defaultSetting';

// 常量定义
const loginPath = '/userLogin';
const THEME_KEY = 'app-theme';
type ThemeType = 'realDark' | 'light';

// 类型定义
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

// 主题相关工具函数
const themeUtils = {
  getTheme: (): ThemeType => {
    return (localStorage.getItem(THEME_KEY) as ThemeType) || 'light';
  },
  setTheme: (theme: ThemeType): void => {
    localStorage.setItem(THEME_KEY, theme);
  },
};

// 数据获取函数
const fetchUserInfo = async (): Promise<IUser | undefined> => {
  try {
    const res = await currentUser();
    return res.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    history.push(loginPath);
    return undefined;
  }
};

const fetchProjects = async (): Promise<{ label: string; value: number }[]> => {
  try {
    const { code, data } = await queryProject();
    if (code === 0) {
      return data.map((item) => ({
        label: item.title,
        value: item.id,
      }));
    }
    if (code === 4000) {
      history.push(loginPath);
    }
    return [];
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return [];
  }
};

export async function getInitialState(): Promise<InitialState> {
  const baseState = {
    fetchUserInfo,
    refreshProjects: fetchProjects,
    theme: themeUtils.getTheme(),
    setTheme: themeUtils.setTheme,
    settings: defaultSetting,
  };

  if (history.location.pathname !== loginPath) {
    const [currentUser, projects] = await Promise.all([
      fetchUserInfo(),
      fetchProjects(),
    ]);

    return {
      ...baseState,
      currentUser,
      projects,
    };
  }

  return baseState;
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const currentTheme = initialState?.theme || 'light';

  const handleToggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'realDark' : 'light';
    initialState?.setTheme?.(newTheme);
    setInitialState((prev) => ({
      ...prev,
      theme: newTheme,
    }));
  };

  const handlePageChange = () => {
    if (!initialState?.currentUser && history.location.pathname !== loginPath) {
      history.push(loginPath);
    }
  };

  return {
    navTheme: currentTheme,
    disableContentMargin: true,
    defaultCollapsed: collapsed,
    onCollapse: setCollapsed,
    breakpoint: false,
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    onPageChange: handlePageChange,
    unAccessible: <div>无访问权限</div>,
    childrenRender: (children) => (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage:
            'radial-gradient(circle at 20% 80%, rgba(24, 144, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(82, 196, 26, 0.1) 0%, transparent 50%)',
        }}
      >
        <ConfigProvider>
          {initialState?.loading ? <PageLoading /> : children}
        </ConfigProvider>
      </div>
    ),
    rightContentRender: () => (
      <LeftSetting
        collapsed={collapsed}
        currentTheme={currentTheme}
        toggleTheme={handleToggleTheme}
      />
    ),
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  ...errorConfig,
};
