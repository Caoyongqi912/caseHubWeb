// utils/routeUtils.ts
import routes from './routes.tsx'; // 导入你的路由配置

// 扁平化路由，方便查找
export const flattenRoutes = (routeList: any[], parent?: any): any[] => {
  let result: any[] = [];

  routeList.forEach((route) => {
    const currentRoute = {
      ...route,
      parentPath: parent?.path,
      parentName: parent?.name,
    };

    result.push(currentRoute);

    if (route.routes && route.routes.length > 0) {
      result = result.concat(flattenRoutes(route.routes, route));
    }
  });

  return result;
};

// 根据路径查找路由信息
export const findRouteByPath = (pathname: string): any => {
  const allRoutes = flattenRoutes(routes);

  // 优先精确匹配
  let matched = allRoutes.find((route) => route.path === pathname);

  // 如果没有精确匹配，尝试匹配带参数的路由
  if (!matched) {
    matched = allRoutes.find((route) => {
      if (!route.path || !route.path.includes(':')) return false;

      // 简单处理参数路由匹配
      const basePath = route.path.split(':')[0];
      return pathname.startsWith(basePath);
    });
  }

  return matched || null;
};

// 获取面包屑路径链
export const getBreadcrumbChain = (pathname: string): any[] => {
  const chain = [];
  const route = findRouteByPath(pathname);

  if (route) {
    // 添加当前路由
    chain.unshift({
      path: route.path,
      name: route.name,
      hideInMenu: route.hideInMenu,
    });

    // 递归查找父路由
    let parent = route;
    while (parent?.parentPath) {
      const parentRoute = findRouteByPath(parent.parentPath);
      if (parentRoute) {
        chain.unshift({
          path: parentRoute.path,
          name: parentRoute.name,
          hideInMenu: parentRoute.hideInMenu,
        });
        parent = parentRoute;
      } else {
        break;
      }
    }
  }

  return chain;
};

// 获取页面标题
export const getPageTitle = (pathname: string): string => {
  const route = findRouteByPath(pathname);

  if (route && route.name) {
    // 排除一些特殊名称
    if (route.name === 'current' || route.name === 'CaseHub') {
      // 可以根据路径推断更好的名称
      if (pathname.includes('/user/center')) return '个人中心';
      if (pathname.includes('/cases/caseHub')) return '测试用例库';
    }
    return route.name;
  }

  // 根据路径推断标题
  if (pathname.includes('/detail')) {
    if (pathname.includes('interApi/detail')) return 'API用例详情';
    if (pathname.includes('caseApi/detail')) return 'API业务流详情';
    if (pathname.includes('case/detail')) return '用例详情';
    if (pathname.includes('task/detail')) return '任务详情';
    if (pathname.includes('report/detail')) return '报告详情';
    if (pathname.includes('perf/detail')) return '压力测试看板';
    return '详情';
  }

  // 默认返回路径最后一段
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] || '首页';
};
