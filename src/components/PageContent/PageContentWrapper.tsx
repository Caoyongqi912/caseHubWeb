import { HomeOutlined } from '@ant-design/icons';
import { PageContainer, PageContainerProps } from '@ant-design/pro-components';
import React from 'react';
import { Link, useLocation, useNavigate } from 'umi';
import { getBreadcrumbChain, getPageTitle } from '../../../config/routeUtils';

interface EnhancedPageContainerProps extends Partial<PageContainerProps> {
  children: React.ReactNode;
  customTitle?: string;
  hideBreadcrumb?: boolean;
  backPath?: string;
  showBack?: boolean;
  // 新增：是否使用卡片模式
  cardMode?: boolean;
  // 新增：自定义样式
  containerStyle?: React.CSSProperties;
}

const PageContentWrapper: React.FC<EnhancedPageContainerProps> = (props) => {
  const {
    children,
    customTitle,
    hideBreadcrumb = false,
    backPath,
    showBack = true,
    cardMode = false, // 默认不使用卡片模式
    containerStyle = {},
    ...restProps
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // 生成面包屑配置
  const generateBreadcrumb = () => {
    if (hideBreadcrumb) return undefined;

    // 自动生成面包屑
    const chain = getBreadcrumbChain(pathname);
    const items = [];

    // 添加首页
    items.push({
      title: (
        <Link to="/home">
          <HomeOutlined /> 首页
        </Link>
      ),
    });

    // 添加路由链
    chain.forEach((route, index) => {
      const isLast = index === chain.length - 1;

      // 跳过隐藏菜单的中间路由（除非是最后一个）
      if (route.hideInMenu && !isLast) return;

      // 处理没有名称的路由
      let title = route.name;
      if (!title || title === 'current' || title === 'CaseHub') {
        title = getPageTitle(route.path);
      }

      items.push({
        title: isLast ? (
          <span>{title}</span>
        ) : route.path ? (
          <Link to={route.path}>{title}</Link>
        ) : (
          <span>{title}</span>
        ),
        path: !isLast ? route.path : undefined,
      });
    });

    // 处理特殊页面的父级关系
    if (pathname.includes('/detail')) {
      // 找出父级页面
      let parentPath = '';
      if (pathname.includes('/interface/interApi/detail')) {
        parentPath = '/interface/interApi/api';
      } else if (pathname.includes('/interface/caseApi/detail')) {
        parentPath = '/interface/caseApi/cases';
      } else if (pathname.includes('/ui/case/detail')) {
        parentPath = '/ui/cases';
      } else if (pathname.includes('/ui/task/detail')) {
        parentPath = '/ui/task';
      } else if (pathname.includes('/ui/report/detail')) {
        parentPath = '/ui/report';
      }

      // 如果找到了父级路径，调整面包屑
      if (parentPath) {
        const parentChain = getBreadcrumbChain(parentPath);
        if (parentChain.length > 0) {
          // 保留首页，替换后面的部分
          const newItems = [items[0]];

          parentChain.forEach((route) => {
            if (route.name && !route.hideInMenu) {
              newItems.push({
                title: <Link to={route.path}>{route.name}</Link>,
                // @ts-ignore
                path: route.path,
              });
            }
          });

          // 添加当前详情页
          newItems.push({
            title: <span>{getPageTitle(pathname)}</span>,
          });

          return { items: newItems };
        }
      }
    }

    return { items };
  };

  const breadcrumb = generateBreadcrumb();

  return (
    <PageContainer
      breadcrumb={breadcrumb}
      ghost={true} // 使用幽灵模式，不显示卡片背景
      fixedHeader={false} // 卡片模式固定头部
      header={{
        breadcrumb,
        style: {
          background: 'transparent',
          padding: '0 24px',
          marginBottom: 16,
        },
      }}
      style={{
        minHeight: 'calc(100vh - 64px)', // 减去头部高度
        ...containerStyle,
      }}
    >
      {children}
    </PageContainer>
  );
};

export default PageContentWrapper;
